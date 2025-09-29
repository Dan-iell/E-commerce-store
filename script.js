let cart = [];
let products = [];
let filteredProducts = [];

function showPage(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  document.querySelector("#" + page + "-page").classList.remove("hidden");
  if (page === "cart") renderCart();
  if (page === "checkout") renderCheckout();
}

function fetchProducts() {
  const loading = document.querySelector("#loading-message");
  const productList = document.querySelector("#product-list");

  // show loading
  loading.classList.remove("hidden");
  productList.innerHTML = "";

  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => {
      products = data;
      filteredProducts = products;
      renderProducts();
      populateCategories();
      loading.classList.add("hidden"); // hide loading
    })
    .catch(() => {
      loading.innerHTML =
        "❌ Failed to load products. Please check your internet and try again.";
    });
}

function populateCategories() {
  const categories = [...new Set(products.map((p) => p.category))];
  const select = document.querySelector("#category-filter");
  // reset and add "All"
  select.innerHTML = `<option value="all">All</option>`;
  categories.forEach((c) => {
    select.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function filterProducts() {
  const search = document.querySelector("#search-bar").value.toLowerCase();
  const category = document.querySelector("#category-filter").value;
  filteredProducts = products.filter((p) => {
    return (
      (category === "all" || p.category === category) &&
      p.title.toLowerCase().includes(search)
    );
  });
  renderProducts();
}

function renderProducts() {
  const list = document.querySelector("#product-list");
  list.innerHTML = "";
  filteredProducts.forEach((p) => {
    list.innerHTML += `
      <div class="bg-white p-4 rounded shadow hover:shadow-lg transition">
        <img src="${p.image}" alt="${p.title}" class="h-40 mx-auto">
        <h3 class="font-bold text-lg mt-2">${p.title}</h3>
        <p class="text-gray-600">$${p.price}</p>
        <button onclick="viewProduct(${p.id})" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded">View</button>
      </div>`;
  });
}

function viewProduct(id) {
  const p = products.find((pr) => pr.id === id);
  document.querySelector("#product-details").innerHTML = `
    <img src="${p.image}" alt="${p.title}" class="h-60 mx-auto mb-4">
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
  document.querySelector("#cart-count").innerText = cart.reduce(
    (sum, i) => sum + i.qty,
    0
  );
}

function renderCart() {
  const container = document.querySelector("#cart-items");
  container.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    container.innerHTML += `
      <div class="flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h3 class="font-bold">${item.title}</h3>
          <p>$${item.price} x ${item.qty}</p>
        </div>
        <div class="space-x-2">
          <button onclick="changeQty(${item.id}, -1)" class="bg-gray-300 px-2 rounded">-</button>
          <button onclick="changeQty(${item.id}, 1)" class="bg-gray-300 px-2 rounded">+</button>
          <button onclick="removeItem(${item.id})" class="bg-red-600 text-white px-2 rounded">Remove</button>
        </div>
      </div>`;
  });
  document.querySelector("#cart-total").innerText = total.toFixed(2);
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
  const summary = document.querySelector("#order-summary");
  summary.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    summary.innerHTML += `<p>${item.title} - $${item.price} x ${item.qty}</p>`;
  });
  document.querySelector("#checkout-total").innerText = total.toFixed(2);
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

// ✅ to make sure DOM is ready before running
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});
