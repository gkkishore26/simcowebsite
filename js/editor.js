/**
 * editor.js — Simco Nighty House
 * Owner auth, editor mode, product CRUD, dynamic category management.
 */

let _editingId   = null;
let _uploadedImg = null;

/* LOGIN */
function openLoginModal() {
  openModal('m-login');
  setTimeout(()=>document.getElementById('l-email').focus(),200);
}
function doLogin() {
  const email=document.getElementById('l-email').value.trim();
  const pass=document.getElementById('l-pass').value;
  const err=document.getElementById('l-err');
  if(email===SIMCO_CONFIG.owner.email&&pass===SIMCO_CONFIG.owner.password){
    closeModal('m-login');enableEditor();
    showToast('Editor mode enabled. Hover any product and click Edit.');
    document.getElementById('l-email').value='';document.getElementById('l-pass').value='';err.style.display='none';
  } else {
    err.style.display='block';document.getElementById('l-pass').value='';document.getElementById('l-pass').focus();
  }
}
document.addEventListener('DOMContentLoaded',()=>{
  const pf=document.getElementById('l-pass');
  if(pf) pf.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
});

/* EDITOR MODE */
function enableEditor(){
  STATE.editMode=true;document.body.classList.add('editmode');
  document.getElementById('editor-bar').classList.add('on');
  renderProducts();
  if(STATE.currentPage==='detail'&&STATE.currentDetailId){
    const p=STATE.products.find(x=>x.id===STATE.currentDetailId);if(p)buildDetailPage(p);
  }
}
function logoutEditor(){
  STATE.editMode=false;document.body.classList.remove('editmode');
  document.getElementById('editor-bar').classList.remove('on');
  renderProducts();
  if(STATE.currentPage==='detail'&&STATE.currentDetailId){
    const p=STATE.products.find(x=>x.id===STATE.currentDetailId);if(p)buildDetailPage(p);
  }
  showToast('Exited editor mode.');
}
function saveAll(){
  DB_save(STATE.products);DB_saveCategories();
  showToast('All changes saved successfully.');
}

/* CATEGORY SELECT — rebuild <select> from live SIMCO_CATEGORIES */
function rebuildCategorySelect(selectedId){
  const sel=document.getElementById('mp-cat');if(!sel)return;
  const target=selectedId||(SIMCO_CATEGORIES.length?SIMCO_CATEGORIES[0].id:'');
  sel.innerHTML=SIMCO_CATEGORIES.map(c=>
    `<option value="${c.id}"${c.id===target?' selected':''}>${c.label}</option>`
  ).join('')+`<option value="__new__" style="color:#e8405c;font-weight:700;">+ Add New Category</option>`;
}

/* Show / hide new-category inline panel when select changes */
function onCatSelectChange(){
  const sel=document.getElementById('mp-cat');
  const panel=document.getElementById('new-cat-panel');
  const err=document.getElementById('new-cat-err');
  if(!sel||!panel)return;
  if(sel.value==='__new__'){
    panel.style.display='block';
    if(err)err.style.display='none';
    setTimeout(()=>{const n=document.getElementById('new-cat-name');if(n)n.focus();},60);
  } else {
    panel.style.display='none';
  }
}

/* Create a new category from the inline panel */
function createCategory(){
  const nameEl=document.getElementById('new-cat-name');
  const priceEl=document.getElementById('new-cat-price');
  const errEl=document.getElementById('new-cat-err');
  const label=nameEl?nameEl.value.trim():'';
  if(!label){
    if(errEl){errEl.textContent='Please enter a category name.';errEl.style.display='block';}
    if(nameEl)nameEl.focus();return;
  }
  const priceRaw=priceEl?priceEl.value.trim():'';
  const fromPrice=priceRaw?'\u20b9'+priceRaw.replace(/[^\d]/g,''):'';
  const newCat=DB_addCategory(label,fromPrice,'');
  if(!newCat){
    if(errEl){errEl.textContent='A category with this name already exists.';errEl.style.display='block';}
    if(nameEl)nameEl.focus();return;
  }
  if(errEl)errEl.style.display='none';
  if(nameEl)nameEl.value='';if(priceEl)priceEl.value='';
  document.getElementById('new-cat-panel').style.display='none';
  rebuildCategorySelect(newCat.id);
  refreshCategoryUI();
  showToast(`Category "${newCat.label}" created and selected.`);
}

