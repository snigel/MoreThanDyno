function removeGearOverlap(vehicle, gearbox){
    //This function removes points where speed overlap between gears.
    //The points with more power and same speed are kept.

    for(gear = 0; gear < gearbox.length-1; gear++){
        //In second and later passes, high gear may have lower speed than low.
        //Remove those elements before proceeding.
        while(gearbox[gear][0].x > gearbox[gear+1][0].x){
            gearbox[gear+1].splice(0, 1)
        }

        var popped = false;
        //Remove less powerful high rpms from low gear.
        for(hiSpeed = gearbox[gear+1].length-1; hiSpeed>=0; hiSpeed--){
            if(gearbox[gear][gearbox[gear].length-1].x >= gearbox[gear+1][hiSpeed].x){            
                if(gearbox[gear][gearbox[gear].length-1].y < gearbox[gear+1][hiSpeed].y){
                    //If fastest speed in low gear is less powerful than high gear.
                    //Remove last element from high gear and redo operation.
                    var elem = gearbox[gear].pop();
                    var popped = true;
                }
            }
        }
        

        //Remove less powerful low rpms from high gear.
        var spliced = false;
        for(hiSpeed = 0; hiSpeed < gearbox[gear+1].length; hiSpeed++){
            for(loSpeed = 0; loSpeed < gearbox[gear].length; loSpeed++){
                if(gearbox[gear][loSpeed].x >= gearbox[gear+1][hiSpeed].x){
                    if(gearbox[gear][loSpeed].y > gearbox[gear+1][hiSpeed].y){
                        //Low gear is faster and more powerful than high gear.
                        //Remove every high gear element below this point.
                        //Current element is left for later interpolation.
                        gearbox[gear+1].splice(0, hiSpeed);
                        spliced = true;
                    }
                }
            }
        }

        //If we removed elements from low gear, add the last back for interpolation.
        //We will find a speed between those two points.
        if(popped){
            let interpSpeed = gearbox[gear][gearbox[gear].length-1].x;
            
            //Even though we popped, we can't be certain that the current element is the most powerful!
            //Interpolate to check.
            if(kxym(gearbox[gear+1], 1, interpSpeed) < kxym(gearbox[gear], gearbox[gear].length-1, interpSpeed)){
                //If low gear is more powerful when interpolating high gear, add a higher low gear element.
                gearbox[gear].push(elem);

                //Update with new speed for interpolation.
                interpSpeed = gearbox[gear][gearbox[gear].length-1].x;

                //Since we added a faster low gear element, make sure only one hi gear element is slower.
                if(gearbox[gear+1][1].x < interpSpeed){
                    gearbox[gear+1].splice(0,1);
                }
            } 
            
            //Round interpolate speed for nicer values to look at.
            //Round up just to be safe.
            interpSpeed = Math.round(interpSpeed+1);

            //Back off until low gear has more power.
            while (kxym(gearbox[gear+1], 1, interpSpeed) > kxym(gearbox[gear], gearbox[gear].length-1, interpSpeed)){
                interpSpeed -= 1;
            }

            //Update last element with the interpolated values.
            gearbox[gear][gearbox[gear].length-1].y = kxym(gearbox[gear], gearbox[gear].length-1, interpSpeed);
            gearbox[gear][gearbox[gear].length-1].x = interpSpeed;
            

        }
        //Finally, always interpolate a new point for hi gear that meets low gear.
        let loTopSpeed = gearbox[gear][gearbox[gear].length-1].x;
        gearbox[gear+1][0].y = kxym(gearbox[gear+1], 1, loTopSpeed);
        gearbox[gear+1][0].x = loTopSpeed;
    }
    return gearbox;
}

function topSpeedSprockets(v){
        //Find real sprocket combinations.
        console.log(" ");
        console.log("Test sprocket combos!");
    
        var list = [];
    
        for(f=12; f<21; f++){
            for(r=38; r<50; r++){
                list.push({speed: getVehicleTopSpeed(v, f, r), front: f, rear: r});
            }
        }
    
        function mycomparator(a,b) {
            return parseInt(a.speed, 10) - parseInt(b.speed, 10);
        }

        list.sort(mycomparator);

        //TODO
        //Sort list by fastest.
        //Choose the combination that are closest to default.
        //If several has the same value, pick the one with most cogs.
        //Avoid +3/-3 front or -6 rear.


        console.log(list);
        //end of sprocketz
}

function concatGears(gearbox){
    //This function concatenates all gears to a single array.
    //Used after overlap has been removed.
    var concatGear = [];
    for(gear = 0; gear < gearbox.length; gear++){
        concatGear = concatGear.concat(gearbox[gear]);
    }
    return concatGear;
}

