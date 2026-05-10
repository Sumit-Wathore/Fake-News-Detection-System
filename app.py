# app.py - Fixed OTP Verification Flow
import os
import re
import secrets
import bcrypt
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

# MySQL Configuration
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', '')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'auth_system')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)
CORS(app, supports_credentials=True)

# Email Configuration (MUST USE GMAIL APP PASSWORD)
SMTP_CONFIG = {
    'server': os.environ.get('SMTP_SERVER', 'smtp.gmail.com'),
    'port': int(os.environ.get('SMTP_PORT', 587)),
    'username': os.environ.get('SMTP_USERNAME'),
    'password': os.environ.get('SMTP_PASSWORD'),  # 16-char App Password
    'from_email': os.environ.get('FROM_EMAIL', 'noreply@truthguard.com')
}

# ==================== HELPER FUNCTIONS ====================

def validate_full_name(name):
    """Validate full name - only alphabets and spaces"""
    if not name or len(name.strip()) < 2:
        return False, "Name must be at least 2 characters"
    
    if not re.match(r'^[A-Za-z ]+$', name):
        return False, "Only alphabets and spaces allowed"
    
    return True, "Valid name"

def validate_email_format(email):
    """Validate email format ONLY - DO NOT check existence"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not email:
        return False, "Email is required"
    
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    return True, "Valid email format"

def check_email_in_database(email):
    """Check if email already exists in database"""
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT id FROM users WHERE email = %s", (email.lower(),))
        result = cursor.fetchone()
        cursor.close()
        return result is not None
    except Exception as e:
        print(f"Database error: {e}")
        return False

def generate_otp():
    """Generate 6-digit OTP"""
    return str(secrets.randbelow(900000) + 100000)

def send_otp_email(to_email, otp, user_name):
    """
    Send OTP via Gmail SMTP
    THIS IS THE PROOF OF EMAIL EXISTENCE
    """
    try:
        # Email content
        subject = "Verify Your Email – TruthGuard"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Verify Your Email Address</h2>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>Thank you for registering with TruthGuard. Please use the OTP below to verify your email address.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">Your Verification Code</h3>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e74c3c; margin: 20px 0;">
                    {otp}
                </div>
                <p style="color: #7f8c8d; font-size: 14px;">
                    This code will expire in 5 minutes.
                </p>
            </div>
            
            <p>If you did not request this verification, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            <p style="color: #95a5a6; font-size: 12px;">
                TruthGuard Security Team<br>
                This is an automated message, please do not reply.
            </p>
        </body>
        </html>
        """
        
        text_content = f"""
        Verify Your Email - TruthGuard
        
        Hello {user_name},
        
        Your verification code is: {otp}
        
        This code will expire in 5 minutes.
        
        If you did not request this verification, please ignore this email.
        
        --
        TruthGuard Security Team
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_CONFIG['from_email']
        msg['To'] = to_email
        
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        server = smtplib.SMTP(SMTP_CONFIG['server'], SMTP_CONFIG['port'])
        server.starttls()
        server.login(SMTP_CONFIG['username'], SMTP_CONFIG['password'])
        server.send_message(msg)
        server.quit()
        
        print(f"[EMAIL SENT] OTP {otp} sent to {to_email}")
        return True, "OTP sent successfully"
        
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP: {str(e)}")
        return False, "Failed to send verification email"

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# ==================== ROUTES ====================

@app.route('/')
def index():
    """Serve the single-page application"""
    return app.send_static_file('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    """
    STEP 1: Collect user data, check database, send OTP
    Data stays in session until OTP verification
    """
    try:
        data = request.get_json()
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        
        # Validate full name
        is_valid, message = validate_full_name(full_name)
        if not is_valid:
            return jsonify({'success': False, 'message': message}), 400
        
        # Validate email format ONLY
        is_valid, message = validate_email_format(email)
        if not is_valid:
            return jsonify({'success': False, 'message': message}), 400
        
        # Check if email already registered
        if check_email_in_database(email):
            return jsonify({
                'success': False, 
                'message': 'Email already registered. Please login.'
            }), 400
        
        # Generate OTP
        otp = generate_otp()
        otp_expiry = datetime.now() + timedelta(minutes=5)
        
        # Store ALL data in session (NOT in database yet)
        session['pending_user'] = {
            'full_name': full_name,
            'email': email,
            'password': password,
            'otp': otp,
            'otp_expiry': otp_expiry.isoformat(),
            'created_at': datetime.now().isoformat()
        }
        session.modified = True
        
        # Send OTP via email
        email_sent, email_msg = send_otp_email(email, otp, full_name)
        
        if not email_sent:
            # Clear session if email fails
            session.pop('pending_user', None)
            return jsonify({'success': False, 'message': email_msg}), 500
        
        return jsonify({
            'success': True,
            'message': 'OTP sent to your email. Please check your inbox (and spam folder).'
        })
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'Server error. Please try again.'
        }), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    STEP 2: Verify OTP and create user account
    ONLY HERE is email confirmed as real
    """
    try:
        data = request.get_json()
        user_otp = data.get('otp', '')
        
        # Get pending user from session
        pending_user = session.get('pending_user')
        
        if not pending_user:
            return jsonify({
                'success': False, 
                'message': 'Session expired. Please start registration again.'
            }), 400
        
        # Check OTP expiry
        otp_expiry = datetime.fromisoformat(pending_user['otp_expiry'])
        if datetime.now() > otp_expiry:
            session.pop('pending_user', None)
            return jsonify({
                'success': False, 
                'message': 'OTP has expired. Please request a new one.'
            }), 400
        
        # Verify OTP
        if pending_user['otp'] != user_otp:
            return jsonify({
                'success': False, 
                'message': 'Invalid OTP. Please try again.'
            }), 400
        
        # ✅ OTP VERIFIED! Email is confirmed REAL and reachable
        # Now create the user account in database
        
        # Hash password
        password_hash = hash_password(pending_user['password'])
        
        # Insert into database
        cursor = mysql.connection.cursor()
        cursor.execute("""
            INSERT INTO users (full_name, email, password_hash, is_verified, created_at)
            VALUES (%s, %s, %s, TRUE, NOW())
        """, (
            pending_user['full_name'],
            pending_user['email'],
            password_hash
        ))
        
        user_id = cursor.lastrowid
        mysql.connection.commit()
        cursor.close()
        
        # Clear session data
        session.pop('pending_user', None)
        
        return jsonify({
            'success': True,
            'message': 'Email verified and account created successfully!',
            'user_id': user_id,
            'user_name': pending_user['full_name'],
            'user_email': pending_user['email']
        })
        
    except Exception as e:
        print(f"OTP verification error: {str(e)}")
        mysql.connection.rollback()
        return jsonify({
            'success': False, 
            'message': 'Server error during verification.'
        }), 500

