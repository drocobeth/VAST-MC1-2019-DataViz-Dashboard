const acceptableGrids = [1, 2, 7, 8, 9, 10, 11, 15, 16, 17, 18, 24, 25, 26, 27, 31, 32, 33, 34]
const locations = [2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const mapGridsToLocations = new Map()
let varianceMap
let colorScale = d3.scaleLinear().range(["white", "#69b3a2"])
let grid;
let row;
let sewer_and_water = "sewer_and_water";
let power = "power";
let roads_and_bridges = "roads_and_bridges";
let shake_intensity = "shake_intensity";
let medical = "medical";
let buildings = "buildings";
let variables = [sewer_and_water, power, roads_and_bridges, medical, buildings, shake_intensity];
let barChartsArray = [];
let legendScale;
let xAxis;

function gridData() {
    for (let i = 0; i < acceptableGrids.length; i++) {
        mapGridsToLocations.set(acceptableGrids[i], locations[i])
    }
    const data = [];
    let xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    let ypos = 1;
    const width = 60;
    const height = 60;
    const click = 0;
    let num = 0;
    // iterate for rows
    for (let row = 0; row < 5; row++) {
        data.push([]);
        for (let column = 0; column < 7; column++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                click: click,
                num: num,
                variance: mapGridsToLocations.has(num) ? varianceMap.get(mapGridsToLocations.get(num)) : 0,
                location: mapGridsToLocations.has(num) ? mapGridsToLocations.get(num) : 0
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
            num++
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }
    return data;
}

function getDomainOfVariance(varMap) {
    let min = Number.MAX_VALUE
    let max = Number.MIN_VALUE

    function getDomain(value, key, map) {
        if (value > max) {
            max = value
        }
        if (value < min && value !== -1) {
            min = value
        }
    }

    varMap.forEach(getDomain)
    return [min, max]
}

function drawGrid(varMap, locVariances) {
    varianceMap = varMap
    let domain = getDomainOfVariance(varMap)
    colorScale.domain([0, domain[1]])
    let start_grid = d3.select("#grid")


    grid = start_grid.append("svg")
        .attr('viewBox', [0, 0, 500, 440])
        .attr("width", "500px")
        .attr("height", "380px")
        .attr("margin-top", "40px")
        .attr("overflow", "auto");
    let desc = d3.select("body").attr("class", "location_desc")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("background", "#fff")
        .style("visibility", "hidden")
        .style("color", "black")
        .style("border-width", "2px")
        .style("border-color", "black")
        .style("border-style", "solid")
        .style("padding", "5px")
        .style("border-radius", "8px")
        .style("width", "150px")
    row = grid.selectAll(".grid-row")
        .data(gridData)
        .enter().append("g")
        .attr("class", "grid-row");

    let squares = row.selectAll(".sq")
        .data(function (d) {
            return d;
        })
        .enter()
    squares.append("rect")
        .attr("class", "sq")
        .attr("id", function () {
            let dat = this.__data__
            return "location " + dat.location
        })
        .attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("width", function (d) {
            return d.width;
        })
        .attr("height", function (d) {
            return d.height;
        })
        .style("fill", function (d) {
            let dat = this.__data__
            return colorScale(dat.variance)
        })
        .style("stroke", "#000")
        .style("visibility", function () {
            let dat = this.__data__
            if (acceptableGrids.includes(dat.num)) {
                return "visible"
            }
            return "hidden"
        })
        .on("mousemove", function (event, d) {
            console.log("yesssss")
            desc.style("visibility", "visible").style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseover", function (event) {
            d3.select(this).style("cursor", "pointer");
            let k1 = cityDict[this.__data__.location] + ": " + this.__data__.variance
            desc.html(k1)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function () {
            desc.style("visibility", "hidden")
        })
        .on("mousedown", function () {
            let dat = this.__data__
            d3.select(this).style("opacity", "0.7")
            d3.select(document.getElementById("text " + dat.location)).style("opacity", "0.7")
        }).on("mouseup", function () {
        let dat = this.__data__
        d3.select(this).style("opacity", "1")
        d3.select(document.getElementById("text " + dat.location)).style("opacity", "1")
    })
        .on('click', function (event) {
            let dat = this.__data__
            dat.click++;
            let id = "barChart" + dat.location
            let leader_lines = document.getElementsByClassName("leader-line")
            let barCharts = document.getElementsByClassName("barChart")
            let ids = []
            for (let i = 0; i < barCharts.length; i++) {
                ids.push(barCharts[i].attributes.id.value)
            }
            if (ids.includes(id)) {
                return
            }
            let barData = [];
            let max = Number.MIN_VALUE;
            for (let i = 0; i < variables.length; i++) {
                let obj = {}
                obj.report = variables[i]
                obj.variance = locVariances[dat.location][variables[i] + " variance"]
                obj.variance = Math.round(obj.variance * 100) / 100
                barData.push(obj)
            }
            for (let i = 1; i < 20; i++) {
                for (let j = 0; j < variables.length; j++) {
                    if (max < locVariances[i][variables[j] + " variance"]) {
                        max = locVariances[i][variables[j] + " variance"]
                    }
                }
            }
            let height = 170
            let barChart_x = d3.scaleBand()
            barChart_x.domain(barData.map(d => d.report)).range([0, 350]).padding(0.2);
            let barChart_y = d3.scaleLinear()
            barChart_y.range([height, 0]).domain([0, Math.ceil(max)]);
            if (barCharts.length === 3) {
                leader_lines[0].remove()
                for (let i = 0; i < barChartsArray.length; i++) {
                    if (barChartsArray[i].id === barCharts[0].attributes.id.value) {
                        barChartsArray.splice(i, 1)
                        break;
                    }
                }
                barCharts[0].remove()
            }
            let barChart = d3.select("body")
                .append("svg")
                .attr("class", "barChart")
                .attr("id", id)
                .style("position", "absolute")
                .style("z-index", "10")
                .style("background", "#fff")
                .style("color", "black")
                .style("border-width", "2px")
                .style("border-color", "black")
                .style("border-style", "solid")
                .style("padding", "5px")
                .style("border-radius", "8px")
                .style("height", "270px")
                .style("width", "450px")
                .style("visibility", "visible").style("left", (event.pageX + 15 * getRandomArbitrary()) + "px")
                .style("top", (event.pageY + 10 * getRandomArbitrary()) + "px").append("g")
                .attr("transform", `translate(${30}, ${20})`);

            barChart.append("text").attr('transform','rotate(-90)')
                .attr('y','-20px')
                .attr('text-anchor','middle')
                .attr('x',"-85px")
                .style('font-size','15px')
                .style('fill','black')
                .text('Uncertainity (variance)');
            barChart.append("text")
                .attr('y','220px')
                .attr('text-anchor','middle')
                .attr('x',"145px")
                .style('font-size','15px')
                .style('fill','black')
                .text('Dimensions');
            barChart.append("text")
                .attr('y','-5px')
                .attr('text-anchor','middle')
                .attr('x',"145px")
                .style('font-size','15px')
                .style('fill','black')
                .text('Bar Chart');
            let yG = barChart.append("g");
            yG.attr("class", "y-axis").attr("transform", `translate(10, ${0})`)
                .call(d3.axisLeft(barChart_y).tickSizeOuter(0));
            let xG = barChart.append("g")
            xG.attr("transform", `translate(10, ${height})`)
                .call(d3.axisBottom(barChart_x))
                .selectAll("text")
                .attr("transform", "translate(0,0)rotate(-10)")
                .style("text-anchor", "center");
            barChart.selectAll(".mybar")
                .data(barData)
                .enter()
                .append("rect")
                .attr("class", "mybar")
                .attr("transform", `translate(10, ${0})`)
                .attr("x", d => barChart_x(d.report))
                .attr("y", d => barChart_y(d.variance))
                .attr("width", barChart_x.bandwidth())
                .attr("height", d => height - barChart_y(d.variance))
                .attr("fill", "#69b3a2")
            barChartsArray.push({chart: barChart, id: id, x: barChart_x, y: barChart_y, yG: yG, xG: xG})
            let line = new LeaderLine(this, document.getElementById(id))
            new PlainDraggable(document.getElementById(id), {
                onMove: () => {
                    line.position();
                }
            })

            line.setOptions({startSocket: 'top', endSocket: 'left'})
        })
    squares
        .append("text")
        .text(function (d) {
            if (acceptableGrids.includes(d.num)) {
                return d.location;
            }
        }).style("font-size", "10pt")
        .attr("id", function (d) {
            return "text " + d.location;
        })
        .attr("x", function (d) {
            return d.x + 20;
        })
        .attr("y", function (d) {
            return d.y + 30;
        }).on("mousedown", function () {
        let dat = this.__data__
        d3.select(this).style("opacity", "0.7")
        d3.select(document.getElementById("location " + dat.location)).style("opacity", "0.7")
    }).on("mouseup", function () {
        let dat = this.__data__
        d3.select(this).style("opacity", "1")
        d3.select(document.getElementById("location " + dat.location)).style("opacity", "1")
    }).on("mouseover", function (event) {
        d3.select(this).style("cursor", "pointer")
        let k1 = cityDict[this.__data__.location] + ": " + this.__data__.variance
        desc.html(k1)
            .style("left", (event.pageX + 10) + "px").style("visibility", "visible")
            .style("top", (event.pageY + 10) + "px");
    }).on("mousemove", function (event) {
        d3.select(this).style("cursor", "pointer")
        let k1 = cityDict[this.__data__.location] + ": " + this.__data__.variance
        desc.html(k1)
            .style("left", (event.pageX + 10) + "px").style("visibility", "visible")
            .style("top", (event.pageY + 10) + "px");
    })
    const linearGradient = grid.append('defs').append("linearGradient")
        .attr("id", "linear-grad")
    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => {
            return {offset: `${100 * i / n.length}%`, color: colorScale(t)}
        }))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color)
    let g = grid.append("g")
    g.append("rect")
        .attr("y", 360)
        .attr("width", 200)
        .attr("height", 20)
        .style("fill", "url(#linear-grad)")
        .style("stroke", "#000")
    legendScale = d3.scaleLinear()
        .range([0, 200])
        .domain([0, Math.ceil(domain[1])]);
    let ticks = []
    for (let i = 0; i < Math.ceil(domain[1])+1; i++) {
        ticks.push(i)
    }
    xAxis = d3.axisBottom(legendScale)
        .tickSize(20 * 1.3)
        .tickValues(ticks);
    grid.append("g")
        .attr("class", "linear-gradient-ticks")
        .call(xAxis)
        .attr('transform', `translate(0,${360})`);
}

