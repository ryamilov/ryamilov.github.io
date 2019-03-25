    //reading json file
    var readFile = new XMLHttpRequest();
        readFile.open("GET", "chart_data.json", false);
        readFile.overrideMimeType("application/json");
        readFile.send(null);
    var data = JSON.parse(readFile.responseText);

    var xScale = 300;
    var yScale = 150;

    var xBeginValue = [];
    var xEndValue = [];
    var xBeginIndex = [];
    var xEndIndex = [];
    var xArrayLength = [];
    var yMax = [];
    var yMaxAll = [];
    var i = 0;
    var k = 0;
    var j = 0;
    var start = 0;
    var dif1 = xScale;
    var dif2 = xScale;
    var ifMouseDown = false;
    var divs = new Array(data.length);
    var gra = new Array(data.length);
    var line = new Array(data.length);
    var linePreview = new Array(data.length);
    var lineindex = 0;
    var slider = new Array(data.length);
    var sliderMiddle = [];
    var addDiv = [];
    var checkDiv = [];
    var axisLine = [];
    var axisLalel = [];
    var labelText = [];
    var checkBox = [];
    var checkText = new Array(data.length);
    var checkLabel = [];

    var showLine = new Array(data.length);
    var showGroup = new Array(data.length);
    var showRect = new Array(data.length);
    var showText = new Array(data.length);
    var showNewLine = new Array(data.length);
    
    var linesVisible = new Array(data.length);
    for (i=0; i<data.length; i++) {
        linesVisible[i] = new Array(data[i].columns.length-1)
    }

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

window.onload = loadGraph;

