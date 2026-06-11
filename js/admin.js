/* =====================================
   AMAI GREEN ATLAS V3
   ADMIN.JS — Full CRUD + Preview
===================================== */

let adminPlants = [];
let pendingPlants = [];
let heritagePlants = [];
let editingPlantId = null;

/* =====================================
   AUTH GUARD
===================================== */

async function checkAdminAccess(){

    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if(!sessionData?.session?.user){
        window.location.href = "login.html";
        return;
    }

    const profile = await getProfile();

    if(!profile ||
        (profile.role !== "admin" &&
         profile.role !== "superadmin")){
        alert("Admin access required");
        window.location.href = "index.html";
    }

}

/* =====================================
   LOAD ALL PLANTS
===================================== */

async function loadAdminPlants(){

    showLoader();

    adminPlants = await getAllPlants();

    pendingPlants = adminPlants.filter(
        p => p.verification_status === "pending"
    );

    heritagePlants = adminPlants.filter(
        p => p.is_heritage === true
    );

    updateAdminCounters();
    renderPendingPlants(pendingPlants);
    renderAllPlantsTable(adminPlants);
    renderHeritageTrees();
    renderContributors();

    hideLoader();

}

/* =====================================
   COUNTERS
===================================== */

function updateAdminCounters(){

    setText("pendingCount", pendingPlants.length);

    setText("verifiedCount",
        adminPlants.filter(
            p => p.verification_status === "verified"
        ).length
    );

    setText("heritageCountAdmin", heritagePlants.length);

    const contributors = new Set(
        adminPlants
            .filter(p => p.contributor_name)
            .map(p => p.contributor_name)
    );

    setText("contributorCountAdmin", contributors.size);

}

/* =====================================
   HELPER: get display name
===================================== */

function getDisplayName(plant){
    const s = plant.species || {};
    return plant.local_name || s.local_name ||
           plant.english_name || s.english_name ||
           plant.scientific_name || s.scientific_name ||
           "Unnamed Plant";
}

function getScientificName(plant){
    const s = plant.species || {};
    return plant.scientific_name || s.scientific_name || "—";
}

/* =====================================
   PENDING TABLE
===================================== */

function renderPendingPlants(plants){

    const table = document.getElementById("pendingPlantsTable");
    if(!table) return;

    if(plants.length === 0){
        table.innerHTML = `
        <tr>
            <td colspan="6" class="p-8 text-center text-gray-400">
                No pending submissions
            </td>
        </tr>`;
        return;
    }

    table.innerHTML = plants.map(plant => `
    <tr class="border-b hover:bg-yellow-50 transition">

        <td class="p-3">
            <img
                src="${plant.cover_photo_url || 'https://placehold.co/80x60/16a34a/white?text=🌿'}"
                class="w-16 h-12 object-cover rounded-lg">
        </td>

        <td class="p-3">
            <div class="font-bold text-sm">${getDisplayName(plant)}</div>
            <div class="italic text-xs text-gray-400">${getScientificName(plant)}</div>
            <div class="text-xs text-gray-400 mt-1">🔖 ${plant.atlas_number || "—"}</div>
        </td>

        <td class="p-3 text-sm">${plant.contributor_name || "—"}</td>

        <td class="p-3 text-xs text-gray-500">
            ${plant.created_at
                ? new Date(plant.created_at).toLocaleDateString("en-IN")
                : "—"}
        </td>

        <td class="p-3">
            <div class="flex flex-wrap gap-2">

                <button
                    onclick="previewPlant('${plant.id}')"
                    class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200">
                    👁 Preview
                </button>

                <button
                    onclick="approvePlantAdmin('${plant.id}')"
                    class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">
                    ✅ Approve
                </button>

                <button
                    onclick="markHeritageAdmin('${plant.id}')"
                    class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">
                    🏛️ Heritage
                </button>

                <button
                    onclick="openEditModal('${plant.id}')"
                    class="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-600">
                    ✏️ Edit
                </button>

                <button
                    onclick="deletePlantAdmin('${plant.id}')"
                    class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700">
                    🗑 Delete
                </button>

            </div>
        </td>

    </tr>`).join("");

}

