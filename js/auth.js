/* ==========================
   AUTHENTICATION
========================== */

async function loginPassword(){
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        showMessage("Please enter your email and password.", true);
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if(error){
        showMessage(error.message, true);
        return;
    }

    if(window.location.pathname.includes("admin-login")){
        window.location.href = "admin.html";
    } else {
        // Return to page user came from (e.g. contribute.html on iPhone)
        const redirectTo = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectTo || "index.html";
    }
}

async function loginOTP(){
    const email = document.getElementById("email")?.value;
    
    if (!email) {
        showMessage("Please enter your email.", true);
        return;
    }

    const { error } = await supabaseClient.auth.signInWithOtp({
        email
    });

    if(error){
        showMessage(error.message, true);
        return;
    }

    showMessage("Login link sent.");
}

async function logout(){
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}

/**
 * iOS Restructuring: Fallback strategy using local session storage cache 
 * before firing network-dependent user requests.
 */
async function getCurrentUser(){
    try {
        // 1. Try reading the local session cache immediately (Safest and fastest strategy for iPhone)
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionData?.session?.user) {
            return sessionData.session.user;
        }

        // 2. Fall back to secure database lookup if session validation is pending
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userData?.user) {
            return userData.user;
        }
    } catch (e) {
        console.error("iOS Authentication retrieval intercept:", e);
    }
    return null;
}

function showMessage(text, error=false){
    const msg = document.getElementById("message");
    if(!msg) return;

    msg.textContent = text;
    msg.style.color = error ? "red" : "green";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("passwordLoginBtn")?.addEventListener("click", loginPassword);
    document.getElementById("otpLoginBtn")?.addEventListener("click", loginOTP);
});
