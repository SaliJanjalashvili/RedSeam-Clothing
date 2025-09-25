// NAVIGATION MODULE
// handles navigation state based on user authentication

function initNavigation() {
  const loginState = document.getElementById('loginState');
  const userState = document.getElementById('userState');
  const userAvatar = document.getElementById('userAvatar');

  const token = sessionStorage.getItem('authToken');
  const user = sessionStorage.getItem('user');
  
  if (token && user) {
    const userData = JSON.parse(user);
    showUserState(userData, loginState, userState, userAvatar);
  } else {
    showLoginState(loginState, userState);
  }
  
  if (loginState) {
    loginState.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }
}

function showUserState(userData, loginState, userState, userAvatar) {
  loginState.classList.add('hidden');
  
  userState.classList.remove('hidden');
  
  if (userData.avatar && userData.avatar !== 'null' && userData.avatar !== null && userData.avatar !== '') {
    userAvatar.src = userData.avatar;
  } else {
    userAvatar.src = 'assets/nav/default-avatar.jpg';
  }  
}

function showLoginState(loginState, userState) {
  loginState.classList.remove('hidden');
  
  userState.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', initNavigation); 