function loadGraph() {

    //adding night mode checkbox
    nightModeCB = document.createElement("input")
    nightModeCBLabel = document.createElement("label");

    nightModeCB.setAttribute("type", "checkbox");
    nightModeCB.setAttribute("onchange", "switchNightMode(this)");
    nightModeCB.setAttribute("id", "night");
    nightModeCB.setAttribute("class", "check");
    nightModeCBLabel.setAttribute("for", nightModeCB.id);
    nightModeCBLabel.setAttribute("class", "text");
    nightText = document.createTextNode("Night Mode");
    nightModeCBLabel.appendChild(nightText);

    document.getElementById("header").appendChild(nightModeCB);
    document.getElementById("header").appendChild(nightModeCBLabel);

    for (k=0; k<data.length; k++) {

        divs[k] = document.createElement("div");
        divs[k].setAttribute("class", "divg");
        document.getElementById("maindiv").appendChild(divs[k]);

        //finding boundary conditions
        xBeginIndex[k] = 1;
        xEndIndex[k] = data[k].columns[0].length - 1;
        xBeginValue[k] = data[k].columns[0][xBeginIndex[k]];
        xEndValue[k] = data[k].columns[0][xEndIndex[k]];

        //main graphs
        gra[k] = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        gra[k].setAttribute("class", "svg");
        gra[k].setAttribute("id", k);
        //preview graphs
        gra[k+data.length] = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        
        xArrayLength[k] = xEndValue[k] - xBeginValue[k] + 1;

        //finding yMaxAll
        yMaxAll[k] = 1;
        for (j=1; j<data[k].columns.length; j++) {
            yMax[j] = data[k].columns[j][xBeginIndex[k]];
            
            for (i=xBeginIndex[k]; i<xEndIndex[k]+1; i++) {
                if (data[k].columns[j][i] > yMax[j]) {
                    yMax[j] = data[k].columns[j][i];
                }
            }

            if (yMax[j] > yMaxAll[k]) {
                yMaxAll[k] = yMax[j];
            }
        }

        //drawing axis lines
        for (i=0; i<6; i++) {

            axisLine[i] = document.createElementNS("http://www.w3.org/2000/svg", "line");
            axisLine[i].setAttribute("x1", "0");
            axisLine[i].setAttribute("y1", (1 - i / 5) * yScale);
            axisLine[i].setAttribute("x2", xScale);
            axisLine[i].setAttribute("y2", (1 - i / 5) * yScale);
            axisLine[i].setAttribute("stroke", "black");
            axisLine[i].setAttribute("stroke-width", "1");
            axisLine[i].setAttribute("class", "axisline");
            axisLine[i].setAttribute("visibility", "visible");
            gra[k].appendChild(axisLine[i]);
        }

        //axis labels for Y
        for (i=0; i<6; i++) {
            axisLalel[i+k*12] = document.createElementNS("http://www.w3.org/2000/svg", "text");

            axisLalel[i+k*12].setAttribute("x", `${-yMaxAll[k].toString().length*8}`);
            axisLalel[i+k*12].setAttribute("y", (1 - i / 5) * yScale - 5);
            axisLalel[i+k*12].setAttribute("font-size", "11");
            axisLalel[i+k*12].setAttribute("id", "text" + k + i);
            axisLalel[i+k*12].setAttribute("class", "text");
            axisLalel[i+k*12].appendChild(document.createTextNode((yMaxAll[k] * i / 5).toFixed()));
            gra[k].appendChild(axisLalel[i+k*12]);

        }

        //axis labels for X
        for (i=1; i<7; i++) {

            axisLalel[i+5+k*12] = document.createElementNS("http://www.w3.org/2000/svg", "text");

            axisLalel[i+5+k*12].setAttribute("x", i / 5 * xScale - 70);
            axisLalel[i+5+k*12].setAttribute("y", yScale + 20);
            axisLalel[i+5+k*12].setAttribute("font-size", "11");
            axisLalel[i+5+k*12].setAttribute("id", "text" + k + i + 5);
            axisLalel[i+5+k*12].setAttribute("class", "text");

            var date = new Date(data[k].columns[0][1] + (i - 1) / 5 * xArrayLength[k]);
            axisLalel[i+5+k*12].appendChild(document.createTextNode(monthNames[date.getMonth()] + " " + date.getDate()));
            gra[k].appendChild(axisLalel[i+5+k*12]);

        }

        //adding preview versions of graphs
        for (j=1; j<data[k].columns.length; j++) {

            for (i=1; i<data[k].columns[0].length-1; i++) {

                linePreview[i] = document.createElementNS("http://www.w3.org/2000/svg", "line");

                linePreview[i].setAttribute("x1", (data[k].columns[0][i] - data[k].columns[0][1]) / xArrayLength[k] * xScale);
                linePreview[i].setAttribute("y1", (yMaxAll[k] - data[k].columns[j][i]) / yMaxAll[k] * yScale / 5);
                linePreview[i].setAttribute("x2", (data[k].columns[0][i+1] - data[k].columns[0][1]) / xArrayLength[k] * xScale);
                linePreview[i].setAttribute("y2", (yMaxAll[k] - data[k].columns[j][i+1]) / yMaxAll[k] * yScale / 5);
                linePreview[i].setAttribute("stroke", data[k].colors[data[k].columns[j][0]]);
                linePreview[i].setAttribute("stroke-width", "2");
                linePreview[i].setAttribute("class", "line" + k + j);
                linePreview[i].setAttribute("visibility", "visible");
 
                gra[k+data.length].appendChild(linePreview[i]);
            }
        }

        //drawing sliders for each graph
        slider[k] = document.createElement("input");
        slider[k].setAttribute("type", "range");
        slider[k].setAttribute("min", "0");
        slider[k].setAttribute("max", xScale);
        slider[k].setAttribute("step", "0.1");
        slider[k].setAttribute("id", "slider" + k + "1");
        slider[k].setAttribute("class", "slider-top");
        slider[k].setAttribute("value", "0");
        slider[k].setAttribute("oninput", `updateGraph(${k})`);

        slider[k+data.length] = document.createElement("input");
        slider[k+data.length].setAttribute("type", "range");
        slider[k+data.length].setAttribute("min", "0");
        slider[k+data.length].setAttribute("max", xScale);
        slider[k+data.length].setAttribute("step", "0.1");
        slider[k+data.length].setAttribute("id", "slider" + k + "3");
        slider[k+data.length].setAttribute("class", "slider-bottom");
        slider[k+data.length].setAttribute("value", xScale);
        slider[k+data.length].setAttribute("oninput", `updateGraph(${k})`);

        //sliderMiddle are used for mouse event listeners
        sliderMiddle[k] = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        sliderMiddle[k].setAttribute("width", xScale);
        sliderMiddle[k].setAttribute("height", yScale);
        sliderMiddle[k].setAttribute("fill", "azure");
        sliderMiddle[k].setAttribute("id", "rect" + k);
        sliderMiddle[k].setAttribute("class", "slider-middle-top");
        sliderMiddle[k].addEventListener("mousemove", showCurrent);
        gra[k].appendChild(sliderMiddle[k]);

        sliderMiddle[k+data.length] = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        sliderMiddle[k+data.length].setAttribute("width", xScale);
        sliderMiddle[k+data.length].setAttribute("height", "45");
        sliderMiddle[k+data.length].setAttribute("fill", "azure");
        sliderMiddle[k+data.length].setAttribute("id", "rectpreview" + k);
        sliderMiddle[k+data.length].setAttribute("class", "slider-middle-bottom");
        sliderMiddle[k+data.length].addEventListener("mousedown", startMoveSlider);
        sliderMiddle[k+data.length].addEventListener("mousemove", moveSlider);
        sliderMiddle[k+data.length].addEventListener("mouseup", endMoveSlider);
        sliderMiddle[k+data.length].addEventListener("mouseout", endMoveSliderOnMouseOut);
        gra[k+data.length].appendChild(sliderMiddle[k+data.length]);

        //adding additional div for sliders and graph previews
        addDiv[k] = document.createElement("div");
        addDiv[k].setAttribute("id", "adddiv" + k);
        addDiv[k].setAttribute("class", "adddiv");

        //adding additional div for checkboxes
        checkDiv[k] = document.createElement("div");
        checkDiv[k].setAttribute("id", "checkdiv" + k);
        checkDiv[k].setAttribute("class", "checkdiv");

        //graphs and div blocks
        gra[k].setAttribute("viewBox", `-100 -150 500 ${yScale + 200}`);
        divs[k].appendChild(gra[k]);
        divs[k].appendChild(addDiv[k]);
        divs[k].appendChild(checkDiv[k]);

        //sliders and graph previews
        document.getElementById("adddiv" + k).appendChild(slider[k]);
        gra[k+data.length].setAttribute("viewBox", `0 -5 300 ${yScale / 5 + 15}`);
        gra[k+data.length].setAttribute("id", "slidersvg" + k);

        document.getElementById("adddiv" + k).appendChild(gra[k+data.length]);
        document.getElementById("adddiv" + k).appendChild(slider[k+data.length]);

        line[k] = new Array(data[k].columns.length-1);
        checkBox[k] = new Array(data[k].columns.length-1);
        checkLabel[k] = new Array(data[k].columns.length-1);
        checkText[k] = new Array(data[k].columns.length-1);

        //creating show box for each graph
        showLine[k] = document.createElementNS("http://www.w3.org/2000/svg", "line");
        showRect[k] = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        showGroup[k] = document.createElementNS("http://www.w3.org/2000/svg", "g");
        showText[k] = new Array(data[k].columns.length);
        for (j=0; j<data[k].columns.length; j++) {
            showText[k][j] = document.createElementNS("http://www.w3.org/2000/svg", "text");
        }

        //adding graph lines
        for (j=0; j<data[k].columns.length-1; j++) {

            line[k][j] = new Array(data[k].columns[j].length-2);

            for (i=0; i<data[k].columns[j].length-2; i++) {

                line[k][j][i] = document.createElementNS("http://www.w3.org/2000/svg", "line");

                line[k][j][i].setAttribute("x1", (data[k].columns[0][i+1] - data[k].columns[0][1]) / xArrayLength[k] * xScale);
                line[k][j][i].setAttribute("y1", (yMaxAll[k] - data[k].columns[j+1][i+1]) / yMaxAll[k] * yScale);
                line[k][j][i].setAttribute("x2", (data[k].columns[0][i+2] - data[k].columns[0][1]) / xArrayLength[k] * xScale);
                line[k][j][i].setAttribute("y2", (yMaxAll[k] - data[k].columns[j+1][i+2]) / yMaxAll[k] * yScale);
                line[k][j][i].setAttribute("stroke", data[k].colors[data[k].columns[j+1][0]]);
                line[k][j][i].setAttribute("stroke-width", "2");
                line[k][j][i].setAttribute("class", "line" + k + j);
                line[k][j][i].setAttribute("visibility", "visible");
 
                gra[k].appendChild(line[k][j][i]);
            }

            linesVisible[k][j] = true;

            //adding checkbox for each graph
            checkBox[k][j] = document.createElement("input");
            checkLabel[k][j] = document.createElement("label");

            checkBox[k][j].setAttribute("type", "checkbox");
            checkBox[k][j].setAttribute("checked", "true");
            checkBox[k][j].setAttribute("onchange", "ifLineDisplays(this)");
            checkBox[k][j].setAttribute("id", "line" + k + j);
            checkBox[k][j].setAttribute("class", "check");
            checkBox[k][j].setAttribute("style", "border: 6px solid " + data[k].colors[data[k].columns[j+1][0]] + ";");
            checkLabel[k][j].setAttribute("for", checkBox[k][j].id);
            checkLabel[k][j].setAttribute("class", "text");

            checkText[k][j] = document.createTextNode(data[k].names[data[k].columns[j+1][0]]);
            checkLabel[k][j].appendChild(checkText[k][j]);

            document.getElementById("checkdiv" + k).appendChild(checkBox[k][j]);
            document.getElementById("checkdiv" + k).appendChild(checkLabel[k][j]);
            
        }
        
    }

}

