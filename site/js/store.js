/**
 * HEATX Lab Store Engine
 * Cart management, product catalog, discount codes
 * Uses localStorage for cart persistence
 */

// ========== Product Catalog ==========
const PRODUCTS = [
  {
    id: "heatx",
    name: "HEATX",
    category: "HNB Zařízení",
    tag: "ORIGINÁL",
    price: 25.57,
    originalPrice: 30.00,
    currency: "USD",
    image: "assets/heatx.png",
    stock: 100,
    rating: 4.5,
    reviews: 128,
    description: "Původní zařízení HEATX heat-not-burn. Precizně zkonstruovaný HNB systém, který zahřívá místo spalování a poskytuje autentickou chuť s výrazně sníženým obsahem škodlivých látek. Kompaktní, spolehlivé a navržené pro každodenní použití.",
    specs: {
      type: "Heat-Not-Burn (HNB) zařízení",
      heatingSystem: "Chytrý indukční ohřev",
      battery: "1500mAh vestavěný",
      chargeTime: "1,5 hodiny",
      warmUpTime: "20 sekund",
      sessionLength: "Až 6 minut",
      material: "Letecký hliník",
      dimensions: "102 x 28 x 18 mm",
      weight: "78 g",
      temperature: "3stupňová chytrá kontrola",
      color: "Matná černá"
    },
    options: {
      color: [
        { name: "Matná černá", value: "black", extra: 0 }
      ]
    },
    gallery: [
      "assets/heatx.png"
    ],
    slug: "cmt-q001"
  },
  {
    id: "gen2",
    name: "GEN2.0",
    category: "HNB Zařízení",
    tag: "NOVÁ GEN",
    price: 41.90,
    originalPrice: 50.00,
    currency: "USD",
    image: "assets/gen2-0.jpg",
    stock: 75,
    rating: 4.7,
    reviews: 214,
    description: "Zařízení heat-not-burn nové generace. GEN2.0 vylepšuje zážitek HNB s rychlejším nahříváním, delšími relacemi a chytřejší regulací teploty pro bohatší a konzistentnější chuť od začátku do konce.",
    specs: {
      type: "Heat-Not-Burn (HNB) zařízení",
      heatingSystem: "Indukční ohřev 2. generace",
      battery: "2200mAh vestavěný",
      chargeTime: "2 hodiny",
      warmUpTime: "15 sekund",
      sessionLength: "Až 8 minut",
      material: "Hliník s titanovým povrchem",
      dimensions: "108 x 30 x 20 mm",
      weight: "92 g",
      temperature: "3stupňová chytrá kontrola",
      color: "Tmavý titan"
    },
    options: {
      color: [
        { name: "Tmavý titan", value: "titanium", extra: 0 },
        { name: "Tajná černá", value: "black", extra: 0 }
      ]
    },
    gallery: [
      "assets/gen2-0.jpg"
    ],
    slug: "gen2-0-001"
  },
  {
    id: "heatx-3",
    name: "HEATX-3.0",
    category: "HNB Zařízení",
    tag: "VLAJKOVÁ LOD",
    price: 69.99,
    originalPrice: 80.00,
    currency: "USD",
    image: "assets/heatx-3-0.jpg",
    stock: 50,
    rating: 4.9,
    reviews: 386,
    description: "HEATX-3 hybridní topný systém s 360° indukčním ohřevem, velkou baterií 3200mAh a 3stupňovou chytrou kontrolou teploty. Vlajkové HNB zařízení navržené pro prémiovou chuť, dlouhou výdrž a snadné ovládání.",
    specs: {
      type: "Heat-Not-Burn (HNB) zařízení",
      heatingSystem: "HEATX-3 hybridní 360° okolní indukce",
      battery: "3200mAh velká baterie",
      chargeTime: "2,5 hodiny",
      warmUpTime: "12 sekund",
      sessionLength: "Až 10 minut",
      temperature: "3stupňová chytrá kontrola teploty",
      material: "Prémiový hliník + skleněný panel",
      dimensions: "115 x 32 x 22 mm",
      weight: "110 g",
      display: "OLED stavový displej",
      color: "Černá / Zelená / Fialová / Bílá"
    },
    options: {
      color: [
        { name: "Černá", value: "black", extra: 0 },
        { name: "Zelená", value: "green", extra: 0 },
        { name: "Fialová", value: "purple", extra: 0 },
        { name: "Bílá", value: "white", extra: 0 }
      ]
    },
    gallery: [
      "assets/heatx-3-0.jpg"
    ],
    slug: "heatx-3-0"
  },
  {
    id: "heatx-5",
    name: "HEATX 5",
    category: "HNB Zařízení",
    tag: "5. GENERACE",
    price: 33.75,
    originalPrice: 40.00,
    currency: "USD",
    image: "assets/heatx-5.png",
    stock: 0,
    rating: 4.8,
    reviews: 0,
    description: "Zařízení HEATX 5 páté generace heat-not-burn. Postaveno na vylepšené technologii HNB s optimalizovanou topnou účinností, prodlouženou životností relace a elegantním ergonomickým designem. Poskytuje hladkou, konzistentní chuť se sníženým obsahem škodlivých látek — vyvážený blend výkonu a hodnoty.",
    specs: {
      type: "Heat-Not-Burn (HNB) zařízení",
      heatingSystem: "Přesný indukční ohřev 5. generace",
      battery: "2600mAh vestavěný",
      chargeTime: "2 hodiny",
      warmUpTime: "14 sekund",
      sessionLength: "Až 9 minut",
      material: "Letecký hliník",
      dimensions: "110 x 30 x 20 mm",
      weight: "95 g",
      temperature: "3stupňová chytrá kontrola",
      color: "Matná černá"
    },
    options: {
      color: [
        { name: "Matná černá", value: "black", extra: 0 }
      ]
    },
    gallery: [
      "assets/heatx-5.png"
    ],
    slug: "heatx-5"
  },
  {
    id: "heatx-6",
    name: "HEATX 6",
    category: "HNB Zařízení",
    tag: "6. GENERACE",
    price: 49.99,
    originalPrice: 60.00,
    currency: "USD",
    image: "assets/heatx-6.png",
    stock: 0,
    rating: 4.9,
    reviews: 0,
    description: "Zařízení HEATX 6 šesté generace heat-not-burn. Vybaveno pokročilým dvoujádrovým topným systémem, ultrarychlým nahříváním a prodlouženou výdrží baterie pro celodenní relace. Precizně zkonstruováno pro bohatou, vrstvenou chuť a prémiový pocit v ruce — nejrafinovanější HNB zážitek.",
    specs: {
      type: "Heat-Not-Burn (HNB) zařízení",
      heatingSystem: "Dvoujádrový indukční ohřev 6. generace",
      battery: "3000mAh vestavěný",
      chargeTime: "2 hodiny",
      warmUpTime: "10 sekund",
      sessionLength: "Až 10 minut",
      material: "Prémiový hliník + skleněný panel",
      dimensions: "112 x 31 x 21 mm",
      weight: "102 g",
      temperature: "3stupňová chytrá kontrola",
      display: "LED stavový indikátor",
      color: "Matná černá"
    },
    options: {
      color: [
        { name: "Matná černá", value: "black", extra: 0 }
      ]
    },
    gallery: [
      "assets/heatx-6.png"
    ],
    slug: "heatx-6"
  },
  {
    id: "pioneering-solid-nicotine",
    name: "Pioneering Solid Nicotine",
    category: "Pevný nikotin",
    tag: "NOVINKA",
    price: 49.99,
    originalPrice: 60.00,
    currency: "USD",
    image: "assets/pioneering-solid-nicotine.png",
    stock: 60,
    rating: 4.8,
    reviews: 0,
    description: "Pioneering Solid Nicotine — inovativní zařízení pro dodávku pevného nikotinu, které poskytuje hladké, kontrolované uspokojení nikotinem bez spalování. Vybaveno precizním jádrem z pevného nikotinu, dlouhotrvající baterií a čistým, diskrétním designem. Průkopnický přístup k modernímu užívání nikotinu.",
    specs: {
      type: "Zařízení pro pevný nikotin",
      deliveryMethod: "Jádro z pevného nikotinu",
      nicotineForm: "Pevný nikotin",
      battery: "2800mAh vestavěný",
      chargeTime: "2 hodiny",
      warmUpTime: "12 sekund",
      sessionLength: "Až 9 minut",
      material: "Prémiový hliník",
      dimensions: "108 x 30 x 20 mm",
      weight: "96 g",
      temperature: "3stupňová chytrá kontrola",
      color: "Matná černá"
    },
    options: {
      color: [
        { name: "Matná černá", value: "black", extra: 0 }
      ]
    },
    gallery: [
      "assets/pioneering-solid-nicotine.png"
    ],
    slug: "pioneering-solid-nicotine"
  },
  {
    id: "heatx-open-pod",
    name: "HEATX Open Pod",
    category: "Systém otevřených podů",
    tag: "OTEVŘENÝ POD",
    price: 69.99,
    originalPrice: 80.00,
    currency: "USD",
    image: "assets/heatx-open-pod.png",
    stock: 55,
    rating: 4.9,
    reviews: 0,
    description: "HEATX Open Pod — všestranný systém otevřených podů, který vám umožní doplňovat a přizpůsobovat vlastní příchutě. Vybaven proti úniku, plnitelný pod, výkonná baterie a plynulý nastavitelný průtok vzduchu. Vytvořeno pro vapeře, kteří chtějí svobodu volby a prémiový, ekologický zážitek.",
    specs: {
      type: "Systém otevřených podů",
      podType: "Plnitelný otevřený pod",
      podCapacity: "2,0 ml",
      coilResistance: "1,0 ohm mesh spirála",
      battery: "3000mAh vestavěný",
      chargeTime: "2 hodiny",
      warmUpTime: "Okamžitý (aktivace tahem)",
      airflow: "Nastavitelný průtok vzduchu",
      material: "Prémiový hliník + PCTG pod",
      dimensions: "115 x 32 x 22 mm",
      weight: "108 g",
      output: "3stupňové proměnné napětí",
      color: "Matná černá"
    },
    options: {
      color: [
        { name: "Matná černá", value: "black", extra: 0 }
      ]
    },
    gallery: [
      "assets/heatx-open-pod.png"
    ],
    slug: "heatx-open-pod"
  },
  {
    id: "disposable-watermelon",
    name: "Jednorázová - Vodní meloun",
    category: "Jednorázové e-cigarety",
    tag: "2500 POTÁHŮ",
    price: 7.00,
    originalPrice: 10.00,
    currency: "USD",
    image: "assets/disposable-watermelon.png",
    stock: 0,
    rating: 4.6,
    reviews: 156,
    description: "Osvěžující jednorázová e-cigareta s příchutí vodního melounu. 2500 potáhnutí šťavnatého, sladkého melounu s nulovým nikotinem a nulovým dehtem. Kompaktní, připravená k použití, ideální pro cesty.",
    specs: {
      type: "Jednorázová elektronická cigareta",
      flavor: "Vodní meloun",
      puffs: "2500 potáhnutí",
      nicotine: "Bez nikotinu",
      tar: "Bez dehtu",
      battery: "Nabíjecí (přednabita)",
      activation: "Aktivace tahem",
      weight: "32 g"
    },
    options: {},
    slug: "disposable-watermelon"
  },
  {
    id: "disposable-grape",
    name: "Jednorázová - Hroznové víno",
    category: "Jednorázové e-cigarety",
    tag: "2500 POTÁHŮ",
    price: 7.00,
    originalPrice: 10.00,
    currency: "USD",
    image: "assets/disposable-grape.jpg",
    stock: 0,
    rating: 4.6,
    reviews: 142,
    description: "Plná chuť hroznového vína v jednorázové e-cigaretě. 2500 potáhnutí výrazné, sladké chuti hroznů s nulovým nikotinem a nulovým dehtem. Uspokojivý, hladký zážitek v kompaktním, připraveném zařízení.",
    specs: {
      type: "Jednorázová elektronická cigareta",
      flavor: "Hroznové víno",
      puffs: "2500 potáhnutí",
      nicotine: "Bez nikotinu",
      tar: "Bez dehtu",
      battery: "Nabíjecí (přednabita)",
      activation: "Aktivace tahem",
      weight: "32 g"
    },
    options: {},
    slug: "disposable-grape"
  },
  {
    id: "disposable-green-grape",
    name: "Jednorázová - Zelené hrozny",
    category: "Jednorázové e-cigarety",
    tag: "2500 POTÁHŮ",
    price: 7.00,
    originalPrice: 10.00,
    currency: "USD",
    image: "assets/disposable-green-grape.png",
    stock: 0,
    rating: 4.5,
    reviews: 98,
    description: "Svěží chuť zelených hroznů v jednorázové e-cigaretě. 2500 potáhnutí lehké, osvěžující chuti zelených hroznů s nulovým nikotinem a nulovým dehtem. Čistý, chladivý profil chuti pro celodenní užívání.",
    specs: {
      type: "Jednorázová elektronická cigareta",
      flavor: "Zelené hrozny",
      puffs: "2500 potáhnutí",
      nicotine: "Bez nikotinu",
      tar: "Bez dehtu",
      battery: "Nabíjecí (přednabita)",
      activation: "Aktivace tahem",
      weight: "32 g"
    },
    options: {},
    slug: "disposable-green-grape"
  },
  {
    id: "disposable-peach",
    name: "Jednorázová - Broskev",
    category: "Jednorázové e-cigarety",
    tag: "2500 POTÁHŮ",
    price: 7.00,
    originalPrice: 10.00,
    currency: "USD",
    image: "assets/disposables.jpg",
    stock: 0,
    rating: 4.7,
    reviews: 121,
    description: "Sladká broskvová chuť v jednorázové e-cigaretě. 2500 potáhnutí zralé, šťavnaté broskve s nulovým nikotinem a nulovým dehtem. Jemná ovocná chuť, která přináší hladké uspokojení.",
    specs: {
      type: "Jednorázová elektronická cigareta",
      flavor: "Broskev",
      puffs: "2500 potáhnutí",
      nicotine: "Bez nikotinu",
      tar: "Bez dehtu",
      battery: "Nabíjecí (přednabita)",
      activation: "Aktivace tahem",
      weight: "32 g"
    },
    options: {},
    slug: "disposable-peach"
  },
  {
    id: "disposable-mint",
    name: "Jednorázová - Máta",
    category: "Jednorázové e-cigarety",
    tag: "2500 POTÁHŮ",
    price: 7.00,
    originalPrice: 10.00,
    currency: "USD",
    image: "assets/disposable-mint.png",
    stock: 0,
    rating: 4.8,
    reviews: 167,
    description: "Chladivá mátová chuť v jednorázové e-cigaretě. 2500 potáhnutí křupavé, osvěžující máty s nulovým nikotinem a nulovým dehtem. Čistá, povzbuzující chuť ideální pro svěží pocit.",
    specs: {
      type: "Jednorázová elektronická cigareta",
      flavor: "Máta",
      puffs: "2500 potáhnutí",
      nicotine: "Bez nikotinu",
      tar: "Bez dehtu",
      battery: "Nabíjecí (přednabita)",
      activation: "Aktivace tahem",
      weight: "32 g"
    },
    options: {},
    slug: "disposable-mint"
  },
  {
    id: "disposable-lychee",
    name: "Jednorázová - Liči",
    category: "Jednorázové e-cigarety",
    tag: "2500 POTÁHŮ",
    price: 7.00,
    originalPrice: 10.00,
    currency: "USD",
    image: "assets/disposable-lychee.png",
    stock: 0,
    rating: 4.6,
    reviews: 89,
    description: "Exotická chuť liči v jednorázové e-cigaretě. 2500 potáhnutí sladké, voňavé liči s nulovým nikotinem a nulovým dehtem. Výrazná tropická chuť pro jedinečný zážitek.",
    specs: {
      type: "Jednorázová elektronická cigareta",
      flavor: "Liči",
      puffs: "2500 potáhnutí",
      nicotine: "Bez nikotinu",
      tar: "Bez dehtu",
      battery: "Nabíjecí (přednabita)",
      activation: "Aktivace tahem",
      weight: "32 g"
    },
    options: {},
    slug: "disposable-lychee"
  },
  {
    id: "nasal-inhaler",
    name: "Nosní inhalátor",
    category: "Nosní inhalátory",
    tag: "NOVINKA",
    price: 7.00,
    originalPrice: 10.00,
    currency: "USD",
    image: "assets/nasal-inhaler.jpg",
    stock: 150,
    rating: 4.4,
    reviews: 64,
    description: "Nosní inhalační e-Cigareta navržená pro přímou nosní inhalaci. Elegantní, hygienické osobní aroma zařízení, které dodává chuť a pocit nosní cestou a nabízí výraznou alternativu k tradičním zařízením.",
    specs: {
      type: "Nosní inhalační e-cigareta",
      deliveryMethod: "Přímá nosní inhalace",
      flavor: "Mentolová aroma",
      puffs: "1500 potáhnutí",
      nicotine: "Bez nikotinu",
      tar: "Bez dehtu",
      battery: "Nabíjecí (přednabita)",
      activation: "Manuální",
      material: "Potravinářský ABS + silikonový špička",
      weight: "28 g"
    },
    options: {},
    slug: "nasal-inhaler"
  }
];

