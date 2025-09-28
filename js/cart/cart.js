// Shopping Cart Module
let cartItems = [];

function initCart() {
  loadCartFromStorage();
  setupCartEventListeners();
  updateCartDisplay();
}

function setupCartEventListeners() {
  const cartIcon = document.querySelector('.cart');
  if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
      e.preventDefault();
      openCartPanel();
    });
  }

  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  
  cartClose?.addEventListener('click', closeCartPanel);
  
  cartOverlay?.addEventListener('click', (e) => {
    if (e.target === cartOverlay) {
      closeCartPanel();
    }
  });

  const startShoppingBtn = document.getElementById('startShoppingBtn');
  startShoppingBtn?.addEventListener('click', closeCartPanel);

  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn?.addEventListener('click', () => {
    const cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
    if (cartItems.length > 0) {
      window.location.href = 'checkout.html';
    }
  });
}

function openCartPanel() {
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) {
    cartOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeCartPanel() {
  const cartOverlay = document.getElementById('cartOverlay');
  const cartPanel = document.getElementById('cartPanel');
  
  if (cartPanel && cartOverlay) {
    cartPanel.classList.add('closing');
    
    setTimeout(() => {
      cartOverlay.style.display = 'none';
      cartPanel.classList.remove('closing');
      document.body.style.overflow = 'auto';
    }, 300);
  }
}

function addToCart(product, selectedSize, selectedColor, quantity = 1, selectedImage = null) {
  const existingItemIndex = cartItems.findIndex(item => 
    item.id === product.id && 
    item.selectedSize === selectedSize && 
    item.selectedColor === selectedColor
  );

  const itemImage = selectedImage || product.cover_image;

  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: itemImage,
      selectedSize,
      selectedColor,
      quantity
    });
  }

  saveCartToStorage();
  updateCartDisplay();
  openCartPanel();
}

function removeFromCart(index) {
  cartItems.splice(index, 1);
  saveCartToStorage();
  updateCartDisplay();
  
  if (typeof window.refreshCheckoutSummary === 'function') {
    window.refreshCheckoutSummary();
  }
}

function updateQuantity(index, newQuantity) {
  if (newQuantity < 1 || newQuantity > 10) {
    return;
  }
  
  cartItems[index].quantity = newQuantity;
  saveCartToStorage();
  updateCartDisplay();
  
  if (typeof window.refreshCheckoutSummary === 'function') {
    window.refreshCheckoutSummary();
  }
}

function updateCartDisplay() {
  const emptyCart = document.getElementById('emptyCart');
  const cartItems_container = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const totalAmount = document.getElementById('totalAmount');
  const cartTitle = document.getElementById('cartTitle');

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  cartTitle && (cartTitle.textContent = `Shopping Cart (${itemCount})`);

  if (cartItems.length === 0) {
    emptyCart && (emptyCart.style.display = 'flex');
    cartItems_container && (cartItems_container.innerHTML = '');
    cartFooter && (cartFooter.style.display = 'none');
    return;
  }

  emptyCart && (emptyCart.style.display = 'none');
  cartFooter && (cartFooter.style.display = 'block');

  if (cartItems_container) {
    cartItems_container.innerHTML = cartItems.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <div class="cart-item-header">
            <h4 class="cart-item-name">${item.name}</h4>
            <span class="cart-item-price">$ ${(item.price * item.quantity) % 1 === 0 ? (item.price * item.quantity) : (item.price * item.quantity).toFixed(2)}</span>
          </div>
          <p class="cart-item-color">${item.selectedColor}</p>
          <p class="cart-item-size">${item.selectedSize}</p>
          <div class="cart-item-bottom-row">
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
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 5.00;
  const total = subtotal + delivery;
  
  const subtotalAmount = document.getElementById('subtotalAmount');
  subtotalAmount && (subtotalAmount.textContent = `$ ${subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2)}`);
  totalAmount && (totalAmount.textContent = `$ ${total % 1 === 0 ? total : total.toFixed(2)}`);
}

function saveCartToStorage() {
  sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function loadCartFromStorage() {
  const stored = sessionStorage.getItem('cartItems');
  if (stored) {
    cartItems = JSON.parse(stored);
  }
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
} 