// ── DATA ──
// Replace this array with your database fetch when ready
const PARTS = [
    { id: 1, sku: "ENG-4420", name: "High-Flow Air Intake Kit",        category: "Engine",     compat: "2015–2022 Ford F-150",      price: 129.99, badge: "new"  },
    { id: 2, sku: "BRK-0881", name: "Ceramic Brake Pad Set — Front",   category: "Brakes",     compat: "2018–2023 Honda Accord",     price: 54.95,  badge: "sale" },
    { id: 3, sku: "SUS-1124", name: "Monroe Quick-Strut Assembly",      category: "Suspension", compat: "2010–2016 Toyota Camry",     price: 189.00, badge: null   },
    { id: 4, sku: "ELC-7705", name: "Oxygen Sensor — Upstream",        category: "Electrical", compat: "Universal Fit",              price: 39.49,  badge: null   },
    { id: 5, sku: "FLT-3302", name: "Engine Oil Filter (12-pack)",     category: "Filters",    compat: "Multiple fitments",          price: 22.00,  badge: "sale" },
    { id: 6, sku: "EXH-9901", name: "Flowmaster 40 Series Muffler",   category: "Exhaust",    compat: "2.5″ inlet/outlet",          price: 99.99,  badge: null   },
    { id: 7, sku: "ENG-5512", name: "Timing Belt & Water Pump Kit",    category: "Engine",     compat: "2008–2014 Subaru Forester",  price: 142.50, badge: "new"  },
    { id: 8, sku: "BRK-0440", name: "Drilled & Slotted Rotors — Rear",category: "Brakes",     compat: "2015–2020 Mustang GT",       price: 78.00,  badge: null   },
];

const ICONS = {
    Engine:     "⚙️",
    Brakes:     "🛑",
    Suspension: "🔩",
    Electrical: "⚡",
    Filters:    "🌀",
    Exhaust:    "💨",
};

// ── CART ──
let cart = [];

function addToCart(id) {
    cart.push(id);
    document.getElementById("cart-count").textContent = cart.length;
}

// ── PARTS RENDERING ──
function renderParts(data) {
    const grid      = document.getElementById("parts-grid");
    const noResults = document.getElementById("no-results");

    if (!data.length) {
        grid.innerHTML = "";
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";
    grid.innerHTML = data.map(p => {
        const dollars = Math.floor(p.price);
        const cents   = (p.price % 1).toFixed(2).slice(1); // e.g. ".99"
        const badge   = p.badge
            ? `<span class="part-badge ${p.badge}">${p.badge}</span>`
            : "";

        return `
            <div class="part-card">
                <div class="part-img">
                    ${ICONS[p.category] ?? "🔧"}
                    ${badge}
                </div>
                <div class="part-info">
                    <span class="part-sku">${p.sku}</span>
                    <span class="part-name">${p.name}</span>
                    <span class="part-compat">Fits: ${p.compat}</span>
                </div>
                <div class="part-footer">
                    <span class="part-price">$${dollars}<span class="cents">${cents}</span></span>
                    <button class="add-btn" onclick="addToCart(${p.id})">+ Add</button>
                </div>
            </div>
        `;
    }).join("");
}

// ── SEARCH & FILTER ──
function filterParts() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const cat   = document.getElementById("filter-category").value;
    const sort  = document.getElementById("filter-sort").value;

    let results = PARTS.filter(p => {
        const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
        const matchesCat   = !cat   || p.category === cat;
        return matchesQuery && matchesCat;
    });

    if (sort === "price-asc")  results.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") results.sort((a, b) => b.price - a.price);
    if (sort === "name")       results.sort((a, b) => a.name.localeCompare(b.name));

    renderParts(results);
}

function setCategoryFilter(category) {
    document.getElementById("filter-category").value = category;
    filterParts();
    document.getElementById("parts").scrollIntoView({ behavior: "smooth" });
}

// ── EVENT LISTENERS ──
document.getElementById("search-input").addEventListener("input", filterParts);
document.getElementById("filter-category").addEventListener("change", filterParts);
document.getElementById("filter-sort").addEventListener("change", filterParts);

document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => setCategoryFilter(card.dataset.category));
});

// ── DISCOUNT POPUP ──
function buildPopup() {
    const overlay = document.createElement("div");
    overlay.id = "popup-overlay";
    overlay.innerHTML = `
        <div id="popup">
            <button id="popup-close" aria-label="Close">&times;</button>
            <div id="popup-tag">Welcome offer</div>
            <h2 id="popup-heading">10% off<br>your first order</h2>
            <p id="popup-sub">Use the code below at checkout. One-time use, no minimum spend.</p>
            <div id="popup-code-wrap">
                <span id="popup-code">ACME10</span>
                <button id="popup-copy">Copy</button>
            </div>
            <button id="popup-cta">Shop Now</button>
            <p id="popup-dismiss">No thanks, I'll pay full price</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    document.getElementById("popup-close").addEventListener("click", closePopup);
    document.getElementById("popup-dismiss").addEventListener("click", closePopup);
    overlay.addEventListener("click", e => { if (e.target === overlay) closePopup(); });

    // Copy code
    document.getElementById("popup-copy").addEventListener("click", () => {
        navigator.clipboard.writeText("ACME10").then(() => {
            const btn = document.getElementById("popup-copy");
            btn.textContent = "Copied!";
            setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        });
    });

    // Shop now scrolls to parts and closes
    document.getElementById("popup-cta").addEventListener("click", () => {
        closePopup();
        document.getElementById("parts").scrollIntoView({ behavior: "smooth" });
    });

    // Animate in
    requestAnimationFrame(() => overlay.classList.add("visible"));
}

function closePopup() {
    const overlay = document.getElementById("popup-overlay");
    if (!overlay) return;
    overlay.classList.remove("visible");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    sessionStorage.setItem("popupSeen", "true");
}

// Show popup on load — once per session
window.addEventListener("load", () => {
    if (!sessionStorage.getItem("popupSeen")) {
        setTimeout(buildPopup, 800);
    }
});

// ── INIT ──
renderParts(PARTS);