function speed2rpm(vehicle, gear, speed){
    //calculate speed from rpm.
    let ms = speed / 3.6; //kmh to ms
    let wheelrpm = ms / (getWheelRadius(vehicle.wheel) * 2 * Math.PI) * 60;
    return wheelrpm * getGearRatio(vehicle, gear);
}

function rpm2speed(vehicle, gear, rpm) {
    //Returns speed for a given vehicle, gear and rpm.
    let wheelrpm = rpm/getGearRatio(vehicle, gear);
    let wheelLength = getWheelRadius(vehicle.wheel) * 2 * Math.PI;
    let mstokmh = 60/1000; //Converts rpm to rph and m to km.
    return wheelrpm * wheelLength * mstokmh;
}

function rpm2hp(v, i){
    return v.torque[i] * v.dynoRpm[i] / 7023.5; 
}

function getMaxHpIndex(v){
    let maxHp = 0;
    let hpIndex=0;
    for (let i = 0; i < v.dynoRpm.length; i++){
        let hp = rpm2hp(v, i);
        if (hp > maxHp){
            maxHp = hp;
            hpIndex = i;
        }
    }
    return hpIndex;
}

function getMaxTqIndex(v){
    return v.torque.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}



function getWheelRadius(wheel) {
    //Calculates total radius of rim + tire in meter.
    let size = wheel.size*2.54 //inch to cm
    let width = wheel.width/10 //mm to cm
    let profile = wheel.profile/100 //to percent
    return (size + 2*width*profile) / 2 / 100;
}

function getGearRatio(vehicle, gear){
    //Return effective gear ratio from engine to rear wheel.
    return vehicle.gearbox[gear]*vehicle.primary*vehicle.rearSprocket/vehicle.frontSprocket;
}

function calcResistance(gearbox, vehicle, calcAero){
    //CalcAero is 1 for calculating air resistance or 0 for not.

    //Inject top speed coordinate.
    if(calcAero == 1){
        //Loop to find element above top speed.
        let topGear = gearbox[gearbox.length-1];

        for(let rpm = 0; rpm < topGear.length; rpm++){
            if(topGear[rpm].x > vehicle.topSpeed){
                //We want to insert a new element at this location.
                //Clone the element and add it.
                let power = kxym(topGear, rpm, vehicle.topSpeed);
                let slice = topGear.slice((rpm-1), rpm);
                topGear.splice(rpm, 0, slice);
                //Modify the cloned element.
                topGear[rpm].x = vehicle.topSpeed;
                topGear[rpm].y = power;
                break;
            }
        }
    }
    
    for (let gear = 0; gear < gearbox.length; gear+=1) {
        for (let rpm = 0; rpm < gearbox[gear].length; rpm+=1) {
            let speed = gearbox[gear][rpm].x;
            let force = gearbox[gear][rpm].y;
            let drag = ((speed/3.6) * (speed/3.6)) * 0.5 * 1.2 * vehicle.drag;
            // v^2 * 0.5 * air fluidity at 20c * CdA
            gearbox[gear][rpm].y = (force - drag*calcAero) / (vehicle.wetWeight + driverWeight) / 9.82;
            gearbox[gear][rpm].label = 
                vehicle.brand + " " + vehicle.model + " - " +
                "Gear: " + (gear+1) + ", " + 
                Math.round(speed2rpm(vehicle, gear, speed)) + " RPM, " + 
                Math.round(speed)+" km/h, " +
                "Acc: " + Math.round(gearbox[gear][rpm].y*100)/100 + "Gs";
        }
    }
    return gearbox;
}

function gear2wheelThrust(vehicle, gear){
    //Calculates coordinates of wheel thrust vs rpm, for a given gear.
    let coordinates = new Array();
    for (i = 0; i < vehicle.dynoRpm.length; ++i) {
        let speed = rpm2speed(vehicle, gear, vehicle.dynoRpm[i]);

        //Calculate effective force using engine torque, effective gear ratio and wheel size.
        let force = vehicle.torque[i] * getGearRatio(vehicle, gear) / getWheelRadius(vehicle.wheel);
                    
        let rpm = Math.round(vehicle.dynoRpm[i]);
        coordinates.push({
            x: speed,
            y: force,
            label: 
            vehicle.brand + " " + vehicle.model + " - " +
            "Gear: " + (gear+1) + ", " + 
            speed2rpm(vehicle, gear, speed) + " RPM, " + 
            Math.round(speed)+" km/h, " +
            "Power: " + Math.round(force) + " N"
        })
    }
    return coordinates;
}