function drawGraph(a, x1, x2, visibleConditions) {

    //finding new boundary conditions
    xBeginIndex[a] = parseInt((data[a].columns[0].length - 2) / xScale * x1);
    xEndIndex[a] = parseInt((data[a].columns[0].length - 2) / xScale * x2);
    xBeginValue[a] = data[a].columns[0][xBeginIndex[a] + 1];
    xEndValue[a] = data[a].columns[0][xEndIndex[a]+1];
    xArrayLength[a] = xEndValue[a] - xBeginValue[a] + 1;

    //finding yMaxAll
    yMaxAll[a] = 1;

    for (j=1; j<data[a].columns.length; j++) {

        if (visibleConditions[a][j-1]) {

            yMax[j] = 1;
            for (i=xBeginIndex[a]+1; i<xEndIndex[a]+2; i++) {

                if (data[a].columns[j][i] > yMax[j]) {
                    yMax[j] = data[a].columns[j][i];
                }
            }
            if (yMax[j] > yMaxAll[a]) {
                yMaxAll[a] = yMax[j];
            }
        }
    }

    //axis labels for Y
    for (i=0; i<6; i++) {

        document.getElementById("text" + a + i).textContent = (yMaxAll[a] * i / 5).toFixed();

    }

    //axis labels for X
    for (i=1; i<7; i++) {

        var date = new Date(data[a].columns[0][xBeginIndex[a]+1] + (i - 1) / 5 * xArrayLength[a]);
        document.getElementById("text" + a + i + 5).textContent = monthNames[date.getMonth()] + " " + date.getDate();

    }

    for (j=0; j<data[a].columns.length-1; j++) {

        if (visibleConditions[a][j]) {

            for (i=xBeginIndex[a]; i<xEndIndex[a]; i++) {

                line[a][j][i].setAttribute("visibility", "visible");
                line[a][j][i].setAttribute("visibility", "visible");

                line[a][j][i].setAttribute("x1", (data[a].columns[0][i+1] - data[a].columns[0][xBeginIndex[a]+1]) / xArrayLength[a] * xScale);
                line[a][j][i].setAttribute("y1", (yMaxAll[a] - data[a].columns[j+1][i+1]) / yMaxAll[a] * yScale);
                line[a][j][i].setAttribute("x2", (data[a].columns[0][i+2] - data[a].columns[0][xBeginIndex[a]+1]) / xArrayLength[a] * xScale);
                line[a][j][i].setAttribute("y2", (yMaxAll[a] - data[a].columns[j+1][i+2]) / yMaxAll[a] * yScale);
            }

            for (i=0; i<xBeginIndex[a]; i++) {

                line[a][j][i].setAttribute("visibility", "hidden");
            }

            for (i=xEndIndex[a]; i<data[a].columns[j].length-2; i++) {

                line[a][j][i].setAttribute("visibility", "hidden");
            }

        }
        else {
            for (i=xBeginIndex[a]; i<xEndIndex[a]; i++) {
                line[a][j][i].setAttribute("visibility", "hidden");
            }
        }

    }

}

