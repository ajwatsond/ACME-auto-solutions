// ── BRAND DATA ──
// Replace / extend with your database data
const BRANDS = [
    {
        id: 1,
        name: "Flowmaster",
        slug: "flowmaster",
        tier: "Performance",
        categories: ["Exhaust"],
        featured: true,
        logo: "💨",
        tagline: "The sound of performance.",
        desc: "American-made exhaust systems and mufflers engineered for maximum flow and unmistakable sound.",
    },
    {
        id: 2,
        name: "Monroe",
        slug: "monroe",
        tier: "OEM",
        categories: ["Suspension"],
        featured: true,
        logo: "🔩",
        tagline: "Ride control you can trust.",
        desc: "Over 100 years of suspension expertise. Monroe shocks and struts are standard fitment on millions of vehicles.",
    },
    {
        id: 3,
        name: "Bosch",
        slug: "bosch",
        tier: "OEM",
        categories: ["Electrical", "Filters"],
        featured: true,
        logo: "⚡",
        tagline: "Invented for life.",
        desc: "From oxygen sensors to spark plugs, Bosch supplies OEM-quality electrical components for virtually every make.",
    },
    {
        id: 4,
        name: "Brembo",
        slug: "brembo",
        tier: "Performance",
        categories: ["Brakes"],
        featured: true,
        logo: "🛑",
        tagline: "The art of braking.",
        desc: "The world's leading brake manufacturer. Brembo rotors and calipers are fitted on the world's fastest cars.",
    },
    {
        id: 5,
        name: "K&N",
        slug: "kn",
        tier: "Performance",
        categories: ["Engine", "Filters"],
        featured: false,
        logo: "🌀",
        tagline: "More power. More miles.",
        desc: "High-flow air filters and intake systems that deliver measurable horsepower gains with washable, reusable media.",
    },
    {
        id: 6,
        name: "Gates",
        slug: "gates",
        tier: "OEM",
        categories: ["Engine"],
        featured: false,
        logo: "⚙️",
        tagline: "Power transmission leaders.",
        desc: "Timing belts, serpentine belts, and water pumps engineered to OEM spec for reliable long-term performance.",
    },
    {
        id: 7,
        name: "ACDelco",
        slug: "acdelco",
        tier: "OEM",
        categories: ["Engine", "Electrical", "Filters"],
        featured: false,
        logo: "🔧",
        tagline: "GM's own parts brand.",
        desc: "The official parts brand of General Motors. ACDelco covers everything from batteries to brake pads for GM vehicles.",
    },
    {
        id: 8,
        name: "Dorman",
        slug: "dorman",
        tier: "Economy",
        categories: ["Engine", "Suspension", "Electrical"],
        featured: false,
        logo: "🛠️",
        tagline: "Fix it right. Fix it affordable.",
        desc: "Dorman specializes in hard-to-find replacement parts, reengineering OEM components at accessible price points.",
    },
    {
        id: 9,
        name: "Moog",
        slug: "moog",
        tier: "OEM",
        categories: ["Suspension"],
        featured: false,
        logo: "🔩",
        tagline: "Problem solver parts.",
        desc: "MOOG chassis parts are engineered with enhanced design features to outlast and outperform the original equipment.",
    },
    {
        id: 10,
        name: "EBC Brakes",
        slug: "ebc",
        tier: "Performance",
        categories: ["Brakes"],
        featured: false,
        logo: "🛑",
        tagline: "Brake harder. Go faster.",
        desc: "EBC produces premium brake pads and rotors for street, track, and off-road use across hundreds of applications.",
    },
    {
        id: 11,
        name: "Fram",
        slug: "fram",
        tier: "Economy",
        categories: ["Filters"],
        featured: false,
        logo: "🌀",
        tagline: "America's #1 filter brand.",
        desc: "FRAM has been protecting engines since 1934, offering a full line of oil, air, cabin, and fuel filters.",
    },
    {
        id: 12,
        name: "Denso",
        slug: "denso",
        tier: "OEM",
        categories: ["Electrical", "Engine"],
        featured: false,
        logo: "⚡",
        tagline: "Quality beyond expectation.",
        desc: "Toyota's OEM supplier of choice. Denso makes starters, alternators, sensors, and ignition components to factory spec.",
    },
];