/* =====================================
   ALL PLANTS TABLE
===================================== */

function renderAllPlantsTable(plants){

    const table = document.getElementById("allPlantsTable");
    if(!table) return;

    if(plants.length === 0){
        table.innerHTML = `
        <tr>
            <td colspan="6" class="p-8 text-center text-gray-400">
                No plants found
            </td>
        </tr>`;
        return;
    }

    table.innerHTML = plants.map(plant => {

        const statusColor =
            plant.verification_status === "verified"
                ? "bg-green-100 text-green-700"
                : plant.verification_status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700";

        return `
        <tr class="border-b hover:bg-gray-50 transition">

            <td class="p-3">
                <img
                    src="${plant.cover_photo_url || 'https://placehold.co/80x60/16a34a/white?text=🌿'}"
                    class="w-16 h-12 object-cover rounded-lg">
            </td>

            <td class="p-3">
                <div class="font-bold text-sm">${getDisplayName(plant)}</div>
                <div class="italic text-xs text-gray-400">${getScientificName(plant)}</div>
                <div class="text-xs text-gray-400 mt-1">🔖 ${plant.atlas_number || "—"}</div>
            </td>

            <td class="p-3 text-sm">${plant.contributor_name || "—"}</td>

            <td class="p-3">
                <span class="text-xs font-bold px-2 py-1 rounded-full ${statusColor}">
                    ${plant.verification_status || "—"}
                </span>
                ${plant.is_heritage
                    ? `<span class="ml-1 text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        🏛️ Heritage
                    </span>`
                    : ""}
            </td>

            <td class="p-3 text-xs text-gray-400">
                ${plant.created_at
                    ? new Date(plant.created_at).toLocaleDateString("en-IN")
                    : "—"}
            </td>

            <td class="p-3">
                <div class="flex flex-wrap gap-2">

                    <button
                        onclick="previewPlant('${plant.id}')"
                        class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200">
                        👁 Preview
                    </button>

                    <button
                        onclick="openEditModal('${plant.id}')"
                        class="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-600">
                        ✏️ Edit
                    </button>

                    ${plant.verification_status !== "verified"
                        ? `<button
                            onclick="approvePlantAdmin('${plant.id}')"
                            class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">
                            ✅ Approve
                        </button>`
                        : ""
                    }

                    <button
                        onclick="generateAdminQR('${plant.id}')"
                        class="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-700">
                        QR
                    </button>

                    <button
                        onclick="deletePlantAdmin('${plant.id}')"
                        class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700">
                        🗑
                    </button>

                </div>
            </td>

        </tr>`;

    }).join("");

}

/* =====================================
   HERITAGE GRID
===================================== */

function renderHeritageTrees(){

    const grid = document.getElementById("heritageGridAdmin");
    if(!grid) return;

    if(heritagePlants.length === 0){
        grid.innerHTML = `
        <div class="col-span-3 text-center py-8 text-gray-400">
            No heritage trees yet
        </div>`;
        return;
    }

    grid.innerHTML = heritagePlants.map(plant => `
    <div class="bg-blue-50 rounded-2xl overflow-hidden border border-blue-100">

        <img
            src="${plant.cover_photo_url || 'https://placehold.co/600x400/1d4ed8/white?text=🏛️'}"
            class="w-full h-48 object-cover">

        <div class="p-4">

            <div class="font-bold">${getDisplayName(plant)}</div>
            <div class="italic text-sm text-gray-500">${getScientificName(plant)}</div>
            <div class="text-xs text-gray-400 mt-1">${plant.atlas_number || ""}</div>

            <div class="mt-3 flex gap-2">
                <button
                    onclick="previewPlant('${plant.id}')"
                    class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-semibold">
                    👁 Preview
                </button>
                <button
                    onclick="openEditModal('${plant.id}')"
                    class="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-xs font-semibold">
                    ✏️ Edit
                </button>
                <button
                    onclick="deletePlantAdmin('${plant.id}')"
                    class="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold">
                    🗑
                </button>
            </div>

        </div>

    </div>`).join("");

}

/* =====================================
   CONTRIBUTORS
===================================== */

