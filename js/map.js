/* =====================================
   AMAI GREEN ATLAS V3
   MAP.JS — Filters + Search + Stats + QR
===================================== */

/* =====================================
   STATE
===================================== */

let map;
let allPlants = [];
let filteredPlants = [];
let markerClusterGroup;
let markers = [];
let qrPlantId = null;

/* =====================================
   ICON FACTORY
===================================== */

function getPlantIcon(plant){

    const isHeritage = plant.is_heritage;

    const plantType =
        plant.plant_types?.icon || "🌿";

    const color = isHeritage
        ? "#1d4ed8"
        : "#16a34a";

    const emoji = isHeritage
        ? "🏛️"
        : plantType;

    return L.divIcon({

        className: "",

        html: `
        <div style="
            background:${color};
            color:white;
            width:38px;
            height:38px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.35);
            display:flex;
            align-items:center;
            justify-content:center;
        ">
            <span style="transform:rotate(45deg);font-size:16px;">
                ${emoji}
            </span>
        </div>`,

        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -40]

    });

}

/* =====================================
   INIT MAP
===================================== */

function initMap(){

    map = L.map("map", {
        center: [9.3165, 76.6166],
        zoom: 12,
        zoomControl: true
    });

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 19
        }
    ).addTo(map);

    markerClusterGroup = L.markerClusterGroup({

        maxClusterRadius: 60,

        iconCreateFunction: function(cluster){

            const count = cluster.getChildCount();

            const size = count > 50
                ? 55
                : count > 20
                ? 45
                : 36;

            return L.divIcon({

                html: `<div style="
                    background:#16a34a;
                    color:white;
                    width:${size}px;
                    height:${size}px;
                    border-radius:50%;
                    border:3px solid white;
                    box-shadow:0 2px 8px rgba(0,0,0,.3);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:800;
                    font-size:${size > 45 ? 16 : 13}px;
                ">${count}</div>`,

                className: "",
                iconSize: [size, size]

            });

        }

    });

    map.addLayer(markerClusterGroup);

}

/* =====================================
   LOAD PLANTS
===================================== */

async function loadMapPlants(){

    try{

        const { data, error } =
            await supabaseClient
            .from("plants")
            .select(`
                *,
                species(*),
                panchayats(id, name),
                plant_types(id, name, icon)
            `)
            .eq("verification_status", "verified")
            .not("latitude", "is", null)
            .not("longitude", "is", null);

        if(error){
            console.error("Map load error:", error);
            return;
        }

        allPlants = data || [];
        filteredPlants = [...allPlants];

        renderMarkers(filteredPlants);
        updateMapStats(filteredPlants);
        populateFilters();
        loadDashboardStats();
        loadRecentContributions();
        loadHeritageSection();
        loadLeaderboard();

    } catch(err){
        console.error("loadMapPlants error:", err);
    }

}

/* =====================================
   RENDER MARKERS
===================================== */

