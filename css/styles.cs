/* ==========================================
   AMAI GREEN ATLAS V3
========================================== */

:root{

--green-dark:#14532d;
--green:#166534;
--green-light:#22c55e;

--heritage:#2563eb;

--bg:#f7faf7;

--shadow:
0 10px 25px rgba(0,0,0,.08);

}

html{
scroll-behavior:smooth;
}

body{
background:var(--bg);
}

/* ==========================================
   MAP
========================================== */

#map{

height:700px;

width:100%;

z-index:1;

}

.leaflet-popup-content{

min-width:260px;

}

.popup-card img{

width:100%;

height:150px;

object-fit:cover;

border-radius:12px;

margin-bottom:10px;

}

.popup-title{

font-size:18px;

font-weight:700;

}

.popup-scientific{

font-style:italic;

color:#555;

margin-bottom:10px;

}

.popup-btn{

display:block;

background:#166534;

color:white;

padding:10px;

text-align:center;

border-radius:8px;

text-decoration:none;

margin-top:10px;

}

/* ==========================================
   GALLERY
========================================== */

.gallery-card{

background:white;

border-radius:16px;

overflow:hidden;

box-shadow:var(--shadow);

}

.gallery-image{

width:100%;

height:220px;

object-fit:cover;

display:block;

}

.gallery-caption{

padding:10px;

font-size:14px;

}

/* ==========================================
   HERITAGE CARDS
========================================== */

.heritage-card{

background:white;

border-radius:24px;

overflow:hidden;

box-shadow:var(--shadow);

transition:.25s;

}

.heritage-card:hover{

transform:translateY(-5px);

}

.heritage-card img{

width:100%;

height:220px;

object-fit:cover;

}

.heritage-card-content{

padding:20px;

}

/* ==========================================
   MODALS
========================================== */

.modal-show{

animation:
fadeIn .25s ease;

}

@keyframes fadeIn{

from{

opacity:0;

transform:scale(.95);

}

to{

opacity:1;

transform:scale(1);

}

}

/* ==========================================
   LEADERBOARD
========================================== */

#leaderboardTable tr:nth-child(even){

background:#f8fafc;

}

#leaderboardTable td{

padding:16px;

}

/* ==========================================
   FILTERS
========================================== */

select,
input{

outline:none;

}

select:focus,
input:focus{

border-color:#166534;

box-shadow:
0 0 0 3px
rgba(22,101,52,.15);

}

/* ==========================================
   LOADING
========================================== */

.loading{

display:flex;

align-items:center;

justify-content:center;

padding:40px;

}

.spinner{

width:40px;

height:40px;

border:4px solid #ddd;

border-top:4px solid #166534;

border-radius:50%;

animation:
spin 1s linear infinite;

}

@keyframes spin{

100%{

transform:
rotate(360deg);

}

}

/* ==========================================
   MOBILE
========================================== */

@media(max-width:768px){

#map{

height:500px;

}

.section-title{

font-size:1.6rem;

}

.hero-gradient h1{

font-size:2.4rem !important;

}

}

/* ==========================================
   LONG PRESS MENU
========================================== */

#longPressMenu{

position:fixed;

background:white;

padding:15px;

border-radius:16px;

box-shadow:var(--shadow);

z-index:99999;

display:none;

min-width:220px;

}

.longpress-option{

padding:10px;

border-radius:10px;

cursor:pointer;

}

.longpress-option:hover{

background:#f1f5f9;

}

/* ==========================================
   STATUS BADGES
========================================== */

.badge{

padding:5px 10px;

border-radius:999px;

font-size:12px;

font-weight:600;

}

.badge-pending{

background:#fef3c7;

color:#92400e;

}

.badge-verified{

background:#dcfce7;

color:#166534;

}

.badge-heritage{

background:#dbeafe;

color:#1d4ed8;

}

/* ==========================================
   QR
========================================== */

#qrcode canvas{

max-width:100%;

height:auto;

}