// ── PARTS DATA (reuse from main.js structure) ──
const PARTS = [
    { id: 1,  sku: "ENG-4420", name: "High-Flow Air Intake Kit",         brand: "K&N",       category: "Engine",     price: 129.99, badge: "new"  },
    { id: 2,  sku: "BRK-0881", name: "Ceramic Brake Pad Set — Front",    brand: "Brembo",    category: "Brakes",     price: 54.95,  badge: "sale" },
    { id: 3,  sku: "SUS-1124", name: "Monroe Quick-Strut Assembly",       brand: "Monroe",    category: "Suspension", price: 189.00, badge: null   },
    { id: 4,  sku: "ELC-7705", name: "Oxygen Sensor — Upstream",         brand: "Bosch",     category: "Electrical", price: 39.49,  badge: null   },
    { id: 5,  sku: "FLT-3302", name: "Engine Oil Filter (12-pack)",      brand: "Fram",      category: "Filters",    price: 22.00,  badge: "sale" },
    { id: 6,  sku: "EXH-9901", name: "Flowmaster 40 Series Muffler",    brand: "Flowmaster", category: "Exhaust",    price: 99.99,  badge: null   },
    { id: 7,  sku: "ENG-5512", name: "Timing Belt & Water Pump Kit",     brand: "Gates",     category: "Engine",     price: 142.50, badge: "new"  },
    { id: 8,  sku: "BRK-0440", name: "Drilled & Slotted Rotors — Rear", brand: "EBC Brakes", category: "Brakes",    price: 78.00,  badge: null   },
    { id: 9,  sku: "SUS-2201", name: "Rear Sway Bar End Links",          brand: "Moog",      category: "Suspension", price: 34.99,  badge: null   },
    { id: 10, sku: "ELC-3310", name: "Ignition Coil Pack",               brand: "Denso",     category: "Electrical", price: 61.00,  badge: null   },
    { id: 11, sku: "FLT-1100", name: "Cabin Air Filter",                 brand: "Bosch",     category: "Filters",    price: 14.99,  badge: null   },
    { id: 12, sku: "ENG-7730", name: "Valve Cover Gasket Set",           brand: "ACDelco",   category: "Engine",     price: 47.50,  badge: null   },
];

const ICONS = {
    Engine: "⚙️", Brakes: "🛑", Suspension: "🔩",
    Electrical: "⚡", Filters: "🌀", Exhaust: "💨",
};

// ── RENDER FEATURED BRANDS ──
function renderFeatured(data) {
    const grid = document.getElementById("featured-brands-grid");
    const featured = data.filter(b => b.featured);
    if (!featured.length) {
        document.getElementById("featured-section").style.display = "none";
        return;
    }
    document.getElementById("featured-section").style.display = "block";
    grid.innerHTML = featured.map(b => `
        <button class="featured-brand-card" data-id="${b.id}">
            <div class="featured-brand-logo">${b.logo}</div>
            <div class="featured-brand-info">
                <span class="brand-tier-badge tier-${b.tier.toLowerCase()}">${b.tier}</span>
                <h3 class="featured-brand-name">${b.name}</h3>
                <p class="featured-brand-tagline">${b.tagline}</p>
                <p class="featured-brand-cats">${b.categories.join(" · ")}</p>
            </div>
            <span class="featured-brand-arrow">→</span>
        </button>
    `).join("");

    grid.querySelectorAll(".featured-brand-card").forEach(card => {
        card.addEventListener("click", () => openModal(parseInt(card.dataset.id)));
    });
}

