(() => {
let catalogues=JSON.parse(JSON.stringify(window.SBMG_CATALOGUES||[]));
let products=JSON.parse(JSON.stringify(window.SBMG_PRODUCTS||[]));
let settings=JSON.parse(JSON.stringify(window.SBMG_SETTINGS||{}));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.panel').forEach(p=>p.classList.toggle('active',p.id===b.dataset.tab))});

const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function field(label,key,value,type='text',cls=''){return `<div class="field ${cls}"><label>${label}</label>${type==='textarea'?`<textarea data-key="${key}">${esc(value)}</textarea>`:`<input type="${type}" data-key="${key}" value="${esc(value)}">`}</div>`}
function bindCards(container,data,render){
 container.querySelectorAll('.editor-card').forEach((card,i)=>{
   card.querySelectorAll('[data-key]').forEach(inp=>inp.oninput=()=>{data[i][inp.dataset.key]=inp.type==='checkbox'?inp.checked:inp.value});
   card.querySelector('.delete').onclick=()=>{data.splice(i,1);render()};
 });
}
function renderCatalogues(){
 const el=$('#catalogueEditor');
 el.innerHTML=catalogues.map((c,i)=>`<article class="editor-card"><div class="editor-top"><h3>${esc(c.title||'New Catalogue')}</h3><button class="btn danger delete">Delete</button></div><div class="form-grid">
 ${field('Catalogue Title','title',c.title)}${field('Season','season',c.season)}${field('Year','year',c.year)}
 ${field('Cover Image Path','cover',c.cover,'text','wide')}${field('PDF Path','pdf',c.pdf,'text','wide')}
 ${field('Description','description',c.description,'textarea','full')}</div></article>`).join('');
 bindCards(el,catalogues,renderCatalogues);
}
function renderProducts(){
 const el=$('#productEditor');
 el.innerHTML=products.map((p,i)=>`<article class="editor-card"><div class="editor-top"><h3>${esc(p.name||'New Product')}</h3><button class="btn danger delete">Delete</button></div><div class="form-grid">
 ${field('Product Name','name',p.name,'text','wide')}${field('Category','category',p.category)}
 ${field('Collection','collection',p.collection)}${field('Age','age',p.age)}${field('Sizes','sizes',p.sizes)}
 ${field('Fabric','fabric',p.fabric)}${field('GSM','gsm',p.gsm)}${field('Badge','badge',p.badge)}
 ${field('Image Path','image',p.image,'text','wide')}${field('Description','description',p.description,'textarea','full')}</div></article>`).join('');
 bindCards(el,products,renderProducts);
}
function renderSettings(){
 const keys=[['Brand Name','brand'],['WhatsApp Number (country code, no +)','whatsapp'],['Phone Display','phoneDisplay'],['Email','email'],['Address','address'],['Default WhatsApp Message','whatsappMessage']];
 $('#settingsEditor').innerHTML=keys.map(([l,k])=>field(l,k,settings[k],k==='whatsappMessage'?'textarea':'text',k==='whatsappMessage'?'full':'')).join('');
 $('#settingsEditor').querySelectorAll('[data-key]').forEach(inp=>inp.oninput=()=>settings[inp.dataset.key]=inp.value);
}
function download(name,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:'text/javascript'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
$('#addCatalogue').onclick=()=>{catalogues.push({id:'catalogue-'+Date.now(),title:'New Catalogue',season:'Summer',year:new Date().getFullYear(),description:'',cover:'images/catalogue-covers/your-cover.jpg',pdf:'catalogues/your-catalogue.pdf',featured:false});renderCatalogues()};
$('#addProduct').onclick=()=>{products.push({id:'product-'+Date.now(),name:'New Product',category:'Boys',collection:'Summer',age:'3–7 Years',sizes:'3, 4, 5, 6, 7',fabric:'Single Jersey',gsm:'190 GSM',badge:'New',image:'images/products/your-product.jpg',description:''});renderProducts()};
$('#exportCatalogues').onclick=()=>download('catalogues.js','window.SBMG_CATALOGUES = '+JSON.stringify(catalogues,null,2)+';\n');
$('#exportProducts').onclick=()=>download('products.js','window.SBMG_PRODUCTS = '+JSON.stringify(products,null,2)+';\n');
$('#exportSettings').onclick=()=>download('settings.js','window.SBMG_SETTINGS = '+JSON.stringify(settings,null,2)+';\n');
renderCatalogues();renderProducts();renderSettings();
})();