// ========== Discount Codes ==========
const DISCOUNT_CODES = {
  "HEATXLAB10": { type: "percent", value: 10, minOrder: 0, desc: "10% sleva z celé objednávky" },
  "SAVE20": { type: "fixed", value: 20, minOrder: 100, desc: "$20 sleva z objednávek nad $100" },
  "FREESHIP": { type: "shipping", value: 0, minOrder: 0, desc: "Doprava zdarma" },
  "WELCOME15": { type: "percent", value: 15, minOrder: 150, desc: "15% sleva z objednávek nad $150" },
  "BULK25": { type: "percent", value: 25, minOrder: 300, desc: "25% sleva z velkoobchodních objednávek nad $300" }
};

// ========== Cart Management ==========
const CART_KEY = "heatxlab_cart";
const DISCOUNT_KEY = "heatxlab_discount";

function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, options = {}) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Stock check: prevent adding out-of-stock products
  if (product.stock <= 0) {
    alert(`Omlouváme se, ${product.name} je momentálně vyprodáno.`);
    return;
  }

  const cart = getCart();
  const optionKey = JSON.stringify(options);
  const existing = cart.find(item => item.id === productId && JSON.stringify(item.options) === optionKey);

  if (existing) {
    // Prevent exceeding available stock
    if (existing.qty + 1 > product.stock) {
      alert(`Omlouváme se, k dispozici je pouze ${product.stock} kusů ${product.name}.`);
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: getUnitPrice(product, options),
      basePrice: product.price,
      image: product.image,
      qty: 1,
      options: options,
      slug: product.slug
    });
  }

  saveCart(cart);
  return cart;
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  return cart;
}