function renderContributors(){

    const table = document.getElementById("contributorsTable");
    if(!table) return;

    const stats = {};

    adminPlants.forEach(plant => {
        const name = plant.contributor_name || "Anonymous";
        if(!stats[name]) stats[name] = { total: 0, verified: 0 };
        stats[name].total++;
        if(plant.verification_status === "verified")
            stats[name].verified++;
    });

    const sorted = Object.entries(stats)
        .sort((a,b) => b[1].total - a[1].total);

    if(sorted.length === 0){
        table.innerHTML = `
        <tr>
            <td colspan="3" class="p-8 text-center text-gray-400">
                No contributors yet
            </td>
        </tr>`;
        return;
    }

    table.innerHTML = sorted.map(([name, data]) => `
    <tr class="border-b hover:bg-gray-50">
        <td class="p-4 font-semibold">${name}</td>
        <td class="p-4">${data.total}</td>
        <td class="p-4">
            <span class="bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full text-sm">
                ${data.verified}
            </span>
        </td>
    </tr>`).join("");

}

/* =====================================
   PREVIEW MODAL
===================================== */

async function previewPlant(plantId){

    const plant = adminPlants.find(p => p.id === plantId);
    if(!plant) return;

    const species = plant.species || {};
    const name = getDisplayName(plant);
    const sci = getScientificName(plant);

    // Load photos
    const photos = await getPlantPhotos(plantId);

    const photosHtml = photos.length > 0
        ? photos.map(p => `
            <img
                src="${p.photo_url}"
                class="w-full h-48 object-cover rounded-xl cursor-pointer"
                onclick="window.open('${p.photo_url}','_blank')">`
        ).join("")
        : `<p class="text-gray-400 text-sm">No photos uploaded</p>`;

    document.getElementById("previewContent").innerHTML = `

    <div class="space-y-5">

        <!-- Cover -->
        <img
            src="${plant.cover_photo_url || 'https://placehold.co/800x400/16a34a/white?text=🌿'}"
            class="w-full h-64 object-cover rounded-2xl">

        <!-- Name & Status -->
        <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-2xl font-black text-green-900">${name}</h2>
            <span class="text-xs font-bold px-3 py-1 rounded-full
                ${plant.verification_status === 'verified'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'}">
                ${plant.verification_status}
            </span>
            ${plant.is_heritage
                ? `<span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    🏛️ Heritage
                </span>`
                : ""}
        </div>

        <p class="italic text-gray-500">${sci}</p>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4 text-sm">
            <div>
                <div class="text-gray-400 text-xs">Local Name</div>
                <div class="font-semibold">${plant.local_name || species.local_name || "—"}</div>
            </div>
            <div>
                <div class="text-gray-400 text-xs">English Name</div>
                <div class="font-semibold">${plant.english_name || species.english_name || "—"}</div>
            </div>
            <div>
                <div class="text-gray-400 text-xs">Atlas Number</div>
                <div class="font-semibold">${plant.atlas_number || "—"}</div>
            </div>
            <div>
                <div class="text-gray-400 text-xs">Contributor</div>
                <div class="font-semibold">${plant.contributor_name || "—"}</div>
            </div>
            <div>
                <div class="text-gray-400 text-xs">GPS</div>
                <div class="font-semibold text-xs">
                    ${plant.latitude ? `${plant.latitude}, ${plant.longitude}` : "—"}
                </div>
            </div>
            <div>
                <div class="text-gray-400 text-xs">Submitted</div>
                <div class="font-semibold">
                    ${plant.created_at
                        ? new Date(plant.created_at).toLocaleDateString("en-IN")
                        : "—"}
                </div>
            </div>
        </div>

        <!-- Description -->
        ${plant.description || species.description
            ? `<div class="bg-green-50 rounded-2xl p-4 text-sm text-gray-700">
                <div class="font-bold text-green-800 mb-2">Description</div>
                ${plant.description || species.description}
            </div>`
            : ""}

        <!-- Photos -->
        <div>
            <div class="font-bold mb-3">📸 Photos (${photos.length})</div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                ${photosHtml}
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 pt-2">

            ${plant.verification_status !== "verified"
                ? `<button
                    onclick="approvePlantAdmin('${plant.id}'); closePreviewModal();"
                    class="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700">
                    ✅ Approve
                </button>`
                : ""}

            ${!plant.is_heritage
                ? `<button
                    onclick="markHeritageAdmin('${plant.id}'); closePreviewModal();"
                    class="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700">
                    🏛️ Mark Heritage
                </button>`
                : ""}

            <button
                onclick="closePreviewModal(); openEditModal('${plant.id}');"
                class="bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-yellow-600">
                ✏️ Edit
            </button>

            <a
                href="plant.html?id=${plant.id}"
                target="_blank"
                class="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200">
                🔗 View Public Page
            </a>

            <button
                onclick="deletePlantAdmin('${plant.id}'); closePreviewModal();"
                class="bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-red-700">
                🗑 Delete
            </button>

        </div>

    </div>`;

    document.getElementById("previewModal").classList.remove("hidden");

}

