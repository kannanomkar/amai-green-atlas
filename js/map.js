/* =====================================
   AMAI GREEN ATLAS V3
   MAP.JS
   PART 7A - CORE MAP ENGINE
===================================== */

let map;

let markerCluster;

let allMarkers = [];

let verifiedPlants = [];

let currentUserMarker = null;

let longPressTimer = null;

let longPressLatLng = null;

/* =====================================
   CHENGANNUR CENTER
===================================== */

const CHENGANNUR_CENTER = [

    9.3164,
    76.6133

];

/* =====================================
   ICONS
===================================== */

const verifiedIcon = L.divIcon({

    html: `
    <div style="
    font-size:28px;
    ">
    🌳
    </div>
    `,

    className: "",

    iconSize:[30,30]

});

const heritageIcon = L.divIcon({

    html: `
    <div style="
    font-size:28px;
    ">
    🏛️
    </div>
    `,

    className: "",

    iconSize:[30,30]

});

const treeIcon = L.divIcon({

    html:"🌳",

    className:"",

    iconSize:[30,30]

});

const herbIcon = L.divIcon({

    html:"🌿",

    className:"",

    iconSize:[30,30]

});

const rareIcon = L.divIcon({

    html:"🌺",

    className:"",

    iconSize:[30,30]

});

const fruitIcon = L.divIcon({

    html:"🥭",

    className:"",

    iconSize:[30,30]

});

const palmIcon = L.divIcon({

    html:"🌴",

    className:"",

    iconSize:[30,30]

});

/* =====================================
   INIT MAP
===================================== */

function initMap(){

    map = L.map(

        "map",

        {

            zoomControl:true

        }

    )

    .setView(

        CHENGANNUR_CENTER,

        12

    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:20,

            attribution:

            "&copy; OpenStreetMap"

        }

    )

    .addTo(map);

    markerCluster =

    L.markerClusterGroup({

        spiderfyOnMaxZoom:true,

        showCoverageOnHover:false,

        zoomToBoundsOnClick:true

    });

    map.addLayer(

        markerCluster

    );

    initLongPress();

}

/* =====================================
   LOCATE ME
===================================== */

function locateMe(){

    if(

        !navigator.geolocation

    ){

        alert(

            "Geolocation not supported"

        );

        return;

    }

    navigator.geolocation.getCurrentPosition(

        function(position){

            const lat =

            position.coords.latitude;

            const lng =

            position.coords.longitude;

            map.setView(

                [lat,lng],

                17

            );

            if(

                currentUserMarker

            ){

                map.removeLayer(

                    currentUserMarker

                );

            }

            currentUserMarker =

            L.marker(

                [lat,lng]

            )

            .addTo(map)

            .bindPopup(

                "📍 You are here"

            );

        },

        function(){

            alert(

                "Unable to get location"

            );

        },

        {

            enableHighAccuracy:true

        }

    );

}

/* =====================================
   LONG PRESS SUPPORT
===================================== */

function initLongPress(){

    map.on(

        "mousedown",

        startLongPress

    );

    map.on(

        "mouseup",

        cancelLongPress

    );

    map.on(

        "touchstart",

        startLongPress

    );

    map.on(

        "touchend",

        cancelLongPress

    );

    map.on(

        "contextmenu",

        function(e){

            showPlantTypeMenu(

                e.latlng

            );

        }

    );

}

function startLongPress(e){

    longPressLatLng =

    e.latlng;

    longPressTimer =

    setTimeout(

        function(){

            showPlantTypeMenu(

                longPressLatLng

            );

        },

        700

    );

}

function cancelLongPress(){

    clearTimeout(

        longPressTimer

    );

}

/* =====================================
   LONG PRESS MENU
===================================== */

function showPlantTypeMenu(

    latlng

){

    longPressLatLng =

    latlng;

    let menu =

    document.getElementById(

        "longPressMenu"

    );

    if(!menu){

        createLongPressMenu();

        menu =

        document.getElementById(

            "longPressMenu"

        );

    }

    menu.style.display =

    "block";

    menu.style.left =

    "20px";

    menu.style.bottom =

    "20px";

}