/**
 * Unit price for a product including any option surcharges. The selected option
 * value is matched against both `name` and `value`, so the surcharge is applied
 * whether the caller passes the display name or the internal value.
 */
function getUnitPrice(product, options) {
  let extra = 0;
  const groups = product.options || {};
  for (const group of Object.keys(groups)) {
    const choices = groups[group];
    const chosen = options ? options[group] : null;
    if (!chosen || !Array.isArray(choices)) continue;
    const match = choices.find(c => c.name === chosen || c.value === chosen);
    if (match && Number.isFinite(match.extra)) extra += match.extra;
  }
  return +(product.price + extra).toFixed(2);
}

function updateQty(index, qty) {
  const cart = getCart();
  const item = cart[index];
  if (!item) return cart;

  // Never allow the quantity to exceed what the catalog says we have.
  const product = getProductById(item.id);
  const max = product && product.stock > 0 ? product.stock : 999;
  const requested = Math.floor(Number(qty));
  const next = Math.max(1, Math.min(Number.isFinite(requested) ? requested : 1, max));

  if (next !== item.qty) {
    item.qty = next;
    saveCart(cart);
  }
  return cart;
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(DISCOUNT_KEY);
  updateCartBadge();
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + (Number(item && item.qty) || 0), 0);
}

