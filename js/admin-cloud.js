(() => {
  const cfg = window.SBMG_SUPABASE || {};
  const $ = s => document.querySelector(s);
  let client = null;
  let currentEditingId = null;
  let existingImages = [];

  const setupBox = $("#setupRequired");
  const loginView = $("#loginView");
  const adminView = $("#cloudAdminView");
  const loginForm = $("#loginForm");
  const loginMessage = $("#loginMessage");
  const productForm = $("#productForm");
  const productList = $("#cloudProductList");
  const saveBtn = $("#saveProduct");
  const cancelBtn = $("#cancelEdit");
  const logoutBtn = $("#logoutAdmin");

  function configured() {
    return !!(cfg.url && cfg.anonKey && window.supabase);
  }

  function slugify(value) {
    return String(value || "product")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "product";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function showMessage(text, type="info") {
    if (!loginMessage) return;
    loginMessage.textContent = text;
    loginMessage.className = "login-message " + type;
  }

  async function init() {
    if (!configured()) {
      setupBox?.classList.remove("hidden");
      loginView?.classList.add("hidden");
      adminView?.classList.add("hidden");
      return;
    }

    client = window.supabase.createClient(cfg.url, cfg.anonKey);
    const { data } = await client.auth.getSession();

    if (data.session) {
      showAdmin();
      await loadProducts();
    } else {
      showLogin();
    }

    client.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        showAdmin();
        await loadProducts();
      } else {
        showLogin();
      }
    });
  }

  function showLogin() {
    setupBox?.classList.add("hidden");
    loginView?.classList.remove("hidden");
    adminView?.classList.add("hidden");
  }

  function showAdmin() {
    setupBox?.classList.add("hidden");
    loginView?.classList.add("hidden");
    adminView?.classList.remove("hidden");
  }

  loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    showMessage("Signing in...");
    const email = $("#adminEmail").value.trim();
    const password = $("#adminPassword").value;

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      showMessage(error.message, "error");
      return;
    }
    showMessage("");
  });

  logoutBtn?.addEventListener("click", async () => {
    await client.auth.signOut();
  });

  async function uploadImage(file, productId, index) {
    if (!file) return null;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${productId}/${Date.now()}-${index}.${ext}`;

    const { error } = await client.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (error) throw error;

    const { data } = client.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  productForm?.addEventListener("submit", async e => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = "Publishing...";

    try {
      const name = $("#pName").value.trim();
      const id = currentEditingId || slugify(name) + "-" + Date.now().toString().slice(-6);
      const files = [$("#pPhoto1").files[0], $("#pPhoto2").files[0], $("#pPhoto3").files[0]];
      const images = [...existingImages];

      for (let i=0; i<files.length; i++) {
        if (files[i]) {
          const url = await uploadImage(files[i], id, i+1);
          images[i] = url;
        }
      }

      const payload = {
        id,
        name,
        category: $("#pCategory").value.trim(),
        collection: $("#pCollection").value.trim(),
        age: $("#pAge").value.trim(),
        sizes: $("#pSizes").value.trim(),
        fabric: $("#pFabric").value.trim(),
        gsm: $("#pGsm").value.trim(),
        badge: $("#pBadge").value.trim(),
        description: $("#pDescription").value.trim(),
        details: $("#pDetails").value.trim(),
        images: images.filter(Boolean).slice(0,3),
        is_active: $("#pActive").checked,
        sort_order: Number($("#pSort").value || 0),
        updated_at: new Date().toISOString()
      };

      const { error } = await client.from("products").upsert(payload, { onConflict:"id" });
      if (error) throw error;

      resetForm();
      await loadProducts();
      alert("Product published successfully.");
    } catch (err) {
      alert("Could not publish product: " + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Publish Product";
    }
  });

  cancelBtn?.addEventListener("click", resetForm);

  function resetForm() {
    currentEditingId = null;
    existingImages = [];
    productForm?.reset();
    $("#pActive").checked = true;
    $("#formTitle").textContent = "Add Product";
    cancelBtn?.classList.add("hidden");
    renderExistingImages();
  }

  function renderExistingImages() {
    const box = $("#existingImages");
    if (!box) return;
    box.innerHTML = existingImages.filter(Boolean).map((url,i) =>
      `<div><img src="${escapeHtml(url)}" alt=""><small>Current photo ${i+1}</small></div>`
    ).join("");
  }

  async function loadProducts() {
    productList.innerHTML = '<p class="loading-line">Loading products...</p>';
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("sort_order", { ascending:true })
      .order("created_at", { ascending:false });

    if (error) {
      productList.innerHTML = `<p>Could not load products: ${escapeHtml(error.message)}</p>`;
      return;
    }

    if (!data.length) {
      productList.innerHTML = '<div class="empty-admin">No cloud products yet. Add your first product above.</div>';
      return;
    }

    productList.innerHTML = data.map(p => {
      const img = Array.isArray(p.images) && p.images.length ? p.images[0] : "";
      return `<article class="cloud-product-row" data-id="${escapeHtml(p.id)}">
        <div class="cloud-product-thumb">${img ? `<img src="${escapeHtml(img)}" alt="">` : '<span>No photo</span>'}</div>
        <div class="cloud-product-copy">
          <small>${escapeHtml(p.category || "Product")} · ${p.is_active ? "Live" : "Hidden"}</small>
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.age || "")} · ${escapeHtml(p.fabric || "")} · ${escapeHtml(p.gsm || "")}</p>
        </div>
        <div class="cloud-product-actions">
          <button type="button" class="btn edit-cloud">Edit</button>
          <button type="button" class="btn danger delete-cloud">Delete</button>
        </div>
      </article>`;
    }).join("");

    productList.querySelectorAll(".cloud-product-row").forEach(row => {
      const id = row.dataset.id;
      const product = data.find(p => p.id === id);
      row.querySelector(".edit-cloud").onclick = () => editProduct(product);
      row.querySelector(".delete-cloud").onclick = () => deleteProduct(product);
    });
  }

  function editProduct(p) {
    currentEditingId = p.id;
    existingImages = Array.isArray(p.images) ? [...p.images] : [];
    $("#formTitle").textContent = "Edit Product";
    $("#pName").value = p.name || "";
    $("#pCategory").value = p.category || "";
    $("#pCollection").value = p.collection || "";
    $("#pAge").value = p.age || "";
    $("#pSizes").value = p.sizes || "";
    $("#pFabric").value = p.fabric || "";
    $("#pGsm").value = p.gsm || "";
    $("#pBadge").value = p.badge || "";
    $("#pDescription").value = p.description || "";
    $("#pDetails").value = p.details || "";
    $("#pActive").checked = p.is_active !== false;
    $("#pSort").value = p.sort_order || 0;
    cancelBtn.classList.remove("hidden");
    renderExistingImages();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  async function deleteProduct(p) {
    if (!confirm(`Delete "${p.name}"? This removes the product from the website.`)) return;
    const { error } = await client.from("products").delete().eq("id", p.id);
    if (error) {
      alert(error.message);
      return;
    }
    if (currentEditingId === p.id) resetForm();
    await loadProducts();
  }

  init();
})();
