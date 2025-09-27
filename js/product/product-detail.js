// Product detail page functionality
let currentProduct = null;

function initProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    console.error('No product ID provided');
    window.location.href = 'products.html';
    return;
  }
  
  loadProductDetail(productId);
  initEventListeners();
  initQuantityControls();
}

function loadProductDetail(productId) {
  const url = `https://api.redseam.redberryinternship.ge/api/products/${productId}`;
  
  fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch product details');
    }
  })
  .then(data => {
    currentProduct = data;
    displayProductDetail(data);
  })
  .catch(error => {
    console.error('Error loading product details:', error);
    showProductError();
  });
}

function displayProductDetail(product) {
  document.getElementById('productTitle').textContent = product.name;
  document.getElementById('productPrice').textContent = `$${product.price}`;
  document.getElementById('productDescription').textContent = product.description;
  
  const brandName = document.getElementById('brandName');
  const brandLogo = document.getElementById('brandLogo');
  
  if (product.brand && typeof product.brand === 'object') {
    brandName.textContent = product.brand.name || 'Unknown Brand';
    
    if (product.brand.image) {
      brandLogo.src = product.brand.image;
      brandLogo.style.display = 'block';
    } else {
      brandLogo.style.display = 'none';
    }
  } else {
    brandName.textContent = 'Unknown Brand';
    brandLogo.style.display = 'none';
  }
  
  setupProductImages(product);
  setupProductColors(product);
  setupProductSizes(product);
}

function setupProductImages(product) {
  const mainImage = document.getElementById('mainImage');
  const thumbnailsContainer = document.querySelector('.product-thumbnails');
  
  if (!thumbnailsContainer) return;
  
  let imageColorPairs = [];
  
  if (product.images && Array.isArray(product.images)) {
    imageColorPairs = product.images.map((img, index) => ({
      image: img,
      color: product.available_colors[index]
    }));
  } else if (product.cover_image) {
    const mainColor = product.color || 'Default';
    imageColorPairs = [{ image: product.cover_image, color: mainColor }];
  }
  
  window.productImageColorPairs = imageColorPairs;
  
  mainImage.src = imageColorPairs[0].image;
  mainImage.alt = product.name;
  
  thumbnailsContainer.innerHTML = '';
  
  imageColorPairs.forEach((pair, index) => {
    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = `thumbnail ${index === 0 ? 'active' : ''}`;
    thumbnailDiv.setAttribute('data-image', index);
    thumbnailDiv.setAttribute('data-color', pair.color);
    
    const thumbnailImg = document.createElement('img');
    thumbnailImg.src = pair.image;
    thumbnailImg.alt = `${product.name} - ${pair.color}`;
    
    thumbnailDiv.appendChild(thumbnailImg);
    
    thumbnailDiv.addEventListener('click', () => {
      switchMainImage(pair.image, index, pair.color);
    });
    
    thumbnailsContainer.appendChild(thumbnailDiv);
  });
}

function switchMainImage(imageSrc, index, colorName) {
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  mainImage.src = imageSrc;
  
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
  
  if (colorName) {
    const colorCircles = document.querySelectorAll('.color-circle');
    const colorNameElement = document.getElementById('selectedColorName');
    
    colorCircles.forEach(circle => {
      const isMatch = circle.getAttribute('data-color') === colorName;
      circle.classList.toggle('active', isMatch);
    });
    
    colorNameElement.textContent = colorName;
  }
}

function initEventListeners() {
  const backToProducts = document.getElementById('backToProducts');
  if (backToProducts) {
    backToProducts.addEventListener('click', () => {
      const storedState = sessionStorage.getItem('productsPageState');
      if (storedState) {
        const state = JSON.parse(storedState);
        const params = new URLSearchParams();
        
        if (state.page && state.page > 1) {
          params.append('page', state.page);
        }
        
        if (state.filters && state.filters.priceFrom) {
          params.append('price_from', state.filters.priceFrom);
        }
        
        if (state.filters && state.filters.priceTo) {
          params.append('price_to', state.filters.priceTo);
        }
        
        if (state.sort) {
          params.append('sort', state.sort);
        }
        
        const queryString = params.toString();
        window.location.href = queryString ? `products.html?${queryString}` : 'products.html';
      } else {
        window.location.href = 'products.html';
      }
    });
  }
  
  const addToCartBtn = document.getElementById('addToCart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addToCart();
    });
  }
}

function addToCart() {
  if (!currentProduct) {
    console.error('No product data available');
    return;
  }
  
  console.log('Adding to cart:', currentProduct.name);
}

function showProductError() {
  document.getElementById('productTitle').textContent = 'Product Not Found';
  document.getElementById('productPrice').textContent = '';
  document.getElementById('productDescription').textContent = 'Sorry, this product could not be loaded.';
  document.querySelector('.product-images').style.display = 'none';
}

