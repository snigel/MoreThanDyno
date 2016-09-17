function restoreDefaults(){
    localStorage.clear();
    location.reload();
}

function cleanSelect(selectbox){
    var i;
    for(i = selectbox.options.length-1; i >= 0; i--){
        selectbox.remove(i);
    }

    var emptyChoice = document.createElement("OPTION");
    emptyChoice.text = "Select a vehicle";
    emptyChoice.value = -1;
    emptyChoice.selectedIndex = 3;
    selectbox.add(emptyChoice);
}

function fillSelect(select){
    cleanSelect(select);

    for(i = 0; i < motorcycles.length; i++){
        var option = document.createElement("OPTION");
        option.text = motorcycles[i].brand+ " " + motorcycles[i].model + " " + motorcycles[i].year;
        option.value = i;
        select.add(option);
    }
}

function removeBike(bike){
    var mc = eval(bike.custom.value);
    motorcycles.splice(mc, 1);
    localStorage.setItem("mc", JSON.stringify(motorcycles));
    updateDropdown();
}

function updateDropdown(){
    sortMotorcycles();
    fillSelect(document.getElementById("singleBike"));
    fillSelect(document.getElementById("custom"));
    fillSelect(document.getElementById("compare1"));
    fillSelect(document.getElementById("compare2"));
    fillSelect(document.getElementById("compare3"));
}

function createChart(div, title, xtext, ytext, data){
    var chart = new CanvasJS.Chart(div,
    {
        title:{text: title, fontSize: 26},
        legend: {horizontalAlign: "center", verticalAlign: "bottom",fontSize: 15},
        axisX:{ minimum: 0, title: xtext, titleFontSize: 18},
        axisY:{ minimum: 0, title: ytext, titleFontSize: 18},
        data: data
    });

    chart.render();
}

function setDefaultView(){
    document.getElementById("singleBike").options[3].selected = true;
    showBike(2);

    document.getElementById("compare1").options[1].selected = true;
    document.getElementById("compare2").options[2].selected = true;
    document.getElementById("compare3").options[3].selected = true;
    compareBikes(0,1,2);
}

function fetchLocalStorage(){
    var mc = JSON.parse(localStorage.getItem("mc"));

    //If local storage is not empty, use defaults.
    if(mc != null ) {
        motorcycles = mc;
    }
}

function showBike(mc) {
    createChart("singleCompensated", "Optimal gearing & acceleration", "Speed in km/h", "Acceleration in Gs", getMCfor(motorcycles[mc],1));
    createChart("singleGearing", "Gearing", "Speed in km/h", "Power in newton", getMCgearing(motorcycles[mc]));
}

function compareBikes(mc1,mc2,mc3) {
    var data;

    data = getMC(motorcycles[mc1],1).concat(getMC(motorcycles[mc2],1)).concat(getMC(motorcycles[mc3],1));
    createChart("compareCompensated", "Vehicle acceleration", "Speed in km/h", "Acceleration in Gs", data);

    data = getMC(motorcycles[mc1]).concat(getMC(motorcycles[mc2])).concat(getMC(motorcycles[mc3]));
    createChart("compareRaw", "Vehicle thrust", "Speed in km/h", "Power in newton", data); 

    data = getMCtrq(motorcycles[mc1], 1).concat(getMCtrq(motorcycles[mc2], 1)).concat(getMCtrq(motorcycles[mc3], 1));
    createChart("compareTrq", "Engine torque, normalized", "RPM", "Nm", data);

    data = getMCpow(motorcycles[mc1],1).concat(getMCpow(motorcycles[mc2],1)).concat(getMCpow(motorcycles[mc3],1));
    createChart("compareHp", "Engine power, normalized", "RPM", "WHP", data);

    data = getMCtrq(motorcycles[mc1]).concat(getMCtrq(motorcycles[mc2])).concat(getMCtrq(motorcycles[mc3]));
    createChart("normTrq", "Engine torque", "RPM", "Nm", data);

    data = getMCpow(motorcycles[mc1]).concat(getMCpow(motorcycles[mc2])).concat(getMCpow(motorcycles[mc3]));
    createChart("normHp", "Engine power", "RPM", "WHP", data);
}

