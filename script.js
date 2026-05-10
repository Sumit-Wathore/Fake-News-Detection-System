// Initialize sample users
function initializeSampleUsers() {
    if (!localStorage.getItem('users')) {
        const sampleUsers = [
            { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', password: 'password123' },
            { id: 2, name: 'Priya Sharma', email: 'priya@example.com', password: 'password123' },
            { id: 3, name: 'Amit Patel', email: 'amit@example.com', password: 'password123' },
            { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', password: 'password123' },
            { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', password: 'password123' }
        ];
        localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
}

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        document.getElementById('loggedOutButtons').classList.add('hidden');
        document.getElementById('loggedInButtons').classList.remove('hidden');
        document.getElementById('dashboardLink').classList.remove('hidden');
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').textContent = user.name.charAt(0);
        return true;
    }
    return false;
}

// Show section
function showSection(section) {
    const sections = ['home', 'login', 'signup', 'verify', 'dashboard'];
    sections.forEach(s => document.getElementById(s + 'Section').classList.add('hidden'));

    if (section === 'dashboard' && !checkAuth()) {
        showAlert('loginAlert', 'Please login to access dashboard', 'error');
        section = 'login';
    }

    document.getElementById(section + 'Section').classList.remove('hidden');
    if (section === 'dashboard') loadDashboard();
    window.scrollTo(0, 0);
}

// Show alert
function showAlert(id, msg, type) {
    const alert = document.getElementById(id);
    alert.textContent = msg;
    alert.className = `alert alert-${type} show`;
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAlert('loginAlert', 'Login successful!', 'success');
        setTimeout(() => { checkAuth(); showSection('dashboard'); }, 1000);
    } else {
        showAlert('loginAlert', 'Invalid email or password', 'error');
    }
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showAlert('signupAlert', 'Email already registered', 'error');
        return;
    }
    const newUser = { id: users.length + 1, name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showAlert('signupAlert', 'Account created successfully!', 'success');
    setTimeout(() => { checkAuth(); showSection('dashboard'); }, 1000);
}

// ✅ Corrected Handle Verification
function handleVerify(event) {
    event.preventDefault();
    if (!checkAuth()) {
        showAlert('verifyAlert', 'Please login to verify news', 'error');
        setTimeout(() => showSection('login'), 2000);
        return;
    }

    const url = document.getElementById('newsUrl').value;
    const content = document.getElementById('newsContent').value;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const results = ['fake', 'real', 'uncertain'];
    const result = results[Math.floor(Math.random() * results.length)];
    const confidence = Math.floor(Math.random() * 30) + 70;

    const verification = {
        id: Date.now(),
        userId: currentUser.id,
        url,
        content: content.substring(0, 100) + '...',
        result,
        confidence,
        date: new Date().toLocaleString()
    };

    // Save verification history
    const verifications = JSON.parse(localStorage.getItem('verifications') || '[]');
    verifications.push(verification);
    localStorage.setItem('verifications', JSON.stringify(verifications));

    showAlert('verifyAlert', `News verification result: ${result.toUpperCase()} (Confidence: ${confidence}%)`, 'success');
    document.getElementById('newsUrl').value = '';
    document.getElementById('newsContent').value = '';
}

// Dummy dashboard loader
function loadDashboard() {
    const dashboard = document.getElementById('dashboardContent');
    const verifications = JSON.parse(localStorage.getItem('verifications') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const userVerifications = verifications.filter(v => v.userId === currentUser.id);
    if (userVerifications.length === 0) {
        dashboard.innerHTML = '<p>No verifications done yet.</p>';
        return;
    }

    dashboard.innerHTML = userVerifications.map(v => `
        <div class="verification-card">
            <p><strong>URL:</strong> ${v.url}</p>
            <p><strong>Result:</strong> ${v.result.toUpperCase()}</p>
            <p><strong>Confidence:</strong> ${v.confidence}%</p>
            <p><strong>Date:</strong> ${v.date}</p>
        </div>
    `).join('');
}

// Initialize on load
window.onload = () => {
    initializeSampleUsers();
    checkAuth();
};