//function to show current data on the graph
function showCurrent(e) {

    var s = e.target.id.substring(4,5);

    var rect = this.getBoundingClientRect();
    var xCoord = e.clientX-rect.left;

    showLine[s].setAttribute("x1", xCoord);
    showLine[s].setAttribute("y1", 0);
    showLine[s].setAttribute("x2", xCoord);
    showLine[s].setAttribute("y2", yScale);
    showLine[s].setAttribute("stroke", "black");
    showLine[s].setAttribute("stroke-width", "1");
    showLine[s].setAttribute("visibility", "visible");

    showRect[s].setAttribute("x", xCoord - (yMaxAll[s].toString().length*10 + 75) * xCoord / xScale);
    showRect[s].setAttribute("y", -data[s].columns.length*20 - 5);
    showRect[s].setAttribute("rx", 3);
    showRect[s].setAttribute("ry", 3);
    showRect[s].setAttribute("width", yMaxAll[s].toString().length*10 + 75);
    showRect[s].setAttribute("height", data[s].columns.length*20);
    showRect[s].setAttribute("fill", "azure");
    showRect[s].setAttribute("stroke", "grey");
    showRect[s].setAttribute("stroke-width", "1");

    document.getElementById(e.target.id.substring(4,5)).appendChild(showLine[s]);
    document.getElementById(e.target.id.substring(4,5)).appendChild(showGroup[s]);
    showGroup[s].appendChild(showRect[s]);

    var index = parseInt(xCoord / xScale * (data[s].columns[0].length - 2)) + 1;
    var date = new Date(data[s].columns[0][index]);
    var str = dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate();
    showText[s][0].textContent = str;
    showText[s][0].setAttribute("x", xCoord - (yMaxAll[s].toString().length*10 + 75) * xCoord / xScale + 10);
    showText[s][0].setAttribute("y", -data[s].columns.length*20 + 15);
    showText[s][0].setAttribute("id", "textbox" + e.target.id);
    showGroup[s].appendChild(showText[s][0]);

    for (j=1; j<data[s].columns.length; j++) {

        str = data[s].names[data[s].columns[j][0]] + ": " + data[s].columns[j][index];
        showText[s][j].textContent = str;
        showText[s][j].setAttribute("x", xCoord - (yMaxAll[s].toString().length*10 + 75) * xCoord / xScale + 25);
        showText[s][j].setAttribute("y", -data[s].columns.length*20 + 20 + j * 15);
        showText[s][j].setAttribute("id", "textbox" + e.target.id);
        showText[s][j].setAttribute("fill", data[s].colors[data[s].columns[j][0]]);
        showGroup[s].appendChild(showText[s][j]);

    }

}

