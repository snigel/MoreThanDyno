function shiftGraph(vehicle, aero) {
    //Shows all gears in different colors but without overlap.
    //Used to show when to shift.

    if(vehicle === undefined){
        return [];
    }

    let coordinates = getWheelThrust(vehicle);
    coordinates = removeGearOverlap(vehicle, coordinates);

    if(aero){ //TODO: What's going on here?
        calcResistance(coordinates, vehicle, false);
    }

    let gears = [];
    for (i = 0; i < coordinates.length; i+=1) {
        gears.push({type: "line", dataPoints: coordinates[i]});
    }
    return gears;
}

function percentGraph(v1, v2) {
        // Find index when vehicle 1 is faster than vehicle 2.

    if (v1 === undefined || v2 === undefined){
        return {}
    }
    if (v1.topSpeed < 1 || v2.topSpeed < 1){
        return {}
    }

    weight=true
    aero=true
    vehicle1 = thrustGraph(v1,weight,aero)[0].dataPoints
    vehicle2 = thrustGraph(v2,weight,aero)[0].dataPoints

    // Add coordinates to new vehicle
    let speedidx = 0;
/*     for (i = speedidx; speedidx < vehicle1.length; speedidx++){
        if (vehicle1[speedidx].x > vehicle2[0].x){
            break
        }
    } */

    let bs = []
    
    for (i = speedidx; i < vehicle1.length; i++){        
        done = false
        for (j = 0; j < vehicle2.length; j++) {
            
            if (done == true){
                break;
            }

            if(vehicle2[j].y <= 0){
                break;
            }

            if (Math.round(vehicle2[j].x) == Math.round(vehicle1[i].x)){
                let power_delta = vehicle2[j].y / vehicle1[i].y
                if (vehicle2[j].x < 34)
                    console.log(vehicle2[j].y, vehicle1[i].y, "native", power_delta, vehicle2[j].x, vehicle1[i].x)
                bs.push({
                    "x":Math.round(vehicle1[i].x),
                    "y":Math.round(100*power_delta)/100,
                    "label":""
                })
                done = true
                break;
            }

            if (Math.round(vehicle2[j].x) > Math.round(vehicle1[i].x)){

                if (j > 0){
                    interpolate_v2y = kxym(vehicle2, j, vehicle1[i].x)
                    let power_delta = interpolate_v2y / vehicle1[i].y

                    if (power_delta < 0){
                        break;
                    }
                    if (vehicle2[j].x < 34)
                        console.log(vehicle2[j].y,interpolate_v2y, "interp v1", power_delta, vehicle2[j].x, vehicle1[i].x)
                    bs.push({
                        "x":Math.round(vehicle1[i].x),
                        "y":Math.round(100*power_delta)/100,
                        "label":""
                    })
                }
                done = true
                break;
            }
        }
    }

    for (j = 0; j < vehicle2.length; j++){
        if(vehicle2[j].y <= 0){
            break;
        }        
        for (i = 0; i < vehicle1.length; i++) {

            if (Math.round(vehicle2[j].x) == Math.round(vehicle1[i].x)){
                break;
            }

            if (Math.round(vehicle2[j].x) < Math.round(vehicle1[i].x)){

                if (i > 0){
                    interpolate_v1y = kxym(vehicle1, i, vehicle2[j].x)
                    let power_delta = vehicle2[j].y / interpolate_v1y 
                    
                    if (power_delta < 0){
                        break;
                    }
                    if (vehicle2[j].x < 34)
                        console.log(interpolate_v1y, vehicle1[i].y, "interp v3", power_delta, vehicle2[j].x, vehicle1[i].x)
                    bs.push({
                        "x":Math.round(vehicle2[j].x),
                        "y":Math.round(100*power_delta)/100,
                        "label":""
                    })
                }
                break;
            }
        }
    }
    // Ascending
    bs.sort((a, b) => a.x - b.x);


    return {
            type: "line", 
            toolTipContent: v2.brand + " " + v2.model + ": {y}x acceleration at {x}km/h.",
            showInLegend:true, 
            legendText: v2.brand+" "+v2.model, 
            dataPoints: bs
        }
}

function thrustGraph(vehicle, calcWeight, calcAero) {

    // If no vehicle or aero calculations without drag set, return.
    if(vehicle === undefined || (calcAero && vehicle.drag == 0)){
        console.log("Shouldn't be here.")
        return [];
    }

    let coordinates = getWheelThrust(vehicle);
    coordinates = removeGearOverlap(vehicle, coordinates);

    // Calculate resistance if weight is set.
    // Aero calculations are optional.
    if(calcWeight){ 
        calcResistance(coordinates, vehicle, calcAero);
    }

    coordinates = concatGears(coordinates);

    const filtered = coordinates.filter(obj => obj.x >= 40);

    return [
        { 
            type: "line", 
            toolTipContent: vehicle.brand + " " + vehicle.model + ": {y} at {x}km/h",
            showInLegend: true,
            legendText: vehicle.brand + " " + vehicle.model,
            dataPoints: filtered
        }
    ];                
}

function compareGraph(vehicle, calcWeight, calcAero) {
    if(vehicle === undefined || (calcAero && vehicle.drag == 0)){
        return [];
    }
}

function gearingGraph(vehicle) {
    // Shows thrust for all gears, for a single vehicle.
    // Gears are not concatenated.

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
            dataPoints: gear[i],
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
        norm = (maxrpm/10000);
        tooltip = "{y} nm at {x}% of max rpm."
    }

    var coordinates = [];
    for (let i = 0; i < vehicle.dynoRpm.length; i+=1) {
        let rpm = Math.round(vehicle.dynoRpm[i] / norm);
        let trq = Math.round(vehicle.torque[i] * norm);
        coordinates.push({x: rpm, y: trq, label: ""})
    }

    return [
        {
            type: "line", 
            showInLegend:true, 
            legendText: vehicle.brand+" "+vehicle.model+" Torque", 
            toolTipContent: tooltip, 
            dataPoints: coordinates
        }
    ];
}