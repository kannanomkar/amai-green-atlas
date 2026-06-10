/* =====================================
   AMAI GREEN ATLAS V3
   APP.JS
===================================== */

const APP_VERSION =
"3.0.0";

/* =====================================
   GLOBAL STATE
===================================== */

let currentUser = null;
let currentProfile = null;

/* =====================================
   NOTIFICATION
===================================== */

function showNotification(

    message,

    type="success"

){

    const existing =

    document.getElementById(
        "notification"
    );

    if(existing){

        existing.remove();

    }

    const div =

    document.createElement(
        "div"
    );

    div.id =
    "notification";

    let color =
    "bg-green-600";

    if(type === "error"){

        color =
        "bg-red-600";

    }

    if(type === "warning"){

        color =
        "bg-yellow-600";

    }

    div.className =

    `

    fixed
    top-5
    right-5
    z-[99999]
    text-white
    px-5
    py-3
    rounded-xl
    shadow-xl
    ${color}

    `;

    div.innerText =
    message;

    document.body.appendChild(
        div
    );

    setTimeout(

        ()=>{

            div.remove();

        },

        3000

    );

}

/* =====================================
   LOADER
===================================== */

function showLoader(){

    if(

        document.getElementById(
            "globalLoader"
        )

    ){

        return;
    }

    const loader =

    document.createElement(
        "div"
    );

    loader.id =
    "globalLoader";

    loader.innerHTML =

    `

    <div
    class="fixed inset-0 bg-black/40 z-[99999]
    flex items-center justify-center">

    <div
    class="bg-white rounded-2xl p-6 text-center">

    <div
    class="animate-spin text-4xl">

    🌿

    </div>

    <div
    class="mt-3 font-semibold">

    Loading...

    </div>

    </div>

    </div>

    `;

    document.body.appendChild(
        loader
    );

}

function hideLoader(){

    const loader =

    document.getElementById(
        "globalLoader"
    );

    if(loader){

        loader.remove();

    }

}

/* =====================================
   USER SESSION
===================================== */

async function loadSession(){

    try{

        const {

            data

        } =

        await supabaseClient

        .auth

        .getUser();

        currentUser =
        data.user;

        if(currentUser){

            try{

                currentProfile =

                await getProfile();

            }

            catch(e){

                console.error(e);

            }

        }

    }

    catch(error){

        console.error(error);

    }

}

/* =====================================
   USER NAV
===================================== */

function updateNavigation(){

    const loginLinks =

    document.querySelectorAll(
        ".login-link"
    );

    const adminLinks =

    document.querySelectorAll(
        ".admin-link"
    );

    if(currentUser){

        loginLinks.forEach(

            link=>{

                link.innerHTML =

                "👤 Account";

            }

        );

        if(

            currentProfile &&

            (
                currentProfile.role ===
                "admin"

                ||

                currentProfile.role ===
                "superadmin"
            )

        ){

            adminLinks.forEach(

                link=>{

                    link.classList.remove(
                        "hidden"
                    );

                }

            );

        }

    }

}

/* =====================================
   VERSION CHECK
===================================== */

function versionCheck(){

    const stored =

    localStorage.getItem(
        "atlas_version"
    );

    if(

        stored !== APP_VERSION

    ){

        localStorage.setItem(

            "atlas_version",

            APP_VERSION

        );

        console.log(

            "Application updated:",

            APP_VERSION

        );

    }

}

/* =====================================
   CONNECTION TEST
===================================== */

async function testSupabaseConnection(){

    try{

        const {

            error

        } =

        await supabaseClient

        .from("species")

        .select("id")

        .limit(1);

        if(error){

            console.error(error);

            showNotification(

                "Database connection issue",

                "error"

            );

            return false;

        }

        return true;

    }

    catch(error){

        console.error(error);

        return false;

    }

}

/* =====================================
   URL PARAMS
===================================== */

function getUrlParam(

    name

){

    const params =

    new URLSearchParams(

        window.location.search

    );

    return params.get(name);

}

/* =====================================
   DEEP LINK
===================================== */

function handleDeepLinks(){

    const plantId =

    getUrlParam(
        "id"
    );

    if(

        plantId &&

        typeof openPlantModal ===
        "function"

    ){

        console.log(

            "Deep Link Plant:",

            plantId

        );

    }

}

/* =====================================
   PWA INSTALL
===================================== */

let deferredPrompt;

window.addEventListener(

    "beforeinstallprompt",

    (e)=>{

        e.preventDefault();

        deferredPrompt = e;

        console.log(
            "PWA install available"
        );

    }

);

async function installPWA(){

    if(

        !deferredPrompt

    ){

        return;
    }

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

}

/* =====================================
   NETWORK STATUS
===================================== */

function initNetworkMonitor(){

    window.addEventListener(

        "offline",

        ()=>{

            showNotification(

                "Offline Mode",

                "warning"

            );

        }

    );

    window.addEventListener(

        "online",

        ()=>{

            showNotification(

                "Back Online",

                "success"

            );

        }

    );

}

/* =====================================
   MOBILE MENU
===================================== */

function initMobileMenu(){

    const btn =

    document.getElementById(
        "mobileMenuBtn"
    );

    const menu =

    document.getElementById(
        "mobileMenu"
    );

    if(

        !btn ||

        !menu

    ){

        return;
    }

    btn.addEventListener(

        "click",

        ()=>{

            menu.classList.toggle(
                "hidden"
            );

        }

    );

}

/* =====================================
   GLOBAL ERROR HANDLER
===================================== */

window.addEventListener(

    "error",

    (event)=>{

        console.error(

            "Global Error:",

            event.error

        );

    }

);

/* =====================================
   STARTUP DIAGNOSTICS
===================================== */

async function runDiagnostics(){

    console.group(
        "AMAI Green Atlas"
    );

    console.log(
        "Version:",
        APP_VERSION
    );

    console.log(
        "User:",
        currentUser
    );

    console.log(
        "Profile:",
        currentProfile
    );

    console.groupEnd();

}

/* =====================================
   INITIALIZE APP
===================================== */

async function initializeApp(){

    try{

        showLoader();

        versionCheck();

        await loadSession();

        await testSupabaseConnection();

        updateNavigation();

        handleDeepLinks();

        initNetworkMonitor();

        initMobileMenu();

        await runDiagnostics();

    }

    catch(error){

        console.error(error);

        showNotification(

            "Startup Error",

            "error"

        );

    }

    finally{

        hideLoader();

    }

}

/* =====================================
   START
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeApp

);
/* =====================================
SERVICE WORKER
===================================== */

if(

"serviceWorker"

in navigator

){

window.addEventListener(

"load",

()=>{

navigator.serviceWorker.register(

"/sw.js"

)

.then(

()=>{

console.log(

"Service Worker Registered"

);

}

)

.catch(

err=>{

console.error(

err

);

}

);

}

);

}
if("serviceWorker" in navigator){
   ...
}