//functions for dragging the slider
function startMoveSlider(e) {

    var rect = this.getBoundingClientRect();
    var xCoord = e.clientX-rect.left;

    var s = e.target.id.substring(11, 12);
    var slider1 = document.getElementById("slider" + s+ "1");
    var slider3 = document.getElementById("slider" + s+ "3");
    var val1 = parseInt(slider1.value);
    var val3 = parseInt(slider3.value);

    dif1 = xCoord - val1;
    dif2 = val3 - xCoord;
    ifMouseDown = true;

}

function moveSlider(e) {

    var rect = this.getBoundingClientRect();
    var xCoord = e.clientX-rect.left;

    var s = e.target.id.substring(11, 12);
    var slider1 = document.getElementById("slider" + s+ "1");
    var slider3 = document.getElementById("slider" + s+ "3");
    var val1 = parseInt(slider1.value);
    var val3 = parseInt(slider3.value);

    if (ifMouseDown && (val1 < xCoord) && (xCoord < val3)) {
            slider1.value = xCoord - dif1;
            slider3.value = xCoord + dif2; 
            e.target.setAttribute("style", "cursor: pointer;");
            drawGraph(s, val1, val3, linesVisible);
    }

}

function endMoveSlider(e) {

    dif1 = xScale;
    dif2 = xScale;
    ifMouseDown = false;
    e.target.setAttribute("style", "cursor: default;");

}

