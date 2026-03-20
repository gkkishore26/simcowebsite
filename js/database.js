/**
 * database.js — Simco Nighty House
 * Central data store. Products, categories, and sizes — all with localStorage persistence.
 *
 * SIZE MODEL per product:
 *   sizes: [
 *     { label: "S",  price: 149, inStock: true  },
 *     { label: "M",  price: 149, inStock: true  },
 *     { label: "XL", price: 169, inStock: false },
 *     ...
 *   ]
 *   If sizes is [] or undefined → no size feature for this product.
 *
 * SIZE-ENABLED CATEGORIES (can be changed by owner):
 *   Stored in SIMCO_SIZE_CATS — array of category ids that default to showing sizes.
 */

const SIMCO_CONFIG = {
  storeName:       "Simco Nighty House",
  tagline:         "Coimbatore's Trusted Textile Destination",
  phone:           "089251 36919",
  whatsapp:        "918925136919",
  address:         "1173, 1175, Big Bazaar Street, opposite Aryas Hotel, near Pothys, Town Hall, Coimbatore — 641001",
  hours:           "Mon – Sat: 10:15 AM – 9:00 PM  |  Sunday: Closed",
  instagram:       "https://instagram.com/simco_nighty_house",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.363!2d76.9621!3d11.0168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f971cb5%3A0xcbd0ca3bab625001!2sSimco%20Nighty%20House!5e0!3m2!1sen!2sin!4v1720000000000",
  announcement:    "Free delivery on wholesale orders above \u20b92,000  \u00b7  Manufacturer Direct Pricing",
  owner: {
    email:    "SIMCO1122",
    password: "SIMCONO1"
  }
};

/* ─── CATEGORIES THAT SUPPORT SIZE VARIATIONS BY DEFAULT ─────── */
/* Owner can enable/disable sizes per-product regardless of this list */
const SIMCO_SIZE_CATS_DEFAULT = ["nighty", "designer", "innerwear", "footwear"];

/* ─── DEFAULT CATEGORIES ────────────────────────────────────── */
const SIMCO_DEFAULT_CATEGORIES = [
  { id:"nighty",    label:"Cotton Nighties",  from:"\u20b9149", img:"https://images.pexels.com/photos/7679871/pexels-photo-7679871.jpeg?auto=compress&cs=tinysrgb&w=120" },
  { id:"designer",  label:"Designer Nighties", from:"\u20b9299", img:"https://images.pexels.com/photos/6311479/pexels-photo-6311479.jpeg?auto=compress&cs=tinysrgb&w=120" },
  { id:"innerwear", label:"Innerwear",          from:"\u20b995",  img:"https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=120" },
  { id:"footwear",  label:"Slippers",           from:"\u20b9180", img:"https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=120" },
  { id:"home",      label:"Plastic & Home",     from:"\u20b950",  img:"https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=120" },
  { id:"bags",      label:"Bags",               from:"\u20b999",  img:"https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=120" }
];
let SIMCO_CATEGORIES = [];

