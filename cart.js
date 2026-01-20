// ===== OFELIA CART SYSTEM =====

class Cart {
  constructor() {
    this.items = this.loadCart();
    this.init();
  }

  init() {
    this.updateCartCount();
    this.renderCartItems();
    this.bindEvents();
  }

  loadCart() {
    const saved = localStorage.getItem("ofeliaCart");
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem("ofeliaCart", JSON.stringify(this.items));
  }

  addItem(product) {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({
        ...product,
        quantity: 1,
      });
    }

    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
    this.showNotification(`${product.name} agregado al carrito`);
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  updateQuantity(productId, change) {
    const item = this.items.find((item) => item.id === productId);

    if (item) {
      item.quantity += change;

      if (item.quantity <= 0) {
        this.removeItem(productId);
        return;
      }

      this.saveCart();
      this.updateCartCount();
      this.renderCartItems();
    }
  }

  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  updateCartCount() {
    const countElements = document.querySelectorAll(".cart-count");
    const totalItems = this.getTotalItems();

    countElements.forEach((el) => {
      el.textContent = totalItems;
      el.style.display = totalItems > 0 ? "flex" : "none";
    });
  }

  renderCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartSubtotal = document.getElementById("cartSubtotal");

    if (!cartItemsContainer) return;

    if (this.items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
          </svg>
          <p>Tu carrito está vacío</p>
        </div>
      `;
      if (cartSubtotal) cartSubtotal.textContent = "$0";
      return;
    }

    cartItemsContainer.innerHTML = this.items
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toLocaleString(
            "es-AR"
          )}</div>
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="cart.updateQuantity('${
              item.id
            }', -1)">−</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="qty-btn" onclick="cart.updateQuantity('${
              item.id
            }', 1)">+</button>
            <button class="cart-item-remove" onclick="cart.removeItem('${
              item.id
            }')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    if (cartSubtotal) {
      cartSubtotal.textContent = `$${this.getTotal().toLocaleString("es-AR")}`;
    }
  }

  bindEvents() {
    // Add to cart buttons
    document.querySelectorAll("[data-add-cart]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productCard = e.target.closest(".product-card");
        if (!productCard) return;

        const product = {
          id: productCard.dataset.productId,
          name: productCard.querySelector(".product-name").textContent,
          price: parseInt(productCard.dataset.price),
          image: productCard.querySelector(".product-image img")?.src || "",
        };

        this.addItem(product);
      });
    });
  }

  showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector(".cart-notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7"/>
      </svg>
      <span>${message}</span>
    `;
    notification.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #22c55e;
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
      z-index: 3000;
      animation: slideUp 0.3s ease forwards;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUp {
        to { transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideUp 0.3s ease reverse forwards";
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }
}

// Cart Modal Toggle
function toggleCart() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");

  modal.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.style.overflow = modal.classList.contains("active")
    ? "hidden"
    : "";
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const mobileNav = document.getElementById("mobileNav");
  const hamburger = document.querySelector(".hamburger");

  mobileNav.classList.toggle("active");
  hamburger.classList.toggle("active");
  document.body.style.overflow = mobileNav.classList.contains("active")
    ? "hidden"
    : "";
}

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Initialize cart
const cart = new Cart();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Close mobile menu if open
      const mobileNav = document.getElementById("mobileNav");
      if (mobileNav && mobileNav.classList.contains("active")) {
        toggleMobileMenu();
      }
    }
  });
});