@app.route('/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP to pending user"""
    try:
        pending_user = session.get('pending_user')
        
        if not pending_user:
            return jsonify({
                'success': False, 
                'message': 'No pending registration found.'
            }), 400
        
        # Generate new OTP
        new_otp = generate_otp()
        new_expiry = datetime.now() + timedelta(minutes=5)
        
        # Update session
        pending_user['otp'] = new_otp
        pending_user['otp_expiry'] = new_expiry.isoformat()
        session['pending_user'] = pending_user
        session.modified = True
        
        # Resend email
        email_sent, email_msg = send_otp_email(
            pending_user['email'], 
            new_otp, 
            pending_user['full_name']
        )
        
        if not email_sent:
            return jsonify({'success': False, 'message': email_msg}), 500
        
        return jsonify({
            'success': True,
            'message': 'New OTP sent to your email.'
        })
        
    except Exception as e:
        print(f"Resend OTP error: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'Failed to resend OTP.'
        }), 500

@app.route('/check-session', methods=['GET'])
def check_session():
    """Check if user has pending registration"""
    pending_user = session.get('pending_user')
    if pending_user:
        return jsonify({
            'has_pending': True,
            'email': pending_user['email'],
            'expiry': pending_user['otp_expiry']
        })
    return jsonify({'has_pending': False})

# ==================== DATABASE SETUP ====================

def init_database():
    """Initialize database tables"""
    try:
        cursor = mysql.connection.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                INDEX idx_email (email),
                INDEX idx_verified (is_verified)
            )
        """)
        
        mysql.connection.commit()
        cursor.close()
        print("Database initialized successfully")
        
    except Exception as e:
        print(f"Database initialization error: {e}")

# ==================== MAIN ====================

if __name__ == '__main__':
    # Initialize database on startup
    with app.app_context():
        init_database()
    
    # Run the application
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )