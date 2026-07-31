(() => {
const settings=window.SBMG_SETTINGS||{}, products=window.SBMG_PRODUCTS||[], catalogues=window.SBMG_CATALOGUES||[];
const $=s=>document.querySelector(s);
const menuBtn=$('.menu-btn'), menu=$('.menu');
if(menuBtn) menuBtn.onclick=()=>menu.classList.toggle('open');
const wa=`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessage||'Hello SBMG Textiles')}`;
['#whatsappMain','#floatingWhatsapp'].forEach(s=>{const e=$(s);if(e)e.href=wa});
const email=$('#emailMain'); if(email)email.href=`mailto:${settings.email}`;
if($('#footerPhone'))$('#footerPhone').textContent=settings.phoneDisplay||'';
if($('#footerEmail'))$('#footerEmail').textContent=settings.email||'';
if($('#footerAddress'))$('#footerAddress').textContent=settings.address||'';
if($('#year'))$('#year').textContent=new Date().getFullYear();

let active='All';
const cats=['All',...new Set(products.map(p=>p.category))];
const filters=$('#productFilters');
cats.forEach(c=>{const b=document.createElement('button');b.className='filter'+(c==='All'?' active':'');b.textContent=c;b.onclick=()=>{active=c;filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderProducts()};filters.appendChild(b)});
$('#productSearch')?.addEventListener('input',renderProducts);
function renderProducts(){
 const q=($('#productSearch')?.value||'').toLowerCase();
 const list=products.filter(p=>(active==='All'||p.category===active)&&JSON.stringify(p).toLowerCase().includes(q));
 $('#productGrid').innerHTML=list.map(p=>`<article class="product-card">
 <div class="product-img"><img src="${p.image}" alt="${p.name}"></div>
 <div class="product-body"><span class="tag">${p.badge||p.category}</span><h3>${p.name}</h3>
 <p class="meta">${p.age} · ${p.fabric} · ${p.gsm}</p><p>${p.description||''}</p>
 <a class="product-enquire" target="_blank" href="${wa}&text=${encodeURIComponent(' Enquiry: '+p.name)}">Enquire on WhatsApp →</a></div></article>`).join('')||'<p>No products found.</p>';
}
function renderCatalogues(){
 const grid=$('#catalogueGrid');
 if(!catalogues.length){grid.innerHTML='<div class="empty">No catalogues added yet. Open admin.html to add one.</div>';return}
 grid.innerHTML=catalogues.map(c=>`<article class="catalogue-card">
 <div class="catalogue-cover"><img src="${c.cover}" alt="${c.title}"></div>
 <div class="catalogue-body"><span class="tag">${c.season} ${c.year}</span><h3>${c.title}</h3><p>${c.description||''}</p>
 <div class="catalogue-actions"><a class="small-btn view" href="${c.pdf}" target="_blank">View PDF</a><a class="small-btn download" href="${c.pdf}" download>Download</a></div></div></article>`).join('');
}
renderProducts();renderCatalogues();
})();