/* ─── DEFAULT PRODUCTS (with sizes) ─────────────────────────── */
const SIMCO_DEFAULT_PRODUCTS = [
  {
    id:1, name:"Classic Jaipuri Cotton Nighty", cat:"nighty", price:199,
    desc:"Crafted from 100% breathable cotton with traditional Rajasthani block prints. Vibrant colors remain vivid after repeated washing. Relaxed cut for all-night comfort.",
    badge:"Bestseller", avail:"In Stock \u2014 Sizes S to XXL",
    features:["100% breathable cotton","Vibrant fast-dye block prints","Available in 8 color options","Sizes S to XXL"],
    img:"https://images.pexels.com/photos/7679871/pexels-photo-7679871.jpeg?auto=compress&cs=tinysrgb&w=700",
    sizes:[
      {label:"S",   price:199, inStock:true},
      {label:"M",   price:199, inStock:true},
      {label:"L",   price:199, inStock:true},
      {label:"XL",  price:219, inStock:true},
      {label:"XXL", price:239, inStock:true}
    ]
  },
  {
    id:2, name:"Embroidered Designer Nighty", cat:"designer", price:349,
    desc:"Beautifully crafted with delicate embroidery at the neckline and sleeves. Soft premium fabric with a comfortable relaxed silhouette. Perfect for gifting.",
    badge:"New Arrival", avail:"In Stock \u2014 Limited Sizes",
    features:["Delicate neckline embroidery","Soft premium fabric","Available in 5 colors","Ideal for gifting"],
    img:"https://images.pexels.com/photos/6311479/pexels-photo-6311479.jpeg?auto=compress&cs=tinysrgb&w=700",
    sizes:[
      {label:"S",   price:349, inStock:true},
      {label:"M",   price:349, inStock:true},
      {label:"L",   price:349, inStock:false},
      {label:"XL",  price:379, inStock:false}
    ]
  },
  {
    id:3, name:"Everyday Soft Cotton Nighty", cat:"nighty", price:149,
    desc:"Our most popular daily-wear nighty. Ultra-soft combed cotton that gets softer with every wash. Simple, clean design in 10 solid colors.",
    badge:"", avail:"In Stock \u2014 All Sizes",
    features:["Ultra-soft combed cotton","10 solid color options","Machine washable","Sizes XS to XXXL"],
    img:"https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=700",
    sizes:[
      {label:"XS",  price:149, inStock:true},
      {label:"S",   price:149, inStock:true},
      {label:"M",   price:149, inStock:true},
      {label:"L",   price:149, inStock:true},
      {label:"XL",  price:159, inStock:true},
      {label:"XXL", price:169, inStock:true},
      {label:"3XL", price:179, inStock:true}
    ]
  },
  {
    id:4, name:"Cotton Bra & Panty Set", cat:"innerwear", price:95,
    desc:"Pure cotton innerwear set offering all-day comfort. Wide elastic band, breathable fabric, and reinforced stitching for long-lasting wear.",
    badge:"Value Pack", avail:"In Stock \u2014 All Sizes",
    features:["100% pure cotton","Wide comfort elastic band","Breathable fabric","Reinforced stitching"],
    img:"",
    sizes:[
      {label:"28",  price:95,  inStock:true},
      {label:"30",  price:95,  inStock:true},
      {label:"32",  price:95,  inStock:true},
      {label:"34",  price:95,  inStock:true},
      {label:"36",  price:105, inStock:true},
      {label:"38",  price:115, inStock:false},
      {label:"40",  price:125, inStock:false}
    ]
  },
  {
    id:5, name:"Ladies Innerwear Combo Pack", cat:"innerwear", price:175,
    desc:"Pack of 3 high-quality cotton innerwear pieces. Designed for everyday comfort with soft edges and anti-roll waistband.",
    badge:"Pack of 3", avail:"In Stock",
    features:["Pack of 3 pieces","Anti-roll waistband","Soft flat-lock seams","Sizes 28 to 44"],
    img:"",
    sizes:[
      {label:"28-32", price:175, inStock:true},
      {label:"34-38", price:185, inStock:true},
      {label:"40-44", price:195, inStock:true}
    ]
  },
  {
    id:6, name:"VKC Ladies Slippers", cat:"footwear", price:180,
    desc:"Comfortable EVA sole slippers from VKC, India\u2019s trusted footwear brand. Non-slip base, cushioned footbed. Currently 21% off MRP.",
    badge:"21% OFF", avail:"In Stock \u2014 Sizes 4 to 8",
    features:["VKC brand quality","Cushioned EVA footbed","Non-slip sole","Sizes 4 to 8"],
    img:"https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=700",
    sizes:[
      {label:"4",  price:180, inStock:true},
      {label:"5",  price:180, inStock:true},
      {label:"6",  price:180, inStock:true},
      {label:"7",  price:180, inStock:true},
      {label:"8",  price:180, inStock:false}
    ]
  },
  {
    id:7, name:"Multipurpose Plastic Basket Set", cat:"home", price:198,
    desc:"Durable household basket set for kitchen, bathroom, and storage. Strong polypropylene construction. Set of 3 different sizes.",
    badge:"Set of 3", avail:"In Stock",
    features:["Strong polypropylene","Set of 3 sizes","Food-safe material","Easy to clean"],
    img:"https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=700",
    sizes:[]
  },
  {
    id:8, name:"Kids Night Dress", cat:"nighty", price:120,
    desc:"Soft printed cotton night dress for children. Fun cartoon and floral prints. Available in boys and girls designs for ages 2 to 12.",
    badge:"", avail:"Ages 2 to 12 Years",
    features:["Soft cotton fabric","Boys and girls designs","Ages 2 to 12 years","Machine washable"],
    img:"",
    sizes:[
      {label:"2Y",  price:120, inStock:true},
      {label:"4Y",  price:120, inStock:true},
      {label:"6Y",  price:130, inStock:true},
      {label:"8Y",  price:130, inStock:true},
      {label:"10Y", price:140, inStock:false},
      {label:"12Y", price:140, inStock:false}
    ]
  },
  {
    id:9, name:"Ladies Hand Bag", cat:"bags", price:149,
    desc:"Stylish and spacious daily-use hand bag. Strong handles, multiple compartments, durable synthetic material. Available in 6 colors.",
    badge:"", avail:"In Stock",
    features:["Multiple compartments","Strong handles","Durable synthetic material","6 color options"],
    img:"https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=700",
    sizes:[]
  }
];

