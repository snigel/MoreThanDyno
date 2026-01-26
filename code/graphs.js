let Marker = 'none' //“none”, “circle”, “square”, “triangle” and “cross”

function shiftGraph(vehicle) {
    //Shows all gears in different colors but without overlap.
    //Used to show when to shift.

    if(vehicle === undefined){
        return [];
    }

    let coordinates = getWheelThrust(vehicle);
    coordinates = removeGearOverlap(vehicle, coordinates);

    // Apply aero
    calcResistance(coordinates, vehicle, false);

    let gears = [];
    for (i = 0; i < coordinates.length; i+=1) {

        // Fix tooltips.
        for (j in coordinates[i]){
            label = vehicle.model
            label += ", gear " + (i+1) + ": "
            label += speed2rpm(vehicle, i, coordinates[i][j].x) + " rpm"
            label += " / " + Math.round(coordinates[i][j].x) + " km/h"
            coordinates[i][j].label = label
        }

        gears.push({
                    type: "line",
                    markerType: Marker,
                    toolTipContent: "{label}",
                    dataPoints: coordinates[i]
                });
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

            if(vehicle1[i].y <= 0){
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

            if(vehicle1[i].y <= 0){
                break;
                }    

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


    // Add v2 top speed to graph.
    if (v1 != v2 && vehicle1[j].y > 0){
        bs.push({
            "x":Math.round(v2.topSpeed),
            "y":0,
            "label":""
        })
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

function percentGraph2(v1, v2) {
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

    let bs = []
    
    // Loop over speed for vehicle 1.
    for (i = speedidx; i < vehicle1.length; i++){        
        done = false

        // Loop over speed for vehicle 2.
        for (j = 0; j < vehicle2.length; j++) {
            
            if (done == true){
                break;
            }

            // Special case, both vehicles have reached max speed.
            if(vehicle1[i].y == 0 && vehicle2[j].y == 0){
                if (Math.round(vehicle1[i].x) == Math.round(vehicle2[j].x)){
                    bs.push({
                        "x":Math.round(vehicle1[i].x),
                        "y":100,
                        "label":""
                    })
                }
                
                done = true 
            }

            // Break if vehicle 2 doesn't accelerate.
            if(vehicle2[j].y <= 0){
                break;
            }

            // If vehicle 2 and 1 is at the same speed:
            // Add the common speed to the graph.
            if (Math.round(vehicle2[j].x) == Math.round(vehicle1[i].x)){
                let power_delta = vehicle2[j].y / vehicle1[i].y
                bs.push({
                    "x":Math.round(vehicle1[i].x),
                    "y":Math.round(100*power_delta),
                    "label":""
                })
                done = true
                break;
            }

            // If vehicle 2 is faster than vehicle 1:
            // Create an interpolated point at vehicle 1's speed.
            if (Math.round(vehicle2[j].x) > Math.round(vehicle1[i].x)){

                if (j > 0){
                    interpolate_v2y = kxym(vehicle2, j, vehicle1[i].x)
                    let power_delta = interpolate_v2y / vehicle1[i].y

                    if (power_delta < 0){
                        break;
                    }

                    bs.push({
                        "x":Math.round(vehicle1[i].x),
                        "y":Math.round(100*power_delta),
                        "label":""
                    })
                }
                done = true
                break;
            }
        }
    }

    // Loop over vehicle 2 speed.
    done = false
    for (j = 0; j < vehicle2.length; j++){
        if(done == true){
            break;
        }

        // Break if vehicle 2 is not accelerating.
        if(vehicle2[j].y <= 0){
            break;
        }        
        // Loop over vehicle 1 speed.
        for (i = 0; i < vehicle1.length; i++) {

            // Break if vehicle 1 is not accelerating.
            if (Math.round(vehicle2[j].x) == Math.round(vehicle1[i].x)){
                break;
            }

            // If vehicle 2 is slower than vehicle 1.
            if (Math.round(vehicle2[j].x) < Math.round(vehicle1[i].x)){
                // If we're not at the first loop for behicle 1, interpolate. 
                if (i > 0){
                        interpolate_v1y = kxym(vehicle1, i, vehicle2[j].x)
                        let power_delta = vehicle2[j].y / interpolate_v1y 
                        
                        if (power_delta < 0){
                            break;
                        }

                        bs.push({
                            "x":Math.round(vehicle2[j].x),
                            "y":Math.round(100*power_delta),
                            "label":""
                        })
                }
                break;
            }
        }
    }



    // Sort ascending.
    bs.sort((a, b) => a.x - b.x);

    if (v1 === v2){
        return {
                type: "line",
                markerType: Marker,
                toolTipContent: v2.brand + " " + v2.model + " (reference): {x}km/h.",
                showInLegend:true, 
                legendText: v2.brand+" "+v2.model+" (reference)", 
                dataPoints: bs
                }
    }
    else {
        return {
                type: "line",
                markerType: Marker,
                toolTipContent: v2.brand + " " + v2.model + ": {y}% of " + v1.brand + " " + v1.model + " at {x}km/h.",
                showInLegend:true, 
                legendText: v2.brand+" "+v2.model, 
                dataPoints: bs
            }
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

    // Rounding.
    for (coord in coordinates) {
        coordinates[coord].x = Math.round(coordinates[coord].x * 100)/100
        coordinates[coord].y = Math.round(coordinates[coord].y * 100)/100
        coordinates[coord].label = ""
    }


    const filtered = coordinates.filter(obj => obj.x >= 40);

    return [
        { 
            type: "line",
            markerType: Marker,
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
        for (j in gear[i]){
            gear[i][j].x = Math.round(gear[i][j].x)
            gear[i][j].y = Math.round(gear[i][j].y)
            gear[i][j].label = ""
        }

        arr.push({
            type: "line",
            markerType: Marker,
            toolTipContent: vehicle.brand + " " + vehicle.model + ": {y}nm at {x}km/h",
            showInLegend:true,
            legendText: "Gear "+(i+1),
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
        var hp  = Math.round(vehicle.dynoRpm[i]*vehicle.torque[i]/7023.5);
        var rpm = Math.round(vehicle.dynoRpm[i]/norm);
        arr.push({
                    x: rpm,
                    y: hp, 
                    label: ""
                })
    }

    return [{
        type: "line",
        markerType: Marker,
        showInLegend:true,
        legendText: vehicle.brand + " " + vehicle.model,
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
        let trq = Math.round(vehicle.torque[i]);
        coordinates.push({x: rpm, y: trq, label: ""})
    }

    return [
        {
            type: "line",
            markerType: Marker,
            showInLegend:true, 
            legendText: vehicle.brand+" "+vehicle.model, 
            toolTipContent: tooltip, 
            dataPoints: coordinates
        }
    ];
}