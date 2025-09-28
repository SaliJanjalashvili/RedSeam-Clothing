// Filter popup functionality
let isFilterOpen = false;

function initFilter() {
  const filterSection = document.querySelector('.filter-section');
  const filterPopup = document.getElementById('filterPopup');
  const applyButton = document.getElementById('applyFilter');
  const clearButton = document.getElementById('clearFilter');
  
  if (!filterSection || !filterPopup || !applyButton || !clearButton) return;
  
  initFilterPlaceholders();
  
  filterSection.addEventListener('click', toggleFilterPopup);
  
  filterPopup.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  
  applyButton.addEventListener('click', applyFilter);
  
  clearButton.addEventListener('click', clearFilter);
  
  document.addEventListener('click', handleOutsideClick);
}

// Expose close function globally for other modules
window.closeFilterPopup = function() {
  const filterPopup = document.getElementById('filterPopup');
  if (filterPopup && isFilterOpen) {
    filterPopup.style.display = 'none';
    isFilterOpen = false;
  }
};

function toggleFilterPopup(event) {
  event.stopPropagation();
  const filterPopup = document.getElementById('filterPopup');
  
  // Close sort popup if open
  if (window.closeSortPopup) {
    window.closeSortPopup();
  }
  
  if (isFilterOpen) {
    filterPopup.style.display = 'none';
    isFilterOpen = false;
  } else {
    filterPopup.style.display = 'block';
    isFilterOpen = true;
  }
}

function handleOutsideClick(event) {
  const filterPopup = document.getElementById('filterPopup');
  const filterSection = document.querySelector('.filter-section');
  
  if (isFilterOpen && 
      !filterPopup.contains(event.target) && 
      !filterSection.contains(event.target)) {
    filterPopup.style.display = 'none';
    isFilterOpen = false;
  }
}

function applyFilter() {
  const priceFrom = document.getElementById('priceFrom').value;
  const priceTo = document.getElementById('priceTo').value;
  
  if (!priceFrom || !priceTo) {
    return;
  }
  
  if (parseFloat(priceFrom) > parseFloat(priceTo)) {
    return;
  }
  
  window.currentFilters = {
    price_from: priceFrom,
    price_to: priceTo
  };
  
  window.currentPage = 1;
  
  showFilterChip(priceFrom, priceTo);
  
  if (window.loadProducts) {
    window.loadProducts();
  }
  
  const filterPopup = document.getElementById('filterPopup');
  filterPopup.style.display = 'none';
  isFilterOpen = false;
}

function clearFilter() {
  window.currentFilters = {};
  window.currentPage = 1;
  
  const priceFromInput = document.getElementById('priceFrom');
  const priceToInput = document.getElementById('priceTo');
  
  priceFromInput.value = '';
  priceToInput.value = '';
  
  priceFromInput.dispatchEvent(new Event('input'));
  priceToInput.dispatchEvent(new Event('input'));
  
  hideFilterChip();
  
  if (window.loadProducts) {
    window.loadProducts();
  }
}

function showFilterChip(priceFrom, priceTo) {
  const chipContainer = document.getElementById('filterChipContainer');
  const chipText = document.getElementById('filterChipText');
  
  if (chipContainer && chipText) {
    chipText.textContent = `Price: ${priceFrom} - ${priceTo}`;
    chipContainer.style.display = 'block';
  }
}

function hideFilterChip() {
  const chipContainer = document.getElementById('filterChipContainer');
  
  if (chipContainer) {
    chipContainer.style.display = 'none';
  }
}

function initFilterPlaceholders() {
  const filterInputs = document.querySelectorAll('.filter-input');
  
  filterInputs.forEach(input => {
    const placeholder = input.getAttribute('placeholder');
    if (placeholder && placeholder.includes('*')) {
      createCustomPlaceholder(input, placeholder);
    }
  });
}

function createCustomPlaceholder(input, placeholderText) {
  const container = input.parentElement;
  
  const placeholderDiv = document.createElement('div');
  placeholderDiv.className = 'custom-placeholder';
  placeholderDiv.style.cssText = `
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 14px;
    color: var(--gray);
    z-index: 1;
  `;
  
  const parts = placeholderText.split('*');
  const textSpan = document.createElement('span');
  textSpan.textContent = parts[0];
  
  const asteriskSpan = document.createElement('span');
  asteriskSpan.textContent = '*';
  asteriskSpan.style.color = 'var(--red)';
  
  placeholderDiv.appendChild(textSpan);
  placeholderDiv.appendChild(asteriskSpan);
  
  container.style.position = 'relative';
  
  container.insertBefore(placeholderDiv, input);
  
  input.removeAttribute('placeholder');
  
  function togglePlaceholder() {
    if (input.value.trim() !== '') {
      placeholderDiv.style.display = 'none';
    } else {
      placeholderDiv.style.display = 'block';
    }
  }
  
  input.addEventListener('input', togglePlaceholder);
  input.addEventListener('focus', togglePlaceholder);
  input.addEventListener('blur', togglePlaceholder);
  input.addEventListener('change', togglePlaceholder);
  
  togglePlaceholder();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFilter);
} else {
  initFilter();
} 