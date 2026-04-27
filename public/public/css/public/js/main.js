// =====================
// LOCAL STORAGE PRODUCT LOADER (works with admin panel)
// =====================
let products = [];

function loadProducts() {
  const stored = localStorage.getItem('pmcProducts');
  products = stored ? JSON.parse(stored) : [];
  renderProducts();
}

// =====================
// CART FUNCTIONALITY
// =====================
let cart = JSON.parse(localStorage.getItem('pmcCart')) || [];

function saveCart() {
  localStorage.setItem('pmcCart', JSON.stringify(cart));
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartUI();
  showAddedAnimation(productId);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, newQuantity);
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = totalItems;
  document.getElementById('cartTotal').textContent = getCartTotal().toLocaleString();
}

function showAddedAnimation(productId) {
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.textContent = '✔ Added to cart!';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

// =====================
// RENDER PRODUCTS
// =====================
function renderProducts(filteredProducts = null) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const toRender = filteredProducts || products;
  grid.innerHTML = toRender.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22/>'">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p style="font-size:0.8rem; color:#aaa;">${product.description || ''}</p>
        <p class="price">₦${product.price.toLocaleString()}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">➕ Add to Cart</button>
      </div>
    </div>
  `).join('');
}

// =====================
// CART SIDEBAR
// =====================
const cartSidebar = document.getElementById('cartSidebar');
const overlay = document.getElementById('overlay');
const cartIcon = document.getElementById('cartIcon');
const closeCart = document.getElementById('closeCart');

cartIcon.addEventListener('click', () => {
  cartSidebar.classList.add('active');
  overlay.classList.add('active');
  renderCartItems();
});
closeCart.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
});
overlay.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
});

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">No items in cart.</p>';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item" style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:15px;">
      <img src="${item.image}" style="width:50px; height:50px; object-fit:contain; background:#000;">
      <div style="flex:1;">
        <h4 style="font-size:0.9rem;">${item.name}</h4>
        <p style="color:var(--neon-green);">₦${item.price.toLocaleString()}</p>
        <div style="display:flex; align-items:center; gap:10px;">
          <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" style="background:#333; border:none; color:white; width:25px;">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" style="background:#333; border:none; color:white; width:25px;">+</button>
          <button onclick="removeFromCart(${item.id})" style="margin-left:auto; background:#ff4444; border:none; color:white; border-radius:50%; width:25px;">🗑</button>
        </div>
      </div>
    </div>
  `).join('');
}

// =====================
// WHATSAPP CHECKOUT
// =====================
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  const phone = '2348038919878'; // ← change to final number later
  let message = `📱 *New Order from PMC Website*%0A%0A`;
  cart.forEach((item, i) => {
    message += `${i+1}. ${item.name} - ₦${item.price.toLocaleString()} x ${item.quantity}%0A`;
  });
  message += `%0A🧾 *Total: ₦${getCartTotal().toLocaleString()}*%0A`;
  message += `%0A👤 Name:%0A📍 Preferred Store: Ugbor / Mission Road / Pipeline%0A%0AThank you!`;
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
});

// =====================
// SEARCH
// =====================
document.getElementById('searchBtn').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') performSearch();
});
function performSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  if (!query) { renderProducts(); return; }
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query)) ||
    (p.category && p.category.toLowerCase().includes(query))
  );
  renderProducts(filtered);
  document.getElementById('productGrid')?.scrollIntoView({ behavior: 'smooth' });
}

// Mobile nav
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartUI();
  // Inject toast style
  const style = document.createElement('style');
  style.textContent = `
    .cart-toast {
      position: fixed; bottom:20px; right:20px;
      background: var(--neon-green); color:black;
      padding:12px 25px; border-radius:30px;
      font-weight:bold; z-index:9999;
      animation: fadeInOut 1.5s ease;
    }
    @keyframes fadeInOut {
      0% { opacity:0; transform: translateY(20px); }
      15% { opacity:1; transform: translateY(0); }
      85% { opacity:1; }
      100% { opacity:0; }
    }
  `;
  document.head.appendChild(style);
});
