document.addEventListener('DOMContentLoaded', function() {
  
    // form toggle functionality
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginForm = document.querySelector('.login-form-content');
    const registrationForm = document.querySelector('.registration-form-content');
    
    // show registration form
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function() {
            loginForm.classList.add('hidden');
            registrationForm.classList.remove('hidden');
        });
    }
    
    // show login form
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function() {
            registrationForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

});