function createLongPressMenu(){

    const menu =

    document.createElement(

        "div"

    );

    menu.id =

    "longPressMenu";

    menu.innerHTML = `

    <div class="font-bold mb-2">

    Add Plant

    </div>

    <div
    class="longpress-option"
    onclick="selectPlantType('tree')">

    🌳 Tree

    </div>

    <div
    class="longpress-option"
    onclick="selectPlantType('herb')">

    🌿 Medicinal Herb

    </div>

    <div
    class="longpress-option"
    onclick="selectPlantType('rare')">

    🌺 Rare Plant

    </div>

    <div
    class="longpress-option"
    onclick="selectPlantType('fruit')">

    🥭 Fruit Tree

    </div>

    <div
    class="longpress-option"
    onclick="selectPlantType('palm')">

    🌴 Palm

    </div>

    `;

    document.body.appendChild(

        menu

    );

}

function selectPlantType(

    type

){

    const menu =

    document.getElementById(

        "longPressMenu"

    );

    if(menu){

        menu.style.display =

        "none";

    }

    openAddPlantForm(

        type,

        longPressLatLng

    );

}

/* =====================================
   PLACEHOLDER
   ADD PLANT FORM
===================================== */

function openAddPlantForm(

    plantType,

    latlng

){

    console.log(

        "Plant Type:",

        plantType

    );

    console.log(

        "Location:",

        latlng.lat,

        latlng.lng

    );

    alert(

        "Add Plant Form coming in Part 7C"
    );

}

/* =====================================
   HELPERS
===================================== */

function clearMarkers(){

    markerCluster.clearLayers();

    allMarkers = [];

}

function refreshMap(){

    if(

        typeof loadVerifiedPlants ===

        "function"

    ){

        loadVerifiedPlants();

    }

}

/* =====================================
   INIT
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    function(){

        if(

            document.getElementById(

                "map"

            )

        ){

            initMap();

        }

        const locateBtn =

        document.getElementById(

            "locateMeBtn"

        );

        if(locateBtn){

            locateBtn.addEventListener(

                "click",

                locateMe

            );

        }

        const refreshBtn =

        document.getElementById(

            "refreshMapBtn"

        );

        if(refreshBtn){

            refreshBtn.addEventListener(

                "click",

                refreshMap

            );

        }

    }

);
/* =====================================
   PART 7B
   LOAD PLANTS + MARKERS
===================================== */

/* =====================================
   LOAD VERIFIED PLANTS
===================================== */

async function loadVerifiedPlants(){

    try{

        clearMarkers();

        verifiedPlants =
        await getVerifiedPlants();

        const heritageTrees =
        await getHeritageTrees();

        const heritageIds =
        new Set(
            heritageTrees.map(
                tree => tree.id
            )
        );

        verifiedPlants.forEach(

            plant => {

                const isHeritage =
                heritageIds.has(
                    plant.id
                );

                addPlantMarker(

                    plant,

                    isHeritage

                );

            }

        );

        updateMapStatistics();

    }

    catch(error){

        console.error(
            error
        );

    }

}

/* =====================================
   ADD MARKER
===================================== */

function addPlantMarker(

    plant,

    isHeritage = false

){

    const lat =
    parseFloat(
        plant.latitude
    );

    const lng =
    parseFloat(
        plant.longitude
    );

    if(

        isNaN(lat)

        ||

        isNaN(lng)

    ){

        return;

    }

    const marker =

    L.marker(

        [lat,lng],

        {

            icon:

            isHeritage

            ?

            heritageIcon

            :

            verifiedIcon

        }

    );

    marker.bindPopup(

        buildPopupHTML(

            plant,

            isHeritage

        ),

        {

            maxWidth:320

        }

    );

    marker.on(

        "click",

        ()=>{

            openPlantModal(
                plant
            );

        }

    );

    markerCluster.addLayer(
        marker
    );

    allMarkers.push({

        marker,
        plant

    });

}

/* =====================================
   POPUP HTML
===================================== */

