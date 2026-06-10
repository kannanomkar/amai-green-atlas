/* =====================================
   AMAI GREEN ATLAS V3
   PLANTS.JS
===================================== */

/* =====================================
   CURRENT USER
===================================== */

async function getCurrentUserId(){

    const user =
    await getCurrentUser();

    return user?.id || null;

}

/* =====================================
   ATLAS NUMBER
===================================== */

async function generateAtlasNumber(){

    const { data, error } =
    await supabaseClient.rpc(
        "generate_atlas_number"
    );

    if(error){

        console.error(error);

        return null;

    }

    return data;

}

/* =====================================
   SPECIES LOOKUP
===================================== */

async function findSpecies(
    scientificName
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("species")

    .select("*")

    .eq(
        "scientific_name",
        scientificName
    )

    .maybeSingle();

    if(error){

        console.error(error);

        return null;

    }

    return data;

}

/* =====================================
   CREATE SPECIES
===================================== */

async function createSpecies({

    scientific_name,

    english_name,

    local_name,

    description

}){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("species")

    .insert({

        scientific_name,

        english_name,

        local_name,

        description

    })

    .select()

    .single();

    if(error){

        console.error(error);

        return null;

    }

    return data;

}

/* =====================================
   FIND OR CREATE SPECIES
===================================== */

async function findOrCreateSpecies({

    scientific_name,

    english_name,

    local_name,

    description

}){

    let species =
    await findSpecies(
        scientific_name
    );

    if(species)
        return species;

    species =
    await createSpecies({

        scientific_name,

        english_name,

        local_name,

        description

    });

    return species;

}

/* =====================================
   CREATE PLANT
===================================== */

async function createPlant({

    scientific_name,

    english_name,

    local_name,

    description,

    latitude,

    longitude,

    contributor_name,

    school_name,

    organization_name

}){

    try{

        const ownerId =
        await getCurrentUserId();

        if(!ownerId){

            throw new Error(
                "Login required"
            );

        }

        const species =
        await findOrCreateSpecies({

            scientific_name,

            english_name,

            local_name,

            description

        });

        if(!species){

            throw new Error(
                "Species creation failed"
            );

        }

        const atlasNumber =
        await generateAtlasNumber();

        const {

            data,
            error

        } =

        await supabaseClient

        .from("plants")

        .insert({

            atlas_number:
            atlasNumber,

            species_id:
            species.id,

            latitude,

            longitude,

            owner_id:
            ownerId,

            contributor_name,

            school_name,

            organization_name,

            verification_status:
            "pending",

            is_heritage:
            false,

            photo_count:
            0

        })

        .select()

        .single();

        if(error){

            throw error;

        }

        await logActivity(

            ownerId,

            "Plant Added",

            data.id

        );

        return data;

    }

    catch(error){

        console.error(error);

        return null;

    }

}

/* =====================================
   UPDATE PLANT
===================================== */

async function updatePlant(

    plantId,

    updates

){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .update(updates)

    .eq(
        "id",
        plantId
    )

    .select()

    .single();

    if(error){

        console.error(error);

        return null;

    }

    return data;

}

/* =====================================
   DELETE PLANT
===================================== */

async function deletePlant(
    plantId
){

    const {

        error

    } =

    await supabaseClient

    .from("plants")

    .delete()

    .eq(
        "id",
        plantId
    );

    if(error){

        console.error(error);

        return false;

    }

    return true;

}

/* =====================================
   GET PLANT
===================================== */

async function getPlant(
    plantId
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .select(`
        *,
        species(*)
    `)

    .eq(
        "id",
        plantId
    )

    .single();

    if(error){

        console.error(error);

        return null;

    }

    return data;

}

/* =====================================
   VERIFIED PLANTS
===================================== */

