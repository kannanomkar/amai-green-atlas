/* =====================================
   AMAI GREEN ATLAS V3
   ADMIN.JS
===================================== */

let adminPlants = [];
let pendingPlants = [];
let heritagePlants = [];

/* =====================================
   AUTH GUARD
===================================== */

async function checkAdminAccess(){

    const user =
    await getCurrentUser();

    if(!user){

        window.location.href =
        "login.html";

        return;
    }

    const profile =
    await getProfile();

    if(

        !profile ||

        (
            profile.role !== "admin"

            &&

            profile.role !== "superadmin"
        )

    ){

        alert(
            "Admin access required"
        );

        window.location.href =
        "index.html";

    }

}

/* =====================================
   LOAD ALL PLANTS
===================================== */

async function loadAdminPlants(){

    adminPlants =
    await getAllPlants();

    pendingPlants =
    adminPlants.filter(

        plant=>

        plant.verification_status ===
        "pending"

    );

    heritagePlants =
    adminPlants.filter(

        plant=>

        plant.is_heritage ===
        true

    );

    updateAdminCounters();

    renderPendingPlants();

    renderVerifiedPlants();

    renderHeritageTrees();

    renderContributors();

}

/* =====================================
   COUNTERS
===================================== */

function updateAdminCounters(){

    setText(

        "pendingCount",

        pendingPlants.length

    );

    setText(

        "verifiedCount",

        adminPlants.filter(

            p=>

            p.verification_status ===
            "verified"

        ).length

    );

    setText(

        "heritageCountAdmin",

        heritagePlants.length

    );

    const contributors =
    new Set();

    adminPlants.forEach(

        plant=>{

            if(

                plant.contributor_name

            ){

                contributors.add(

                    plant.contributor_name

                );

            }

        }

    );

    setText(

        "contributorCountAdmin",

        contributors.size

    );

}

/* =====================================
   PENDING TABLE
===================================== */

function renderPendingPlants(){

    const table =

    document.getElementById(
        "pendingPlantsTable"
    );

    if(!table)
        return;

    table.innerHTML = "";

    pendingPlants.forEach(

        plant=>{

            const species =
            plant.species || {};

            table.innerHTML +=

            `

            <tr
            class="border-b">

            <td class="p-4">

            ${plant.atlas_number || ""}

            </td>

            <td class="p-4">

            ${species.scientific_name || ""}

            </td>

            <td class="p-4">

            ${plant.contributor_name || ""}

            </td>

            <td class="p-4">

            ${plant.panchayat_name || ""}

            </td>

            <td class="p-4">

            <div
            class="flex gap-2">

            <button

            onclick="approvePlantAdmin('${plant.id}')"

            class="bg-green-700 text-white px-3 py-2 rounded">

            Approve

            </button>

            <button

            onclick="markHeritageAdmin('${plant.id}')"

            class="bg-blue-700 text-white px-3 py-2 rounded">

            Heritage

            </button>

            <button

            onclick="deletePlantAdmin('${plant.id}')"

            class="bg-red-700 text-white px-3 py-2 rounded">

            Delete

            </button>

            </div>

            </td>

            </tr>

            `;

        }

    );

}

/* =====================================
   VERIFIED GRID
===================================== */

function renderVerifiedPlants(){

    const grid =

    document.getElementById(
        "verifiedPlantsGrid"
    );

    if(!grid)
        return;

    grid.innerHTML = "";

    adminPlants

    .filter(

        p=>

        p.verification_status ===
        "verified"

    )

    .forEach(

        plant=>{

            const species =
            plant.species || {};

            grid.innerHTML +=

            `

            <div
            class="bg-slate-50 rounded-2xl overflow-hidden">

            <img

            src="${
                plant.cover_photo_url ||

                'https://placehold.co/600x400?text=Plant'
            }"

            class="w-full h-48 object-cover">

            <div class="p-4">

            <div
            class="font-bold">

            ${species.local_name || ""}

            </div>

            <div
            class="italic text-sm text-gray-600">

            ${species.scientific_name || ""}

            </div>

            <div
            class="mt-3 flex gap-2">

            <button

            onclick="generateAdminQR('${plant.id}')"

            class="bg-green-700 text-white px-3 py-2 rounded">

            QR

            </button>

            <button

            onclick="markHeritageAdmin('${plant.id}')"

class="bg-blue-700 text-white px-3 py-2 rounded">

Heritage

</button>

</div>

</div>

</div>

`;

        }

    );

}

/* =====================================
   HERITAGE GRID
===================================== */

