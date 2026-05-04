// ── VEHICLE DATA ──
// Replace / extend with your database data
const VEHICLES = {
    "Ford": {
        "F-150":    [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
        "Mustang":  [2015, 2016, 2017, 2018, 2019, 2020],
        "Explorer": [2016, 2017, 2018, 2019, 2020, 2021],
    },
    "Honda": {
        "Accord":  [2018, 2019, 2020, 2021, 2022, 2023],
        "Civic":   [2016, 2017, 2018, 2019, 2020, 2021, 2022],
        "CR-V":    [2017, 2018, 2019, 2020, 2021, 2022],
    },
    "Toyota": {
        "Camry":   [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2021, 2022],
        "Tacoma":  [2016, 2017, 2018, 2019, 2020, 2021, 2022],
        "4Runner": [2015, 2016, 2017, 2018, 2019, 2020, 2021],
    },
    "Subaru": {
        "Forester": [2008, 2009, 2010, 2011, 2012, 2013, 2014],
        "Outback":  [2015, 2016, 2017, 2018, 2019, 2020],
        "WRX":      [2015, 2016, 2017, 2018, 2019, 2020, 2021],
    },
    "Chevrolet": {
        "Silverado": [2014, 2015, 2016, 2017, 2018, 2019, 2020],
        "Camaro":    [2016, 2017, 2018, 2019, 2020, 2021],
        "Equinox":   [2018, 2019, 2020, 2021, 2022],
    },
};

// ── PARTS DATA ──
// Replace with your database fetch when ready
const PARTS = [
    { id: 1,  sku: "ENG-4420", name: "High-Flow Air Intake Kit",         category: "Engine",     price: 129.99, badge: "new",  vehicles: [{ make: "Ford",      model: "F-150",    years: [2015,2016,2017,2018,2019,2020,2021,2022] }] },
    { id: 2,  sku: "BRK-0881", name: "Ceramic Brake Pad Set — Front",    category: "Brakes",     price: 54.95,  badge: "sale", vehicles: [{ make: "Honda",     model: "Accord",   years: [2018,2019,2020,2021,2022,2023] }] },
    { id: 3,  sku: "SUS-1124", name: "Monroe Quick-Strut Assembly",       category: "Suspension", price: 189.00, badge: null,   vehicles: [{ make: "Toyota",    model: "Camry",    years: [2010,2011,2012,2013,2014,2015,2016] }] },
    { id: 4,  sku: "ELC-7705", name: "Oxygen Sensor — Upstream",         category: "Electrical", price: 39.49,  badge: null,   vehicles: [{ make: "Ford",      model: "F-150",    years: [2015,2016,2017,2018,2019,2020,2021,2022] }, { make: "Chevrolet", model: "Silverado", years: [2014,2015,2016,2017,2018,2019,2020] }] },
    { id: 5,  sku: "FLT-3302", name: "Engine Oil Filter (12-pack)",      category: "Filters",    price: 22.00,  badge: "sale", vehicles: [{ make: "Honda",     model: "Civic",    years: [2016,2017,2018,2019,2020,2021,2022] }, { make: "Honda", model: "CR-V", years: [2017,2018,2019,2020,2021,2022] }] },
    { id: 6,  sku: "EXH-9901", name: "Flowmaster 40 Series Muffler",    category: "Exhaust",    price: 99.99,  badge: null,   vehicles: [{ make: "Ford",      model: "Mustang",  years: [2015,2016,2017,2018,2019,2020] }] },
    { id: 7,  sku: "ENG-5512", name: "Timing Belt & Water Pump Kit",     category: "Engine",     price: 142.50, badge: "new",  vehicles: [{ make: "Subaru",    model: "Forester", years: [2008,2009,2010,2011,2012,2013,2014] }] },
    { id: 8,  sku: "BRK-0440", name: "Drilled & Slotted Rotors — Rear", category: "Brakes",     price: 78.00,  badge: null,   vehicles: [{ make: "Ford",      model: "Mustang",  years: [2015,2016,2017,2018,2019,2020] }] },
    { id: 9,  sku: "SUS-2201", name: "Rear Sway Bar End Links",          category: "Suspension", price: 34.99,  badge: null,   vehicles: [{ make: "Subaru",    model: "WRX",      years: [2015,2016,2017,2018,2019,2020,2021] }] },
    { id: 10, sku: "ELC-3310", name: "Ignition Coil Pack",               category: "Electrical", price: 61.00,  badge: null,   vehicles: [{ make: "Toyota",    model: "Tacoma",   years: [2016,2017,2018,2019,2020,2021,2022] }] },
    { id: 11, sku: "FLT-1100", name: "Cabin Air Filter",                 category: "Filters",    price: 14.99,  badge: null,   vehicles: [{ make: "Chevrolet", model: "Equinox",  years: [2018,2019,2020,2021,2022] }, { make: "Toyota", model: "Camry", years: [2021,2022] }] },
    { id: 12, sku: "ENG-7730", name: "Valve Cover Gasket Set",           category: "Engine",     price: 47.50,  badge: null,   vehicles: [{ make: "Honda",     model: "Accord",   years: [2018,2019,2020,2021] }] },
];

const ICONS = {
    Engine: "⚙️", Brakes: "🛑", Suspension: "🔩",
    Electrical: "⚡", Filters: "🌀", Exhaust: "💨",
};

// ── ELEMENTS ──
const selYear  = document.getElementById("sel-year");
const selMake  = document.getElementById("sel-make");
const selModel = document.getElementById("sel-model");
const btnSearch = document.getElementById("btn-search-vehicle");
const resultsSection = document.getElementById("results-section");
const emptyState     = document.getElementById("empty-state");
const resultsGrid    = document.getElementById("results-grid");
const resultsTitle   = document.getElementById("results-title");
const resultsNone    = document.getElementById("results-none");
const recentWrap     = document.getElementById("recent-searches-wrap");
const recentContainer = document.getElementById("recent-searches");

// ── POPULATE YEAR ──
// Build a unique sorted list of all years across all vehicles
const allYears = [...new Set(
    Object.values(VEHICLES).flatMap(models =>
        Object.values(models).flat()
    )
)].sort((a, b) => b - a); // newest first

allYears.forEach(year => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    selYear.appendChild(opt);
});