function buildPopupHTML(

    plant,

    isHeritage

){

    const species =

    plant.species || {};

    const photo =

    plant.cover_photo_url ||

    "https://placehold.co/600x400?text=Plant";

    return `

    <div class="popup-card">

        <img
        src="${photo}">

        <div class="popup-title">

        ${species.local_name || "Plant"}

        </div>

        <div class="popup-scientific">

        ${species.scientific_name || ""}

        </div>

        <div>

        ${plant.atlas_number || ""}

        </div>

        <div style="
        margin-top:8px;
        ">

        ${
            isHeritage

            ?

            "🏛️ Heritage Tree"

            :

            "🌳 Verified Plant"
        }

        </div>

        <a

        href="plant.html?id=${plant.id}"

        class="popup-btn">

        View Details

        </a>

    </div>

    `;

}

/* =====================================
   PLANT MODAL
===================================== */

async function openPlantModal(
    plant
){

    const modal =
    document.getElementById(
        "plantModal"
    );

    if(!modal)
        return;

    const species =
    plant.species || {};

    document.getElementById(
        "modalPlantTitle"
    ).textContent =

    species.local_name ||

    species.english_name ||

    "Plant";

    document.getElementById(
        "modalAtlasNumber"
    ).textContent =

    plant.atlas_number || "";

    document.getElementById(
        "modalScientificName"
    ).textContent =

    species.scientific_name || "";

    document.getElementById(
        "modalLocalName"
    ).textContent =

    species.local_name || "";

    document.getElementById(
        "modalContributor"
    ).textContent =

    plant.contributor_name || "";

    document.getElementById(
        "modalDescription"
    ).textContent =

    species.description || "";

    document.get
ElementById(
    "modalPanchayat"
).textContent =

plant.panchayat_name ||

"";

document.getElementById(
    "modalPhotoCount"
).textContent =

plant.photo_count || 0;

document.getElementById(
    "modalCoverPhoto"
).src =

plant.cover_photo_url ||

"https://placehold.co/800x500?text=Plant";

document.getElementById(
    "openPlantPageBtn"
).href =

`plant.html?id=${plant.id}`;

modal.classList.remove(
    "hidden"
);

modal.classList.add(
    "modal-show"
);

currentModalPlant =
plant;

}

/* =====================================
   CLOSE MODAL
===================================== */

function initModalHandlers(){

    const closeBtn =

    document.getElementById(
        "closePlantModal"
    );

    if(closeBtn){

        closeBtn.addEventListener(

            "click",

            ()=>{

                document
                .getElementById(
                    "plantModal"
                )
                .classList.add(
                    "hidden"
                );

            }

        );

    }

}

/* =====================================
   RECENT CONTRIBUTIONS
===================================== */

async function loadRecentContributions(){

    const container =

    document.getElementById(
        "recentContributions"
    );

    if(!container)
        return;

    const plants =
    await getVerifiedPlants();

    container.innerHTML = "";

    plants

    .slice(0,6)

    .forEach(

        plant=>{

            const species =
            plant.species || {};

            const photo =

            plant.cover_photo_url ||

            "https://placehold.co/600x400?text=Plant";

            const card =

            document.createElement(
                "div"
            );

            card.className =

            "bg-white rounded-2xl overflow-hidden shadow";

            card.innerHTML =

            `

            <img
            src="${photo}"
            class="w-full h-48 object-cover">

            <div class="p-4">

            <div class="font-bold">

            ${species.local_name || ""}

            </div>

            <div class="italic text-sm text-gray-600">

            ${species.scientific_name || ""}

            </div>

            <div class="mt-3">

            <a

            href="plant.html?id=${plant.id}"

            class="text-green-700 font-semibold">

            View Details →

            </a>

            </div>

            </div>

            `;

            container.appendChild(
                card
            );

        }

    );

}

/* =====================================
   HERITAGE GRID
===================================== */

async function loadHeritageGrid(){

    const container =

    document.getElementById(
        "heritageTreesGrid"
    );

    if(!container)
        return;

    const trees =
    await getHeritageTrees();

    container.innerHTML = "";

    trees.forEach(

        plant=>{

            const species =
            plant.species || {};

            const card =

            document.createElement(
                "div"
            );

            card.className =
            "heritage-card";

            card.innerHTML =

            `

            <img
            src="${
                plant.cover_photo_url ||

                'https://placehold.co/600x400?text=Heritage'
            }">

            <div
            class="heritage-card-content">

            <div
            class="font-bold text-xl">

            ${species.local_name || ""}

            </div>

            <div
            class="italic text-gray-600">

            ${species.scientific_name || ""}

            </div>

            <div
            class="mt-3 text-sm">

            ${plant.atlas_number || ""}

            </div>

            </div>

            `;

            container.appendChild(
                card
            );

        }

    );

}