/* ─── SIZE UTILITY FUNCTIONS ─────────────────────────────────── */

/**
 * Compute the availability status from a sizes array.
 * Returns: 'all' | 'some' | 'none' | 'na' (no sizes defined)
 */
function SIZE_status(sizes) {
  if (!sizes || !sizes.length) return 'na';
  const inStock = sizes.filter(s => s.inStock);
  if (inStock.length === 0)          return 'none';
  if (inStock.length === sizes.length) return 'all';
  return 'some';
}

/**
 * Get the avail display string from sizes.
 * Used on product cards and detail page.
 */
function SIZE_availText(sizes) {
  const st = SIZE_status(sizes);
  if (st === 'na')   return null;          // caller uses own avail field
  if (st === 'none') return 'Out of Stock';
  if (st === 'all')  return 'All Sizes Available';
  const avail = sizes.filter(s => s.inStock).map(s => s.label);
  return avail.join(' · ');
}

/**
 * Get the display price for a product — lowest in-stock price.
 * Returns the numeric price to display.
 */
function SIZE_basePrice(product) {
  const sizes = product.sizes;
  if (!sizes || !sizes.length) return product.price;
  const inStock = sizes.filter(s => s.inStock);
  if (!inStock.length) return product.price;
  return Math.min(...inStock.map(s => s.price));
}

/**
 * Returns true if prices differ across sizes.
 */
function SIZE_hasVariedPrices(sizes) {
  if (!sizes || sizes.length < 2) return false;
  const prices = sizes.map(s => s.price);
  return Math.min(...prices) !== Math.max(...prices);
}

/* ─── CATEGORY PERSISTENCE ───────────────────────────────────── */
function DB_loadCategories() {
  try {
    const saved = localStorage.getItem("simco_categories");
    SIMCO_CATEGORIES = saved
      ? JSON.parse(saved)
      : JSON.parse(JSON.stringify(SIMCO_DEFAULT_CATEGORIES));
  } catch {
    SIMCO_CATEGORIES = JSON.parse(JSON.stringify(SIMCO_DEFAULT_CATEGORIES));
  }
  return SIMCO_CATEGORIES;
}
function DB_saveCategories() {
  try { localStorage.setItem("simco_categories", JSON.stringify(SIMCO_CATEGORIES)); } catch {}
}
function DB_addCategory(label, from, img) {
  label = label.trim();
  if (!label) return null;
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  if (SIMCO_CATEGORIES.find(c => c.id===id || c.label.toLowerCase()===label.toLowerCase())) return null;
  const cat = { id, label, from: from||'', img: img||'', custom:true };
  SIMCO_CATEGORIES.push(cat);
  DB_saveCategories();
  return cat;
}
function DB_removeCategory(id) {
  const cat = SIMCO_CATEGORIES.find(c => c.id===id);
  if (!cat||!cat.custom) return false;
  SIMCO_CATEGORIES = SIMCO_CATEGORIES.filter(c => c.id!==id);
  DB_saveCategories();
  return true;
}

/* ─── PRODUCT PERSISTENCE ────────────────────────────────────── */
function DB_load() {
  try {
    const saved = localStorage.getItem("simco_products");
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(SIMCO_DEFAULT_PRODUCTS));
  } catch {
    return JSON.parse(JSON.stringify(SIMCO_DEFAULT_PRODUCTS));
  }
}
function DB_save(products) {
  try { localStorage.setItem("simco_products", JSON.stringify(products)); } catch {}
}
function DB_nextId(products) {
  return products.length ? Math.max(...products.map(p=>p.id))+1 : 1;
}
function DB_catLabel(id) {
  const c = SIMCO_CATEGORIES.find(c=>c.id===id);
  return c ? c.label : id;
}

/* ─── INIT ───────────────────────────────────────────────────── */
DB_loadCategories();
