(() => {
  const cfg = window.SBMG_SUPABASE || {};
  const fallback = Array.isArray(window.SBMG_PRODUCTS) ? window.SBMG_PRODUCTS : [];

  async function loadCloudProducts() {
    if (!cfg.url || !cfg.anonKey || !window.supabase) return fallback;

    try {
      const client = window.supabase.createClient(cfg.url, cfg.anonKey);
      const { data, error } = await client
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!Array.isArray(data) || !data.length) return fallback;

      return data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || "",
        collection: p.collection || "",
        age: p.age || "",
        sizes: p.sizes || "",
        fabric: p.fabric || "",
        gsm: p.gsm || "",
        badge: p.badge || "",
        description: p.description || "",
        details: p.details || "",
        images: Array.isArray(p.images) ? p.images : []
      }));
    } catch (err) {
      console.warn("SBMG cloud products unavailable; using local products.", err);
      return fallback;
    }
  }

  window.SBMG_PRODUCTS_READY = loadCloudProducts().then(items => {
    window.SBMG_PRODUCTS = items;
    return items;
  });
})();