/* =====================================
   MAP STATISTICS
===================================== */

function updateMapStatistics(){

    const plants =
    verifiedPlants || [];

    const speciesSet =
    new Set();

    let heritageCount = 0;

    plants.forEach(

        plant=>{

            if(

                plant.species?.scientific_name

            ){

                speciesSet.add(

                    plant.species
                    .scientific_name

                );

            }

            if(

                plant.is_heritage

            ){

                heritageCount++;

            }

        }

    );

    const plantCountEl =
    document.getElementById(
        "visiblePlantCount"
    );

    if(plantCountEl){

        plantCountEl.textContent =
        plants.length;
    }

    const speciesCountEl =
    document.getElementById(
        "visibleSpeciesCount"
    );

    if(speciesCountEl){

        speciesCountEl.textContent =
        speciesSet.size;
    }

    const heritageEl =
    document.getElementById(
        "visibleHeritageCount"
    );

    if(heritageEl){

        heritageEl.textContent =
        heritageCount;
    }

}

/* =====================================
   INITIAL LOAD
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        if(

            document.getElementById(
                "map"
            )

        ){

            await loadVerifiedPlants();

            await loadRecentContributions();

            await loadHeritageGrid();

            initModalHandlers();

        }

    }

);
/* =====================================
   PART 7C
   ADD PLANT WORKFLOW
===================================== */

let selectedPlantType = null;

/* =====================================
   ADD PLANT MODAL
===================================== */

function createAddPlantModal(){

    if(
        document.getElementById(
            "addPlantModal"
        )
    ){
        return;
    }

    const modal =
    document.createElement(
        "div"
    );

    modal.id =
    "addPlantModal";

    modal.className =
    "fixed inset-0 bg-black/70 hidden z-[99999] overflow-y-auto";

    modal.innerHTML = `

    <div
    class="min-h-screen flex items-center justify-center p-4">

    <div
    class="bg-white rounded-3xl w-full max-w-3xl p-6">

    <div
    class="flex justify-between items-center mb-6">

    <h2 class="text-2xl font-bold">

    Add Plant

    </h2>

    <button
    onclick="closeAddPlantModal()"
    class="text-3xl">

    ×

    </button>

    </div>

    <form id="addPlantForm">

    <div
    class="grid md:grid-cols-2 gap-4">

    <input

    id="localName"

    placeholder="Local Name"

    class="border p-3 rounded-xl">

    <input

    id="englishName"

    placeholder="English Name"

    class="border p-3 rounded-xl">

    <input

    id="scientificName"

    placeholder="Scientific Name"

    class="border p-3 rounded-xl">

    <input

    id="contributorName"

    placeholder="Contributor Name"

    class="border p-3 rounded-xl">

  

  <input
id="contributorAssociation"
placeholder="Association / School / Eco Club / Organization"
class="border p-3 rounded-xl">
<input
id="contributorPhone"
placeholder="Mobile Number"
class="border p-3 rounded-xl">

    </div>

    <textarea

    id="plantDescription"

    placeholder="Description"

    class="border p-3 rounded-xl w-full mt-4 h-28">

    </textarea>

    <div class="mt-4">

    <label class="font-semibold">

    Panchayat

    </label>

    <select
    id="plantPanchayat"
    class="border p-3 rounded-xl w-full mt-2">

    <option value="">
    Select Panchayat
    </option>

    </select>

    </div>

    <div class="mt-4">

    <label class="font-semibold">

    Upload Photos

    </label>

    <input

    type="file"

    id="plantPhotos"

    multiple

    accept="image/*"

    class="w-full mt-2">

    </div>

    <div
   class="mt-6 flex gap-3">

<button

type="submit"

class="bg-green-700 text-white px-6 py-3 rounded-xl">

Save Plant

</button>

<button

type="button"

onclick="closeAddPlantModal()"

class="bg-slate-500 text-white px-6 py-3 rounded-xl">

Cancel

</button>

</div>

</form>

</div>

</div>

`;

    document.body.appendChild(
        modal
    );

    populatePanchayatDropdown();

    document

    .getElementById(
        "addPlantForm"
    )

    .addEventListener(

        "submit",

        submitPlantForm

    );

}