/* Cancel new category — revert select to first real category */
function cancelNewCategory(){
  const panel=document.getElementById('new-cat-panel');
  const errEl=document.getElementById('new-cat-err');
  const nameEl=document.getElementById('new-cat-name');
  const priceEl=document.getElementById('new-cat-price');
  const sel=document.getElementById('mp-cat');
  if(panel)panel.style.display='none';
  if(errEl)errEl.style.display='none';
  if(nameEl)nameEl.value='';if(priceEl)priceEl.value='';
  if(sel&&SIMCO_CATEGORIES.length)sel.value=SIMCO_CATEGORIES[0].id;
}

/* Refresh category grid (#cat-grid) and filter pills (#filter-row) from SIMCO_CATEGORIES */
function refreshCategoryUI(){
  // Delegate to app.js canonical renderers so logic stays in one place
  if(typeof renderCatGrid     === 'function') renderCatGrid();
  if(typeof renderFilterPills === 'function') renderFilterPills();
}

/* OPEN ADD MODAL */
function openAddModal(){
  if(!STATE.editMode)return;
  _editingId=null;_uploadedImg=null;
  document.getElementById('mp-h').textContent='Add New Product';
  document.getElementById('mp-sub').textContent='Fill in the details to add a new product to your store.';
  document.getElementById('mp-id').value='';
  ['mp-name','mp-price','mp-desc','mp-badge','mp-feats','mp-url'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('mp-avail').value='In Stock';
  rebuildCategorySelect();
  document.getElementById('new-cat-panel').style.display='none';
  document.getElementById('new-cat-err').style.display='none';
  document.getElementById('img-prev').style.display='none';
  document.getElementById('mp-del').style.display='none';
  document.getElementById('mp-err').style.display='none';
  // Reset size editor
  SIZE_editorInit([]);
  closeSizePanel();
  openModal('m-product');setTimeout(()=>document.getElementById('mp-name').focus(),200);
}

/* OPEN EDIT MODAL */
function openEditModal(id){
  const p=STATE.products.find(x=>x.id===id);if(!p)return;
  _editingId=id;_uploadedImg=null;
  document.getElementById('mp-h').textContent='Edit Product';
  document.getElementById('mp-sub').textContent='Update the product details below.';
  document.getElementById('mp-id').value=id;
  document.getElementById('mp-name').value=p.name;
  document.getElementById('mp-price').value=p.price;
  document.getElementById('mp-desc').value=p.desc;
  document.getElementById('mp-badge').value=p.badge||'';
  document.getElementById('mp-avail').value=p.avail||'In Stock';
  document.getElementById('mp-feats').value=(p.features||[]).join('\n');
  document.getElementById('mp-url').value=p.img||'';
  document.getElementById('mp-err').style.display='none';
  rebuildCategorySelect(p.cat);
  document.getElementById('new-cat-panel').style.display='none';
  document.getElementById('new-cat-err').style.display='none';
  const prev=document.getElementById('img-prev');
  if(p.img){prev.src=p.img;prev.style.display='block';}else prev.style.display='none';
  document.getElementById('mp-del').style.display='inline-flex';
  // Load sizes into editor
  SIZE_editorInit(p.sizes || []);
  closeSizePanel();
  openModal('m-product');setTimeout(()=>document.getElementById('mp-name').focus(),200);
}

/* SAVE PRODUCT */
function saveProduct(){
  const name=document.getElementById('mp-name').value.trim();
  const priceStr=document.getElementById('mp-price').value.trim().replace(/[₹\s,]/g,'');
  const err=document.getElementById('mp-err');
  if(!name||!priceStr||isNaN(Number(priceStr))){
    err.style.display='block';
    err.textContent=!name?'Product name is required.':'Please enter a valid price (numbers only, e.g. 199).';
    return;
  }
  const catSel=document.getElementById('mp-cat');
  if(catSel.value==='__new__'){
    err.style.display='block';err.textContent='Please create or select a category before saving.';return;
  }
  err.style.display='none';
  const cat=catSel.value;
  const desc=document.getElementById('mp-desc').value.trim();
  const badge=document.getElementById('mp-badge').value.trim();
  const avail=document.getElementById('mp-avail').value.trim();
  const featsRaw=document.getElementById('mp-feats').value.trim();
  const features=featsRaw?featsRaw.split('\n').map(s=>s.trim()).filter(Boolean):[];
  const img=_uploadedImg||document.getElementById('mp-url').value.trim();
  // Collect sizes from the editor
  const sizes = SIZE_editorCollect();
  // Base price = lowest in-stock size price, or manual price if no sizes
  const basePrice = sizes.length ? SIZE_basePrice({price:Number(priceStr),sizes}) : Number(priceStr);
  if(_editingId){
    const idx=STATE.products.findIndex(x=>x.id===_editingId);
    if(idx!==-1)STATE.products[idx]={...STATE.products[idx],name,price:basePrice,cat,desc,badge,avail,features,img,sizes};
    showToast('Product updated successfully.');
  } else {
    STATE.products.push({id:DB_nextId(STATE.products),name,price:basePrice,cat,desc,badge,avail,features,img,sizes});
    showToast('New product added to the store.');
  }
  DB_save(STATE.products);closeModal('m-product');renderProducts();
  if(STATE.currentPage==='detail'&&_editingId&&STATE.currentDetailId===_editingId){
    const p=STATE.products.find(x=>x.id===_editingId);if(p)buildDetailPage(p);
  }
}

/* DELETE PRODUCT */
function confirmDel(){
  if(!_editingId)return;
  const p=STATE.products.find(x=>x.id===_editingId);if(!p)return;
  if(!confirm(`Delete "${p.name}"?\n\nThis cannot be undone.`))return;
  STATE.products=STATE.products.filter(x=>x.id!==_editingId);
  DB_save(STATE.products);closeModal('m-product');renderProducts();
  showToast('Product deleted.');if(STATE.currentPage==='detail')goHome();
}

/* IMAGE UPLOAD */
function handleUpload(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    _uploadedImg=e.target.result;
    const prev=document.getElementById('img-prev');
    prev.src=_uploadedImg;prev.style.display='block';
    document.getElementById('mp-url').value='';
  };
  reader.readAsDataURL(file);
}
function previewUrl(url){
  if(!url)return;
  const prev=document.getElementById('img-prev');
  prev.src=url;prev.style.display='block';_uploadedImg=null;
}

