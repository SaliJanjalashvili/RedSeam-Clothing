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
      <img src="${item.selectedImage || item.image || item.cover_image || item.images?.[0] || 'assets/products/placeholder.jpg'}" alt="${item.name}" class="summary-item-image">
      <div class="summary-item-details">
        <div class="summary-item-name">
          <span>${item.name}</span>
          <span class="summary-item-price">$ ${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="summary-item-options">${item.selectedColor}</div>
        <div class="summary-item-options">${item.selectedSize}</div>
        <div class="summary-item-quantity">
          <div class="cart-item-quantity-controls">
            <button class="quantity-btn ${item.quantity <= 1 ? 'disabled' : ''}" 
                    onclick="updateQuantity(${item.id}, '${item.selectedSize}', '${item.selectedColor}', Math.max(1, ${item.quantity - 1}))" 
                    ${item.quantity <= 1 ? 'disabled' : ''}>
              <img src="assets/product/minus.svg" alt="Decrease" class="quantity-icon">
            </button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn ${item.quantity >= 10 ? 'disabled' : ''}" 
                    onclick="updateQuantity(${item.id}, '${item.selectedSize}', '${item.selectedColor}', Math.min(10, ${item.quantity + 1}))" 
                    ${item.quantity >= 10 ? 'disabled' : ''}>
              <img src="assets/product/plus.svg" alt="Increase" class="quantity-icon">
            </button>
          </div>
          <button class="remove-text-btn" onclick="removeFromCart(${item.id}, '${item.selectedSize}', '${item.selectedColor}')">Remove</button>
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
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
      });
    }
  });

  const successClose = document.getElementById('successCloseBtn');
  const successOverlay = document.getElementById('successOverlay');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');

  if (successClose) {
    successClose.addEventListener('click', closeSuccessModal);
  }

  if (successOverlay) {
    successOverlay.addEventListener('click', (e) => {
      if (e.target === successOverlay) {
        closeSuccessModal();
      }
    });
  }

  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', closeSuccessModal);
  }
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

async function handlePlaceOrder(e) {
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

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing...';
  }

  try {
    await submitCheckout();
  } catch (error) {
    console.error('Checkout failed:', error);
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
    }
  }
}

async function submitCheckout() {
  const user = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('authToken');
  
  if (!user || !token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const formData = {
      name: document.getElementById('firstName')?.value.trim(),
      surname: document.getElementById('lastName')?.value.trim(),
      email: document.getElementById('email')?.value.trim(),
      address: document.getElementById('address')?.value.trim(),
      zip_code: document.getElementById('zipCode')?.value.trim()
    };

    console.log('Submitting checkout with data:', formData);

    const response = await fetch('https://api.redseam.redberryinternship.ge/api/cart/checkout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Checkout successful:', data);
      
      sessionStorage.removeItem('cartItems');
      
      showSuccessModal();
    } else if (response.status === 401) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      window.location.href = 'login.html';
    } else if (response.status === 400) {
      const errorData = await response.json();
      console.error('Checkout error:', errorData);
      alert('Checkout failed: ' + (errorData.message || 'Please try again'));
      
      const placeOrderBtn = document.getElementById('placeOrderBtn');
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Place Order';
      }
    } else if (response.status === 422) {
      const errorData = await response.json();
      console.error('Validation errors:', errorData);
      
      if (errorData.errors) {
        Object.keys(errorData.errors).forEach(field => {
          const fieldMapping = {
            'name': 'firstName',
            'surname': 'lastName',
            'email': 'email',
            'address': 'address',
            'zip_code': 'zipCode'
          };
          
          const frontendFieldId = fieldMapping[field];
          if (frontendFieldId && errorData.errors[field][0]) {
            showError(frontendFieldId, errorData.errors[field][0]);
          }
        });
      } else {
        alert('Validation failed: ' + (errorData.message || 'Please check your information'));
      }
      
      const placeOrderBtn = document.getElementById('placeOrderBtn');
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Place Order';
      }
    } else {
      const errorText = await response.text();
      console.error('Checkout failed:', response.status, errorText);
      alert('Checkout failed. Please try again.');
      
      const placeOrderBtn = document.getElementById('placeOrderBtn');
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Place Order';
      }
    }
  } catch (error) {
    console.error('Network error during checkout:', error);
    alert('Network error. Please check your connection and try again.');
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
    }
    
    throw error;
  }
}

function showSuccessModal() {
  const successOverlay = document.getElementById('successOverlay');
  if (successOverlay) {
    successOverlay.style.display = 'flex';
  }
}

function closeSuccessModal() {
  const successOverlay = document.getElementById('successOverlay');
  if (successOverlay) {
    successOverlay.style.display = 'none';
  }
  window.location.href = 'index.html';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckout);
} else {
  initCheckout();
} 