function getSubtotal() {
  const sum = getCart().reduce((acc, item) => {
    if (!item) return acc;
    const price = Number(item.price);
    const qty = Number(item.qty);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) return acc;
    return acc + price * qty;
  }, 0);
  return +sum.toFixed(2);
}

function getDiscount() {
  const code = localStorage.getItem(DISCOUNT_KEY);
  if (!code) return null;
  return DISCOUNT_CODES[code] || null;
}

function applyDiscountCode(code) {
  if (typeof code !== "string") return { success: false, message: "Neplatný slevový kód" };
  code = code.toUpperCase().trim();
  const discount = DISCOUNT_CODES[code];
  if (!discount) return { success: false, message: "Neplatný slevový kód" };

  const subtotal = getSubtotal();
  if (subtotal < discount.minOrder) {
    return { success: false, message: `Minimální objednávka $${discount.minOrder} je vyžadována pro tento kód` };
  }

  localStorage.setItem(DISCOUNT_KEY, code);
  return { success: true, message: `Kód aplikován: ${discount.desc}`, discount };
}

function removeDiscount() {
  localStorage.removeItem(DISCOUNT_KEY);
}

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 9.90;
const EXPRESS_SHIPPING_EXTRA = 19.90;

function getBaseShipping() {
  const discount = getDiscount();
  if (discount && discount.type === "shipping") return 0;
  if (getSubtotal() >= FREE_SHIPPING_THRESHOLD) return 0; // Free shipping over $100
  return FLAT_SHIPPING; // Flat rate $9.90
}