function closePreviewModal(){
    document.getElementById("previewModal").classList.add("hidden");
}

/* =====================================
   EDIT MODAL
===================================== */

function openEditModal(plantId){

    const plant = adminPlants.find(p => p.id === plantId);
    if(!plant) return;

    editingPlantId = plantId;

    const species = plant.species || {};

    // Fill form fields
    setValue("editLocalName",
        plant.local_name || species.local_name || "");
    setValue("editEnglishName",
        plant.english_name || species.english_name || "");
    setValue("editScientificName",
        plant.scientific_name || species.scientific_name || "");
    setValue("editDescription",
        plant.description || species.description || "");
    setValue("editContributorName",
        plant.contributor_name || "");
    setValue("editVerificationStatus",
        plant.verification_status || "pending");
    setValue("editIsHeritage",
        plant.is_heritage ? "true" : "false");
    setValue("editLatitude",
        plant.latitude || "");
    setValue("editLongitude",
        plant.longitude || "");

    document.getElementById("editModal").classList.remove("hidden");

}

function closeEditModal(){
    document.getElementById("editModal").classList.add("hidden");
    editingPlantId = null;
}

async function saveEditedPlant(){

    if(!editingPlantId) return;

    const updates = {
        local_name:            getValue("editLocalName"),
        english_name:          getValue("editEnglishName"),
        scientific_name:       getValue("editScientificName"),
        description:           getValue("editDescription"),
        contributor_name:      getValue("editContributorName"),
        verification_status:   getValue("editVerificationStatus"),
        is_heritage:           getValue("editIsHeritage") === "true",
        latitude:              parseFloat(getValue("editLatitude")) || null,
        longitude:             parseFloat(getValue("editLongitude")) || null
    };

    showLoader();

    const result = await updatePlant(editingPlantId, updates);

    hideLoader();

    if(result){
        showAdminNotification("Plant updated successfully!", "success");
        closeEditModal();
        await loadAdminPlants();
    } else {
        showAdminNotification("Update failed. Please try again.", "error");
    }

}

/* =====================================
   APPROVE / HERITAGE / DELETE
===================================== */

async function approvePlantAdmin(plantId){
    showLoader();
    await approvePlant(plantId);
    hideLoader();
    showAdminNotification("Plant approved!", "success");
    await loadAdminPlants();
}

async function markHeritageAdmin(plantId){
    showLoader();
    await markHeritage(plantId);
    hideLoader();
    showAdminNotification("Marked as Heritage Tree!", "success");
    await loadAdminPlants();
}

async function deletePlantAdmin(plantId){

    const plant = adminPlants.find(p => p.id === plantId);
    const name = plant ? getDisplayName(plant) : "this plant";

    const ok = confirm(`Delete "${name}"?\n\nThis cannot be undone.`);
    if(!ok) return;

    showLoader();
    await deletePlant(plantId);
    hideLoader();
    showAdminNotification("Plant deleted.", "success");
    await loadAdminPlants();

}

/* =====================================
   QR GENERATION
===================================== */

function generateAdminQR(plantId){

    const modal = document.getElementById("qrAdminModal");
    const container = document.getElementById("adminQrContainer");
    if(!modal || !container) return;

    container.innerHTML = "";

    const url = `${window.location.origin}/plant.html?id=${plantId}`;

    new QRCode(container, {
        text: url,
        width: 250,
        height: 250,
        colorDark: "#14532d",
        colorLight: "#ffffff"
    });

    modal.classList.remove("hidden");

}