/* =====================================
   OPEN MODAL
===================================== */

function openAddPlantForm(

    plantType,

    latlng

){

    selectedPlantType =
    plantType;

    longPressLatLng =
    latlng;

    createAddPlantModal();

    document

    .getElementById(
        "addPlantModal"
    )

    .classList.remove(
        "hidden"
    );

}

/* =====================================
   CLOSE MODAL
===================================== */

function closeAddPlantModal(){

    const modal =

    document.getElementById(
        "addPlantModal"
    );

    if(modal){

        modal.classList.add(
            "hidden"
        );

    }

}

/* =====================================
   LOAD PANCHAYATS
===================================== */

async function populatePanchayatDropdown(){

    const dropdown =

    document.getElementById(
        "plantPanchayat"
    );

    if(!dropdown)
        return;

    const {

        data,
        error

    } =

    await supabaseClient

    .from("panchayats")

    .select("*")

    .order(
        "name"
    );

    if(error){

        console.error(error);

        return;

    }

    dropdown.innerHTML =

    `<option value="">
    Select Panchayat
    </option>`;

    data.forEach(

        p=>{

            dropdown.innerHTML +=

            `

            <option value="${p.id}">

            ${p.name}

            </option>

            `;

        }

    );

}

/* =====================================
   SUBMIT PLANT
===================================== */

async function submitPlantForm(e){

    e.preventDefault();

    try{

        const localName =

        document.getElementById(
            "localName"
        ).value;

        const englishName =

        document.getElementById(
            "englishName"
        ).value;

        const scientificName =

        document.getElementById(
            "scientificName"
        ).value;

        const contributorName =

        document.getElementById(
            "contributorName"
        ).value;

       const contributorAssociation =
document.getElementById(
    "contributorAssociation"
).value;

const contributorPhone =
document.getElementById(
    "contributorPhone"
).value;

        const description =

        document.getElementById(
            "plantDescription"
        ).value;

        const panchayatId =

        document.getElementById(
            "plantPanchayat"
        ).value;
       
if(
    !scientificName ||
    !contributorName ||
    !contributorAssociation ||
    !longPressLatLng
){

            alert(
                "Scientific name is required"
            );

            return;

        }

        const plant =

        await createPlant({

            scientific_name:
            scientificName,

            english_name:
            englishName,

            local_name:
            localName,

            description:
            description,

            latitude:
            longPressLatLng.lat,

            longitude:
            longPressLatLng.lng,

            contributor_name:
            contributorName,

contributor_association:
contributorAssociation,

contributor_phone:
contributorPhone,

            panchayat_id:
            panchayatId,

            plant_type:
            selectedPlantType

        });

        if(!plant){

            alert(
                "Failed to save plant"
            );

            return;

        }

        await uploadSelectedPhotos(
            plant.id
        );

        closeAddPlantModal();

        alert(

            "Plant submitted successfully.\n\nStatus: Pending Verification"

        );

    }

    catch(error){

        console.error(error);

        alert(
            error.message
        );

    }

}

/* =====================================
   PHOTO UPLOAD
===================================== */

async function uploadSelectedPhotos(
    plantId
){

    const input =

    document.getElementById(
        "plantPhotos"
    );

    if(

        !input ||

        !input.files ||

        input.files.length === 0

    ){

        return;
    }

    const files =

    Array.from(
        input.files
    );

    for(

        const file of files

    ){

        await uploadPlantPhoto(

            plantId,

            file,

            ""

        );

    }

}

/* =====================================
   QUICK PREVIEW
===================================== */

function previewPlantMarker(

    lat,

    lng,

    plantType

){

    let icon =
    treeIcon;

    switch(

        plantType

    ){

        case "herb":

            icon = herbIcon;
            break;

        case "rare":

            icon = rareIcon;
            break;

        case "fruit":

            icon = fruitIcon;
            break;

        case "palm":

            icon = palmIcon;
            break;

    }

    L.marker(

        [lat,lng],

        {

            icon:icon

        }

    )

    .addTo(map);

}
