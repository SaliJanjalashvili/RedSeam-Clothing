// MAIN APP INITIALIZATION
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
});

function initializeApp() {
  initAuthForms();
  initImageUpload();
  initPlaceholderStyling();
  initRegistrationValidation();
  initLoginValidation();
}