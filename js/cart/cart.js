// Shopping Cart Module
let cartItems = [];
let isUpdating = false;

function findImageForColor(product, selectedColor, selectedImage) {
  if (selectedImage) {
    return selectedImage;
  }
  
  if (window.productImageColorPairs) {
    const matchingPair = window.productImageColorPairs.find(pair => 
      pair.color === selectedColor
    );
    if (matchingPair && matchingPair.image) {
      return matchingPair.image;
    }
  }
  
  return product.cover_image || product.images?.[0];
}

function initCart() {
  loadCartFromServer();
  setupCartEventListeners();
}

async function loadCartFromServer() {
  const user = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('authToken');
  
  if (!user || !token) {
    cartItems = [];
    updateCartDisplay();
    return;
  }

  try {
    const response = await fetch('https://api.redseam.redberryinternship.ge/api/cart', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const cartData = await response.json();
      
      const existingCartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
      
      const cleanExistingItems = existingCartItems.filter(item => !item._isBeingRemoved);
      
      cartItems = cartData.map(serverItem => {
        const localItem = cleanExistingItems.find(local => 
          local.id === serverItem.id && 
          local.selectedSize === serverItem.size && 
          local.selectedColor === serverItem.color
        );
        
        return {
          ...serverItem,
          selectedSize: serverItem.size,
          selectedColor: serverItem.color,
          selectedImage: localItem?.selectedImage || localItem?.image || serverItem.image || serverItem.cover_image || serverItem.images?.[0],
          cover_image: localItem?.cover_image || serverItem.cover_image,
          images: localItem?.images || serverItem.images
        };
      });
      
      sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
      updateCartDisplay();
    } else if (response.status === 401) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      cartItems = [];
      updateCartDisplay();
    } else {
      console.error('Failed to load cart:', response.status);
      cartItems = [];
      updateCartDisplay();
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    cartItems = [];
    updateCartDisplay();
  }
}

function setupCartEventListeners() {
  const cartIcon = document.querySelector('.cart');
  if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
      e.preventDefault();
      const user = sessionStorage.getItem('user');
      if (!user) {
        window.location.href = 'login.html';
        return;
      }
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
    }, 100);
  }
}

async function addToCart(product, selectedSize, selectedColor, quantity = 1, selectedImage = null) {
  const user = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('authToken');
  
  if (!user || !token) {
    window.location.href = 'login.html';
    return;
  }

  cartItems = cartItems.filter(item => !item._isBeingRemoved);

  const existingItemIndex = cartItems.findIndex(item => 
    item.id === product.id && 
    item.selectedSize === selectedSize && 
    item.selectedColor === selectedColor
  );

  const itemImage = findImageForColor(product, selectedColor, selectedImage);

  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity;
    if (itemImage && !cartItems[existingItemIndex].selectedImage) {
      cartItems[existingItemIndex].selectedImage = itemImage;
    }
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: itemImage,
      cover_image: product.cover_image,
      images: product.images,
      selectedSize,
      selectedColor,
      selectedImage: itemImage,
      quantity
    });
  }
  
  const cleanCartItems = cartItems.map(item => {
    const cleanItem = { ...item };
    delete cleanItem._isBeingRemoved;
    return cleanItem;
  });
  sessionStorage.setItem('cartItems', JSON.stringify(cleanCartItems));
  updateCartDisplay();
  openCartPanel();

  try {
    const response = await fetch(`https://api.redseam.redberryinternship.ge/api/cart/products/${product.id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity: quantity,
        size: selectedSize,
        color: selectedColor
      })
    });

          if (response.ok) {
        // Item synced successfully
      } else if (response.status === 401) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      window.location.href = 'login.html';
    } else {
      console.error('Failed to sync with server cart:', response.status);
      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity -= quantity;
      } else {
        cartItems.pop();
      }
      sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
      updateCartDisplay();
    }
  } catch (error) {
    console.error('Error syncing with server cart:', error);
    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity -= quantity;
    } else {
      cartItems.pop();
    }
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartDisplay();
  }
}

async function removeFromCart(itemId, selectedSize, selectedColor) {
  const user = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('authToken');
  
  if (!user || !token) {
    window.location.href = 'login.html';
    return;
  }

  const itemIndex = cartItems.findIndex(item => 
    item.id === itemId && 
    item.selectedSize === selectedSize && 
    item.selectedColor === selectedColor &&
    !item._isBeingRemoved
  );

  if (itemIndex === -1) {
    console.warn('Item not found in cart for removal');
    return;
  }

  const item = cartItems[itemIndex];
  
  const backupCartItems = [...cartItems];
  
  cartItems.splice(itemIndex, 1);

  const cleanCartItems = cartItems.map(item => {
    const cleanItem = { ...item };
    delete cleanItem._isBeingRemoved;
    return cleanItem;
  });

  sessionStorage.setItem('cartItems', JSON.stringify(cleanCartItems));
  updateCartDisplay();
  
  if (typeof window.refreshCheckoutSummary === 'function') {
    window.refreshCheckoutSummary();
  }

  try {
    const deleteResponse = await fetch(`https://api.redseam.redberryinternship.ge/api/cart/products/${item.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (deleteResponse.ok || deleteResponse.status === 204) {
      const remainingVariants = cartItems.filter(cartItem => cartItem.id === itemId);
      
      for (const variant of remainingVariants) {
        try {
          const addResponse = await fetch(`https://api.redseam.redberryinternship.ge/api/cart/products/${variant.id}`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              quantity: variant.quantity,
              size: variant.selectedSize,
              color: variant.selectedColor
            })
          });

          if (!addResponse.ok) {
            console.error(`Failed to re-add variant ${variant.selectedSize}/${variant.selectedColor}:`, addResponse.status);
          }
        } catch (addError) {
          console.error(`Error re-adding variant ${variant.selectedSize}/${variant.selectedColor}:`, addError);
        }
      }
      
    } else if (deleteResponse.status === 401) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      window.location.href = 'login.html';
      return;
    } else {
      throw new Error(`Server deletion failed: ${deleteResponse.status}`);
    }
  } catch (error) {
    console.error('Error removing from server cart:', error);
    
    cartItems.length = 0;
    cartItems.push(...backupCartItems);
    
    const revertedCleanItems = cartItems.map(item => {
      const cleanItem = { ...item };
      delete cleanItem._isBeingRemoved;
      return cleanItem;
    });
    
    sessionStorage.setItem('cartItems', JSON.stringify(revertedCleanItems));
    updateCartDisplay();
    
    if (typeof window.refreshCheckoutSummary === 'function') {
      window.refreshCheckoutSummary();
    }
    
    alert('Failed to remove item from cart. Please try again.');
  }
}