/* TOAST */
let _toastTimer;
function showToast(msg){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;el.classList.add('show');
  clearTimeout(_toastTimer);_toastTimer=setTimeout(()=>el.classList.remove('show'),3400);
}

/* ════════════════════════════════════════════════════
   SIZE VARIATION EDITOR
   — Manages an in-memory draft copy of sizes while
     the product modal is open. On saveProduct() the
     draft is written to the product via SIZE_editorCollect().
════════════════════════════════════════════════════ */

let _sizeDraft = []; // working copy of sizes while modal is open

/**
 * Initialise the size editor with a product's existing sizes (or [] for new).
 */
function SIZE_editorInit(sizes) {
  _sizeDraft = sizes.map(s => ({ ...s })); // deep-clone
  SIZE_editorRender();
}

/**
 * Return the current size draft (called by saveProduct).
 */
function SIZE_editorCollect() {
  return _sizeDraft.map(s => ({ ...s }));
}

/** Open / close the size panel toggle */
function toggleSizePanel() {
  const panel   = document.getElementById('size-editor-panel');
  const toggle  = document.getElementById('size-panel-toggle');
  if (!panel || !toggle) return;
  const isOpen  = panel.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
}
function closeSizePanel() {
  document.getElementById('size-editor-panel')?.classList.remove('open');
  document.getElementById('size-panel-toggle')?.classList.remove('open');
}

/**
 * Render the full size editor list inside #size-editor-body.
 */
