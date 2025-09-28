// NAVIGATION MODULE
// handles navigation state based on user authentication

function initNavigation() {
  const user = sessionStorage.getItem('user');
  const loginState = document.getElementById('loginState');
  const userState = document.getElementById('userState');
  const userAvatar = document.getElementById('userAvatar');

  setupNavigationHandlers();

  if (user) {
    const userData = JSON.parse(user);
    showUserState(userData, loginState, userState, userAvatar);
  } else {
    showLoginState(loginState, userState);
  }
}

function setupNavigationHandlers() {
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  const loginButton = document.getElementById('loginState');
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
}

function showLoginState(loginState, userState) {
  if (loginState) {
    loginState.style.display = 'flex';
  }
  if (userState) {
    userState.style.display = 'none';
  }
}

function showUserState(userData, loginState, userState, userAvatar) {
  if (loginState) {
    loginState.style.display = 'none';
  }
  if (userState) {
    userState.style.display = 'flex';
  }
  
  if (userData.avatar && userData.avatar !== 'null' && userData.avatar !== null && userData.avatar !== '') {
    userAvatar.src = userData.avatar;
  } else {
    userAvatar.src = 'assets/nav/default-avatar.jpg';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
} 