function createCustom(bike){
    var mc = eval(bike.custom.value);

    document.getElementById("brand").value = motorcycles[mc].brand;
    document.getElementById("model").value = motorcycles[mc].model;
    document.getElementById("year").value = motorcycles[mc].year;
    document.getElementById("frontSprocket").value = motorcycles[mc].frontSprocket;
    document.getElementById("rearSprocket").value = motorcycles[mc].rearSprocket;
    document.getElementById("primary").value = Math.round(motorcycles[mc].primary * 1000)/1000;
    document.getElementById("gearbox").value = roundAll(motorcycles[mc].gearbox, 3).toString();
    document.getElementById("wetWeight").value = motorcycles[mc].wetWeight;
    document.getElementById("size").value = motorcycles[mc].wheel.size;
    document.getElementById("width").value = motorcycles[mc].wheel.width;
    document.getElementById("profile").value = motorcycles[mc].wheel.profile;
    document.getElementById("dynorpm").value = multiplyAll(motorcycles[mc].dynorpm,1/100).toString();
    document.getElementById("dynotorque").value = roundAll(motorcycles[mc].dynotorque).toString();
    document.getElementById("dynosource").value = motorcycles[mc].dynosource;
    document.getElementById("topSpeed").value = motorcycles[mc].topSpeed;
    document.getElementById("drag").value = motorcycles[mc].drag;
    exportVehicle();
}

function writeBike(){
    var brand = document.getElementById("brand").value;
    var model = document.getElementById("model").value;
    var year = document.getElementById("year").value;
    var topSpeed = document.getElementById("topSpeed").value;
    var frontSprocket = document.getElementById("frontSprocket").value;
    var rearSprocket = document.getElementById("rearSprocket").value;
    var primary = document.getElementById("primary").value;
    var gearbox = JSON.parse("[" + document.getElementById("gearbox").value + "]");
    var wetWeight = parseInt(document.getElementById("wetWeight").value);
    var size = document.getElementById("size").value;
    var width = document.getElementById("width").value;
    var profile = document.getElementById("profile").value;
    var dynosource = document.getElementById("dynosource").value;
    var dynorpm = multiplyAll(JSON.parse("[" + document.getElementById("dynorpm").value + "]"), 100);
    var dynotorque = JSON.parse("[" + document.getElementById("dynotorque").value + "]");
    var topSpeed = document.getElementById("topSpeed").value;
    var drag = parseFloat(document.getElementById("drag").value);

    var moto = {
        brand: brand, model: model, year: year, topSpeed: topSpeed, wetWeight: wetWeight, drag: drag,
        wheel: {size: size, width: width, profile: profile}, primary: primary,frontSprocket: frontSprocket, rearSprocket: rearSprocket,
        gearbox: gearbox, dynosource: dynosource, dynorpm: dynorpm, dynotorque: dynotorque
    };

    exportVehicle();
    motorcycles.push(moto);
    localStorage.setItem("mc", JSON.stringify(motorcycles));
    updateDropdown();
}

function exportVehicle(){
    var brand = document.getElementById("brand").value;
    var model = document.getElementById("model").value;
    var year = document.getElementById("year").value;
    var topSpeed = document.getElementById("topSpeed").value;
    var frontSprocket = document.getElementById("frontSprocket").value;
    var rearSprocket = document.getElementById("rearSprocket").value;
    var primary = document.getElementById("primary").value;
    var gearbox = document.getElementById("gearbox").value;
    var wetWeight = parseInt(document.getElementById("wetWeight").value);
    var size = document.getElementById("size").value;
    var width = document.getElementById("width").value;
    var profile = document.getElementById("profile").value;
    var dynosource = document.getElementById("dynosource").value;
    var dynorpm =  multiplyAll(JSON.parse("[" + document.getElementById("dynorpm").value + "]"), 100).toString();
    var dynotorque = JSON.parse("[" + document.getElementById("dynotorque").value + "]").toString();
    var topSpeed = document.getElementById("topSpeed").value;
    var drag = parseInt(document.getElementById("drag").value);

    var b = "<br>";
    var s = "&nbsp;&nbsp;&nbsp;&nbsp;"
    var str = "<h3>Export vehicle stats:</h3>" + b;
    str += "{"+b;
    str += s+"brand: \"" + brand + "\"," + b;
    str += s+"model: \"" + model + "\"," + b;
    str += s+"year: \"" + year + "\"," + b;
    str += s+"topSpeed: " + topSpeed + "," + b;
    str += s+"wetWeight: " + wetWeight + "," + b;
    str += s+"drag: " + drag + "," + b;
    str += b;
    str += s+"wheel:" + b;
    str += s+"{" + b;
    str += s+s+"size: " + size + "," + b;
    str += s+s+"width: " + width + "," + b;
    str += s+s+"profile: " + profile + b;
    str += s+"}," + b;
    str += b;
    str += s+"primary: " + primary + "," + b;
    str += s+"frontSprocket: " + frontSprocket + "," + b;
    str += s+"rearSprocket: " + rearSprocket + "," + b;
    str += s+"gearbox: " + "[" + gearbox + "]" + "," + b;
    str += b;
    str += s+"dynosource: \"" + dynosource + "\"" + "," + b;
    str += s+"dynorpm: " + "[" + dynorpm + "]" + "," + b;
    str += s+"dynotorque: " +  "[" + dynotorque + "]" + b;
    str += "}";
    document.getElementById("export").innerHTML = str;
}