function SIZE_editorRender() {
  const body = document.getElementById('size-editor-body');
  if (!body) return;

  if (_sizeDraft.length === 0) {
    body.innerHTML = `
      <div class="size-cat-note">
        No sizes added yet. Type a size label below and click Add.
      </div>
      ${SIZE_editorAddRow()}`;
    return;
  }

  const rows = _sizeDraft.map((s, i) => `
    <div class="size-row" id="sz-row-${i}">
      <label>
        <input type="checkbox" ${s.inStock ? 'checked' : ''}
          onchange="SIZE_editorToggleStock(${i}, this.checked)">
        <span>${s.label}</span>
      </label>
      <div style="display:flex;align-items:center;gap:4px;">
        <span style="font-family:var(--ff-num);font-size:12px;color:var(--c-rose);">₹</span>
        <input type="number" value="${s.price}" min="1"
          onchange="SIZE_editorSetPrice(${i}, this.value)"
          oninput="SIZE_editorSetPrice(${i}, this.value)"
          ${!s.inStock ? 'disabled' : ''}
          placeholder="Price">
      </div>
      <div class="sz-stock-toggle ${s.inStock ? 'in' : 'out'}"
        onclick="SIZE_editorToggleStock(${i}, ${!s.inStock})"
        title="${s.inStock ? 'Mark out of stock' : 'Mark in stock'}"
        id="sz-toggle-${i}">
        ${s.inStock ? '✓' : '✕'}
      </div>
      <button onclick="SIZE_editorRemove(${i})"
        style="background:none;border:none;color:var(--c-rose);font-size:16px;cursor:pointer;padding:2px 4px;line-height:1;"
        title="Remove size">&times;</button>
    </div>`).join('');

  body.innerHTML = rows + SIZE_editorAddRow();
}

/** Returns the "add new size" row HTML */
function SIZE_editorAddRow() {
  return `
    <div class="size-add-row">
      <input type="text" id="sz-new-label" placeholder="Size label e.g. S, M, XL, 38, 2Y"
        onkeydown="if(event.key==='Enter'){event.preventDefault();SIZE_editorAdd();}">
      <input type="number" id="sz-new-price" placeholder="Price ₹" min="1" style="max-width:100px;"
        onkeydown="if(event.key==='Enter'){event.preventDefault();SIZE_editorAdd();}">
      <button class="btn-add-size" onclick="SIZE_editorAdd()">Add Size</button>
    </div>`;
}

/** Toggle a size's inStock flag */
function SIZE_editorToggleStock(idx, inStock) {
  if (idx < 0 || idx >= _sizeDraft.length) return;
  _sizeDraft[idx].inStock = !!inStock;
  SIZE_editorRender();
}

/** Update a size's price */
function SIZE_editorSetPrice(idx, val) {
  if (idx < 0 || idx >= _sizeDraft.length) return;
  const n = parseInt(val, 10);
  if (!isNaN(n) && n > 0) _sizeDraft[idx].price = n;
}

/** Remove a size from the draft */
function SIZE_editorRemove(idx) {
  _sizeDraft.splice(idx, 1);
  SIZE_editorRender();
}

/** Add a new size to the draft */
function SIZE_editorAdd() {
  const labelEl = document.getElementById('sz-new-label');
  const priceEl = document.getElementById('sz-new-price');
  if (!labelEl) return;

  const label = labelEl.value.trim().toUpperCase();
  if (!label) { labelEl.focus(); return; }

  // Prevent duplicates
  if (_sizeDraft.find(s => s.label.toUpperCase() === label)) {
    labelEl.style.borderColor = 'var(--c-rose)';
    setTimeout(() => { labelEl.style.borderColor = ''; }, 1200);
    labelEl.focus();
    return;
  }

  const rawPrice = priceEl ? parseInt(priceEl.value, 10) : NaN;
  // Default price: same as last entry, or base price from modal, or 0
  const lastPrice = _sizeDraft.length ? _sizeDraft[_sizeDraft.length - 1].price : 0;
  const price = (!isNaN(rawPrice) && rawPrice > 0) ? rawPrice : (lastPrice || 0);

  _sizeDraft.push({ label, price, inStock: true });
  SIZE_editorRender();

  // Refocus label input for quick multi-entry
  setTimeout(() => {
    const newLabel = document.getElementById('sz-new-label');
    const newPrice = document.getElementById('sz-new-price');
    if (newLabel) { newLabel.value = ''; newLabel.focus(); }
    if (newPrice) newPrice.value = '';
  }, 30);
}
