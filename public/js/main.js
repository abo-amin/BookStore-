// Toast notification
window.showToast = function(msg, type='info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast toast-' + type + ' show';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.className = 'toast', 3500);
};

// Cart badge
window._updateCartBadge = function(count) {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = count;
};

// Add to cart (global)
window._addToCart = async function(bookId, qty=1) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
      body: JSON.stringify({bookId, quantity: qty})
    });
    const data = await res.json();
    if (data.success) {
      window.showToast('Added to cart!', 'success');
      window._updateCartBadge(data.totalItems);
    } else if (res.status === 401) {
      window.showToast('Please login to add to cart', 'error');
      setTimeout(() => window.location.href = '/login', 1200);
    } else {
      window.showToast(data.message, 'error');
    }
  } catch(e) { window.showToast('Something went wrong', 'error'); }
};

// Add to cart buttons
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;
  window._addToCart(id, 1);
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

// Dropdown menu
document.querySelectorAll('.dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.parentElement.classList.toggle('open');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
});

// Fetch cart count on load
async function loadCartCount() {
  try {
    const res = await fetch('/api/cart', {headers:{'X-Requested-With':'XMLHttpRequest'}});
    if (res.ok) {
      const data = await res.json();
      window._updateCartBadge(data.totalItems || 0);
    }
  } catch(e) {}
}
loadCartCount();

// Books page AJAX loader
if (document.getElementById('booksGrid')) {
  let currentPage = 1, searchTimer;
  const params = new URLSearchParams(window.location.search);

  function getFilters() {
    return {
      search: document.getElementById('booksSearchInput')?.value || params.get('search') || '',
      category: document.querySelector('input[name="category"]:checked')?.value || params.get('category') || '',
      minPrice: document.getElementById('minPrice')?.value || '',
      maxPrice: document.getElementById('maxPrice')?.value || '',
      sort: document.getElementById('sortSelect')?.value || '',
      page: currentPage, limit: 12
    };
  }

  async function loadBooks() {
    const f = getFilters();
    const q = new URLSearchParams(Object.fromEntries(Object.entries(f).filter(([,v])=>v!=='')));
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    try {
      const res = await fetch('/api/books?' + q, {headers:{'X-Requested-With':'XMLHttpRequest'}});
      const data = await res.json();
      document.getElementById('resultsCount').textContent = data.total + ' books found';
      if (!data.books.length) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-search empty-icon"></i><p>No books found.</p></div>';
        document.getElementById('pagination').innerHTML = '';
        return;
      }
      grid.innerHTML = data.books.map(b => `
        <div class="book-card">
          <a href="/book-detail.html?id=${b._id}" class="book-card-img-link">
            <img src="${b.coverImage||'/images/default-book.png'}" alt="${b.title}" class="book-card-img" loading="lazy"/>
            ${b.featured?'<span class="badge badge-featured">Featured</span>':''}
            ${b.stock===0?'<span class="badge badge-out">Out of Stock</span>':''}
          </a>
          <div class="book-card-body">
            <span class="book-category">${b.category}</span>
            <h3 class="book-title"><a href="/book-detail.html?id=${b._id}">${b.title}</a></h3>
            <p class="book-author"><i class="fas fa-user-pen"></i> ${b.author}</p>
            <div class="book-card-footer">
              <span class="book-price">$${b.price.toFixed(2)}</span>
              ${b.stock>0?`<button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${b._id}"><i class="fas fa-cart-plus"></i> Add</button>`:'<button class="btn btn-sm" disabled style="opacity:.5">Out of Stock</button>'}
            </div>
          </div>
        </div>`).join('');
      // Pagination
      const pg = document.getElementById('pagination');
      let html = '';
      for(let i=1;i<=data.pages;i++) html += `<button class="page-btn ${i===data.page?'active':''}" onclick="goPage(${i})">${i}</button>`;
      pg.innerHTML = html;
    } catch(e) { grid.innerHTML = '<div class="empty-state"><p>Failed to load books.</p></div>'; }
  }

  window.goPage = function(p) { currentPage = p; loadBooks(); window.scrollTo({top:0,behavior:'smooth'}); };

  // Set initial category from URL
  const urlCat = params.get('category');
  if (urlCat) { const r = document.querySelector(`input[name="category"][value="${urlCat}"]`); if(r) r.checked=true; }

  document.getElementById('booksSearchInput')?.addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage=1; loadBooks(); }, 400);
  });
  document.getElementById('applyFilters')?.addEventListener('click', () => { currentPage=1; loadBooks(); });
  document.getElementById('clearFilters')?.addEventListener('click', () => {
    document.querySelectorAll('input[name="category"]')[0].checked = true;
    document.getElementById('minPrice').value='';
    document.getElementById('maxPrice').value='';
    document.getElementById('sortSelect').value='';
    document.getElementById('booksSearchInput').value='';
    currentPage=1; loadBooks();
  });
  document.getElementById('toggleFilters')?.addEventListener('click', () => {
    document.getElementById('filtersSidebar').classList.toggle('open');
  });
  loadBooks();
}