/* =====================================
   SEARCH & FILTER
===================================== */

function applyAdminSearch(){

    const search = (getValue("adminSearch") || "").toLowerCase();
    const statusFilter = getValue("adminStatusFilter") || "";

    const filtered = adminPlants.filter(plant => {

        const species = plant.species || {};

        const text = [
            plant.atlas_number || "",
            plant.local_name || "",
            plant.english_name || "",
            plant.scientific_name || "",
            species.local_name || "",
            species.scientific_name || "",
            plant.contributor_name || ""
        ].join(" ").toLowerCase();

        const matchSearch = !search || text.includes(search);
        const matchStatus = !statusFilter ||
            plant.verification_status === statusFilter;

        return matchSearch && matchStatus;

    });

    renderAllPlantsTable(filtered);

    const pending = filtered.filter(
        p => p.verification_status === "pending"
    );
    renderPendingPlants(pending);

}

/* =====================================
   NOTIFICATION
===================================== */

function showAdminNotification(message, type="success"){

    const existing = document.getElementById("adminNotif");
    if(existing) existing.remove();

    const div = document.createElement("div");
    div.id = "adminNotif";

    const color = type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-yellow-600";

    div.className =
        `fixed top-5 right-5 z-[99999] text-white px-5 py-3 rounded-xl shadow-xl ${color}`;

    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);

}

/* =====================================
   LOADER
===================================== */

function showLoader(){
    if(document.getElementById("adminLoader")) return;
    const d = document.createElement("div");
    d.id = "adminLoader";
    d.className =
        "fixed inset-0 bg-black/30 z-[99998] flex items-center justify-center";
    d.innerHTML = `
    <div class="bg-white rounded-2xl p-6 text-center shadow-xl">
        <div class="animate-spin text-4xl">🌿</div>
        <div class="mt-2 font-semibold text-gray-700">Loading...</div>
    </div>`;
    document.body.appendChild(d);
}

function hideLoader(){
    document.getElementById("adminLoader")?.remove();
}

/* =====================================
   HELPERS
===================================== */

function setText(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value;
}

function getValue(id){
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function setValue(id, value){
    const el = document.getElementById(id);
    if(el) el.value = value;
}

async function getPlantPhotos(plantId){
    const { data, error } =
        await supabaseClient
        .from("plant_photos")
        .select("*")
        .eq("plant_id", plantId)
        .order("created_at", { ascending: true });
    if(error) return [];
    return data || [];
}

/* =====================================
   LOGOUT
===================================== */

async function logoutAdmin(){
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
}

/* =====================================
   INIT
===================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await checkAdminAccess();
    await loadAdminPlants();

    // QR modal close
    document.getElementById("closeAdminQR")
        ?.addEventListener("click", () => {
            document.getElementById("qrAdminModal")
                .classList.add("hidden");
        });

    // Preview modal close
    document.getElementById("closePreviewModal")
        ?.addEventListener("click", closePreviewModal);

    document.getElementById("previewModal")
        ?.addEventListener("click", function(e){
            if(e.target === this) closePreviewModal();
        });

    // Edit modal close
    document.getElementById("closeEditModal")
        ?.addEventListener("click", closeEditModal);

    document.getElementById("editModal")
        ?.addEventListener("click", function(e){
            if(e.target === this) closeEditModal();
        });

    // Save edit
    document.getElementById("saveEditBtn")
        ?.addEventListener("click", saveEditedPlant);

    // Search
    document.getElementById("adminSearchBtn")
        ?.addEventListener("click", applyAdminSearch);

    document.getElementById("adminSearch")
        ?.addEventListener("keydown", e => {
            if(e.key === "Enter") applyAdminSearch();
        });

    document.getElementById("adminStatusFilter")
        ?.addEventListener("change", applyAdminSearch);

    // Refresh
    document.getElementById("refreshAdminBtn")
        ?.addEventListener("click", loadAdminPlants);

    // Logout
    document.getElementById("logoutBtn")
        ?.addEventListener("click", logoutAdmin);

});
