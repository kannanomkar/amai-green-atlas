/* =====================================
   AMAI GREEN ATLAS V3
   SUPABASE CONFIG
===================================== */

/*
=====================================

REPLACE THESE WITH YOUR VALUES

=====================================
*/

const SUPABASE_URL =
"https://kcavwosmwfmcespztwuw.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYXZ3b3Ntd2ZtY2VzcHp0d3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjU1NDcsImV4cCI6MjA5NjUwMTU0N30.38ZOmXvltuZy68MKY9-vodgNO2QKiM7DNLoMs-jTquU";

/*
=====================================
SUPABASE CLIENT
=====================================
*/

const supabaseClient =

supabase.createClient(

    SUPABASE_URL,

    SUPABASE_ANON_KEY,

    {

        auth:{

            persistSession:true,

            autoRefreshToken:true,

            detectSessionInUrl:true

        }

    }

);

/*
=====================================
HELPERS
=====================================
*/

async function getCurrentUser(){

    try{

        const {

            data,

            error

        } =

        await supabaseClient

        .auth

        .getUser();

        if(error){

            console.error(error);

            return null;

        }

        return data.user;

    }

    catch(error){

        console.error(error);

        return null;

    }

}

/*
=====================================
CURRENT SESSION
=====================================
*/

async function getCurrentSession(){

    try{

        const {

            data,

            error

        } =

        await supabaseClient

        .auth

        .getSession();

        if(error){

            console.error(error);

            return null;

        }

        return data.session;

    }

    catch(error){

        console.error(error);

        return null;

    }

}

/*
=====================================
IS LOGGED IN
=====================================
*/

async function isLoggedIn(){

    const user =

    await getCurrentUser();

    return !!user;

}

/*
=====================================
LOGOUT
=====================================
*/

async function logout(){

    await supabaseClient

    .auth

    .signOut();

    window.location.href =
    "index.html";

}

/*
=====================================
STORAGE URL
=====================================
*/

function getPublicStorageUrl(

    bucket,

    path

){

    const {

        data

    } =

    supabaseClient

    .storage

    .from(bucket)

    .getPublicUrl(path);

    return data.publicUrl;

}

/*
=====================================
TEST CONNECTION
=====================================
*/

async function testConnection(){

    try{

        const {

            error

        } =

        await supabaseClient

        .from("species")

        .select("id")

        .limit(1);

        if(error){

            console.error(

                "Supabase Error",

                error

            );

            return false;

        }

        console.log(

            "Supabase Connected"

        );

        return true;

    }

    catch(error){

        console.error(error);

        return false;

    }

}

/*
=====================================
AUTH STATE LISTENER
=====================================
*/

supabaseClient.auth.onAuthStateChange(

    async (

        event,

        session

    )=>{

        console.log(

            "Auth Event:",

            event

        );

        switch(event){

            case "SIGNED_IN":

                console.log(

                    "User signed in"

                );

                break;

            case "SIGNED_OUT":

                console.log(

                    "User signed out"

                );

                break;

            case "TOKEN_REFRESHED":

                console.log(

                    "Token refreshed"

                );

                break;

        }

    }

);

/*
=====================================
STARTUP TEST
=====================================
*/

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await testConnection();

    }

);