function renderHeritageTrees(){

    const grid =

    document.getElementById(
        "heritageGridAdmin"
    );

    if(!grid)
        return;

    grid.innerHTML = "";

    heritagePlants.forEach(

        plant=>{

            const species =
            plant.species || {};

            grid.innerHTML +=

            `

            <div
            class="bg-blue-50 rounded-2xl overflow-hidden">

            <img

            src="${
                plant.cover_photo_url ||

                'https://placehold.co/600x400?text=Heritage'
            }"

            class="w-full h-48 object-cover">

            <div class="p-4">

            <div
            class="font-bold">

            ${species.local_name || ""}

            </div>

            <div
            class="italic text-sm">

            ${species.scientific_name || ""}

            </div>

            <div
            class="text-xs mt-2">

            ${plant.atlas_number || ""}

            </div>

            </div>

            </div>

            `;

        }

    );

}

/* =====================================
   CONTRIBUTORS
===================================== */

function renderContributors(){

    const table =

    document.getElementById(
        "contributorsTable"
    );

    if(!table)
        return;

    const stats = {};

    adminPlants.forEach(

        plant=>{

            const name =

            plant.contributor_name ||

            "Unknown";

            if(!stats[name]){

                stats[name] = {

                    total:0,

                    verified:0

                };

            }

            stats[name].total++;

            if(

                plant.verification_status ===

                "verified"

            ){

                stats[name].verified++;

            }

        }

    );

    table.innerHTML = "";

    Object.keys(stats)

    .sort(

        (a,b)=>

        stats[b].total -

        stats[a].total

    )

    .forEach(

        contributor=>{

            table.innerHTML +=

            `

            <tr>

            <td class="p-4">

            ${contributor}

            </td>

            <td class="p-4">

            ${stats[contributor].total}

            </td>

            <td class="p-4">

            ${stats[contributor].verified}

            </td>

            </tr>

            `;

        }

    );

}

/* =====================================
   APPROVE
===================================== */

async function approvePlantAdmin(
    plantId
){

    await approvePlant(
        plantId
    );

    await loadAdminPlants();

}

/* =====================================
   HERITAGE
===================================== */

async function markHeritageAdmin(
    plantId
){

    await markHeritage(
        plantId
    );

    await loadAdminPlants();

}

/* =====================================
   DELETE
===================================== */

async function deletePlantAdmin(
    plantId
){

    const ok =

    confirm(

        "Delete this plant?"

    );

    if(!ok)
        return;

    await deletePlant(
        plantId
    );

    await loadAdminPlants();

}

/* =====================================
   QR GENERATION
===================================== */

function generateAdminQR(
    plantId
){

    const modal =

    document.getElementById(
        "qrAdminModal"
    );

    const container =

    document.getElementById(
        "adminQrContainer"
    );

    if(

        !modal ||

        !container

    ){

        return;

    }

    container.innerHTML = "";

    const url =

    `${window.location.origin}/plant.html?id=${plantId}`;

    new QRCode(

        container,

        {

            text:url,

            width:250,

            height:250

        }

    );

    modal.classList.remove(
        "hidden"
    );

}

/* =====================================
   CLOSE QR
===================================== */

function initQRModal(){

    document

    .getElementById(
        "closeAdminQR"
    )

    ?.addEventListener(

        "click",

        ()=>{

            document

            .getElementById(
                "qrAdminModal"
            )

            .classList.add(
                "hidden"
            );

        }

    );

}

/* =====================================
   SEARCH
===================================== */

function initSearch(){

    document

    .getElementById(
        "adminSearchBtn"
    )

    ?.addEventListener(

        "click",

        ()=>{

            const search =

            document

            .getElementById(
                "adminSearch"
            )

            .value

            .toLowerCase();

            const filtered =

            adminPlants.filter(

                plant=>{

                    const species =

                    plant.species || {};

                    const text =

                    `
                    ${plant.atlas_number || ""}
                    ${species.local_name || ""}
                    ${species.scientific_name || ""}
                    ${plant.contributor_name || ""}
                    `
                    .toLowerCase();

                    return text.includes(
                        search
                    );

                }

            );

            console.log(
                filtered
            );

            alert(

                filtered.length +

                " plants found"

            );

        }

    );

}

/* =====================================
   HELPERS
===================================== */

function setText(
    id,
    value
){

    const el =

    document.getElementById(
        id
    );

    if(el){

        el.textContent =
        value;

    }

}

/* =====================================
   LOGOUT
===================================== */

async function logoutAdmin(){

    await supabaseClient.auth.signOut();

    window.location.href =
    "index.html";

}

/* =====================================
   INIT
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await checkAdminAccess();

        await loadAdminPlants();

        initQRModal();

        initSearch();

        document

        .getElementById(
            "logoutBtn"
        )

        ?.addEventListener(

            "click",

            logoutAdmin

        );

        document

        .getElementById(
            "refreshAdminBtn"
        )

        ?.addEventListener(

            "click",

            loadAdminPlants

        );

    }

);