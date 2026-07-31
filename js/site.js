(() => {
const settings=window.SBMG_SETTINGS||{},products=window.SBMG_PRODUCTS||[],$=s=>document.querySelector(s);
const menuBtn=$('.menu-btn'),menu=$('.menu');if(menuBtn)menuBtn.onclick=()=>menu.classList.toggle('open');
const baseWa=`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessage||'Hello SBMG Textiles')}`;
['#whatsappMain','#floatingWhatsapp'].forEach(s=>{const e=$(s);if(e)e.href=baseWa});
if($('#emailMain'))$('#emailMain').href=`mailto:${settings.email}`;
if($('#footerPhone'))$('#footerPhone').textContent=settings.phoneDisplay||'';
if($('#footerEmail'))$('#footerEmail').textContent=settings.email||'';
if($('#footerAddress'))$('#footerAddress').textContent=settings.address||'';
if($('#year'))$('#year').textContent=new Date().getFullYear();
let active='All';const cats=['All',...new Set(products.map(p=>p.category))],filters=$('#productFilters');
cats.forEach(c=>{const b=document.createElement('button');b.className='filter'+(c==='All'?' active':'');b.textContent=c;b.onclick=()=>{active=c;filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderProducts()};filters.appendChild(b)});
$('#productSearch')?.addEventListener('input',renderProducts);
const getImages=p=>Array.isArray(p.images)&&p.images.length?p.images.filter(Boolean):(p.image?[p.image]:[]);
function renderProducts(){const q=($('#productSearch')?.value||'').toLowerCase(),list=products.filter(p=>(active==='All'||p.category===active)&&JSON.stringify(p).toLowerCase().includes(q));
$('#productGrid').innerHTML=list.map(p=>`<article class="product-card clickable" data-product-id="${p.id}" tabindex="0"><div class="product-img"><img src="${getImages(p)[0]||''}" alt="${p.name}"></div><div class="product-body"><span class="tag">${p.badge||p.category}</span><h3>${p.name}</h3><p class="meta">${p.age} · ${p.fabric} · ${p.gsm}</p><p>${p.description||''}</p><span class="product-enquire">Click to view details and photos →</span></div></article>`).join('')||'<p>No products found.</p>';
document.querySelectorAll('.product-card[data-product-id]').forEach(card=>{const open=()=>openProduct(card.dataset.productId);card.onclick=open;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}})}
const modal=$('#productModal');
function openProduct(id){const p=products.find(x=>x.id===id);if(!p)return;const images=getImages(p),main=$('#modalMainImage'),thumbs=$('#modalThumbnails');
$('#modalBadge').textContent=p.badge||p.category||'Product';$('#modalName').textContent=p.name||'';$('#modalDescription').textContent=p.description||'';
$('#modalAge').textContent=p.age||'—';$('#modalSizes').textContent=p.sizes||'—';$('#modalFabric').textContent=p.fabric||'—';$('#modalGsm').textContent=p.gsm||'—';$('#modalCollection').textContent=p.collection||'—';$('#modalDetails').textContent=p.details||'';
$('#modalWhatsapp').href=`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Hello SBMG Textiles, I want details about: '+p.name)}`;
main.src=images[0]||'';main.alt=p.name||'Product photo';thumbs.innerHTML=images.map((src,i)=>`<button class="thumb ${i===0?'active':''}" data-src="${src}"><img src="${src}" alt=""></button>`).join('');
thumbs.querySelectorAll('.thumb').forEach(btn=>btn.onclick=()=>{main.src=btn.dataset.src;thumbs.querySelectorAll('.thumb').forEach(x=>x.classList.toggle('active',x===btn))});
modal.classList.add('open');document.body.classList.add('modal-open')}
function closeProduct(){modal.classList.remove('open');document.body.classList.remove('modal-open')}
document.querySelectorAll('[data-close-modal]').forEach(x=>x.onclick=closeProduct);
const zv=$('#zoomViewer'),zi=$('#zoomImage'),zs=zv?.querySelector('.zoom-stage');let scale=1,x=0,y=0,drag=false,sx=0,sy=0;
const apply=()=>zi.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
function openZoom(){zi.src=$('#modalMainImage').src;scale=1;x=0;y=0;apply();zv.classList.add('open')}
function closeZoom(){zv?.classList.remove('open')}
$('#zoomButton')?.addEventListener('click',openZoom);$('#modalMainImage')?.addEventListener('click',openZoom);$('#zoomClose')?.addEventListener('click',closeZoom);
zs?.addEventListener('wheel',e=>{e.preventDefault();scale=Math.min(5,Math.max(1,scale+(e.deltaY<0?.25:-.25)));if(scale===1){x=0;y=0}apply()},{passive:false});
zs?.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX-x;sy=e.clientY-y;zs.setPointerCapture(e.pointerId)});
zs?.addEventListener('pointermove',e=>{if(!drag||scale<=1)return;x=e.clientX-sx;y=e.clientY-sy;apply()});
zs?.addEventListener('pointerup',()=>drag=false);zs?.addEventListener('dblclick',()=>{scale=scale===1?2.5:1;x=0;y=0;apply()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeProduct();closeZoom()}});
renderProducts();
})();