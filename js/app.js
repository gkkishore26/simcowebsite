/**
 * app.js — Simco Nighty House
 * Core application: routing, page rendering, product display, navigation.
 */

/* ── STATE ── */
let STATE = {
  products:        [],
  filter:          'all',
  currentPage:     'home',   // 'home' | 'detail'
  editMode:        false,
  currentDetailId: null
};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  STATE.products = DB_load();

  setupLoader();
  setupNav();
  setupScrollReveal();
  setupMarquee();
  populateAnnounce();
  renderCatGrid();
  renderFilterPills();
  renderProducts();
  setupModalClose();
});

/* ════════════════════════════════
   LOADER
════════════════════════════════ */
function setupLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    loader.classList.add('hide');
    document.body.style.overflow = '';
  }, 2400);
}

/* ════════════════════════════════
   ANNOUNCE BAR
════════════════════════════════ */
function populateAnnounce() {
  const el = document.getElementById('announce-text');
  if (el) el.textContent = SIMCO_CONFIG.announcement;
}

/* ════════════════════════════════
   NAV
════════════════════════════════ */
function setupNav() {
  document.querySelectorAll('.nav-logo').forEach(el => el.addEventListener('click', goHome));

  const ham       = document.getElementById('ham-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (ham && mobileNav) {
    ham.addEventListener('click', e => {
      e.stopPropagation();
      mobileNav.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!mobileNav.contains(e.target) && !ham.contains(e.target)) {
        mobileNav.classList.remove('open');
      }
    });
  }
}

/* ════════════════════════════════
   MARQUEE — duplicate for seamless loop
════════════════════════════════ */
function setupMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

/* ════════════════════════════════
   NAVIGATION HELPERS
════════════════════════════════ */
function goHome() {
  showPage('page-home');
  STATE.currentPage     = 'home';
  STATE.currentDetailId = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function gotoSection(id) {
  if (STATE.currentPage !== 'home') {
    goHome();
    setTimeout(() => _scrollTo(id), 380);
  } else {
    _scrollTo(id);
  }
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) mobileNav.classList.remove('open');
}

function _scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

/* ════════════════════════════════
   FILTER PRODUCTS
════════════════════════════════ */
function filterProducts(cat) {
  gotoSection('sec-products');
  setTimeout(() => {
    STATE.filter = cat;
    document.querySelectorAll('.filter-pill').forEach(p =>
      p.classList.toggle('on', p.dataset.c === cat)
    );
    renderProducts();
  }, STATE.currentPage === 'home' ? 60 : 420);
}

function setPill(el, cat) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  STATE.filter = cat;
  renderProducts();
}

/* ════════════════════════════════
   RENDER CATEGORY GRID
   Called on init AND after a new category is added.
════════════════════════════════ */
function renderCatGrid() {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  grid.innerHTML = '';
  SIMCO_CATEGORIES.forEach(c => {
    const tile    = document.createElement('div');
    tile.className = 'cat-tile';
    tile.onclick   = () => filterProducts(c.id);
    tile.innerHTML = `
      <div class="cat-img-wrap">
        ${c.img
          ? `<img src="${c.img}" alt="${c.label}" loading="lazy">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--c-surface3)">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.4">
                 <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
               </svg>
             </div>`
        }
      </div>
      <div class="ct-name">${c.label}</div>
      <div class="ct-from">${c.from || ''}</div>`;
    grid.appendChild(tile);
  });
}

/* ════════════════════════════════
   RENDER FILTER PILLS
   Called on init AND after a new category is added.
════════════════════════════════ */
function renderFilterPills() {
  const row = document.getElementById('filter-row');
  if (!row) return;
  row.innerHTML = '';

  // "All" pill first
  const allPill    = document.createElement('button');
  allPill.className = 'filter-pill' + (STATE.filter === 'all' ? ' on' : '');
  allPill.dataset.c = 'all';
  allPill.textContent = 'All';
  allPill.onclick     = () => setPill(allPill, 'all');
  row.appendChild(allPill);

  // One pill per category
  SIMCO_CATEGORIES.forEach(c => {
    const pill    = document.createElement('button');
    pill.className = 'filter-pill' + (STATE.filter === c.id ? ' on' : '');
    pill.dataset.c = c.id;
    pill.textContent = c.label;
    pill.onclick     = () => setPill(pill, c.id);
    row.appendChild(pill);
  });
}

