const pages = document.querySelectorAll(".page");
const loading = document.querySelector("#loading-message");
const productList = document.querySelector("#product-list");
const categorySelect = document.querySelector("#category-filter");
const searchBar = document.querySelector("#search-bar");
const productDetails = document.querySelector("#product-details");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const orderSummary = document.querySelector("#order-summary");
const checkoutTotal = document.querySelector("#checkout-total");

let cart = [];
let products = [];
let filteredProducts = [];

function showPage(page) {
  pages.forEach((p) => p.classList.add("hidden"));
  document.querySelector(`#${page}-page`).classList.remove("hidden");
  if (page === "cart") renderCart();
  if (page === "checkout") renderCheckout();
}

function fetchProducts() {
  loading.classList.remove("hidden");
  productList.innerHTML = "";

  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => {
      products = data.map((p) => ({
        ...p,
        images: [p.image],
        category: { name: p.category },
      }));

      filteredProducts = products;
      renderProducts();
      populateCategories();
      loading.classList.add("hidden");
    })
    .catch(() => {
      loading.innerHTML =
        "❌ Failed to load products. Please check your internet and try again.";
    });
}

function populateCategories() {
  const categories = [...new Set(products.map((p) => p.category.name))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((c) => {
    categorySelect.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function filterProducts() {
  const search = searchBar.value.toLowerCase();
  const category = categorySelect.value;
  filteredProducts = products.filter((p) => {
    return (
      (category === "all" || p.category.name === category) &&
      p.title.toLowerCase().includes(search)
    );
  });
  renderProducts();
}

function renderProducts() {
  productList.innerHTML = "";
  filteredProducts.forEach((p) => {
    const imgUrl = p.images && p.images.length > 0 ? p.images[0] : "";
    productList.innerHTML += `
      <div class="bg-white p-4 rounded shadow hover:shadow-lg transition">
        <img src="${imgUrl}" alt="${p.title}" class="h-40 mx-auto object-contain">
        <h3 class="font-bold text-lg mt-2">${p.title}</h3>
        <p class="text-gray-600">$${p.price}</p>
        <button onclick="viewProduct(${p.id})" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded">View</button>
      </div>`;
  });
}

function viewProduct(id) {
  const p = products.find((pr) => pr.id === id);
  const imgUrl = p.images && p.images.length > 0 ? p.images[0] : "";
  productDetails.innerHTML = `
    <img src="${imgUrl}" alt="${p.title}" class="h-60 mx-auto mb-4 object-contain">
    <h2 class="text-2xl font-bold mb-2">${p.title}</h2>
    <p class="mb-2">${p.description}</p>
    <p class="text-lg font-bold mb-4">$${p.price}</p>
    <button onclick="addToCart(${p.id})" class="bg-green-600 text-white px-4 py-2 rounded">Add to Cart</button>
  `;
  showPage("product");
}

function addToCart(id) {
  const item = cart.find((c) => c.id === id);
  if (item) {
    item.qty++;
  } else {
    const p = products.find((pr) => pr.id === id);
    cart.push({ ...p, qty: 1 });
  }
  updateCartCount();
  alert("Added to cart!");
}

function updateCartCount() {
  cartCount.innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    const imgUrl = item.images && item.images.length > 0 ? item.images[0] : "";
    cartItems.innerHTML += `
      <div class="flex justify-between items-center bg-white p-4 rounded shadow">
        <div class="flex items-center space-x-3">
          <img src="${imgUrl}" alt="${item.title}" class="h-16 w-16 object-contain rounded">
          <div>
            <h3 class="font-bold">${item.title}</h3>
            <p>$${item.price} x ${item.qty}</p>
          </div>
        </div>
        <div class="space-x-2">
          <button onclick="changeQty(${item.id}, -1)" class="bg-gray-300 px-2 rounded">-</button>
          <button onclick="changeQty(${item.id}, 1)" class="bg-gray-300 px-2 rounded">+</button>
          <button onclick="removeItem(${item.id})" class="bg-red-600 text-white px-2 rounded">Remove</button>
        </div>
      </div>`;
  });
  cartTotal.innerText = total.toFixed(2);
}

function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
    renderCart();
    updateCartCount();
  }
}

function removeItem(id) {
  cart = cart.filter((c) => c.id !== id);
  renderCart();
  updateCartCount();
}

function renderCheckout() {
  orderSummary.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    orderSummary.innerHTML += `<p>${item.title} - $${item.price} x ${item.qty}</p>`;
  });
  checkoutTotal.innerText = total.toFixed(2);
}

function placeOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  alert("Order placed successfully!");
  cart = [];
  updateCartCount();
  showPage("home");
}

fetchProducts();