function getWheelThrust(vehicle){
    //Calculates coordinates of thrust vs rpm for each gear.

    let coordinates = [];
    for(gear = 0; gear < vehicle.gearbox.length; gear++){
        coordinates[gear] = gear2wheelThrust(vehicle, gear);
    }

    return coordinates;
}

function getVehicleDrag(vehicle){
    //Used in pagetools.js to calculate drag at TopSpeed.

    var gears = getWheelThrust(vehicle);
    var topGear = gears[gears.length-1];

    //Loop to find element above top speed.
    for(rpm = 0; rpm < topGear.length; rpm++){
        if(topGear[rpm].x > vehicle.topSpeed){
            //Interpolate power at top speed.
            var power = kxym(topGear, rpm, vehicle.topSpeed);

            //Calculate drag value from interpolation.
            drag = power / ( ((vehicle.topSpeed/3.6) * (vehicle.topSpeed/3.6)) * 0.5 * 1.2);
            return drag;
        }
    }
    console.log("Warning: " + vehicle.brand + " " + vehicle.model + "has top speed above max dyno rpm, drag may be inaccurate.");
    var power = kxym(topGear, (topGear.length-1), vehicle.topSpeed);

    //Calculate drag value from interpolation.
    drag = power / ( ((vehicle.topSpeed/3.6) * (vehicle.topSpeed/3.6)) * 0.5 * 1.2);

    return drag;  
}

function getVehicleTopSpeed(vehicle, front, rear){
    //Calculates effective top speed for a given ratio of sprockets.

    var oldfront = vehicle.frontSprocket;
    var oldrear = vehicle.rearSprocket;

    vehicle.frontSprocket = front;
    vehicle.rearSprocket = rear;

    //Get thrust for all gears.
    var gears = getWheelThrust(vehicle);

    var dragIndex = 0;
    var maxSpeed = 0;
    var overMaxSpeed = 0;

    //Loop over top gear in reverse. So we hit the right side of the curve. 
    //Find where air resistance meets power.
    var topGear = gears[gears.length-1];
    for(rpm = topGear.length-1; rpm > 0; rpm--){
        var force = topGear[rpm].y;
        var speed = topGear[rpm].x;
        drag = ((speed/3.6) * (speed/3.6)) * 0.5 * 1.2 * vehicle.drag;

        if(force > drag){
            dragIndex = (rpm+1); //Drag was bigger at last index.
            maxSpeed = speed;
            if(rpm < topGear.length-1){
                overMaxSpeed = topGear[rpm+1].x;
            }else{
                //This combinaton has no max speed!
                //TODO handling of this scenario?
            }
            break;
        }
    }   

    if(overMaxSpeed > 0){
        //interpolate a closer value, since we're restricted by air resistance.
        for(speed = 100; speed < 400; speed+=0.1){            
            var force = kxym(topGear, dragIndex, speed);
            var drag = ((speed/3.6) * (speed/3.6)) * 0.5 * 1.2 * vehicle.drag;
            if(force < drag){
                maxSpeed = speed-0.1;
                break;
            }
        }
    } else {
    }

    vehicle.frontSprocket = oldfront;
    vehicle.rearSprocket = oldrear;
    return maxSpeed;
}


function kxym(gear, index, xvalue){
    //Returns a new Y value for a given X.
    var y = gear[index].y - gear[index - 1].y;
    var x = gear[index].x - gear[index - 1].x;
    var k = y/x;
    var m =  gear[index].y - gear[index].x * k;

    return xvalue * k + m;
}

function step(i, gr1, j, gr2){
    //Steps index until gr2.x is larger than gr1.x or quits.
    while(gr1[i].x > gr2[j].x){
        if(gr2.length-1 == j){
            return j;
        }
        if(gr1[i].x < gr2[j+1].x){
            return j+1;
        } else{
            j++;
        }
    }
    return j;
}

function lbft2Nm(arr){
    //Used to convert dyno values in motorcycles.js
    return multiplyArray(arr, 1.3558179483314);
}

function roundArray(arr, decimals){
    //Used by pagetools.js
    if(decimals === undefined){
        decimals = 0;
    }

    var out = arr.slice();
    for(i = 0; i < out.length; i++){
        out[i] = Math.round(out[i]*Math.pow(10, decimals))/Math.pow(10, decimals);
    }

    return out;
}

function multiplyArray(arr, float){
    //Used by pagetools.js and lbft2nm.
    let out = [];
    for(i = 0; i < arr.length; i++){
        out[i] = arr[i] * float;
    }

    return out;
}
