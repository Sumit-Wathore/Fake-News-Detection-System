// Show alert message
function showAlert(message, type = 'error') {
  const alert = document.getElementById('alert');
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  alert.style.display = 'block';

  setTimeout(() => {
    alert.style.display = 'none';
  }, 5000);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validation
  if (!isValidEmail(email)) {
    showAlert('Please enter a valid email address.');
    return;
  }

  if (!password) {
    showAlert('Please enter your password.');
    return;
  }

  // Retrieve users from localStorage
  const users = JSON.parse(localStorage.getItem('fndv_users') || '[]');

  // Find user by email and password
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showAlert('Invalid email or password.');
    return;
  }

  // Save logged-in user info
  localStorage.setItem('fndv_loggedInUser', JSON.stringify(user));

  // Show success message
  showAlert('Login successful! Redirecting...', 'success');

  // Redirect after 2 seconds
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2000);
});
