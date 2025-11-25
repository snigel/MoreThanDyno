var driverWeight =  85; //Body+gear

function sortVehicles(){
    vehicles.sort(function(a, b){
        if(a.brand < b.brand) return -1;
        if(a.brand > b.brand) return  1;
        if(a.model < b.model) return -1;
        if(a.model > b.model) return  1;
        return 0;
    });
}

var vehicles =  [
{
    brand: "Kawasaki",
    model: "er6",
    year:  "2009-2011",
    topSpeed: 210,
    wetWeight: 210,
    drag: 0,

    wheel: {
        size:    17,
        width:   160,
        profile: 60
    },

    primary: 88/42,
    frontSprocket: 15,
    rearSprocket: 46,
    gearbox: [39/16, 36/21, 32/24, 30/27, 28/29, 23/27],

    dynoSource: "http://i.imgur.com/brqZWe4.png",
    dynoRpm:    [2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000,10500,11000],
    dynoTorque: [44, 48, 53, 54.5, 53.5, 53, 53, 56, 58, 61, 62.5, 60.5, 57.5, 55, 51, 45.5, 43, 36],
    revLimit: 0,
    metric: true
},
{
    brand: "Honda",
    model: "F4i",
    year:  "2001-2006",
    topSpeed:  250,
    wetWeight:  193,
    drag:  0,

    wheel: {
        size:    17,
        width:   180,
        profile: 55
    },

    primary: 1.822,
    frontSprocket: 16,
    rearSprocket:  46,
    gearbox:  [2.833, 2.062, 1.647, 1.421, 1.272, 1.173],

    dynoSource:  "http://www.areapnolimits.com/images/product/cbr600f4i_dyno_big.gif, http://image.sportrider.com/f/8831852/dyno-2001-hon-f4i.gif",
    dynoRpm:     [2000,  2500,  3000,  3500,  4000,  4500,  5000,  5500,  6000,  6500,  7000,  7500,  8000,  8500,  9000,  9500,  10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000],
    dynoTorque:  [20,22,25,26,27,28,31,31,34,36,37,38,39,39,39,40,41,41,41,40,40,37,35,34,31],
    revLimit: 14250,
    metric: false
},
{
    brand: "Kawasaki",
    model: "z750",
    year:  "2002",
    wetWeight: 226,
    topSpeed:  235,
    drag: 0,

    wheel: {
        size:    17,
        width:   180,
        profile: 55
    },

    primary: 1.822,
    frontSprocket: 16,
    rearSprocket:  46,
    gearbox:  [2.833, 2.062, 1.647, 1.421, 1.272, 1.173],

    dynoSource:  "http://www.motopissaris.gr/products_img/1341058308_3.jpg",
    dynoRpm:     [2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000,10500,11000,11500,12000],
    dynoTorque:  [42, 48, 56, 58, 59, 60, 61, 62, 64, 65, 68, 70, 71, 70, 68, 66, 65, 60, 54, 52],
    revLimit: 12500,
    metric: true
},
{
    brand: "Yamaha",
    model: "FZ6",
    year:  "2007-2009",
    wetWeight: 208,
    topSpeed:  0,
    drag: 0,

    wheel: {
        size:    17,
        width:   180,
        profile: 55
    },

    primary: 1.955,
    frontSprocket: 15,
    rearSprocket:  46,
    gearbox:  [37/13, 1.947, 1.556, 4/3, 1.19, 1.083],

    dynoSource:  "http://www.600riders.com/forum/attachments/fz6-general-discussion/19109d1247084747-stock-fz6-dyno-figures-rear-wheel-vs-honda-599-suzi-sv650-kwaka-ninja-650r-er6n-triumph-speed-triple-aprillia-shiver-suzi-gladius-fz6stockdyno-jpg",
    dynoRpm:     [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000,10500,11000,11500,12000,12500,13000,13500],
    dynoTorque:  [26,32,34,34,37,35,34,36,37,38,42,40,41,43,44,43,42,41,39,37,34,32],
    revLimit: 0,
    metric: false
},
{
    brand: "Honda",
    model: "VFR800",
    year:  "2007",
    topSpeed:  230,
    wetWeight: 240,
    drag: 0,

    wheel: {
        size:    17,
        width:   180,
        profile: 55
    },

    primary: 159/82,
    frontSprocket: 15,
    rearSprocket:  43,
    gearbox: [37/13, 33/16, 30/19, 31/24, 30/27, 28/29],

    dynoSource:  "http://www.galasz.dk/wp-content/uploads/2007_VFR800ABS_Dyno.jpg",
    dynoRpm:     [2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000,10500,11000,11500,12000],
    dynoTorque:  [30,42,44,43,43,44,45,47,47,52,54,54,55,55,53,52,51,49,46,43],
    revLimit: 0,
    metric: false
},
{
    brand: "Honda",
    model: "Goldwing GL1800",
    year:  "2009",
    topspeed:   202,
    wetWeight : 410,
    drag: 0,

    wheel: {
        size:    16,
        width:   180,
        profile: 60
    },

    primary:  1.5476,
    frontSprocket: 1,
    rearSprocket:  2.750,
    gearbox: [2.375, 1.454, 1.068, 0.843, 0.685],

    dynoSource: "http://www.ridermagazine.com/wp-content/uploads/2009/02/2009-Honda-Gold-Wing-Motorcycle-Test-Drevenstedt-131.jpg",
    dynoRpm:    [1500, 2000, 2500, 3000, 3500,  4000,  4500,  5000,  5500,  6000, 6500],
    dynoTorque: [80,90,95,98,101,106,104,102,100,98,79],
    revLimit: 0,
    metric: false
},
{
    brand:  "BMW",
    model:  "s1000rr",
    year:  "2009-2011",
    topSpeed:  304,
    wetWeight: 208,
    drag: 0,

    wheel: {
        size:    17,
        width:   190,
        profile: 55
    },

    primary:  1.652,
    frontSprocket: 17,
    rearSprocket:  44,
    gearbox: [2.6471, 2.091, 1.727, 1.5, 1.360, 1.261],

    dynoSource: "http://www.motorcyclenews.com/upload/261608/images/new-curves.jpg",
    dynoRpm:    [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000],
    dynoTorque: [22,44,45,52,55,60,60,58,58,60,65,70,71,73,75,79,79, 80, 80, 80, 78, 76, 75, 70,66],
    revLimit: 14250,
    metric: false
},
{
    brand: "KTM",
    model: "690 Duke",
    year:  "2008-2011",
    topSpeed:  0,
    wetWeight:  160.6,
    drag: 0,

    wheel: {
        size:    17,
        width:   160,
        profile: 60
    },

    primary:  8/4,
    frontSprocket: 14,
    rearSprocket:  45,
    gearbox:  [35/14, 28/16, 28/21, 23/21, 22/23, 20/23],

    dynoSource:  "http://www.tuneboy.com.au/images/690_Remap.jpg",
    dynoRpm:     [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500],
    dynoTorque:  [40,45,45,52,54,61,57,57,56,53,49,46],
    revLimit: 0,
    metric: false
},
{
    brand: "Honda",
    model: "CBR600FA",
    year: "2010-2013",
    topSpeed:  240,
    wetWeight: 211,
    drag: 0,

    wheel: {
        size:    17,
        width:   180,
        profile: 55
    },

    primary: 76/36,
    frontSprocket: 16,
    rearSprocket: 45,
    gearbox: [33/12, 31/16, 28/18, 31/23, 29/24, 23/21],

    dynoSource: "",
    dynoRpm:    [3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000,10500,11000,11500,12000,12500,13000,13500],
    dynoTorque: [36,38,42,45,45,47,46,47,50,52,54,55,56,57,59,60,59,58,57,54,52,50,47],
    revLimit: 13500,
    metric: true
},
{
    brand: "Mazda",
    model: "Miata 1.6l",
    year: "90-93",
    topSpeed: 203,
    wetWeight: 940,
    drag: 0,

    wheel: {
        size: 14,
        width: 185,
        profile: 60
    },

    primary: 4.3,
    frontSprocket: 1,
    rearSprocket: 1,
    gearbox: [3.163, 1.888, 1.333, 1, 0.814],

    dynoSource: "http://www.flyinmiata.com/tech/dyno_runs/Stinky_091900.pdf",
    dynoRpm:    [1500,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7250],
    dynoTorque: [75,78,81,83,83,84,84,84,83,82,75,69,65],
    revLimit: 7250,
    metric: false
},
{
    brand: "Ducati",
    model: "Streetfighter 1098 (IBC race map)",
    year: "2009-2013",
    topSpeed: 260,
    wetWeight: 197,
    drag: 0,

    wheel: {
        size: 17,
        width: 190,
        profile: 55
    },

    primary: 1.84,
    frontSprocket: 15,
    rearSprocket: 38,
    gearbox: [2.467,1.765,1.4,1.182,1.043,0.958],

    dynoSource: "http://s2.postimg.org/3z5b9nr1l/Streetfighter_dyno.jpg",
    dynoRpm:    [4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000,10500],
    dynoTorque: [97,98,97,98,106,113,115,119,121,119,117,115,110,102],
    revLimit: 0,
    metric: true
},
{
    brand: "Toyota",
    model: "Landcruiser 4.2",
    year: "99",
    topSpeed: 160,
    wetWeight: 2650,
    drag: 0,

    wheel:
    {
        size: 16,
        width: 275,
        profile: 70
    },

    primary: 4.1,
    frontSprocket: 1,
    rearSprocket: 1,
    gearbox: [4.529,2.464,1.49,1,0.811],

    dynoSource: "",
    dynoRpm: [1500,1750,2000,2200,2500,3000,3600,4000,4400],
    dynoTorque: [270,278,280,285,280,270,250,240,210],
    revLimit: 0,
    metric: true
},
{
    brand: "Tesla",
    model: "S P85D",
    year:  "2012",
    topSpeed:  0,
    wetWeight: 2239,
    drag: 0.562,

    wheel:
    {
        size:    19,
        width:   245,
        profile: 45
    },

    primary: 1,
    frontSprocket: 1,
    rearSprocket:  9.73,
    gearbox: [1],

    dynoSource: "http://i.imgur.com/X7RVCdV.png",
    dynoRpm: [100,500,1000,1500,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000,10500,11000,11500,12000,12500,13000,13500,14000,14500,15000,15500,16000,16500,17000,17500,18000,18200],
    dynoTorque: [600,600,600,600,600,600,600,600,600,600,600,560,500,460,420,387,360,345,325,275,250,225,205,183,170,155,150,137,126,120,110,105,100,95,90,85,80,78],
    revLimit: 0,
    metric: true
},
{
    brand: "Volkswagen",
    model: "Passat 2.0 DSG6",
    year:  "2014",
    topSpeed:  0,
    wetWeight: 1406,
    drag: 0,

    wheel:
    {
        size: 18,
        width: 225,
        profile: 45
    },

    primary: 1,
    frontSprocket: 1,
    rearSprocket: 1,
    gearbox: [14.26,8.45,5.36,3.71,2.86,2.39 ],

    dynoSource: "http://www.automobile-catalog.com/curve/2014/1586750/audi_a4_2_0_tdi_177_quattro.html",
    dynoRpm: [1000,1500,2000,2500,3000,3500,4000,4500],
    dynoTorque: [220,360,380,380,370,351,312,265],
    revLimit: 0,
    metric: true
},
{
    brand: "Suzuki",
    model: "GSX-R 1000",
    year: "2007-2008",
    topSpeed: 299,
    wetWeight: 208,
    drag: 0,

    wheel:
    {
        size: 17,
        width: 190,
        profile: 50
    },

    primary: 1.553,
    frontSprocket: 17,
    rearSprocket: 43,
    gearbox: [2.563,2.053,1.714,1.5,1.36,1.269],

    dynoSource: "http://www.motorcyclenews.com/upload/261608/images/new-curves.jpg",
    dynoRpm: [3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000,10500,11000,11500,12000,12500,13000,13200],
    dynoTorque: [70,78,74,81,88,90,93,97,100,102,104,106,106,107,106,106,104,102,100,95,91,87],
    revLimit: 13200,
    metric: true
}
];
