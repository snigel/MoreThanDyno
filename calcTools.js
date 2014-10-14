function cleanFront(gearx, geary){
    var tempgear = gearx.slice();

    var index;
    for (index = 0; index < gearx.length; ++index) {
        var speed_h = gearx[index].x;
        var power_h = gearx[index].y;

        var lindex;
        for(lindex = 0; lindex < geary.length; ++lindex){
            var speed_l = geary[lindex].x;

            if(speed_l >= speed_h){
                var sindex = tempgear.indexOf(gearx[index]);
                if (lindex!= 0 && geary[lindex-1].y > power_h && geary[lindex-1].x < speed_h){
                    tempgear.splice(sindex,1);
                }
                if(lindex == 0){
                    tempgear.splice(sindex,1);
                }
            }
        }
    }
    return tempgear;
}

function cleanTail(gearx, geary){
    var tempgear = gearx.slice();

    var index;
    for (index = 0; index < gearx.length; ++index) {
        var speed_l = gearx[index].x;
        var power_l= gearx[index].y;

        var lindex;
        for(lindex = 0; lindex < geary.length; ++lindex){
            var speed_h = geary[lindex].x;

            if(speed_l > speed_h){
                var sindex = tempgear.indexOf(gearx[index]);
                tempgear.splice(sindex,1);
            }
        }
    }
    return tempgear;
}

function cleanOverlap(gearbox){
    var i;
    for(i = 0; i<gearbox.length; i++){
        if(i > 0){
            gearbox[i] = cleanFront(gearbox[i], gearbox[i-1]);
        }
    }
    
    for(i = 0; i<gearbox.length; i++){
        if(i+1 < gearbox.length){
            gearbox[i] = cleanTail(gearbox[i], gearbox[i+1]);
        }
    }
}

function effectiveForce(torque, gear, motorcycle) {
    return torque * effGearbox(motorcycle)[gear] / wheelRadius(motorcycle.wheel);		
}

function rpmtospeed(rpm, gear, motorcycle) {
    var wheelrpm = rpm/effGearbox(motorcycle)[gear];
    var wheelLength = wheelRadius(motorcycle.wheel) * 2 * Math.PI;
    var mstokmh = 60/1000;
    
    return wheelrpm * wheelLength * mstokmh;
}

function wheelRadius(wheel) {
    var size = wheel.size*2.54 //to cm
    var width = wheel.width/10 //to cm
    var profile = wheel.profile/100 //to percent
    
    return (size + 2*width*profile) / 2 / 100;
}

function effGearbox(motorcycle){
    var i;
    var effGearbox = new Array();

    for (i = 0; i < motorcycle.gearbox.length; ++i) {
        effGearbox.push(motorcycle.gearbox[i]*motorcycle.primary*motorcycle.rearSprocket/motorcycle.frontSprocket);
    }
    
    return effGearbox;
}

function compensate(gearbox, motorcycle){
    var i;
    var j;

    for (i = 0; i < gearbox.length; ++i) {
        for (j = 0; j < gearbox[i].length; ++j) {
            var speed = gearbox[i][j].x;
            var force = gearbox[i][j].y;
            // v^2 * 0.5 * air fluidity at 20c * CdA
            var drag  = (speed/3.6) * (speed/3.6) * 0.5 * 1.2 * motorcycle.drag; 
            var power = (force - drag) / (motorcycle.wetWeight + driverWeight) / 9.82;
            gearbox[i][j].y = power;
            gearbox[i][j].label = motorcycle.model+" - Gear: "+(i+1)+", "+Math.round(motorcycle.dynorpm[j])+" RPM, "+
            Math.round(speed)+" km/h, y:" + Math.round(gearbox[i][j].y*100)/100 + " Drag:" +  Math.round(drag / (motorcycle.wetWeight + driverWeight) / 9.82*100)/100;
        }
    }
}

function thrust(motorcycle, gear){
    var arr = new Array();
    
    var i;
    for (i = 0; i < motorcycle.dynorpm.length; ++i) {
        var speed = rpmtospeed(motorcycle.dynorpm[i],gear, motorcycle);
        var force = effectiveForce(motorcycle.dynotorque[i], gear, motorcycle);
        var rpm = +Math.round(motorcycle.dynorpm[i]);
        arr.push({  
            x: speed,
            y: force,
            label: motorcycle.model+" - Gear: "+(gear+1)+", "+rpm+" RPM, "+ Math.round(speed) +" km/h "+Math.round(force)+" N "
        })
    }
    return arr;
}

