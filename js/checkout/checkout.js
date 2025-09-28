// Checkout page functionality
function initCheckout() {
  loadCartSummary();
  setupCheckoutEventListeners();
  setTimeout(prefillUserData, 100);
}

function prefillUserData() {
  const userData = JSON.parse(sessionStorage.getItem('user'));
  
  if (userData && userData.email) {
    const emailInput = document.getElementById('email');
    
    if (emailInput) {
      emailInput.value = userData.email;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

window.refreshCheckoutSummary = loadCartSummary;

function formatPrice(price) {
  return price % 1 === 0 ? price : price.toFixed(2);
}

function loadCartSummary() {
  const cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
  const summaryItems = document.getElementById('summaryItems');
  const checkoutSubtotal = document.getElementById('checkoutSubtotal');
  const checkoutTotal = document.getElementById('checkoutTotal');

  if (cartItems.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  summaryItems.innerHTML = cartItems.map((item, index) => `
    <div class="summary-item">
      <img src="${item.image}" alt="${item.name}" class="summary-item-image">
      <div class="summary-item-details">
        <div class="summary-item-name">
          <span>${item.name}</span>
          <span class="summary-item-price">$ ${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="summary-item-options">${item.selectedColor}</div>
        <div class="summary-item-options">${item.selectedSize}</div>
        <div class="summary-item-quantity">
          <div class="cart-item-quantity-controls">
            <button class="quantity-btn ${item.quantity <= 1 ? 'disabled' : ''}" onclick="updateQuantity(${index}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
              <img src="assets/product/minus.svg" alt="Decrease" class="quantity-icon">
            </button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn ${item.quantity >= 10 ? 'disabled' : ''}" onclick="updateQuantity(${index}, ${item.quantity + 1})" ${item.quantity >= 10 ? 'disabled' : ''}>
              <img src="assets/product/plus.svg" alt="Increase" class="quantity-icon">
            </button>
          </div>
          <button class="remove-text-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + 5;

  checkoutSubtotal.textContent = `$ ${formatPrice(subtotal)}`;
  checkoutTotal.textContent = `$ ${formatPrice(total)}`;
}

function setupCheckoutEventListeners() {
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const checkoutForm = document.getElementById('checkoutForm');

  placeOrderBtn?.addEventListener('click', handlePlaceOrder);
  checkoutForm?.addEventListener('submit', handlePlaceOrder);
  
  const requiredFields = ['firstName', 'lastName', 'email', 'address', 'zipCode'];
  requiredFields.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
      });
    }
  });
}

function validateField(fieldId, value) {
  switch (fieldId) {
    case 'firstName':
    case 'lastName':
      return value.length >= 3;
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'address':
      return value.length >= 3;
    case 'zipCode':
      return /^\d{4}$/.test(value);
    default:
      return value.length > 0;
  }
}

function getFieldDisplayName(fieldId) {
  switch (fieldId) {
    case 'firstName':
      return 'Name';
    case 'lastName':
      return 'Surname';
    case 'email':
      return 'Email';
    case 'address':
      return 'Address';
    case 'zipCode':
      return 'ZIP code';
    default:
      return 'Field';
  }
}

function getValidationErrorMessage(fieldId) {
  switch (fieldId) {
    case 'firstName':
      return 'Name must be at least 3 characters';
    case 'lastName':
      return 'Surname must be at least 3 characters';
    case 'email':
      return 'Please enter a valid email format';
    case 'address':
      return 'Address must be at least 3 characters';
    case 'zipCode':
      return 'ZIP code must be exactly 4 digits';
    default:
      return 'Invalid format';
  }
}

function clearFieldErrors() {
  const requiredFields = ['firstName', 'lastName', 'email', 'address', 'zipCode'];
  requiredFields.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.style.borderColor = '';
      const existingError = input.parentNode.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
    }
  });
}

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  if (input) {
    input.style.borderColor = 'var(--red)';
    
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '52px';
    errorDiv.style.left = '6px';
    errorDiv.style.color = 'var(--red)';
    errorDiv.style.fontSize = '10px';
    errorDiv.style.fontWeight = '300';
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(errorDiv);
  }
}

function handlePlaceOrder(e) {
  e?.preventDefault();
  
  clearFieldErrors();
  
  const requiredFields = ['firstName', 'lastName', 'email', 'address', 'zipCode'];
  let hasErrors = false;
  let firstErrorField = null;
  
  for (const fieldId of requiredFields) {
    const input = document.getElementById(fieldId);
    const value = input?.value.trim() || '';
    
    if (!value) {
      const fieldName = getFieldDisplayName(fieldId);
      showError(fieldId, `${fieldName} is required`);
      if (!firstErrorField) {
        firstErrorField = input;
      }
      hasErrors = true;
    } else if (!validateField(fieldId, value)) {
      const errorMessage = getValidationErrorMessage(fieldId);
      showError(fieldId, errorMessage);
      if (!firstErrorField) {
        firstErrorField = input;
      }
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    firstErrorField?.focus();
    return;
  }

  sessionStorage.removeItem('cartItems');
  window.location.href = 'index.html';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckout);
} else {
  initCheckout();
} 