/* ════════════════════════════════
   RENDER PRODUCTS GRID
════════════════════════════════ */
function renderProducts() {
  const grid = document.getElementById('pg');
  if (!grid) return;

  const addCard = grid.querySelector('.add-card');
  grid.querySelectorAll('.product-card').forEach(c => c.remove());

  const list = STATE.filter === 'all'
    ? STATE.products
    : STATE.products.filter(p => p.cat === STATE.filter);

  list.forEach((p, idx) => {
    const card = createProductCard(p);
    card.style.animationDelay = `${idx * 0.06}s`;
    card.classList.add('reveal');
    grid.insertBefore(card, addCard);
  });

  setTimeout(triggerReveal, 50);
}

function createProductCard(p) {
  const div       = document.createElement('div');
  div.className   = 'product-card';

  const imgHtml   = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const phDisplay = p.img ? 'none' : 'flex';

  // ── Size & availability logic ──
  const sizes      = p.sizes || [];
  const sizeStatus = SIZE_status(sizes);
  const availText  = SIZE_availText(sizes) || p.avail || 'In Stock';
  const dispPrice  = SIZE_basePrice(p);
  const variedPrices = SIZE_hasVariedPrices(sizes);
  const pricePrefix  = (variedPrices && sizeStatus !== 'none') ? 'From ' : '';

  // Avail tag class
  const availClass = sizeStatus === 'none' ? 'oos-tag'
                   : sizeStatus === 'all'  ? 'all-tag'
                   : sizeStatus === 'some' ? 'some-tag' : '';

  // Size chips (show up to 6 chips on card)
  let sizeChipsHtml = '';
  if (sizes.length) {
    const chips = sizes.slice(0, 6).map(s =>
      `<span class="sz-chip${!s.inStock ? ' oos' : ''}${sizeStatus==='all' ? ' all-avail' : ''}">${s.label}</span>`
    ).join('');
    const more = sizes.length > 6 ? `<span class="sz-chip" style="opacity:.5">+${sizes.length-6}</span>` : '';
    sizeChipsHtml = `<div class="prod-sizes">${chips}${more}</div>`;
  }

  div.innerHTML = `
    <div class="prod-img-wrap">
      ${imgHtml}
      <div class="prod-placeholder" style="display:${phDisplay}">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <span>${DB_catLabel(p.cat)}</span>
      </div>
      ${p.badge ? `<div class="prod-badge badge">${p.badge}</div>` : ''}
      <div class="prod-overlay">
        <button class="ov-btn"  onclick="event.stopPropagation();showDetail(${p.id})">View Details</button>
        <button class="ov-edit" onclick="event.stopPropagation();openEditModal(${p.id})">Edit</button>
      </div>
    </div>
    ${sizeChipsHtml}
    <div class="prod-info">
      <div class="prod-cat">${DB_catLabel(p.cat)}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-desc">${p.desc}</div>
      <div class="prod-foot">
        <div class="price-tag"><span class="rupee">&#8377;</span>${dispPrice}</div>
        <div class="prod-avail ${availClass}">${availText}</div>
      </div>
    </div>`;

  div.addEventListener('click', () => showDetail(p.id));
  return div;
}

