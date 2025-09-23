// REGISTRATION VALIDATION MODULE
// handles registration form validation and submission

function initRegistrationValidation() {
  const registrationForm = document.querySelector('.registration-form-content form');
  
  if (registrationForm) {
    registrationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      validateAndSubmitForm();
    });
  }
}

function validateAndSubmitForm() {
  const allTextInputs = document.querySelectorAll('.registration-form-content input[type="text"]');
  const emailInput = document.querySelector('.registration-form-content input[type="email"]');
  const usernameInput = allTextInputs[0];
  const passwordInput = allTextInputs[1];
  const confirmPasswordInput = allTextInputs[2]; 
  
  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  clearErrors();
  
  let isValid = true;
  
  // validate username
  if (!validateUsername(username)) {
    isValid = false;
  }
  
  // validate email
  if (!validateEmail(email)) {
    isValid = false;
  }
  
  // validate password
  if (!validatePassword(password)) {
    isValid = false;
  }
  
  // validate confirm password
  if (!validateConfirmPassword(password, confirmPassword)) {
    isValid = false;
  }
  
  if (isValid) {
    alert('Registration successful!');
  }
}

function validateUsername(username) {
  if (!username) {
    showError('username', 'Username is required');
    return false;
  }
  
  if (username.length < 3) {
    showError('username', 'Username must be at least 3 characters');
    return false;
  }
  
  return true;
}

function validateEmail(email) {
  if (!email) {
    showError('email', 'Email is required');
    return false;
  }
  
  // email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('email', 'Please enter a valid email format');
    return false;
  }
  
  return true;
}

function validatePassword(password) {
  if (!password) {
    showError('password', 'Password is required');
    return false;
  }
  
  if (password.length < 3) {
    showError('password', 'Password must be at least 3 characters');
    return false;
  }
  
  return true;
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    showError('confirmPassword', 'Please confirm your password');
    return false;
  }
  
  if (password !== confirmPassword) {
    showError('confirmPassword', 'Passwords do not match');
    return false;
  }
  
  return true;
}

function showError(fieldType, message) {
  let input;
  
  switch(fieldType) {
    case 'username':
      input = document.querySelectorAll('.registration-form-content input[type="text"]')[0];
      break;
    case 'email':
      input = document.querySelector('.registration-form-content input[type="email"]');
      break;
    case 'password':
      input = document.querySelectorAll('.registration-form-content input[type="text"]')[1];
      break;
    case 'confirmPassword':
      input = document.querySelectorAll('.registration-form-content input[type="text"]')[2];
      break;
  }
  
  if (input) {
    // error styling
    input.style.borderColor = 'var(--red)';
    
    // error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const inputRect = input.getBoundingClientRect();
    const parentContainer = input.closest('.input-fields');
    const containerRect = parentContainer.getBoundingClientRect();
    
    const topOffset = inputRect.bottom - containerRect.top + 4;
    const leftOffset = inputRect.left - containerRect.left + 6;
    
    errorDiv.style.top = topOffset + 'px';
    errorDiv.style.left = leftOffset + 'px';
    
    parentContainer.appendChild(errorDiv);
  }
}

function clearErrors() {
  // remove error styling
  const inputs = document.querySelectorAll('.registration-form-content input');
  inputs.forEach(input => {
    input.style.borderColor = 'var(--light-gray)';
  });
  
  // remove error messages
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(error => error.remove());
} 