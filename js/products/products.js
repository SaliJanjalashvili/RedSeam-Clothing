// PRODUCTS API MODULE
// handles fetching and displaying products

window.currentPage = 1;
window.currentFilters = {};
window.currentSort = '';

function initProducts() {
  loadProducts();
  initPagination();
}

window.loadProducts = loadProducts;

function initPagination() {
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (window.currentPage > 1) {
        loadProducts(window.currentPage - 1, window.currentFilters, window.currentSort);
      }
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      loadProducts(window.currentPage + 1, window.currentFilters, window.currentSort);
    });
  }
}

function loadProducts(page = window.currentPage, filters = window.currentFilters, sort = window.currentSort) {
  window.currentPage = page;
  window.currentFilters = filters;
  window.currentSort = sort;
  
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
      updatePagination(data.links, data.meta);
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

function updatePagination(links, meta) {
  if (!meta) return;
  
  const currentPage = meta.current_page;
  const lastPage = meta.last_page || 10;
  
  updatePaginationButtons(currentPage, lastPage);
  generatePaginationNumbers(currentPage, lastPage);
}

function updatePaginationButtons(currentPage, lastPage) {
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');
  
  if (prevButton) {
    prevButton.disabled = currentPage <= 1;
  }
  
  if (nextButton) {
    nextButton.disabled = currentPage >= lastPage;
  }
}

function generatePaginationNumbers(currentPage, totalPages) {
  const container = document.getElementById('paginationNumbers');
  if (!container) return;
  
  const pages = calculatePaginationPages(currentPage, totalPages);
  
  container.innerHTML = pages.map(page => {
    if (page === '...') {
      return '<span class="pagination-ellipsis">...</span>';
    } else {
      const isActive = page === currentPage ? 'active' : '';
      return `<button class="pagination-number ${isActive}" data-page="${page}">${page}</button>`;
    }
  }).join('');
  
  container.querySelectorAll('.pagination-number').forEach(button => {
    button.addEventListener('click', (e) => {
      const page = parseInt(e.target.dataset.page);
      if (page !== currentPage) {
        loadProducts(page, currentFilters, currentSort);
      }
    });
  });
}

function calculatePaginationPages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  const pages = new Set();
  
  pages.add(1);
  pages.add(2);
  
  pages.add(total - 1);
  pages.add(total);
  
  pages.add(current - 1);
  pages.add(current);
  pages.add(current + 1);
  
  const sortedPages = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < sortedPages.length; i++) {
    const currentPage = sortedPages[i];
    const nextPage = sortedPages[i + 1];
    
    result.push(currentPage);
    
    if (nextPage && nextPage - currentPage > 1) {
      result.push('...');
    }
  }
  
  return result;
}

function showProductsError() {
  const container = document.querySelector('.product-cards-container');
  container.innerHTML = '<p>Error loading products. Please try again later.</p>';
}

document.addEventListener('DOMContentLoaded', initProducts); 