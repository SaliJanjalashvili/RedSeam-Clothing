// Sort popup functionality
let isSortOpen = false;

function initSort() {
  const sortSection = document.querySelector('.sort-section');
  const sortPopup = document.getElementById('sortPopup');
  const sortOptions = document.querySelectorAll('.sort-option');
  
  if (!sortSection || !sortPopup || !sortOptions.length) return;
  
  sortSection.addEventListener('click', toggleSortPopup);
  
  sortPopup.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  
  sortOptions.forEach(option => {
    option.addEventListener('click', () => {
      const sortValue = option.getAttribute('data-sort');
      applySort(sortValue, option);
    });
  });
  
  document.addEventListener('click', handleOutsideClick);
  
  updateActiveOption();
}

window.closeSortPopup = function() {
  const sortPopup = document.getElementById('sortPopup');
  if (sortPopup && isSortOpen) {
    sortPopup.style.display = 'none';
    isSortOpen = false;
  }
};

function toggleSortPopup(event) {
  event.stopPropagation();
  const sortPopup = document.getElementById('sortPopup');
  
  if (window.closeFilterPopup) {
    window.closeFilterPopup();
  }
  
  if (isSortOpen) {
    sortPopup.style.display = 'none';
    isSortOpen = false;
  } else {
    sortPopup.style.display = 'block';
    isSortOpen = true;
  }
}

function handleOutsideClick(event) {
  const sortPopup = document.getElementById('sortPopup');
  const sortSection = document.querySelector('.sort-section');
  
  if (isSortOpen && 
      !sortPopup.contains(event.target) && 
      !sortSection.contains(event.target)) {
    sortPopup.style.display = 'none';
    isSortOpen = false;
  }
}

function applySort(sortValue, selectedOption) {
  window.currentSort = sortValue;
  
  document.querySelectorAll('.sort-option').forEach(option => {
    option.classList.remove('active');
  });
  selectedOption.classList.add('active');
  
  window.currentPage = 1;
  
  if (window.loadProducts) {
    window.loadProducts(window.currentPage, window.currentFilters, window.currentSort);
  }
  
  const sortPopup = document.getElementById('sortPopup');
  sortPopup.style.display = 'none';
  isSortOpen = false;
}

function updateActiveOption() {
  const sortOptions = document.querySelectorAll('.sort-option');
  sortOptions.forEach(option => {
    const sortValue = option.getAttribute('data-sort');
    if (sortValue === window.currentSort) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSort);
} else {
  initSort();
} 