function renderMarkers(plants){

    markerClusterGroup.clearLayers();
    markers = [];

    plants.forEach(plant => {

        const lat = parseFloat(plant.latitude);
        const lng = parseFloat(plant.longitude);

        if(isNaN(lat) || isNaN(lng)) return;

        const species = plant.species || {};
        const panchayat = plant.panchayats || {};

        // Use plants columns first, fall back to species
        const displayName =
            plant.local_name ||
            species.local_name ||
            plant.english_name ||
            species.english_name ||
            species.scientific_name ||
            "Plant";

        const sciName =
            plant.scientific_name ||
            species.scientific_name || "";

        const marker = L.marker(
            [lat, lng],
            { icon: getPlantIcon(plant) }
        );

        const popupHtml = `
        <div style="
            font-family:Inter,sans-serif;
            min-width:220px;
            max-width:280px;
        ">
            <img
                src="${plant.cover_photo_url || 'https://placehold.co/400x200/16a34a/white?text=🌿'}"
                style="width:100%;height:140px;object-fit:cover;border-radius:10px;margin-bottom:10px;">

            <div style="font-weight:800;font-size:15px;color:#14532d;">
                ${displayName}
            </div>

            <div style="font-style:italic;font-size:12px;color:#6b7280;margin-top:2px;">
                ${sciName}
            </div>

            ${plant.is_heritage
                ? `<div style="
                    display:inline-block;
                    background:#dbeafe;
                    color:#1d4ed8;
                    padding:2px 10px;
                    border-radius:999px;
                    font-size:11px;
                    font-weight:700;
                    margin-top:6px;
                ">🏛️ Heritage Tree</div>`
                : ""
            }

            <div style="
                margin-top:8px;
                font-size:12px;
                color:#6b7280;
                display:flex;
                flex-direction:column;
                gap:2px;
            ">
                <span>📍 ${panchayat.name || ""}</span>
                <span>🔖 Atlas: ${plant.atlas_number || "—"}</span>
                <span>👤 ${plant.contributor_name || "—"}</span>
            </div>

            <div style="margin-top:12px;display:flex;gap:8px;">
                <a
                    href="plant.html?id=${plant.id}"
                    style="
                        flex:1;
                        background:#16a34a;
                        color:white;
                        text-align:center;
                        padding:8px;
                        border-radius:8px;
                        font-size:12px;
                        font-weight:700;
                        text-decoration:none;
                    ">
                    View Details
                </a>
                <button
                    onclick="showQRFromMap('${plant.id}')"
                    style="
                        background:#1d4ed8;
                        color:white;
                        border:none;
                        padding:8px 12px;
                        border-radius:8px;
                        font-size:12px;
                        font-weight:700;
                        cursor:pointer;
                    ">
                    QR
                </button>
            </div>
        </div>`;

        marker.bindPopup(popupHtml, {
            maxWidth: 300,
            className: "atlas-popup"
        });

        marker._plantData = plant;
        markers.push(marker);
        markerClusterGroup.addLayer(marker);

    });

    updateMapStats(plants);

}

/* =====================================
   UPDATE MAP STATS
===================================== */

function updateMapStats(plants){

    const speciesSet = new Set();
    const panchayatSet = new Set();
    let heritageCount = 0;

    plants.forEach(p => {
        if(p.species?.id) speciesSet.add(p.species.id);
        if(p.panchayats?.id) panchayatSet.add(p.panchayats.id);
        if(p.is_heritage) heritageCount++;
    });

    setText("visiblePlantCount", plants.length);
    setText("visibleSpeciesCount", speciesSet.size);
    setText("visiblePanchayatCount", panchayatSet.size);
    setText("visibleHeritageCount", heritageCount);

}

/* =====================================
   POPULATE FILTER DROPDOWNS
===================================== */

function populateFilters(){

    // Panchayats
    const panchayatSel =
        document.getElementById("panchayatFilter");

    if(panchayatSel){

        const panchayatMap = new Map();

        allPlants.forEach(p => {
            if(p.panchayats?.id){
                panchayatMap.set(
                    p.panchayats.id,
                    p.panchayats.name
                );
            }
        });

        panchayatMap.forEach((name, id) => {
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = name;
            panchayatSel.appendChild(opt);
        });

    }

    // Species
    const speciesSel =
        document.getElementById("speciesFilter");

    if(speciesSel){

        const speciesMap = new Map();

        allPlants.forEach(p => {
            if(p.species?.id){
                speciesMap.set(
                    p.species.id,
                    p.species.local_name ||
                    p.species.english_name ||
                    p.species.scientific_name
                );
            }
        });

        // Sort alphabetically
        const sorted = [...speciesMap.entries()]
            .sort((a,b) => a[1].localeCompare(b[1]));

        sorted.forEach(([id, name]) => {
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = name;
            speciesSel.appendChild(opt);
        });

    }

}

/* =====================================
   APPLY FILTERS
===================================== */

function applyFilters(){

    const searchVal =
        (document.getElementById("searchInput")?.value || "")
        .toLowerCase().trim();

    const panchayatVal =
        document.getElementById("panchayatFilter")?.value || "";

    const speciesVal =
        document.getElementById("speciesFilter")?.value || "";

    const heritageVal =
        document.getElementById("heritageFilter")?.value || "";

    filteredPlants = allPlants.filter(plant => {

        const species = plant.species || {};
        const panchayat = plant.panchayats || {};

        // Search text
        if(searchVal){
            const haystack = [
                plant.atlas_number || "",
                species.local_name || "",
                species.english_name || "",
                species.scientific_name || "",
                plant.contributor_name || "",
                panchayat.name || ""
            ].join(" ").toLowerCase();

            if(!haystack.includes(searchVal)) return false;
        }

        // Panchayat filter
        if(panchayatVal && panchayat.id !== panchayatVal)
            return false;

        // Species filter
        if(speciesVal && species.id !== speciesVal)
            return false;

        // Heritage filter
        if(heritageVal === "heritage" && !plant.is_heritage)
            return false;

        return true;

    });

    renderMarkers(filteredPlants);

    // Fit bounds if results found
    if(filteredPlants.length > 0 && markers.length > 0){
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }

}

/* =====================================
   RESET FILTERS
===================================== */

function resetFilters(){

    const ids = [
        "searchInput",
        "panchayatFilter",
        "speciesFilter",
        "heritageFilter"
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });

    filteredPlants = [...allPlants];
    renderMarkers(filteredPlants);
    map.setView([9.3165, 76.6166], 12);

}

/* =====================================
   LOCATE ME
===================================== */

function locateMe(){

    if(!navigator.geolocation){
        showNotification("Geolocation not supported", "error");
        return;
    }

    navigator.geolocation.getCurrentPosition(

        pos => {
            map.setView(
                [pos.coords.latitude, pos.coords.longitude],
                15
            );

            L.circle(
                [pos.coords.latitude, pos.coords.longitude],
                {
                    radius: 100,
                    color: "#16a34a",
                    fillColor: "#bbf7d0",
                    fillOpacity: 0.5
                }
            ).addTo(map);
        },

        err => {
            showNotification("Could not get location", "warning");
        }

    );

}

/* =====================================
   DASHBOARD STATS (hero + statistics)
===================================== */

async function loadDashboardStats(){

    try{

        const stats = await getDashboardStats();

        // Hero section
        setText("heroTreeCount",        stats.plantCount);
        setText("heroSpeciesCount",     stats.speciesCount);
        setText("heroHeritageCount",    stats.heritageCount);
        setText("heroContributorCount", stats.contributorCount);

        // Statistics section
        setText("totalPlantsCount", stats.plantCount);
        setText("speciesCount",     stats.speciesCount);
        setText("heritageCount",    stats.heritageCount);
        setText("contributorsCount",stats.contributorCount);

        // Animate counters
        animateCounters();

    } catch(err){
        console.error("Stats error:", err);
    }

}

/* =====================================
   ANIMATE COUNTERS
===================================== */

function animateCounters(){

    const counterIds = [
        "heroTreeCount",
        "heroSpeciesCount",
        "heroHeritageCount",
        "heroContributorCount",
        "totalPlantsCount",
        "speciesCount",
        "heritageCount",
        "contributorsCount"
    ];

    counterIds.forEach(id => {

        const el = document.getElementById(id);
        if(!el) return;

        const target = parseInt(el.textContent) || 0;
        if(target === 0) return;

        let current = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if(current >= target) clearInterval(interval);
        }, 30);

    });

}

/* =====================================
   RECENT CONTRIBUTIONS
===================================== */

async function loadRecentContributions(){

    try{

        const { data, error } =
            await supabaseClient
            .from("plants")
            .select(`*, species(*)`)
            .eq("verification_status", "verified")
            .order("created_at", { ascending: false })
            .limit(6);

        if(error || !data) return;

        const container =
            document.getElementById("recentContributions");

        if(!container) return;

        if(data.length === 0){
            container.innerHTML = `
            <div class="col-span-3 text-center py-12 text-gray-400">
                <div class="text-5xl mb-3">🌱</div>
                <div class="text-lg font-semibold">
                    No contributions yet
                </div>
                <div class="text-sm mt-2">
                    Be the first to document a plant!
                </div>
            </div>`;
            return;
        }

        container.innerHTML = data.map(plant => {

            const species = plant.species || {};

            return `
            <div
                onclick="window.location.href='plant.html?id=${plant.id}'"
                style="cursor:pointer;"
                class="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition">

                <img
                    src="${plant.cover_photo_url || 'https://placehold.co/600x300/16a34a/white?text=🌿'}"
                    class="w-full h-48 object-cover">

                <div class="p-5">

                    <div class="font-bold text-lg text-green-800">
                        ${species.local_name || species.english_name || "Plant"}
                    </div>

                    <div class="italic text-sm text-gray-500 mt-1">
                        ${species.scientific_name || ""}
                    </div>

                    <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>🔖 ${plant.atlas_number || "—"}</span>
                        <span>👤 ${plant.contributor_name || "—"}</span>
                    </div>

                    ${plant.is_heritage
                        ? `<div class="mt-3 inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                            🏛️ Heritage Tree
                        </div>`
                        : ""
                    }

                </div>

            </div>`;

        }).join("");

    } catch(err){
        console.error("Recent contributions error:", err);
    }

}

/* =====================================
   HERITAGE TREES SECTION
===================================== */

async function loadHeritageSection(){

    try{

        const heritagePlants = await getHeritageTrees();

        const grid =
            document.getElementById("heritageTreesGrid");

        if(!grid) return;

        if(heritagePlants.length === 0){
            grid.innerHTML = `
            <div class="col-span-3 text-center py-12 text-gray-400">
                <div class="text-5xl mb-3">🏛️</div>
                <div class="text-lg font-semibold">
                    No heritage trees registered yet
                </div>
            </div>`;
            return;
        }

        grid.innerHTML = heritagePlants.map(plant => {

            const species = plant.species || {};

            return `
            <div
                onclick="window.location.href='plant.html?id=${plant.id}'"
                style="cursor:pointer;"
                class="bg-white rounded-2xl shadow overflow-hidden border-2 border-blue-100 hover:shadow-lg transition">

                <div style="position:relative;">
                    <img
                        src="${plant.cover_photo_url || 'https://placehold.co/600x300/1d4ed8/white?text=🏛️'}"
                        class="w-full h-52 object-cover">

                    <div style="
                        position:absolute;
                        top:12px;
                        left:12px;
                        background:#1d4ed8;
                        color:white;
                        padding:4px 12px;
                        border-radius:999px;
                        font-size:11px;
                        font-weight:700;
                    ">🏛️ Heritage</div>
                </div>

                <div class="p-5">

                    <div class="font-bold text-xl text-blue-900">
                        ${species.local_name || species.english_name || "Heritage Tree"}
                    </div>

                    <div class="italic text-sm text-gray-500 mt-1">
                        ${species.scientific_name || ""}
                    </div>

                    <div class="mt-3 text-xs text-gray-400 flex flex-col gap-1">
                        <span>🔖 ${plant.atlas_number || "—"}</span>
                        <span>👤 ${plant.contributor_name || "—"}</span>
                    </div>

                </div>

            </div>`;

        }).join("");

    } catch(err){
        console.error("Heritage section error:", err);
    }

}

/* =====================================
   LEADERBOARD
===================================== */

async function loadLeaderboard(){

    try{

        const { data, error } =
            await supabaseClient
            .from("plants")
            .select("contributor_name, verification_status")
            .eq("verification_status", "verified");

        if(error || !data) return;

        const table =
            document.getElementById("leaderboardTable");

        if(!table) return;

        const stats = {};

        data.forEach(plant => {
            const name = plant.contributor_name || "Anonymous";
            stats[name] = (stats[name] || 0) + 1;
        });

        const sorted = Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if(sorted.length === 0){
            table.innerHTML = `
            <tr>
                <td colspan="3" class="p-8 text-center text-gray-400">
                    No contributors yet
                </td>
            </tr>`;
            return;
        }

        const medals = ["🥇","🥈","🥉"];

        table.innerHTML = sorted.map(([name, count], i) => `
        <tr class="border-b hover:bg-green-50 transition">

            <td class="p-4 font-bold text-lg">
                ${medals[i] || (i + 1)}
            </td>

            <td class="p-4 font-semibold">
                ${name}
            </td>

            <td class="p-4">
                <span class="
                    bg-green-100
                    text-green-800
                    font-bold
                    px-3 py-1
                    rounded-full
                    text-sm
                ">
                    ${count} plants
                </span>
            </td>

        </tr>`).join("");

    } catch(err){
        console.error("Leaderboard error:", err);
    }

}

/* =====================================
   PLANT MODAL (click from map)
===================================== */

function openPlantModal(plantId){

    const plant = allPlants.find(p => p.id === plantId);
    if(!plant) return;

    const species = plant.species || {};
    const panchayat = plant.panchayats || {};

    setText("modalPlantTitle",
        species.local_name || species.english_name || "Plant");

    setText("modalAtlasNumber",   plant.atlas_number || "—");
    setText("modalScientificName",species.scientific_name || "—");
    setText("modalLocalName",     species.local_name || "—");
    setText("modalContributor",   plant.contributor_name || "—");
    setText("modalDescription",   species.description || "No description.");
    setText("modalPanchayat",     panchayat.name || "—");
    setText("modalPhotoCount",    plant.photo_count || 0);

    const coverImg = document.getElementById("modalCoverPhoto");
    if(coverImg){
        coverImg.src = plant.cover_photo_url ||
            "https://placehold.co/800x400/16a34a/white?text=🌿";
    }

    const openBtn = document.getElementById("openPlantPageBtn");
    if(openBtn){
        openBtn.href = `plant.html?id=${plant.id}`;
    }

    const modal = document.getElementById("plantModal");
    if(modal) modal.classList.remove("hidden");

    // QR button
    const qrBtn = document.getElementById("showQRBtn");
    if(qrBtn){
        qrBtn.onclick = () => {
            modal.classList.add("hidden");
            showQRFromMap(plant.id);
        };
    }

}

/* =====================================
   QR CODE (from map popup)
===================================== */

function showQRFromMap(plantId){

    qrPlantId = plantId;

    const qrModal = document.getElementById("qrModal");
    const qrContainer = document.getElementById("qrcode");

    if(!qrModal || !qrContainer) return;

    qrContainer.innerHTML = "";

    const url = `${window.location.origin}/plant.html?id=${plantId}`;

    new QRCode(qrContainer, {
        text: url,
        width: 250,
        height: 250,
        colorDark: "#14532d",
        colorLight: "#ffffff"
    });

    qrModal.classList.remove("hidden");

}

/* =====================================
   INIT MODALS & EVENTS
===================================== */

function initMapEvents(){

    // Search button
    document.getElementById("searchBtn")
        ?.addEventListener("click", applyFilters);

    // Live search on Enter
    document.getElementById("searchInput")
        ?.addEventListener("keydown", e => {
            if(e.key === "Enter") applyFilters();
        });

    // Filter changes
    ["panchayatFilter","speciesFilter","heritageFilter"]
        .forEach(id => {
            document.getElementById(id)
                ?.addEventListener("change", applyFilters);
        });

    // Reset filters
    document.getElementById("resetFiltersBtn")
        ?.addEventListener("click", resetFilters);

    // Locate me
    document.getElementById("locateMeBtn")
        ?.addEventListener("click", locateMe);

    // Refresh map
    document.getElementById("refreshMapBtn")
        ?.addEventListener("click", loadMapPlants);

    // Close plant modal
    document.getElementById("closePlantModal")
        ?.addEventListener("click", () => {
            document.getElementById("plantModal")
                ?.classList.add("hidden");
        });

    // Close QR modal
    document.getElementById("closeQRModal")
        ?.addEventListener("click", () => {
            document.getElementById("qrModal")
                ?.classList.add("hidden");
        });

    // Close gallery modal
    document.getElementById("closeGalleryModal")
        ?.addEventListener("click", () => {
            document.getElementById("galleryModal")
                ?.classList.add("hidden");
        });

    // Click outside modal to close
    document.getElementById("plantModal")
        ?.addEventListener("click", function(e){
            if(e.target === this)
                this.classList.add("hidden");
        });

    document.getElementById("qrModal")
        ?.addEventListener("click", function(e){
            if(e.target === this)
                this.classList.add("hidden");
        });

}

/* =====================================
   HELPER: setText
===================================== */

function setText(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value;
}

/* =====================================
   STARTUP
===================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initMap();
    initMapEvents();
    await loadMapPlants();

});
