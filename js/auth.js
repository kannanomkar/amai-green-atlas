
/* ==========================
   AUTHENTICATION
========================== */

async function loginPassword(){

    const email =
    document.getElementById(
        "email"
    ).value;

    const password =
    document.getElementById(
        "password"
    ).value;

    const {

        data,
        error

    } =

    await supabaseClient.auth
    .signInWithPassword({

        email,
        password

    });

    if(error){

    showMessage(
        error.message,
        true
    );

    return;
}

window.location.href =
"index.html";
}

async function loginOTP(){

    const email =
    document.getElementById(
        "email"
    ).value;

    const {

        error

    } =

    await supabaseClient.auth
    .signInWithOtp({

        email

    });

    if(error){

        showMessage(
            error.message,
            true
        );

        return;
    }

    showMessage(
        "Login link sent."
    );

}

async function logout(){

    await supabaseClient.auth
    .signOut();

    window.location.href =
    "login.html";

}

async function getCurrentUser(){

    const {

        data

    } =

    await supabaseClient.auth
    .getUser();

    return data.user;

}

function showMessage(
    text,
    error=false
){

    const msg =
    document.getElementById(
        "message"
    );

    if(!msg)
        return;

    msg.textContent =
    text;

    msg.style.color =
    error
    ? "red"
    : "green";

}

document
.addEventListener(
    "DOMContentLoaded",
    ()=>{

        document
        .getElementById(
            "passwordLoginBtn"
        )
        ?.addEventListener(
            "click",
            loginPassword
        );

        document
        .getElementById(
            "otpLoginBtn"
        )
        ?.addEventListener(
            "click",
            loginOTP
        );

    }
);

