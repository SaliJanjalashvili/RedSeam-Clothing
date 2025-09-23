// PLACEHOLDER STYLING MODULE
// handles red asterisks in input placeholders

function initPlaceholderStyling() {
  const inputs = document.querySelectorAll('input[placeholder*="*"]');
  
  inputs.forEach(function(input) {
    const originalPlaceholder = input.placeholder;
    
    input.placeholder = '';
    input.style.position = 'relative';
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';
    
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    
    const placeholderDiv = document.createElement('div');
    placeholderDiv.style.position = 'absolute';
    placeholderDiv.style.left = '8px';
    placeholderDiv.style.top = '50%';
    placeholderDiv.style.transform = 'translateY(-50%)';
    placeholderDiv.style.pointerEvents = 'none';
    placeholderDiv.style.fontSize = '14px';
    placeholderDiv.style.fontFamily = 'Poppins, sans-serif';
    placeholderDiv.style.color = 'var(--gray)';
    placeholderDiv.style.zIndex = '1';
    
    // split text and asterisk
    const text = originalPlaceholder.replace(' *', '');
    placeholderDiv.innerHTML = text + ' <span style="color: var(--red);">*</span>';
    
    wrapper.appendChild(placeholderDiv);
    
    // hide/show custom placeholder
    function togglePlaceholder() {
      if (input.value.length > 0) {
        placeholderDiv.style.display = 'none';
      } else {
        placeholderDiv.style.display = 'block';
      }
    }
    
    input.addEventListener('input', togglePlaceholder);
    input.addEventListener('focus', togglePlaceholder);
    input.addEventListener('blur', togglePlaceholder);
    
    togglePlaceholder();
  });
} 