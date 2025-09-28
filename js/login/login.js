// LOGIN VALIDATION MODULE
// handles login form validation and submission

function initLoginValidation() {
  const loginForm = document.querySelector('.login-form-content form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      validateAndSubmitLogin();
    });
  }
}

function validateAndSubmitLogin() {
  const emailInput = document.querySelector('.login-form-content input[type="email"]');
  const passwordInput = document.querySelector('.login-form-content input[type="text"]');
  
  const email = emailInput.value;
  const password = passwordInput.value;
  
  clearLoginErrors();
  
  let isValid = true;
  
  if (!validateLoginEmail(email)) {
    isValid = false;
  }
  
  if (!validateLoginPassword(password)) {
    isValid = false;
  }
  
  if (isValid) {
    submitLogin(email, password);
  }
}

function validateLoginEmail(email) {
  if (!email) {
    showLoginError('email', 'Email is required');
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showLoginError('email', 'Please enter a valid email format');
    return false;
  }
  
  return true;
}

function validateLoginPassword(password) {
  if (!password) {
    showLoginError('password', 'Password is required');
    return false;
  }
  
  return true;
}

function submitLogin(email, password) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  
  fetch('https://api.redseam.redberryinternship.ge/api/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    },
    body: formData
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else if (response.status === 422) {
      return response.json().then(data => {
        throw { type: 'validation', data: data };
      });
    } else if (response.status === 401) {
      return response.json().then(data => {
        throw { type: 'auth', data: data };
      });
    } else {
      throw { type: 'network', message: 'Network error occurred' };
    }
  })
  .then(data => {
    console.log('Login successful!');
    console.log('User logged in:', data.user);
    console.log('Token:', data.token);
    
    sessionStorage.setItem('authToken', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    
    window.location.href = 'index.html';
  })
  .catch(error => {
    if (error.type === 'validation') {
      console.error('Validation errors:', error.data.errors);
      
      if (error.data.errors.email) {
        showLoginError('email', error.data.errors.email[0]);
      }
      if (error.data.errors.password) {
        showLoginError('password', error.data.errors.password[0]);
      }
    } else if (error.type === 'auth') {
      showLoginError('password', 'Invalid email or password');
    } else {
      console.error('Login error:', error);
    }
  });
}

function showLoginError(fieldType, message) {
  let input;
  
  switch(fieldType) {
    case 'email':
      input = document.querySelector('.login-form-content input[type="email"]');
      break;
    case 'password':
      input = document.querySelector('.login-form-content input[type="text"]');
      break;
  }
  
  if (input) {
    input.style.borderColor = 'var(--red)';
    
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

function clearLoginErrors() {
  const inputs = document.querySelectorAll('.login-form-content input');
  inputs.forEach(input => {
    input.style.borderColor = 'var(--light-gray)';
  });
  
  const errorMessages = document.querySelectorAll('.login-form-content .error-message');
  errorMessages.forEach(error => error.remove());
} 