function getCoords(mc){
    var gear = [];

    var index;
    for(index = 0; index < mc.gearbox.length; index++){
        gear[index] = thrust(mc, index);
    }

    return gear;
}

function getMC(motorcycle, choice) {
    if(motorcycle === undefined){
        return [];
    }

    var gear = getCoords(motorcycle);

    if(choice==1){
        compensate(gear, motorcycle);
    }

    cleanOverlap(gear);
    var gears = gear[0].concat(gear[1]).concat(gear[2]).concat(gear[3]).concat(gear[4]).concat(gear[5]);
    
    return [{type: "line", toolTipContent: "{label}", showInLegend: true, legendText: motorcycle.brand+" "+motorcycle.model, dataPoints: gears}];                
}

function getMCfor (motorcycle, choice) {
    if(motorcycle === undefined){
        return [];
    }

    var gear = getCoords(motorcycle);

    if(choice == 1){
        compensate(gear, motorcycle);
    }

    cleanOverlap(gear);
    var gears = gear[0].concat(gear[1]).concat(gear[2]).concat(gear[3]).concat(gear[4]).concat(gear[5]);

    return [
        {type: "line", toolTipContent: "{label}", showInLegend: true, legendText: motorcycle.brand+" "+motorcycle.model, dataPoints: gears},
        {type: "line", dataPoints: gear[0]}, {type: "line", dataPoints: gear[1]}, {type: "line", dataPoints: gear[2]},
        {type: "line", dataPoints: gear[3]}, {type: "line", dataPoints: gear[4]},{type: "line", dataPoints: gear[5]}
    ];

}

function getMCgearing(motorcycle) {
//Returns many colored graphs, for seeing the full gearbox

    if(motorcycle === undefined){
    return [];
    }

    var gear = getCoords(motorcycle);
    var arr = [];

    var i;
    for (i = 0; i < motorcycle.gearbox.length; i++) {
        arr.push({
            type: "line", 
            showInLegend:true, 
            legendText: "Gear "+(i+1), 
            toolTipContent: "{label}", dataPoints: gear[i]
        });
    }
    
    return arr;	
}

function getMCpow(motorcycle, norm) {
    if(motorcycle === undefined){
        return [];
    }

    if(norm === undefined){
        norm = 1;
    }else{
        var maxrpm = motorcycle.dynorpm[motorcycle.dynorpm.length-1];
        norm = (maxrpm/10000);
    }

    var arr = [];
    
    var i;
    for (i = 0; i < motorcycle.dynorpm.length; ++i) {
        var hp = Math.round(motorcycle.dynorpm[i]*motorcycle.dynotorque[i]/7023.5);
        var rpm = Math.round(motorcycle.dynorpm[i]/norm);
        arr.push({x: rpm, y: hp, label: ""})
    }
    
    return [{
        type: "line",
        showInLegend:true,
        legendText:  motorcycle.brand+" "+motorcycle.model+" Power",
        toolTipContent: "{y} HP at {x} RPM",
        dataPoints: arr
    }];
}

function getMCtrq(motorcycle, norm) {
    if(motorcycle === undefined){
        return [];
    }

    if(norm === undefined){
        norm = 1;
    }else{
        var maxrpm = motorcycle.dynorpm[motorcycle.dynorpm.length-1];
        norm = (maxrpm/10000);
    }

    var arr = [];
    
    var i;
    for (i = 0; i < motorcycle.dynorpm.length; ++i) {
        var rpm = Math.round(motorcycle.dynorpm[i]/norm);
        var trq = Math.round(motorcycle.dynotorque[i]*norm);
        arr.push({x: rpm, y: trq, label: ""})
    }
    
    return [{
        type: "line",
        showInLegend:true,
        legendText:  motorcycle.brand+" "+motorcycle.model+" Torque",
        toolTipContent: "{y} nm at {x} RPM",
        dataPoints: arr
    }];
}

function toNm(arr){
    return multiplyAll(arr, 1.35581795);
}

function roundAll(arr, decimals){
    if(decimals === undefined){
        decimals = 0;
    }

    var out = arr.slice();
    
    var i;
    for(i = 0; i < out.length; i++){ 
        out[i] = Math.round(out[i]*Math.pow(10, decimals))/Math.pow(10, decimals); 
    }
    
    return out;
}

function multiplyAll(arr, float){
    var out = [];
    
    var i;
    for(i = 0; i < arr.length; i++){
        out[i] = arr[i]*float;
    }
    
    return out;
}