/* ════════════════════════════════
   PRODUCT DETAIL PAGE
════════════════════════════════ */
function showDetail(id) {
  const p = STATE.products.find(x => x.id === id);
  if (!p) return;
  STATE.currentDetailId = id;
  buildDetailPage(p);
  showPage('page-detail');
  STATE.currentPage = 'detail';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildDetailPage(p) {
  const feats    = (p.features || []).map(f => `<div class="d-feat">${f}</div>`).join('');
  const imgBlock = p.img
    ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">`
    : `<div class="d-ph">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <span>${DB_catLabel(p.cat)}</span>
       </div>`;
  const wa = `https://wa.me/${SIMCO_CONFIG.whatsapp}?text=Hi%2C+I'm+interested+in+${encodeURIComponent(p.name)}`;

  // ── Size selector block ──
  const sizes      = p.sizes || [];
  const sizeStatus = SIZE_status(sizes);
  const basePrice  = SIZE_basePrice(p);
  const varied     = SIZE_hasVariedPrices(sizes);
  const pricePrefix = (varied && sizeStatus !== 'none') ? 'From ' : '';

  let sizeSectionHtml = '';
  if (sizes.length > 0) {
    const sizeButtons = sizes.map((s, i) => {
      const priceDiff = s.price !== basePrice ? (s.price > basePrice ? `+₹${s.price - basePrice}` : '') : '';
      return `<button
        class="d-sz-btn${!s.inStock ? ' sz-oos' : ''}"
        data-idx="${i}"
        data-price="${s.price}"
        data-instock="${s.inStock}"
        onclick="detailSelectSize(this, ${p.id})"
        ${!s.inStock ? 'title="Out of stock"' : ''}
      >${s.label}${priceDiff ? `<span class="sz-price-diff">${priceDiff}</span>` : ''}</button>`;
    }).join('');

    let noteText = '', noteClass = '';
    if (sizeStatus === 'none') { noteText = 'Currently out of stock in all sizes.'; noteClass = 'oos-msg'; }
    else if (sizeStatus === 'all') { noteText = 'All sizes available.'; noteClass = 'all-msg'; }
    else { noteText = 'Some sizes are currently out of stock.'; }

    sizeSectionHtml = `
      <div class="d-size-section">
        <div class="d-size-label">Select Size</div>
        <div class="d-size-row">${sizeButtons}</div>
        <div class="d-size-note ${noteClass}" id="d-size-note">${noteText}</div>
      </div>`;
  }

  // ── Availability meta ──
  const availMeta = SIZE_availText(sizes) || p.avail || 'In Stock';

  document.getElementById('pd-inner').innerHTML = `
    <button class="back-btn" onclick="goHome()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back to Collection
    </button>

    <div class="d-edit-bar">
      <span>Editor Mode Active — You can edit this product</span>
      <button class="d-edit-btn" onclick="openEditModal(${p.id})">Edit This Product</button>
    </div>

    <div class="detail-grid">
      <div class="d-img-main">
        ${imgBlock}
        ${p.badge ? `<div class="d-badge-pos"><span class="badge">${p.badge}</span></div>` : ''}
      </div>
      <div class="d-info">
        <div class="d-cat">${DB_catLabel(p.cat)}</div>
        <div class="d-name">${p.name}</div>
        <div class="d-price price-tag" id="d-price-display">
          <span class="rupee">&#8377;</span><span id="d-price-num">${basePrice}</span>
        </div>
        <div class="d-price-sub" id="d-price-sub">${pricePrefix ? pricePrefix + '&#8377;' + basePrice : 'Manufacturer Direct Price'}</div>
        <div class="d-divider"></div>
        <div class="d-desc">${p.desc}</div>
        ${sizeSectionHtml}
        ${feats ? `<div class="d-feats">${feats}</div>` : ''}
        <div class="d-actions">
          <a href="tel:${SIMCO_CONFIG.phone.replace(/\s/g,'')}" class="btn-fill d-cta">Call to Order</a>
          <a href="${wa}" target="_blank" class="btn-outline d-cta">WhatsApp Us</a>
        </div>
        <div class="d-meta">
          <div class="d-meta-item"><div class="d-meta-key">Availability</div><div class="d-meta-val" id="d-avail-meta">${availMeta}</div></div>
          <div class="d-meta-item"><div class="d-meta-key">Category</div><div class="d-meta-val">${DB_catLabel(p.cat)}</div></div>
          <div class="d-meta-item"><div class="d-meta-key">Store Location</div><div class="d-meta-val">Big Bazaar St, Coimbatore</div></div>
          <div class="d-meta-item">
            <div class="d-meta-key">Contact</div>
            <div class="d-meta-val">
              <a href="tel:${SIMCO_CONFIG.phone.replace(/\s/g,'')}" style="color:var(--c-rose)">${SIMCO_CONFIG.phone}</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * Called when a size button is clicked on the detail page.
 * Updates the displayed price and note live.
 */
function detailSelectSize(btn, productId) {
  if (btn.classList.contains('sz-oos')) return; // can't select OOS

  // Deselect all, select clicked
  document.querySelectorAll('.d-sz-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  const price   = parseInt(btn.dataset.price, 10);
  const label   = btn.textContent.trim().split('\n')[0].trim(); // first line only (strip price diff)

  // Update price display
  const priceEl = document.getElementById('d-price-num');
  const subEl   = document.getElementById('d-price-sub');
  const noteEl  = document.getElementById('d-size-note');
  const availEl = document.getElementById('d-avail-meta');

  if (priceEl) priceEl.textContent = price;
  if (subEl)   subEl.textContent   = `Size ${label} selected`;
  if (noteEl)  { noteEl.textContent = `Size ${label} is in stock.`; noteEl.className = 'd-size-note all-msg'; }
  if (availEl) availEl.textContent = `In Stock — Size ${label}`;
}

/* ════════════════════════════════
   SCROLL REVEAL
════════════════════════════════ */
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
  window._revealObserver = observer;
}

function triggerReveal() {
  if (!window._revealObserver) return;
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => window._revealObserver.observe(el));
}

/* ════════════════════════════════
   MODAL CLOSE ON BACKDROP
════════════════════════════════ */
function setupModalClose() {
  document.querySelectorAll('.modal-bd').forEach(bd => {
    bd.addEventListener('click', e => { if (e.target === bd) bd.classList.remove('open'); });
  });
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
