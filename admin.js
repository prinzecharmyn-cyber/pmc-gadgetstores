// Static Admin Panel – uses localStorage 'pmcProducts'
const LOGIN_KEY = 'pmcAdminLoggedIn';
const STORAGE_KEY = 'pmcProducts';
const USER = 'admin';
const PASS = 'pmc2026';

// UI elements
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginMsg = document.getElementById('loginMsg');
const addForm = document.getElementById('addProductForm');
const addMsg = document.getElementById('addMsg');
const tableBody = document.querySelector('#productTable tbody');

// Check login state
if (sessionStorage.getItem(LOGIN_KEY) === 'true') {
  showPanel();
  renderTable();
}

loginBtn.addEventListener('click', () => {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if (u === USER && p === PASS) {
    sessionStorage.setItem(LOGIN_KEY, 'true');
    showPanel();
    renderTable();
  } else {
    loginMsg.textContent = 'Invalid credentials.';
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(LOGIN_KEY);
  adminPanel.style.display = 'none';
  loginScreen.style.display = 'flex';
});

function showPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display = 'block';
}

// --- localStorage helpers ---
function getProducts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function saveProducts(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function renderTable() {
  const products = getProducts();
  tableBody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image}" width="50" onerror="this.style.display='none'"></td>
      <td>${p.name}</td>
      <td>${p.category || '-'}</td>
      <td>₦${p.price.toLocaleString()}</td>
      <td><button class="delete-btn" data-id="${p.id}">🗑 Delete</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      if (!confirm('Delete this product?')) return;
      let products = getProducts();
      products = products.filter(p => p.id !== id);
      saveProducts(products);
      renderTable();
    });
  });
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = addForm.name.value.trim();
  const category = addForm.category.value.trim() || 'Other';
  const price = Number(addForm.price.value);
  const description = addForm.description.value.trim();
  const image = addForm.image.value.trim();

  if (!name || !price || !image) {
    addMsg.textContent = '❌ Name, price, and image URL are required.';
    return;
  }
  const newProduct = {
    id: Date.now(),
    name,
    category,
    price,
    description,
    image
  };
  const products = getProducts();
  products.push(newProduct);
  saveProducts(products);
  addMsg.textContent = `✅ ${name} added!`;
  addForm.reset();
  renderTable();
});