async function getVerifiedPlants(){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .select(`
        *,
        species(*)
    `)

    .eq(
        "verification_status",
        "verified"
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   HERITAGE TREES
===================================== */

async function getHeritageTrees(){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .select(`
        *,
        species(*)
    `)

    .eq(
        "is_heritage",
        true
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   ADMIN ALL PLANTS
===================================== */

async function getAllPlants(){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .select(`
        *,
        species(*)
    `)

    .order(
        "created_at",
        {
            ascending:false
        }
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   APPROVE PLANT
===================================== */

async function approvePlant(
    plantId
){

    return updatePlant(

        plantId,

        {

            verification_status:
            "verified"

        }

    );

}

/* =====================================
   MARK HERITAGE
===================================== */

async function markHeritage(
    plantId
){

    return updatePlant(

        plantId,

        {

            verification_status:
            "verified",

            is_heritage:true

        }

    );

}

/* =====================================
   MY PLANTS
===================================== */

async function getMyPlants(){

    const userId =
    await getCurrentUserId();

    if(!userId)
        return [];

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .select(`
        *,
        species(*)
    `)

    .eq(
        "owner_id",
        userId
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   ACTIVITY LOG
===================================== */

async function logActivity(

    userId,

    action,

    plantId

){

    await supabaseClient

    .from("activity_log")

    .insert({

        user_id:
        userId,

        action:
        action,

        plant_id:
        plantId

    });

}
/* =====================================
   AMAI GREEN ATLAS V3
   EXTENDED BIODIVERSITY FEATURES
===================================== */

/* =====================================
   PLANT VIDEOS
===================================== */

async function addPlantVideo({

    plantId,

    youtubeUrl,

    title

}){

    const user =
    await getCurrentUser();

    if(!user)
        return null;

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plant_videos")

    .insert({

        plant_id:
        plantId,

        youtube_url:
        youtubeUrl,

        title:
        title,

        added_by:
        user.id

    })

    .select()

    .single();

    if(error){

        console.error(error);

        return null;

    }

    return data;

}

async function getPlantVideos(
    plantId
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plant_videos")

    .select("*")

    .eq(
        "plant_id",
        plantId
    )

    .order(
        "created_at",
        {
            ascending:true
        }
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   OBSERVATIONS
===================================== */

async function addObservation({

    plantId,

    notes,

    healthStatus

}){

    const user =
    await getCurrentUser();

    if(!user)
        return null;

    const {

        data,
        error

    } =

    await supabaseClient

    .from("observations")

    .insert({

        plant_id:
        plantId,

        observer_id:
        user.id,

        notes:
        notes,

        health_status:
        healthStatus

    })

    .select()

    .single();

    if(error){

        console.error(error);

        return null;

    }

    return data;

}

async function getObservations(
    plantId
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("observations")

    .select("*")

    .eq(
        "plant_id",
        plantId
    )

    .order(
        "created_at",
        {
            ascending:false
        }
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   SPECIES SEARCH
===================================== */

async function searchSpecies(
    searchText
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("species")

    .select("*")

    .ilike(
        "scientific_name",
        `%${searchText}%`
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   PLANT SEARCH
===================================== */

async function searchPlants(
    searchText
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .select(`
        *,
        species(*)
    `)

    .or(
        `atlas_number.ilike.%${searchText}%,
         contributor_name.ilike.%${searchText}%`
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   PANCHAYAT FILTER
===================================== */

async function getPlantsByPanchayat(
    panchayatId
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from("plants")

    .select(`
        *,
        species(*)
    `)

    .eq(
        "panchayat_id",
        panchayatId
    )

    .eq(
        "verification_status",
        "verified"
    );

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

/* =====================================
   DASHBOARD STATS
===================================== */

async function getDashboardStats(){

    try{

        const { count: plantCount } =
        await supabaseClient
        .from("plants")
        .select("*",{count:"exact",head:true})
        .eq("verification_status","verified");

        const { count: speciesCount } =
        await supabaseClient
        .from("species")
        .select("*",{count:"exact",head:true});

        const { count: heritageCount } =
        await supabaseClient
        .from("plants")
        .select("*",{count:"exact",head:true})
        .eq("is_heritage",true);

        const { count: contributorCount } =
        await supabaseClient
        .from("profiles")
        .select("*",{count:"exact",head:true});

        return {

            plantCount:
            plantCount || 0,

            speciesCount:
            speciesCount || 0,

            heritageCount:
            heritageCount || 0,

            contributorCount:
            contributorCount || 0

        };

    }

    catch(error){

        console.error(error);

        return {

            plantCount:0,
            speciesCount:0,
            heritageCount:0,
            contributorCount:0

        };

    }

}