function updateGrid(varMap, locVariances) {
    varianceMap = varMap
    let domain = getDomainOfVariance(varMap)
    colorScale.domain([domain[0], domain[1]])
    varianceMap = varMap
    grid.selectAll(".grid-row")
        .data(gridData)
    row.selectAll(".square")
        .data(function (d) {
            return d;
        }).transition()
        .duration(200).style("fill", function () {
        let dat = this.__data__
        return colorScale(dat.variance)
    })
    for (let i = 0; i < barChartsArray.length; i++) {
        let barChartId = barChartsArray[i].id
        let loc = +barChartId.replace("barChart", "")
        let barData = [];
        let max = Number.MIN_VALUE;
        for (let i = 0; i < variables.length; i++) {
            let obj = {}
            obj.report = variables[i]
            obj.variance = locVariances[loc][variables[i] + " variance"]
            obj.variance = Math.round(obj.variance * 100) / 100
            barData.push(obj)
        }
        for (let i = 1; i < 20; i++) {
            for (let j = 0; j < variables.length; j++) {
                if (max < locVariances[i][variables[j] + " variance"]) {
                    max = locVariances[i][variables[j] + " variance"]
                }
            }
        }
        let x = barChartsArray[i].x
        let y = barChartsArray[i].y
        let yG = barChartsArray[i].yG
        y.domain([0, Math.ceil(max)])
        yG.transition().duration(100)
            .call(d3.axisLeft(y).tickSizeOuter(0))
        console.log(barData)
        barChartsArray[i].chart.selectAll(".mybar").data(barData).transition()
            .duration(200).attr("x", d => x(d.report))
            .attr("y", d => y(d.variance))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.variance))

    }
    legendScale = d3.scaleLinear().range([0, 200])
        .domain([0, Math.ceil(domain[1])]);
    let ticks = []
    for (let i = 0; i < Math.ceil(domain[1])+1; i++) {
        ticks.push( i)
    }
    xAxis = d3.axisBottom(legendScale)
        .tickSize(20 * 1.3)
        .tickValues(ticks);
    let linear_gradient_ticks = document.getElementsByClassName("linear-gradient-ticks")
    while (linear_gradient_ticks.length !== 0) {
        linear_gradient_ticks[0].remove()
    }
    grid.append("g")
        .attr("class", "linear-gradient-ticks")
        .call(xAxis)
        .attr('transform', `translate(0,${360})`);

}

function getRandomArbitrary() {
    return Math.random() * 10;
}