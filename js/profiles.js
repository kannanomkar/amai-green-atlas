
/* ==========================
   PROFILES
========================== */

async function getProfile(){

    const user =
    await getCurrentUser();

    if(!user)
        return null;

    const {

        data,
        error

    } =

    await supabaseClient

    .from("profiles")

    .select("*")

    .eq(
        "id",
        user.id
    )

    .single();

    if(error){

        console.error(
            error
        );

        return null;
    }

    return data;

}

async function isAdmin(){

    const profile =
    await getProfile();

    if(!profile)
        return false;

    return (

        profile.role ===
        "admin"

        ||

        profile.role ===
        "superadmin"

    );

}