/**
 * Shipping cost for the chosen method. The express surcharge used to be shown
 * in the radio label but never added to the total, so express orders were
 * silently under-charged; it is part of the calculation now.
 */
function getShipping(method) {
  const base = getBaseShipping();
  return method === "express" ? +(base + EXPRESS_SHIPPING_EXTRA).toFixed(2) : base;
}

function getDiscountAmount() {
  const discount = getDiscount();
  if (!discount) return 0;
  const subtotal = getSubtotal();
  if (discount.type === "percent") return +(subtotal * discount.value / 100).toFixed(2);
  if (discount.type === "fixed") return Math.min(discount.value, subtotal);
  return 0;
}

function getTotal(method) {
  return +(getSubtotal() - getDiscountAmount() + getShipping(method)).toFixed(2);
}

function getAppliedDiscountCode() {
  return localStorage.getItem(DISCOUNT_KEY) || "";
}

// ========== Cart Badge ==========
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

// ========== Product Helpers ==========
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ========== Order Management ==========
function generateOrderId() {
  return "CM" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

/**
 * Escape a value before it is interpolated into an HTML string.
 * The tracking page renders order numbers and e-mail addresses that come from
 * the URL query string, so unescaped interpolation there was a reflected XSS.
 */
function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// localStorage is roughly 5MB; cap how many order backups we keep locally.
const MAX_LOCAL_ORDERS = 50;

function saveOrder(orderData) {
  if (!orderData || typeof orderData !== "object") return orderData;
  const orders = getOrders();
  orders.push(orderData);
  const trimmed = orders.slice(-MAX_LOCAL_ORDERS);
  try {
    localStorage.setItem("heatxlab_orders", JSON.stringify(trimmed));
  } catch (err) {
    // Quota exceeded — keep the most recent half and try once more.
    try {
      localStorage.setItem(
        "heatxlab_orders",
        JSON.stringify(trimmed.slice(-Math.ceil(MAX_LOCAL_ORDERS / 2)))
      );
    } catch (err2) {
      console.warn("Unable to persist local order backup:", err2);
    }
  }
  return orderData;
}

function getOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem("heatxlab_orders"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function matchesIdentity(record, idField, idValue, emailValue) {
  if (!record || typeof record !== "object") return false;
  const recId = record[idField];
  const recEmail = record.email;
  if (typeof recId !== "string" || typeof recEmail !== "string") return false;
  if (typeof idValue !== "string" || typeof emailValue !== "string") return false;
  return (
    recId.toUpperCase() === idValue.trim().toUpperCase() &&
    recEmail.toLowerCase() === emailValue.trim().toLowerCase()
  );
}

function findOrder(orderId, email) {
  if (typeof orderId !== "string" || typeof email !== "string") return null;
  return getOrders().find(o => matchesIdentity(o, "orderId", orderId, email)) || null;
}

// ========== Order Status Management ==========
function updateOrderStatus(orderId, email, newStatus) {
  const orders = getOrders();
  const idx = orders.findIndex(o => matchesIdentity(o, "orderId", orderId, email));
  if (idx === -1) return null;
  orders[idx].status = newStatus;
  orders[idx].statusHistory = Array.isArray(orders[idx].statusHistory) ? orders[idx].statusHistory : [];
  orders[idx].statusHistory.push({ status: newStatus, date: new Date().toISOString() });
  localStorage.setItem("heatxlab_orders", JSON.stringify(orders));
  return orders[idx];
}

function getOrderStatusHistory(orderId, email) {
  const order = findOrder(orderId, email);
  if (!order) return [];
  return order.statusHistory || [{ status: order.status || "confirmed", date: order.date }];
}

// ========== Return / RMA Management ==========
function generateRMAId() {
  return "RMA" + Date.now().toString(36).toUpperCase().substring(2, 8) + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function requestReturn(orderId, email, items, reason, detail) {
  const order = findOrder(orderId, email);
  if (!order) return null;
  const returns = getReturns();
  const existing = returns.find(r => matchesIdentity(r, "orderId", orderId, email));
  if (existing) return { error: "Pro tuto objednávku již existuje žádost o vrácení.", existing };
  const rma = {
    rmaId: generateRMAId(),
    orderId: orderId,
    email: email,
    items: items,
    reason: reason,
    detail: detail || "",
    status: "requested",
    createdAt: new Date().toISOString(),
    statusHistory: [{ status: "requested", date: new Date().toISOString() }],
  };
  returns.push(rma);
  localStorage.setItem("heatxlab_returns", JSON.stringify(returns));
  return rma;
}

function getReturns() {
  try {
    const parsed = JSON.parse(localStorage.getItem("heatxlab_returns"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findReturn(rmaId, email) {
  if (typeof rmaId !== "string" || typeof email !== "string") return null;
  return getReturns().find(r => matchesIdentity(r, "rmaId", rmaId, email)) || null;
}

function findReturnByOrder(orderId, email) {
  if (typeof orderId !== "string" || typeof email !== "string") return null;
  return getReturns().find(r => matchesIdentity(r, "orderId", orderId, email)) || null;
}

function updateReturnStatus(rmaId, email, newStatus) {
  const returns = getReturns();
  const idx = returns.findIndex(r => matchesIdentity(r, "rmaId", rmaId, email));
  if (idx === -1) return null;
  returns[idx].status = newStatus;
  returns[idx].statusHistory = Array.isArray(returns[idx].statusHistory) ? returns[idx].statusHistory : [];
  returns[idx].statusHistory.push({ status: newStatus, date: new Date().toISOString() });
  localStorage.setItem("heatxlab_returns", JSON.stringify(returns));
  return returns[idx];
}

// ========== Logistics Simulation ==========
function simulateLogistics(orderId, email) {
  const steps = ["confirmed", "processing", "shipped", "delivered"];
  const order = findOrder(orderId, email);
  if (!order) return null;
  const currentIdx = steps.indexOf(order.status);
  if (currentIdx === -1 || currentIdx >= steps.length - 1) return order;
  const nextStatus = steps[currentIdx + 1];
  return updateOrderStatus(orderId, email, nextStatus);
}

function simulateReturnFlow(rmaId, email) {
  const steps = ["requested", "approved", "return_shipped", "received", "refunded"];
  const rma = findReturn(rmaId, email);
  if (!rma) return null;
  const currentIdx = steps.indexOf(rma.status);
  if (currentIdx === -1 || currentIdx >= steps.length - 1) return rma;
  const nextStatus = steps[currentIdx + 1];
  return updateReturnStatus(rmaId, email, nextStatus);
}

// Initialize cart badge on page load
document.addEventListener("DOMContentLoaded", updateCartBadge);
