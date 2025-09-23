// IMAGE UPLOAD MODULE
// handles avatar image upload, preview, and removal

function initImageUpload() {
  const imageUpload = document.getElementById('imageUpload');
  const avatarContainer = document.getElementById('avatarContainer');
  const uploadText = document.getElementById('uploadText');
  const removeImage = document.getElementById('removeImage');

  // click on avatar or text to upload
  avatarContainer.addEventListener('click', function () {
    imageUpload.click();
  });

  uploadText.addEventListener('click', function () {
    imageUpload.click();
  });

  // file selection
  if (imageUpload) {
    imageUpload.addEventListener('change', function (e) {
      const file = e.target.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // remove image
  if (removeImage) {
    removeImage.addEventListener('click', function (e) {
      e.stopPropagation();
      removeImagePreview();
    });
  }
}

function showImagePreview(imageSrc) {
  const avatarIcon = document.getElementById('avatarIcon');
  const previewImage = document.getElementById('previewImage');
  const uploadText = document.getElementById('uploadText');
  const removeImage = document.getElementById('removeImage');

  avatarIcon.classList.add('hidden');
  previewImage.src = imageSrc;
  previewImage.classList.remove('hidden');
  uploadText.textContent = 'Upload new';
  removeImage.classList.remove('hidden');
}

function removeImagePreview() {
  const avatarIcon = document.getElementById('avatarIcon');
  const previewImage = document.getElementById('previewImage');
  const uploadText = document.getElementById('uploadText');
  const removeImage = document.getElementById('removeImage');
  const imageUpload = document.getElementById('imageUpload');

  avatarIcon.classList.remove('hidden');
  previewImage.classList.add('hidden');
  previewImage.src = '';
  uploadText.textContent = 'Upload image';
  removeImage.classList.add('hidden');
  imageUpload.value = '';
} 