function setupProductColors(product) {
  const colorOptionsContainer = document.getElementById('colorOptions');
  const colorNameElement = document.getElementById('selectedColorName');
  
  if (!colorOptionsContainer) return;
  
  const imageColorPairs = window.productImageColorPairs || [];
  
  colorOptionsContainer.innerHTML = '';
  
  imageColorPairs.forEach((pair, index) => {
    const colorCircle = document.createElement('div');
    colorCircle.className = 'color-circle';
    
    const colorName = pair.color;
    
    const getCSSColor = (name) => {
      const colorMap = {
        'Navy Blue': 'navy',
        'Multi': '#333333',
        'Cream': '#F5F5DC',
        'Peach': '#FFCBA4',
        'Off White': '#FAF0E6'
      };
      return colorMap[name] || name;
    };
    
    colorCircle.setAttribute('data-color', colorName);
    colorCircle.style.backgroundColor = getCSSColor(colorName);
    
    if (colorName === 'Multi') {
      colorCircle.classList.add('multi-color');
    }
    
    if (colorName.includes('White')) {
      colorCircle.style.border = '1px solid #E0E0E0';
    }
    
    if (index === 0) {
      colorCircle.classList.add('active');
      colorNameElement.textContent = colorName;
    }
    
    colorCircle.addEventListener('click', () => {
      document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
      colorCircle.classList.add('active');
      colorNameElement.textContent = colorName;
      switchMainImage(pair.image, index, colorName);
    });
    
    colorOptionsContainer.appendChild(colorCircle);
  });
}

function setupProductSizes(product) {
  const sizeOptionsContainer = document.getElementById('sizeOptions');
  const sizeNameElement = document.getElementById('selectedSizeName');
  
  if (!sizeOptionsContainer) return;
  
  // Handle case when no sizes are available
  if (!product.available_sizes || product.available_sizes.length === 0) {
    sizeOptionsContainer.innerHTML = '<div class="out-of-stock">Out of Stock</div>';
    
    const addToCartBtn = document.getElementById('addToCart');
    const quantitySelect = document.getElementById('quantitySelect');
    
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Out of Stock';
    }
    
    if (quantitySelect) {
      quantitySelect.style.pointerEvents = 'none';
      quantitySelect.style.opacity = '0.5';
    }
    
    return;
  }
  
  sizeOptionsContainer.innerHTML = '';
  
  product.available_sizes.forEach((size, index) => {
    const sizeOption = document.createElement('div');
    sizeOption.className = `size-option ${index === 0 ? 'active' : ''}`;
    sizeOption.setAttribute('data-size', size);
    sizeOption.textContent = size;
    
    if (index === 0 && sizeNameElement) {
      sizeNameElement.textContent = size;
    }
    
    sizeOption.addEventListener('click', () => {
      document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
      sizeOption.classList.add('active');
      
      if (sizeNameElement) {
        sizeNameElement.textContent = size;
      }
    });
    
    sizeOptionsContainer.appendChild(sizeOption);
  });
}

function initQuantityControls() {
  const quantitySelect = document.getElementById('quantitySelect');
  const quantityPopup = document.getElementById('quantityPopup');
  const quantityDisplay = document.getElementById('quantityDisplay');
  const quantityOptions = document.querySelectorAll('.quantity-option');
  
  let isQuantityOpen = false;
  
  if (quantitySelect && quantityPopup && quantityDisplay) {
    quantitySelect.addEventListener('click', (event) => {
      event.stopPropagation();
      
      if (window.closeFilterPopup) window.closeFilterPopup();
      if (window.closeSortPopup) window.closeSortPopup();
      
      if (isQuantityOpen) {
        quantityPopup.style.display = 'none';
        quantitySelect.classList.remove('active');
        isQuantityOpen = false;
      } else {
        quantityPopup.style.display = 'block';
        quantitySelect.classList.add('active');
        isQuantityOpen = true;
      }
    });
    
    quantityPopup.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    
    quantityOptions.forEach(option => {
      option.addEventListener('click', () => {
        const selectedQuantity = option.getAttribute('data-quantity');
        
        quantityOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        quantityDisplay.textContent = selectedQuantity;
        
        quantityPopup.style.display = 'none';
        quantitySelect.classList.remove('active');
        isQuantityOpen = false;
      });
    });
    
    document.addEventListener('click', (event) => {
      if (isQuantityOpen && 
          !quantityPopup.contains(event.target) && 
          !quantitySelect.contains(event.target)) {
        quantityPopup.style.display = 'none';
        quantitySelect.classList.remove('active');
        isQuantityOpen = false;
      }
    });
  }
  
  window.closeQuantityPopup = function() {
    if (quantityPopup && isQuantityOpen) {
      quantityPopup.style.display = 'none';
      quantitySelect.classList.remove('active');
      isQuantityOpen = false;
    }
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductDetail);
} else {
  initProductDetail();
} 