// ── RENDER ALL BRANDS ──
function renderBrands(data) {
    const grid  = document.getElementById("brands-grid");
    const none  = document.getElementById("brands-none");
    const label = document.getElementById("brand-count-label");

    const nonFeatured = data.filter(b => !b.featured);
    label.textContent = `${data.length} brand${data.length !== 1 ? "s" : ""}`;

    if (!data.length) {
        grid.innerHTML = "";
        none.style.display = "block";
        return;
    }
    none.style.display = "none";

    // Show featured in the all-brands grid too if search is active
    const isFiltered = document.getElementById("brand-search").value ||
                       document.getElementById("brand-category-filter").value ||
                       document.getElementById("brand-tier-filter").value;
    const toShow = isFiltered ? data : nonFeatured;

    grid.innerHTML = toShow.map(b => `
        <button class="brand-card" data-id="${b.id}">
            <div class="brand-card-logo">${b.logo}</div>
            <div class="brand-card-info">
                <span class="brand-tier-badge tier-${b.tier.toLowerCase()}">${b.tier}</span>
                <span class="brand-card-name">${b.name}</span>
                <span class="brand-card-cats">${b.categories.join(" · ")}</span>
            </div>
            <span class="brand-card-arrow">→</span>
        </button>
    `).join("");

    grid.querySelectorAll(".brand-card").forEach(card => {
        card.addEventListener("click", () => openModal(parseInt(card.dataset.id)));
    });
}

// ── FILTER ──
function filterBrands() {
    const query = document.getElementById("brand-search").value.toLowerCase();
    const cat   = document.getElementById("brand-category-filter").value;
    const tier  = document.getElementById("brand-tier-filter").value;

    const results = BRANDS.filter(b => {
        const matchesQuery = !query || b.name.toLowerCase().includes(query) || b.desc.toLowerCase().includes(query);
        const matchesCat   = !cat  || b.categories.includes(cat);
        const matchesTier  = !tier || b.tier === tier;
        return matchesQuery && matchesCat && matchesTier;
    });

    renderFeatured(results);
    renderBrands(results);
}

document.getElementById("brand-search").addEventListener("input", filterBrands);
document.getElementById("brand-category-filter").addEventListener("change", filterBrands);
document.getElementById("brand-tier-filter").addEventListener("change", filterBrands);

// ── MODAL ──
function openModal(id) {
    const brand = BRANDS.find(b => b.id === id);
    if (!brand) return;

    const parts = PARTS.filter(p => p.brand === brand.name);

    document.getElementById("brand-modal-tag").textContent     = brand.tagline;
    document.getElementById("brand-modal-name").textContent    = brand.name;
    document.getElementById("brand-modal-desc").textContent    = brand.desc;
    document.getElementById("brand-modal-tier").textContent    = brand.tier;
    document.getElementById("brand-modal-tier").className      = `brand-tier-badge tier-${brand.tier.toLowerCase()}`;
    document.getElementById("brand-modal-cats").textContent    = brand.categories.join(" · ");

    const partsGrid = document.getElementById("brand-modal-parts-grid");
    const partsNone = document.getElementById("brand-modal-none");

    if (!parts.length) {
        partsGrid.innerHTML = "";
        partsNone.style.display = "block";
    } else {
        partsNone.style.display = "none";
        partsGrid.innerHTML = parts.map(p => {
            const dollars = Math.floor(p.price);
            const cents   = (p.price % 1).toFixed(2).slice(1);
            const badge   = p.badge ? `<span class="part-badge ${p.badge}">${p.badge}</span>` : "";
            return `
                <div class="part-card">
                    <div class="part-img">
                        ${ICONS[p.category] ?? "🔧"}
                        ${badge}
                    </div>
                    <div class="part-info">
                        <span class="part-sku">${p.sku}</span>
                        <span class="part-name">${p.name}</span>
                        <span class="part-compat">${p.category}</span>
                    </div>
                    <div class="part-footer">
                        <span class="part-price">$${dollars}<span class="cents">${cents}</span></span>
                        <button class="add-btn" onclick="addToCart(${p.id})">+ Add</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    const overlay = document.getElementById("brand-modal-overlay");
    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("visible"));
}

function closeModal() {
    const overlay = document.getElementById("brand-modal-overlay");
    overlay.classList.remove("visible");
    overlay.addEventListener("transitionend", () => {
        overlay.style.display = "none";
    }, { once: true });
}

document.getElementById("brand-modal-close").addEventListener("click", closeModal);
document.getElementById("brand-modal-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("brand-modal-overlay")) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ── CART ──
let cart = [];
function addToCart(id) {
    cart.push(id);
    document.getElementById("cart-count").textContent = cart.length;
}

// ── INIT ──
renderFeatured(BRANDS);
renderBrands(BRANDS);