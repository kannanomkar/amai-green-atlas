```javascript
/* =====================================
   AMAI GREEN ATLAS V3
   STORAGE.JS
===================================== */

const PHOTO_BUCKET =
"plant-photos";

/* =====================================
   COMPRESS IMAGE
===================================== */

async function compressImage(file){

    return new Promise((resolve)=>{

        const reader =
        new FileReader();

        reader.onload = function(e){

            const img =
            new Image();

            img.onload = function(){

                const canvas =
                document.createElement(
                    "canvas"
                );

                const MAX_WIDTH =
                1600;

                let width =
                img.width;

                let height =
                img.height;

                if(width > MAX_WIDTH){

                    height =
                    height *
                    (MAX_WIDTH / width);

                    width =
                    MAX_WIDTH;

                }

                canvas.width =
                width;

                canvas.height =
                height;

                const ctx =
                canvas.getContext(
                    "2d"
                );

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                canvas.toBlob(

                    function(blob){

                        resolve(blob);

                    },

                    "image/jpeg",

                    0.75

                );

            };

            img.src =
            e.target.result;

        };

        reader.readAsDataURL(
            file
        );

    });

}

/* =====================================
   GENERATE FILE NAME
===================================== */

function generatePhotoName(){

    return (

        "photo_"

        +

        Date.now()

        +

        "_"

        +

        Math.floor(
            Math.random()*100000
        )

        +

        ".jpg"

    );

}

/* =====================================
   UPLOAD PHOTO
===================================== */

async function uploadPlantPhoto(

    plantId,

    file,

    caption=""

){

    try{

        const user =
        await getCurrentUser();

        if(!user){

            throw new Error(
                "Login required"
            );

        }

        const compressedFile =
        await compressImage(
            file
        );

        const fileName =
        generatePhotoName();

        const storagePath =

        `${plantId}/${fileName}`;

        const {

            error:uploadError

        } =

        await supabaseClient
        .storage
        .from(
            PHOTO_BUCKET
        )
        .upload(

            storagePath,

            compressedFile,

            {

                contentType:
                "image/jpeg",

                upsert:false

            }

        );

        if(uploadError){

            throw uploadError;

        }

        const {

            data:urlData

        } =

        supabaseClient
        .storage
        .from(
            PHOTO_BUCKET
        )
        .getPublicUrl(
            storagePath
        );

        const publicUrl =

        urlData.publicUrl;

        const {

            error:dbError

        } =

        await supabaseClient

        .from(
            "plant_photos"
        )

        .insert({

            plant_id:
            plantId,

            photo_url:
            publicUrl,

            caption:
            caption,

            uploaded_by:
            user.id

        });

        if(dbError){

            throw dbError;

        }

        await updatePhotoCount(
            plantId
        );

        return {

            success:true,

            url:publicUrl

        };

    }

    catch(error){

        console.error(
            error
        );

        return {

            success:false,

            error:error.message

        };

    }

}

/* =====================================
   LOAD PLANT PHOTOS
===================================== */

async function getPlantPhotos(
    plantId
){

    const {

        data,
        error

    } =

    await supabaseClient

    .from(
        "plant_photos"
    )

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

        console.error(
            error
        );

        return [];

    }

    return data;

}

/* =====================================
   DELETE PHOTO
===================================== */

async function deletePlantPhoto(
    photoId
){

    try{

        const {

            data

        } =

        await supabaseClient

        .from(
            "plant_photos"
        )

        .select("*")

        .eq(
            "id",
            photoId
        )

        .single();

        if(!data){

            throw new Error(
                "Photo not found"
            );

        }

        const url =
        data.photo_url;

        const path =
        extractStoragePath(
            url
        );

        if(path){

            await supabaseClient
            .storage
            .from(
                PHOTO_BUCKET
            )
            .remove(
                [path]
            );

        }

        await supabaseClient

        .from(
            "plant_photos"
        )

        .delete()

        .eq(
            "id",
            photoId
        );

        await updatePhotoCount(
            data.plant_id
        );

        return true;

    }

    catch(error){

        console.error(
            error
        );

        return false;

    }

}

/* =====================================
   SET COVER PHOTO
===================================== */

async function setCoverPhoto(

    plantId,

    photoUrl

){

    const {

        error

    } =

    await supabaseClient

    .from(
        "plants"
    )

    .update({

        cover_photo_url:
        photoUrl

    })

    .eq(
        "id",
        plantId
    );

    if(error){

        console.error(
            error
        );

    }

}

/* =====================================
   UPDATE PHOTO COUNT
===================================== */

async function updatePhotoCount(
    plantId
){

    const {

        count

    } =

    await supabaseClient

    .from(
        "plant_photos"
    )

    .select(
        "*",
        {
            count:"exact",
            head:true
        }
    )

    .eq(
        "plant_id",
        plantId
    );

    await supabaseClient

    .from(
        "plants"
    )

    .update({

        photo_count:
        count || 0

    })

    .eq(
        "id",
        plantId
    );

}

/* =====================================
   EXTRACT STORAGE PATH
===================================== */

function extractStoragePath(
    url
){

    try{

        const marker =

        "/plant-photos/";

        const index =
        url.indexOf(
            marker
        );

        if(index === -1)
            return null;

        return url.substring(
            index +
            marker.length
        );

    }

    catch(e){

        return null;

    }

}

/* =====================================
   RENDER PHOTO GALLERY
===================================== */

async function renderPhotoGallery(

    plantId,

    containerId

){

    const photos =
    await getPlantPhotos(
        plantId
    );

    const container =

    document.getElementById(
        containerId
    );

    if(!container)
        return;

    container.innerHTML = "";

    photos.forEach(photo=>{

        const card =
        document.createElement(
            "div"
        );

        card.className =
        "gallery-card";

        card.innerHTML = `

        <img
        src="${photo.photo_url}"
        class="gallery-image">

        <div class="gallery-caption">

        ${photo.caption || ""}

        </div>

        `;

        container.appendChild(
            card
        );

    });

}
```
