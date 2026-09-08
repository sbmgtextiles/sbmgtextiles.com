(() => {
  const settings = window.SBMG_SETTINGS || {};
  const products = window.SBMG_PRODUCTS || [];
  const $ = (s, root=document) => root.querySelector(s);

  let activeProduct = null;
  let order = [];
  try {
    order = JSON.parse(localStorage.getItem("sbmg_wholesale_order") || "[]");
  } catch (_) {
    order = [];
  }

  const modal = $("#productModal");
  const qtyWrap = $("#modalSizeQty");
  const addBtn = $("#addToOrder");
  const orderDrawer = $("#orderDrawer");
  const orderItems = $("#orderItems");
  const orderFab = $("#orderFab");
  const orderCount = $("#orderCount");
  const totalPieces = $("#orderTotalPieces");
  const shopInput = $("#orderShopName");
  const cityInput = $("#orderCity");
  const sendBtn = $("#sendOrderWhatsapp");
  const clearBtn = $("#clearOrder");

  function parseSizes(value) {
    if (Array.isArray(value)) return value.map(String);
    return String(value || "")
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);
  }

  function saveOrder() {
    localStorage.setItem("sbmg_wholesale_order", JSON.stringify(order));
    updateOrderButton();
  }

  function totalFor(item) {
    return Object.values(item.quantities || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);
  }

  function grandTotal() {
    return order.reduce((sum, item) => sum + totalFor(item), 0);
  }

  function updateOrderButton() {
    const pcs = grandTotal();
    if (orderCount) orderCount.textContent = pcs;
    if (orderFab) orderFab.classList.toggle("has-items", pcs > 0);
  }

  function prepareProduct(product) {
    activeProduct = product;
    if (!qtyWrap || !product) return;

    const sizes = parseSizes(product.sizes);
    qtyWrap.innerHTML = sizes.map(size => `
      <label class="size-qty-card">
        <span>Size ${size}</span>
        <input class="size-qty-input" type="number" min="0" step="1" value="0" inputmode="numeric" data-size="${size}" aria-label="Quantity for size ${size}">
      </label>
    `).join("");

    if (addBtn) {
      addBtn.disabled = false;
      addBtn.textContent = "Add to Order";
    }
  }

  function findProductFromModal() {
    const name = ($("#modalName")?.textContent || "").trim();
    return products.find(p => p.name === name) || null;
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card[data-product-id]");
    if (card) {
      const product = products.find(p => p.id === card.dataset.productId);
      if (product) setTimeout(() => prepareProduct(product), 0);
    }

    if (e.target.closest("[data-open-order]")) {
      e.preventDefault();
      openOrder();
    }

    if (e.target.closest("[data-close-order]")) {
      e.preventDefault();
      closeOrder();
    }

    const remove = e.target.closest("[data-remove-order]");
    if (remove) {
      const id = remove.dataset.removeOrder;
      order = order.filter(item => item.id !== id);
      saveOrder();
      renderOrder();
    }
  });

  if (modal) {
    const observer = new MutationObserver(() => {
      if (modal.classList.contains("open") && !activeProduct) {
        const product = findProductFromModal();
        if (product) prepareProduct(product);
      }
      if (!modal.classList.contains("open")) activeProduct = null;
    });
    observer.observe(modal, { attributes:true, attributeFilter:["class"] });
  }

  addBtn?.addEventListener("click", () => {
    if (!activeProduct) activeProduct = findProductFromModal();
    if (!activeProduct) return;

    const quantities = {};
    qtyWrap?.querySelectorAll(".size-qty-input").forEach(input => {
      const qty = Math.max(0, parseInt(input.value || "0", 10) || 0);
      if (qty > 0) quantities[input.dataset.size] = qty;
    });

    const pcs = Object.values(quantities).reduce((a,b) => a+b, 0);
    if (!pcs) {
      alert("Enter quantity for at least one size.");
      return;
    }

    const existing = order.find(item => item.id === activeProduct.id);
    if (existing) {
      Object.entries(quantities).forEach(([size, qty]) => {
        existing.quantities[size] = (Number(existing.quantities[size]) || 0) + qty;
      });
    } else {
      order.push({
        id: activeProduct.id,
        name: activeProduct.name,
        quantities
      });
    }

    saveOrder();
    qtyWrap?.querySelectorAll(".size-qty-input").forEach(input => input.value = 0);
    addBtn.textContent = `Added ✓ (${pcs} pcs)`;
    setTimeout(() => addBtn.textContent = "Add to Order", 1300);
  });

  function renderOrder() {
    if (!orderItems) return;

    if (!order.length) {
      orderItems.innerHTML = '<div class="order-empty"><strong>Your order is empty.</strong><span>Open a product and enter size quantities.</span></div>';
    } else {
      orderItems.innerHTML = order.map((item, index) => {
        const rows = Object.entries(item.quantities || {})
          .filter(([,qty]) => Number(qty) > 0)
          .map(([size, qty]) => `<span>Size ${size}: <b>${qty} pcs</b></span>`)
          .join("");

        return `
          <article class="order-item">
            <div class="order-item-head">
              <div><small>STYLE ${index + 1}</small><h4>${item.name}</h4></div>
              <button type="button" class="remove-order" data-remove-order="${item.id}">Remove</button>
            </div>
            <div class="order-size-summary">${rows}</div>
            <div class="order-item-total">Total <b>${totalFor(item)} pcs</b></div>
          </article>
        `;
      }).join("");
    }

    if (totalPieces) totalPieces.textContent = grandTotal();
  }

  function openOrder() {
    renderOrder();
    orderDrawer?.classList.add("open");
    orderDrawer?.setAttribute("aria-hidden", "false");
    document.body.classList.add("order-open");
  }

  function closeOrder() {
    orderDrawer?.classList.remove("open");
    orderDrawer?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("order-open");
  }

  clearBtn?.addEventListener("click", () => {
    if (!order.length) return;
    if (!confirm("Clear all products from this order?")) return;
    order = [];
    saveOrder();
    renderOrder();
  });

  sendBtn?.addEventListener("click", () => {
    if (!order.length) {
      alert("Your order is empty.");
      return;
    }

    const shop = (shopInput?.value || "").trim();
    const city = (cityInput?.value || "").trim();
    let message = "Hello SBMG Textiles, I would like to place a wholesale order.\n\n";

    if (shop) message += `Shop: ${shop}\n`;
    if (city) message += `City: ${city}\n`;
    if (shop || city) message += "\n";

    order.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      Object.entries(item.quantities || {}).forEach(([size, qty]) => {
        if (Number(qty) > 0) message += `Size ${size}: ${qty} pcs\n`;
      });
      message += `Total: ${totalFor(item)} pcs\n\n`;
    });

    message += `*GRAND TOTAL: ${grandTotal()} pcs*\n\nPlease confirm availability and price.`;

    const phone = String(settings.whatsapp || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });

  orderFab?.addEventListener("click", openOrder);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && orderDrawer?.classList.contains("open")) closeOrder();
  });

  updateOrderButton();
})();