async function updateQuantity(itemId, selectedSize, selectedColor, newQuantity) {
  const user = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('authToken');
  
  if (!user || !token) {
    window.location.href = 'login.html';
    return;
  }

  if (isUpdating) {
    return;
  }

  if (newQuantity < 1 || newQuantity > 10) {
    return;
  }

  const itemIndex = cartItems.findIndex(item => 
    item.id === itemId && 
    item.selectedSize === selectedSize && 
    item.selectedColor === selectedColor &&
    !item._isBeingRemoved
  );

  if (itemIndex === -1) {
    console.warn('Item not found in cart for quantity update');
    return;
  }

  const item = cartItems[itemIndex];
  const oldQuantity = item.quantity;
  
  if (oldQuantity === newQuantity) {
    return;
  }

  isUpdating = true;

  cartItems[itemIndex].quantity = newQuantity;
  
  const cleanCartItems = cartItems.map(item => {
    const cleanItem = { ...item };
    delete cleanItem._isBeingRemoved;
    return cleanItem;
  });
  
  sessionStorage.setItem('cartItems', JSON.stringify(cleanCartItems));
  updateCartDisplay();
  
  if (typeof window.refreshCheckoutSummary === 'function') {
    window.refreshCheckoutSummary();
  }

  try {
    const deleteResponse = await fetch(`https://api.redseam.redberryinternship.ge/api/cart/products/${item.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (deleteResponse.ok || deleteResponse.status === 204) {
      
      
      const allVariants = cartItems.filter(cartItem => cartItem.id === itemId);
      
      for (const variant of allVariants) {
        try {
          const addResponse = await fetch(`https://api.redseam.redberryinternship.ge/api/cart/products/${variant.id}`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              quantity: variant.quantity,
              size: variant.selectedSize,
              color: variant.selectedColor
            })
          });

          if (!addResponse.ok) {
            console.error(`Failed to re-add variant ${variant.selectedSize}/${variant.selectedColor}:`, addResponse.status);
          }
        } catch (addError) {
          console.error(`Error re-adding variant ${variant.selectedSize}/${variant.selectedColor}:`, addError);
        }
      }
      
      
    } else if (deleteResponse.status === 401) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      window.location.href = 'login.html';
      return;
    } else {
      throw new Error(`Server deletion failed: ${deleteResponse.status}`);
    }
  } catch (error) {
    console.error('Error updating quantity on server:', error);
    
    cartItems[itemIndex].quantity = oldQuantity;
    
    const revertedCleanItems = cartItems.map(item => {
      const cleanItem = { ...item };
      delete cleanItem._isBeingRemoved;
      return cleanItem;
    });
    
    sessionStorage.setItem('cartItems', JSON.stringify(revertedCleanItems));
    updateCartDisplay();
    
    if (typeof window.refreshCheckoutSummary === 'function') {
      window.refreshCheckoutSummary();
    }
  } finally {
    setTimeout(() => {
      isUpdating = false;
    }, 100);
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
        <img src="${item.selectedImage || item.image || item.cover_image || item.images?.[0] || 'assets/products/placeholder.jpg'}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <div class="cart-item-header">
            <h4 class="cart-item-name">${item.name}</h4>
            <span class="cart-item-price">$ ${(item.price * item.quantity) % 1 === 0 ? (item.price * item.quantity) : (item.price * item.quantity).toFixed(2)}</span>
          </div>
          <p class="cart-item-color">${item.selectedColor}</p>
          <p class="cart-item-size">${item.selectedSize}</p>
          <div class="cart-item-bottom-row">
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
window.refreshCart = loadCartFromServer;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
} 