// ── CASCADE: YEAR → MAKE ──
selYear.addEventListener("change", () => {
    const year = parseInt(selYear.value);

    // Reset downstream
    resetSelect(selMake,  "Select make");
    resetSelect(selModel, "Select model");
    selMake.disabled  = true;
    selModel.disabled = true;
    btnSearch.disabled = true;

    if (!year) return;

    // Find makes that have at least one model covering this year
    const validMakes = Object.entries(VEHICLES)
        .filter(([, models]) =>
            Object.values(models).some(years => years.includes(year))
        )
        .map(([make]) => make)
        .sort();

    validMakes.forEach(make => appendOption(selMake, make, make));
    selMake.disabled = false;
});

// ── CASCADE: MAKE → MODEL ──
selMake.addEventListener("change", () => {
    const year = parseInt(selYear.value);
    const make = selMake.value;

    resetSelect(selModel, "Select model");
    selModel.disabled = true;
    btnSearch.disabled = true;

    if (!make) return;

    const models = Object.entries(VEHICLES[make] || {})
        .filter(([, years]) => years.includes(year))
        .map(([model]) => model)
        .sort();

    models.forEach(model => appendOption(selModel, model, model));
    selModel.disabled = false;
});

// ── ENABLE SEARCH BUTTON ──
selModel.addEventListener("change", () => {
    btnSearch.disabled = !selModel.value;
});

// ── SEARCH ──
btnSearch.addEventListener("click", runSearch);

function runSearch() {
    const year  = parseInt(selYear.value);
    const make  = selMake.value;
    const model = selModel.value;
    if (!year || !make || !model) return;

    saveRecentSearch(year, make, model);
    renderRecentSearches();
    showResults(year, make, model);
}

function showResults(year, make, model) {
    const cat  = document.getElementById("results-filter-category").value;
    const sort = document.getElementById("results-sort").value;

    let matches = PARTS.filter(p =>
        p.vehicles.some(v =>
            v.make === make &&
            v.model === model &&
            v.years.includes(year)
        )
    );

    if (cat)  matches = matches.filter(p => p.category === cat);
    if (sort === "price-asc")  matches.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") matches.sort((a, b) => b.price - a.price);
    if (sort === "name")       matches.sort((a, b) => a.name.localeCompare(b.name));

    resultsTitle.textContent = `${year} ${make} ${model} — ${matches.length} part${matches.length !== 1 ? "s" : ""} found`;
    resultsSection.style.display = "block";
    emptyState.style.display = "none";

    if (!matches.length) {
        resultsGrid.innerHTML = "";
        resultsNone.style.display = "block";
        return;
    }

    resultsNone.style.display = "none";
    resultsGrid.innerHTML = matches.map(p => {
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

// Re-run results when filters change (if a search has already been run)
document.getElementById("results-filter-category").addEventListener("change", () => {
    if (selModel.value) runSearch();
});
document.getElementById("results-sort").addEventListener("change", () => {
    if (selModel.value) runSearch();
});

// ── RECENT SEARCHES ──
function saveRecentSearch(year, make, model) {
    let recent = getRecentSearches();
    const key  = `${year} ${make} ${model}`;
    recent     = [key, ...recent.filter(r => r !== key)].slice(0, 5);
    localStorage.setItem("acme_recent_vehicles", JSON.stringify(recent));
}

function getRecentSearches() {
    try { return JSON.parse(localStorage.getItem("acme_recent_vehicles")) || []; }
    catch { return []; }
}

function renderRecentSearches() {
    const recent = getRecentSearches();
    if (!recent.length) { recentWrap.style.display = "none"; return; }

    recentWrap.style.display = "flex";
    recentContainer.innerHTML = recent.map(r =>
        `<button class="recent-tag" data-vehicle="${r}">${r}</button>`
    ).join("");

    recentContainer.querySelectorAll(".recent-tag").forEach(btn => {
        btn.addEventListener("click", () => {
            const [year, make, ...modelParts] = btn.dataset.vehicle.split(" ");
            const model = modelParts.join(" ");
            loadVehicle(parseInt(year), make, model);
        });
    });
}

function loadVehicle(year, make, model) {
    // Set year
    selYear.value = year;
    selYear.dispatchEvent(new Event("change"));

    // Set make after a tick so the options have populated
    setTimeout(() => {
        selMake.value = make;
        selMake.dispatchEvent(new Event("change"));

        setTimeout(() => {
            selModel.value = model;
            btnSearch.disabled = false;
            showResults(year, make, model);
            document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
        }, 0);
    }, 0);
}

// ── CART ──
let cart = [];
function addToCart(id) {
    cart.push(id);
    document.getElementById("cart-count").textContent = cart.length;
}

// ── HELPERS ──
function resetSelect(el, placeholder) {
    el.innerHTML = `<option value="">${placeholder}</option>`;
}

function appendOption(el, value, label) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    el.appendChild(opt);
}

// ── INIT ──
renderRecentSearches();
if (!getRecentSearches().length) recentWrap.style.display = "none";