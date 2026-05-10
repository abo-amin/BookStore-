// Global UI State Management
async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth/me', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        window.currentUser = data.user;
        updateNavbarForUser(data.user);
        return data.user;
      }
    }
  } catch (e) {
    console.error('Auth check failed', e);
  }
  updateNavbarForGuest();
  return null;
}

function updateNavbarForUser(user) {
  const authLinks = document.getElementById('authLinks');
  if (!authLinks) return;
  
  const firstName = user.name.split(' ')[0];
  let html = `
    <a href="/cart.html" class="nav-link cart-link" id="navCartLink">
      <i class="fas fa-shopping-cart"></i>
      <span class="cart-badge" id="cartBadge">0</span>
    </a>
    <div class="nav-dropdown">
      <button class="nav-link dropdown-toggle">
        <i class="fas fa-user-circle"></i> ${firstName} <i class="fas fa-chevron-down fa-xs"></i>
      </button>
      <div class="dropdown-menu">
        <a href="/profile.html" class="dropdown-item"><i class="fas fa-user"></i> Profile</a>
        ${user.role === 'admin' ? '<a href="/admin/dashboard.html" class="dropdown-item"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' : ''}
        <div class="dropdown-divider"></div>
        <button onclick="logout()" class="dropdown-item text-danger" style="width:100%;text-align:left"><i class="fas fa-sign-out-alt"></i> Logout</button>
      </div>
    </div>
  `;
  authLinks.innerHTML = html;
  
  // Re-bind dropdown listeners
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.parentElement.classList.toggle('open');
    });
  });
  
  // Load cart count
  if (typeof loadCartCount === 'function') loadCartCount();
}

function updateNavbarForGuest() {
  const authLinks = document.getElementById('authLinks');
  if (!authLinks) return;
  authLinks.innerHTML = `
    <a href="/login.html" class="nav-link">Login</a>
    <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
  `;
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    window.location.href = '/login.html';
  } catch(e) {
    console.error(e);
  }
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});