function endMoveSliderOnMouseOut(e) {

    dif1 = xScale;
    dif2 = xScale;
    ifMouseDown = false;
    e.target.setAttribute("style", "cursor: default;");

}

//checkboxes handler to set lines visibility
function ifLineDisplays(cb) {

    var s = cb.id.substring(4,5);
    var g = cb.id.substring(5,6);
    var slider1 = document.getElementById("slider" + s + "1");
    var slider3 = document.getElementById("slider" + s + "3");
    var val1 = parseInt(slider1.value);
    var val3 = parseInt(slider3.value);

    if (cb.checked) {

        linesVisible[s][g] = true;
        cb.setAttribute("checked", "true");

    }
    else {

        linesVisible[s][g] = false;
        cb.setAttribute("checked", "false");

    }

    drawGraph(s, val1, val3, linesVisible);

}

//sliders handler
function updateGraph(s) {

    var slider1 = document.getElementById("slider" + s + "1"); 
    var slider3 = document.getElementById("slider" + s + "3"); 
    var val1 = parseInt(slider1.value); 
    var val3 = parseInt(slider3.value);

    if (val1 > val3-25) 
    { 
        slider3.value = val1+25; 
        slider1.value = val3-25; 

    }

    drawGraph(s, val1, val3, linesVisible);
}

//switching night mode
function switchNightMode(cb) {

    var divs = document.getElementsByClassName("divg");
    var labels = document.getElementsByClassName("text");

    if (cb.checked) {

        document.getElementById("screen").setAttribute("style", "background:#111736;");
        document.getElementById("header").setAttribute("style", "background:#111736;");
        document.getElementById("footer").setAttribute("style", "background:#111736;");
        for (i=0; i<divs.length; i++) {
            divs[i].setAttribute("style", "background:#111736;");
        }
        for (i=0; i<labels.length; i++) {
            labels[i].setAttribute("style", "stroke:white;color:white;");
        }
        cb.setAttribute("checked", "true");

    }
    else {

        document.getElementById("screen").setAttribute("style", "background:white;");
        document.getElementById("header").setAttribute("style", "background:white;");
        document.getElementById("footer").setAttribute("style", "background:white;");
        for (i=0; i<divs.length; i++) {
            divs[i].setAttribute("style", "background:white;");
        }
        for (i=0; i<labels.length; i++) {
            labels[i].setAttribute("style", "stroke:black;color:black;");
        }
        cb.setAttribute("checked", "false");

    }
}




