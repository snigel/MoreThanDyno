function init(){
    fetchLocalStorage();
    updateAllDropdowns();
    initVehicles();
    setDefaultView();
}

function setDefaultView(){
    //Change showVehicle values to show different vehicles as default.

    document.getElementById("singleVehicle").options[3].selected = true;
    showVehicle(2);

    document.getElementById("compare1").options[1].selected = true;
    document.getElementById("compare2").options[2].selected = true;
    document.getElementById("compare3").options[3].selected = true;
    compareVehicles(0, 1, 2);

    document.getElementById("custom").options[1].selected = true;
    loadVehicleStats(0);
}

function updateAllDropdowns(){
    sortVehicles();
    updateDropdown(document.getElementById("singleVehicle"));
    updateDropdown(document.getElementById("custom"));
    updateDropdown(document.getElementById("compare1"));
    updateDropdown(document.getElementById("compare2"));
    updateDropdown(document.getElementById("compare3"));
}

function updateDropdown(select){
    //Used to update a single dropdown menu.
    purgeDropdown(select);

    for(i = 0; i < vehicles.length; i++){
        let option = document.createElement("OPTION");
        option.text = vehicles[i].brand+ " " + vehicles[i].model + " " + vehicles[i].year;
        option.value = i;
        select.add(option);
    }
}

function purgeDropdown(selectbox){
    for(i = selectbox.options.length-1; i >= 0; i--){
        selectbox.remove(i);
    }

    let emptyChoice = document.createElement("OPTION");
    emptyChoice.text = "Select a vehicle";
    emptyChoice.value = -1;
    emptyChoice.selectedIndex = 3;
    selectbox.add(emptyChoice);
}

function removeVehicle(vehicle){
    vehicles.splice(eval(vehicle.custom.value), 1);
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
    updateAllDropdowns();
}

function restoreDefaults(){
    localStorage.clear();
    location.reload();
}

function createChart(div, title, xtext, ytext, coordinates, min){

    let chart = new CanvasJS.Chart(div,
    {
        title:  { text: title, fontSize: 26},
        legend: { horizontalAlign: "center", verticalAlign: "bottom", fontSize: 15},
        axisX:  { minimum: 0,   title: xtext, titleFontSize: 18},
        axisY:  { minimum: min, title: ytext, titleFontSize: 18},
        data:   coordinates
    });

    chart.render();
}



function fetchLocalStorage() {
    let storage = JSON.parse(localStorage.getItem("vehicles"));

    //Check if storage exists before loading.
    if(storage != null ) {
        vehicles = storage;
    }
}

function showVehicle(v) {
    createChart("singleCompensated", "Optimal shifting.", "Speed in km/h", "Power in Gs", shiftGraph(vehicles[v], 1));
    createChart("singleGearing", "All gears", "Speed in km/h", "Power in newton", gearingGraph(vehicles[v]));
}

function compareVehicles(v1, v2, v3) {
    let coordinates;

    let weight = true;
    let aero = 1;
    coordinates = thrustGraph(vehicles[v1],weight,aero).concat(thrustGraph(vehicles[v2],weight,aero)).concat(thrustGraph(vehicles[v3],weight,aero));
    createChart("compareWeightAir", "Thrust compensated for weight and air resistance", "Speed in km/h", "Acceleration in G", coordinates, 0);

    weight = true;
    aero = 0;
    coordinates = thrustGraph(vehicles[v1],weight,aero).concat(thrustGraph(vehicles[v2],weight,aero)).concat(thrustGraph(vehicles[v3],weight,aero));
    createChart("compareWeight", "Thrust to weight ratio", "Speed in km/h", "Power in newton", coordinates);

    weight = false;
    aero = 0;
    coordinates = thrustGraph(vehicles[v1],weight,aero).concat(thrustGraph(vehicles[v2],weight,aero)).concat(thrustGraph(vehicles[v3],weight,aero));
    createChart("compareRaw", "Raw thrust", "Speed in km/h", "Power in newton", coordinates); 

    coordinates = torqueGraph(vehicles[v1], weight).concat(torqueGraph(vehicles[v2], 1)).concat(torqueGraph(vehicles[v3], 1));
    createChart("compareTrq", "Engine torque, normalized by rpm", "RPM", "Nm", coordinates);

    coordinates = hpGraph(vehicles[v1], 1).concat(hpGraph(vehicles[v2], 1)).concat(hpGraph(vehicles[v3], 1));
    createChart("compareHp", "Engine power, normalized by rpm", "RPM", "WHP", coordinates);

    coordinates = torqueGraph(vehicles[v1]).concat(torqueGraph(vehicles[v2])).concat(torqueGraph(vehicles[v3]));
    createChart("normTrq", "Engine torque", "RPM", "Nm", coordinates);

    coordinates = hpGraph(vehicles[v1]).concat(hpGraph(vehicles[v2])).concat(hpGraph(vehicles[v3]));
    createChart("normHp", "Engine power", "RPM", "WHP", coordinates);
}

