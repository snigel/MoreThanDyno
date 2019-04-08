function shiftGraph(vehicle, aero) {
    //Shows all gears in different colors but without overlap.
    //Used to show when to shift.

    if(vehicle === undefined){
        return [];
    }

    let coordinates = getWheelThrust(vehicle);
    coordinates = removeGearOverlap(vehicle, coordinates);

    if(aero == 1){
        calcResistance(coordinates, vehicle, false);
    }

    let gears = [];
    for (i = 0; i < coordinates.length; i+=1){
        gears.push({type: "line", dataPoints: coordinates[i]});
    }
    return gears;
}

function thrustGraph(vehicle, calcWeight, calcAero) {

    if(vehicle === undefined || calcAero && vehicle.drag == 0){
        return [];
    }

    let coordinates = getWheelThrust(vehicle);
    coordinates = removeGearOverlap(vehicle, coordinates);

    if(calcWeight){
        calcResistance(coordinates, vehicle, calcAero);
    }

    coordinates = concatGears(coordinates);

    return [
        {type: "line", toolTipContent: "{label}", showInLegend: true, legendText: vehicle.brand+" "+vehicle.model, dataPoints: coordinates}
    ];                
}

function gearingGraph(vehicle) {
    //Shows thrust for all gears, for a single vehicle.
    //Gears are not concatenated.

    if(vehicle === undefined){
        return [];
    }

    var gear = getWheelThrust(vehicle);
    var arr = [];

    var i;
    for (i = 0; i < vehicle.gearbox.length; i++) {
        arr.push({
            type: "line",
            showInLegend:true,
            legendText: "Gear "+(i+1),
            toolTipContent: "{label}", 
            dataPoints: gear[i]
        });
    }

    return arr;
}

function hpGraph(vehicle, norm) {
    //Returns raw engine hp/rpm or using a normalizing gearbox.

    if(vehicle === undefined){
        return [];
    }

    if(norm === undefined){
        norm = 1;
        var tooltip = "{y} HP at {x} RPM";
    }else{
        var maxrpm = vehicle.dynoRpm[vehicle.dynoRpm.length-1];
        norm = (maxrpm/100);
        tooltip = "{y} HP at {x}% of max rpm."
    }

    var i;
    var arr = [];
    for (i = 0; i < vehicle.dynoRpm.length; ++i) {
        var hp = Math.round(vehicle.dynoRpm[i]*vehicle.torque[i]/7023.5);
        var rpm = Math.round(vehicle.dynoRpm[i]/norm);
        arr.push({x: rpm, y: hp, label: ""})
    }

    return [{
        type: "line",
        showInLegend:true,
        legendText: vehicle.brand + " " + vehicle.model + " Power",
        toolTipContent: tooltip,
        dataPoints: arr
    }];
}

function torqueGraph(vehicle, norm) {
    //Returns raw engine torque/rpm or using a normalizing gearbox.

    if(vehicle === undefined){
        return [];
    }

    //If normalization isn't used, it's 1.
    if(norm === undefined){
        norm = 1;
        var tooltip = "{y} nm at {x} RPM";
    } else {
        let maxrpm = vehicle.dynoRpm[vehicle.dynoRpm.length-1];
        norm = (maxrpm/100);
        tooltip = "{y} nm at {x}% of max rpm."
    }

    var coordinates = [];
    for (let i = 0; i < vehicle.dynoRpm.length; i+=1) {
        let rpm = Math.round(vehicle.dynoRpm[i] / norm);
        let trq = Math.round(vehicle.dynoTorque[i] * norm);
        coordinates.push({x: rpm, y: trq, label: ""})
    }

    return [
        {type: "line", showInLegend:true, legendText: vehicle.brand+" "+vehicle.model+" Torque", toolTipContent: tooltip, dataPoints: coordinates}
    ];
}