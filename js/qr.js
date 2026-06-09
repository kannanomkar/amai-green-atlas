/* =====================================
   AMAI GREEN ATLAS V3
   QR.JS
===================================== */

/* =====================================
   GENERATE QR
===================================== */

function generatePlantQRCode(){

    const container =

    document.getElementById(
        "plantQRCode"
    );

    if(
        !container
    ){
        return;
    }

    container.innerHTML = "";

    const url =

    window.location.href;

    new QRCode(

        container,

        {

            text:url,

            width:220,

            height:220,

            correctLevel:
            QRCode.CorrectLevel.H

        }

    );

}

/* =====================================
   DOWNLOAD QR
===================================== */

function downloadPlantQR(){

    const canvas =

    document.querySelector(
        "#plantQRCode canvas"
    );

    if(!canvas){

        alert(
            "QR not generated"
        );

        return;
    }

    const link =

    document.createElement(
        "a"
    );

    const atlasNumber =

    plantData?.atlas_number ||

    "plant";

    link.download =

    atlasNumber +

    "_QR.png";

    link.href =

    canvas.toDataURL(
        "image/png"
    );

    link.click();

}

/* =====================================
   PRINTABLE LABEL
===================================== */

function printPlantLabel(){

    if(
        !plantData
    ){
        return;
    }

    const species =

    plantData.species || {};

    const canvas =

    document.querySelector(
        "#plantQRCode canvas"
    );

    if(!canvas){

        alert(
            "Generate QR first"
        );

        return;
    }

    const qrImage =

    canvas.toDataURL(
        "image/png"
    );

    const win =

    window.open(
        "",
        "_blank"
    );

    win.document.write(

    `

    <html>

    <head>

    <title>

    ${plantData.atlas_number}

    </title>

    <style>

    body{

    font-family:Arial;

    text-align:center;

    padding:20px;

    }

    .label{

    border:2px solid #000;

    width:350px;

    margin:auto;

    padding:20px;

    }

    img{

    width:180px;

    }

    h2{

    margin:10px 0;
    }

    </style>

    </head>

    <body>

    <div class="label">

    <h2>

    ${species.local_name || ""}

    </h2>

    <div>

    <i>

    ${species.scientific_name || ""}

    </i>

    </div>

    <div>

    ${plantData.atlas_number}

    </div>

    <br>

    <img src="${qrImage}">

    </div>

    </body>

    </html>

    `

    );

    win.document.close();

    win.focus();

    win.print();

}

/* =====================================
   ADMIN QR
===================================== */

function generateAtlasQR(

    atlasNumber,

    plantId

){

    const url =

    `${window.location.origin}/plant.html?id=${plantId}`;

    const temp =

    document.createElement(
        "div"
    );

    new QRCode(

        temp,

        {

            text:url,

            width:250,

            height:250

        }

    );

    return temp;

}

/* =====================================
   BULK QR PDF PREP
===================================== */

function prepareBulkQRData(
    plants
){

    return plants.map(

        plant=>{

            return {

                id:
                plant.id,

                atlas:
                plant.atlas_number,

                name:
                plant.species?.local_name ||

                "",

                scientific:
                plant.species?.scientific_name ||

                ""

            };

        }

    );

}

/* =====================================
   QR MODAL HELPER
===================================== */

function showQRCodeModal(

    plantId

){

    const modal =

    document.getElementById(
        "qrModal"
    );

    if(
        !modal
    ){
        return;
    }

    modal.classList.remove(
        "hidden"
    );

}

/* =====================================
   CLOSE QR MODAL
===================================== */

function closeQRCodeModal(){

    const modal =

    document.getElementById(
        "qrModal"
    );

    if(
        modal
    ){

        modal.classList.add(
            "hidden"

        );

    }

}

/* =====================================
   EVENTS
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        document

        .getElementById(
            "downloadQRBtn"
        )

        ?.addEventListener(

            "click",

            downloadPlantQR

        );

    }

);