function initVehicles(){
    //This function inits vehicle values that can be calculated.

    for (let i = 0; i < vehicles.length; i++){
        v = vehicles[i];

        //Convert lbft to nm when required.
        if(v.metric === false || v.metric == "false"){
            v.torque = lbft2Nm(v.dynoTorque);
        } else {
            v.torque = v.dynoTorque;
        }

        //Debug: report when values are mismatching.
        if(v.topSpeed > 0 && v.drag > 0){
            if(v.drag != Math.round(getVehicleDrag(v)*10000)/10000){
                console.log("Warning: " + v.model + " Drag is set to: " + v.drag + " but calculated drag is " + Math.round(getVehicleDrag(v)*10000)/10000 +
                " This may be correct if drag is known and the vehicle has a speed limiter or is limited by gearing.");
            }
        }

        //If top speed is missing.
        if(v.topSpeed == 0 && v.drag > 0){
            v.topSpeed = getVehicleTopSpeed(v, v.frontSprocket, v.rearSprocket);
        }

        //If drag is missing.
        if(v.drag == 0 && v.topSpeed > 0){
            v.drag = Math.round(getVehicleDrag(v)*10000)/10000;
        }

        //If rev limit is missing.
        if(v.revLimit == 0){
            v.revLimit = v.dynoRpm[v.dynoRpm.length-1];
            console.log(v.dynoRpm[v.dynoRpm.length-1] + " " + v.revLimit);
        }
    }
}

function loadVehicleStats(v1){
    let v = vehicles[v1];
    document.getElementById("brand").value =         v.brand;
    document.getElementById("model").value =         v.model;
    document.getElementById("year").value =          v.year;
    document.getElementById("frontSprocket").value = v.frontSprocket;
    document.getElementById("rearSprocket").value =  v.rearSprocket;
    document.getElementById("primary").value =       Math.round(v.primary * 1000)/1000;
    document.getElementById("gearbox").value =       roundArray(v.gearbox, 3).toString();
    document.getElementById("wetWeight").value =     v.wetWeight;
    document.getElementById("size").value =          v.wheel.size;
    document.getElementById("width").value =         v.wheel.width;
    document.getElementById("profile").value =       v.wheel.profile;
    document.getElementById("dynoRpm").value =       multiplyArray(v.dynoRpm,1/100).toString();
    document.getElementById("dynoTorque").value =    v.dynoTorque.toString(); //dynoTorque, not torque. raw values.
    document.getElementById("revLimit").value =      v.revLimit;
    document.getElementById("metric").value =        v.metric;
    document.getElementById("dynoSource").value =    v.dynoSource;
    document.getElementById("topSpeed").value =      v.topSpeed;
    document.getElementById("drag").value =          v.drag;





    //TODO: Remove this call.
    //topSpeed(v);
    
    let b = "<br>";
    let s = "&nbsp;&nbsp;&nbsp;&nbsp;"
    let str = "<h3>Calculated stats for: " + v.brand + " " + v.model + "</h3>";
    str += s + "Top speed: "       + Math.round(v.topSpeed) + " km/h at " + Math.round(speed2rpm(v, v.gearbox.length-1, v.topSpeed)) + " rpm." + b;
    str += s + "Rev limit: "       + Math.round(rpm2speed(v, v.gearbox.length-1, v.revLimit)) + " km/h at " + v.revLimit + " rpm." + b;
    str += s + "Drag (Cd*A): "     + v.drag + b;
    str += s + b;
    str += s + "Maximum power: "   + Math.round(rpm2hp(v, getMaxHpIndex(v))) + "hp at " + v.dynoRpm[getMaxHpIndex(v)] + "rpm." + b; 
    str += s + "Maximum torque: "  + Math.round(v.torque[getMaxTqIndex(v)]) + "nm at " + v.dynoRpm[getMaxTqIndex(v)] + " rpm."  + b;
    str += s + b;
    str += s + "When to shift:" + b;
    
    let coordinates = getWheelThrust(v);
    coordinates = removeGearOverlap(v, coordinates);

    for(let i=0; i < coordinates.length-1; i+=1){
        let speed = coordinates[i][coordinates[i].length-1].x;
        let rpm = speed2rpm(v, i, speed);
        str += s + (i+1) + " > " + (i+2) + " at " + Math.round(speed) + " km/h / " + Math.round(rpm) + " rpm" + b;
    }

    str += s + b;
    str +=s + "Effective gear ratios using " + v.frontSprocket + "/" + v.rearSprocket + ":" + b;
    for(let i=0; i < v.gearbox.length; i+=1){
        str += s + "Gear " + (i+1) + " - 1:" + Math.round(getGearRatio(v, i)*100)/100 + b;
    }

    document.getElementById("calculations").innerHTML = str;
    exportVehicle();
}

