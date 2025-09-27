// PRODUCTS API MODULE
// handles fetching and displaying products

let currentPage = 1;
let currentFilters = {};
let currentSort = '';

function initProducts() {
  loadProducts();
}

function loadProducts(page = 1, filters = {}, sort = '') {
  currentPage = page;
  currentFilters = filters;
  currentSort = sort;
  
  const url = buildProductsUrl(page, filters, sort);
  
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
      throw new Error('Failed to fetch products');
    }
  })
  .then(data => {
    displayProducts(data.data);
    updateResultsCount(data.meta);
  })
  .catch(error => {
    console.error('Error loading products:', error);
    showProductsError();
  });
}

function buildProductsUrl(page, filters, sort) {
  const baseUrl = 'https://api.redseam.redberryinternship.ge/api/products';
  const params = new URLSearchParams();
  
  if (page > 1) {
    params.append('page', page);
  }
  
  if (filters.price_from) {
    params.append('filter[price_from]', filters.price_from);
  }
  
  if (filters.price_to) {
    params.append('filter[price_to]', filters.price_to);
  }
  
  if (sort) {
    params.append('sort', sort);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

function displayProducts(products) {
  const container = document.querySelector('.product-cards-container');
  
  if (!products || products.length === 0) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }
  
  const productsHTML = products.map(product => createProductCard(product)).join('');
  container.innerHTML = productsHTML;
}

function createProductCard(product) {
  const imageUrl = product.image || product.cover_image || product.photo || '';
  
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        ${imageUrl ? 
          `<img src="${imageUrl}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
           <div class="image-placeholder" style="display: none;">No Image</div>` :
          `<div class="image-placeholder">No Image</div>`
        }
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price}</p>
      </div>
    </div>
  `;
}

function updateResultsCount(meta) {
  const resultsElement = document.querySelector('.results-count');
  if (resultsElement && meta) {
    const from = meta.from || 0;
    const to = meta.to || 0;
    const total = meta.total || 0;
    resultsElement.textContent = `Showing ${from}–${to} of ${total} results`;
  }
}

function showProductsError() {
  const container = document.querySelector('.product-cards-container');
  container.innerHTML = '<p>Error loading products. Please try again later.</p>';
}

document.addEventListener('DOMContentLoaded', initProducts); 