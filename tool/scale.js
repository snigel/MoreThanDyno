    var x_k = 1;
    var x_m = 0;
    var y_k = 1;
    var y_m = 0;

    function point_it(event){
        pos_x = event.offsetX?(event.offsetX):event.pageX-document.getElementById("dyno").offsetLeft;
        pos_y = event.offsetY?(event.offsetY):event.pageY-document.getElementById("dyno").offsetTop;
        document.getElementById("cross").style.left = (pos_x-8) ;
        document.getElementById("cross").style.top = (pos_y-8) ;
        document.getElementById("cross").style.visibility = "visible" ;
        document.pointform.form_x.value = Math.round(pos_x*x_k+x_m);
        document.pointform.form_y.value = Math.round(pos_y*y_k+y_m);
    }

    function setScale(){
        var x1 = parseInt(document.getElementById("x1").value);
        var x2 = parseInt(document.getElementById("x2").value);
        var rpm1 = parseInt(document.getElementById("rpm1").value);
        var rpm2 = parseInt(document.getElementById("rpm2").value);

        var y1 = parseInt(document.getElementById("y1").value);
        var y2 = parseInt(document.getElementById("y2").value);
        var trq1 = parseInt(document.getElementById("trq1").value);
        var trq2 = parseInt(document.getElementById("trq2").value);

        x_k = (rpm2-rpm1)/(x2-x1);
        x_m = rpm1 - x1*x_k;
        y_k = (trq2-trq1)/(y2-y1);
        y_m = trq1 - y1*y_k;
    }

    function resetScale(){
        x_k = 1;
        x_m = 0;
        y_k = 1;
        y_m = 0;
    }

    function setImage(){
        var url = document.getElementById("url").value;
        console.log(url);
        var dyno = document.getElementById("dyno");
        dyno.style.backgroundImage = "url(" + url + ")";
        dyno.style.height = document.getElementById("height").value;
    }