function writeVehicle(){
    //Saves a custom vehicle to local html5 storage.
    let brand =         document.getElementById("brand").value;
    let model =         document.getElementById("model").value;
    let year =          document.getElementById("year").value;
    let topSpeed =      document.getElementById("topSpeed").value;
    let frontSprocket = document.getElementById("frontSprocket").value;
    let rearSprocket =  document.getElementById("rearSprocket").value;
    let primary =       document.getElementById("primary").value;
    let gearbox =       JSON.parse("[" + document.getElementById("gearbox").value + "]");
    let wetWeight =     parseInt(document.getElementById("wetWeight").value);
    let size =          document.getElementById("size").value;
    let width =         document.getElementById("width").value;
    let profile =       document.getElementById("profile").value;
    let dynoSource =    document.getElementById("dynoSource").value;
    let dynoRpm =       multiplyArray(JSON.parse("[" + document.getElementById("dynoRpm").value + "]"), 100);
    let revLimit =      document.getElementById("revLimit").value;
    let metric =        document.getElementById("metric").value;
    let dynoTorque =    JSON.parse("[" + document.getElementById("dynoTorque").value + "]");
    let drag =          document.getElementById("drag").value;

    let v = {
        brand: brand, model: model, year: year, topSpeed: topSpeed, wetWeight: wetWeight, drag: drag,
        wheel: {size: size, width: width, profile: profile}, primary: primary,frontSprocket: frontSprocket, rearSprocket: rearSprocket,
        gearbox: gearbox, dynoSource: dynoSource, dynoRpm: dynoRpm, dynoTorque: dynoTorque, revLimit: revLimit, metric: metric
    };

    exportVehicle();
    vehicles.push(v);
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
    initVehicles();
    updateAllDropdowns();
}

function exportVehicle(){
    //This function shows vehicle data formatted so it can be added to motorcycles.js
    //For users so they can give their vehicle data to the maintainers.
    let brand =         document.getElementById("brand").value;
    let model =         document.getElementById("model").value;
    let year =          document.getElementById("year").value;
    let topSpeed =      document.getElementById("topSpeed").value;
    let drag =          document.getElementById("drag").value;
    let frontSprocket = document.getElementById("frontSprocket").value;
    let rearSprocket =  document.getElementById("rearSprocket").value;
    let primary =       document.getElementById("primary").value;
    let gearbox =       document.getElementById("gearbox").value;
    let wetWeight =     document.getElementById("wetWeight").value;
    let size =          document.getElementById("size").value;
    let width =         document.getElementById("width").value;
    let profile =       document.getElementById("profile").value;
    let dynoSource =    document.getElementById("dynoSource").value;
    let dynoRpm =       multiplyArray(JSON.parse("[" + document.getElementById("dynoRpm").value + "]"), 100).toString();
    let dynoTorque =    JSON.parse("[" + document.getElementById("dynoTorque").value + "]").toString();
    let revLimit =      document.getElementById("revLimit").value;
    let metric =        document.getElementById("metric").value;

    let b = "<br>";
    let s = "&nbsp;&nbsp;&nbsp;&nbsp;"
    let str = "<h3>Export vehicle stats:</h3>" + b;
    str += "{"+b;
    str += s+"brand: \""   + brand     + "\"," + b;
    str += s+"model: \""   + model     + "\"," + b;
    str += s+"year: \""    + year      + "\"," + b;
    str += s+"topSpeed: "  + topSpeed  + "," + b;
    str += s+"drag: "      + drag  + "," + b;
    str += s+"wetWeight: " + wetWeight + "," + b;
    str += b;
    str += s+"wheel:" + b;
    str += s+"{"      + b;
    str += s+s+"size: "    + size    + "," + b;
    str += s+s+"width: "   + width   + "," + b;
    str += s+s+"profile: " + profile + b;
    str += s+"}," + b;
    str += b;
    str += s+"primary: "       + primary    + "," + b;
    str += s+"frontSprocket: " + frontSprocket    + "," + b;
    str += s+"rearSprocket: "  + rearSprocket     + "," + b;
    str += s+"gearbox: "    + "[" + gearbox    + "]" + "," + b;
    str += b;
    str += s+"dynoRpm: "    + "[" + dynoRpm    + "]" + "," + b;
    str += s+"dynoTorque: " + "[" + dynoTorque + "]" + b;
    str += s+"revLimit: "      + revLimit   + b;
    str += s+"metric: "        + metric     + b;
    str += s+"dynoSource: \""  + dynoSource + "\"" + "," + b;
    str += "}";
    document.getElementById("export").innerHTML = str;
}
