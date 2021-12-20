let data;
const margin = {top: 30, right: 10, bottom: 80, left: 50},
    width = 1600 - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;
let svg;
let x;
let x_axis;
let mapDateToReports
let y
let x_high;
let y_high = 10;
let keys;
let area_data = [];
const sunWidth = 632;
let svgSun
let gSun;
let locationVariances;
let left_time;
let right_time;
let xTime;
let timeAverage;
//Variables added by Saad
let damageDict = {
    "power-map-bt": 0,
    "roads-bridges-map-bt": 1,
    "medical-map-bt": 2,
    "buildings-map-bt": 3,
    "shake-intensity-map-bt": 4,
    "sewer-water-map-bt": 5
}
var damageClicked = 'power-map-bt';
let startTime = 379;
let endTime = 1079;
let damageVariable = damageDict['power-map-bt'];
$(document).ready(function () {
    $("#chart").css("margin-bottom", "20px")
    $("#grid").css("padding-left", "20px").css("padding-top", "20px").css("width", 600)
    svgSun = d3.select('#chart').append('svg').attr("viewbox", [0, 0, sunWidth + "px", sunWidth + "px"])
        .style("width", sunWidth + "px")
        .style("height", sunWidth + "px")
        .style("align-items", "center")
        .style('font', '10px sans-serif');
    gSun = svgSun.append('g')
        .attr('transform', `translate(${sunWidth / 2},${sunWidth / 2})`);
    Promise.all([d3.csv('data/mc1-reports-data.csv')]).then(async function (values) {
        data = values[0]
        data.sort(function (a, b) {
            let x = a.time
            let y = b.time
            return x < y ? -1 : x > y ? 1 : 0;
        })

        let dataLength = data.length
        for (let i = 0; i < dataLength; i++) {
            for (const prop in data[i]) {
                if (data[i][prop] === "") {
                    data[i][prop] = 0
                }
                if (prop !== "time") {
                    data[i][prop] = parseFloat(data[i][prop])
                }
            }
        }
        for (let i = 0; i < variables.length; i++) {
            let count = 0
            for (let j = 0; j < data.length; j++) {
                if (data[j][variables[i]] !== 0) {
                    count += 1
                }
            }
            console.log(variables[i], count)
        }
        mapDateToReports = new Map()
        for (let i = 0; i < dataLength; i++) {
            let time = data[i].time
            if (mapDateToReports.has(time)) {
                let result = mapDateToReports.get(time)
                let count = result.count
                let avg = 0;
                for (const prop in data[i]) {
                    if (prop !== "time" && prop !== "location") {
                        avg += (result[prop] * count + data[i][prop]) / (count + 1)
                        result[prop] = ((result[prop] * count) + data[i][prop]) / (count + 1)
                        if (result[prop] > 10) {
                            // console.log(i)
                        }
                    }
                    result.count = count + 1
                }
                mapDateToReports.set(time, {...result, avg: +(avg / 6).toFixed(2)})
            } else {
                let obj = {}
                let avg = 0
                for (const prop in data[i]) {
                    if (prop !== "time" && prop !== "location") {
                        obj[prop] = data[i][prop]
                        avg += data[i][prop]
                    }
                    avg = avg / 6
                }
                mapDateToReports.set(time, {count: 1, ...obj, avg: +avg.toFixed(2)})
            }
        }
        svg = d3.select("#density_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
        keys = Array.from(mapDateToReports.keys())
        keys.sort(function (x, y) {
            return x < y ? -1 : x > y ? 1 : 0;
        })
        x_high = mapDateToReports.size
        for (let i = 0; i < mapDateToReports.size; i++) {
            area_data.push({
                x: i,
                y: mapDateToReports.get(keys[i]).avg
            })
        }
        draw_chart()
    })
})

// plot x-axis
function draw_x_axis(left, right) {
    let dat = []
    for (let i = 0; i < mapDateToReports; i++) {
        dat.push(i)
    }
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x_axis).tickSizeOuter(0).tickFormat(function (d, i) {
            return keys[d];
        }));
    svg.append("text")
        .attr('y', '220px')
        .attr('x', "645px")
        .style('font-size', '15px')
        .style('fill', 'black')
        .text('Time from ');
    left_time = svg.append("text")
        .attr('y', '220px')
        .attr('x', "725px")
        .style('font-size', '15px')
        .style('fill', 'gray')
        .text(keys[left])
    svg.append("text")
        .attr('y', '220px')
        .attr('x', "900px")
        .style('font-size', '15px')
        .style('fill', 'black')
        .text('to ');
    right_time = svg.append("text")
        .attr('y', '220px')
        .attr('x', "935px")
        .style('font-size', '15px')
        .style('fill', 'gray')
        .text(keys[144])
}

// plot y-axis
function draw_y_axis() {
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickSizeOuter(0));
    svg.append("text").attr('transform', 'rotate(-90)')
        .attr('y', '-30px')
        .attr('text-anchor', 'middle')
        .attr('x', "-85px")
        .style('font-size', '15px')
        .style('fill', 'black')
        .text('Average Damage Intensity');
}


function draw_chart() {
    x_axis = d3.scaleLinear().domain([0, x_high]).range([0, width])
    y = d3.scaleLinear()
        .range([height, 0]).domain([0, y_high]);

    d3.select("#density_plot").append("div")
        .attr("id", "sliding_window")
        .style("position", "absolute")
        .style("height", height - 36 + "px")
        .style("width", width + 2 + "px")
        .style("left", x_axis(0) + margin.left + margin.right - 6 + "px")
        .style("top", y(7.4) + margin.top + 38 + "px")
    d3.select("#sliding_window").append("div")
        .attr("id", "slider")
        .style("height", height - 37 + "px")
        .style("background", "#71797E")
        .style("opacity", "0.2")
        .style("color", "black")
        .style("border-width", "1px")
        .style("border-color", "black")
        .style("border-style", "solid")
        .style("border-bottom-style", "none")
        .style("border-radius", "3px 3px 0px 0px")
        .style("width", "100px")
    let slider = $('#slider')
    let stopAction = function () {
        let u = document.getElementById("slider")
        let right = Math.round(x_axis.invert(u.offsetLeft + u.offsetWidth) > 1440 ? 1440 : x_axis.invert(u.offsetLeft + u.offsetWidth))
        let left = Math.round(x_axis.invert(u.offsetLeft))
        if (left < 0) {
            left = 0
        }
        let sol = getSlidingWindowData(keys[left], keys[right])
        left_time.text(keys[left])
        right_time.text(keys[right])
        updateSunBurst(getSunBurstData(data.slice(sol[0], sol[1])))
        startTime = sol[0];
        endTime = sol[1];
        updateGrid(getVariance(data.slice(sol[0], sol[1])), locationVariances)
        updateScatter(sol[0], sol[1], damageVariable);
        updategeoMap(sol[0], sol[1]);
    }
    slider.draggable({
        axis: "x",
        containment: "parent",
        stop: stopAction
    });
    slider.resizable({
        containment: "parent",
        handles: "e, w",
        stop: stopAction
    })
    drawDensityPlot(area_data)
    let u = document.getElementById("slider")
    let right = Math.round(x_axis.invert(u.offsetLeft + u.offsetWidth) > 1440 ? 1440 : x_axis.invert(u.offsetLeft + u.offsetWidth))
    let left = Math.round(x_axis.invert(u.offsetLeft))
    if (left < 0) {
        left = 0
    }
    let sol = getSlidingWindowData(keys[left], keys[right])
    let dat = getSunBurstData(data.slice(sol[0], sol[1]))
    drawSunBurst(dat, svgSun, gSun)
    drawGrid(getVariance(data.slice(sol[0], sol[1])), locationVariances)
    draw_x_axis(left, right)
    draw_y_axis()
}

function drawDensityPlot(data) {
    svg.append("g").append("path")
        .datum(data)
        .attr('class', "area")
        .attr("fill", "#69b3a2")
        .attr("opacity", "0.65")
        .attr("stroke", "black")
        .attr("stroke-width", 0.8)
        .attr("d", d3.area().curve(d3.curveBasis)
            .x(function (d) {
                return x_axis(d.x);
            })
            .y1(function (d) {
                return y(d.y);
            })
            .y0(height));
}

function getSunBurstData(givenData) {
    let obj = {name: "reports", children: []}
    for (const prop in givenData[0]) {
        if (prop !== "time" && prop !== "location") {
            let ob = {}
            ob.name = prop
            ob.children = []
            obj.children.push(ob)
        }
    }
    for (let i in obj.children) {
        let locationData = [];
        for (let i = 1; i <= 19; i++) {
            locationData.push({
                name: cityDict[i],
                value: 0,
                count: 0
            })
        }
        obj.children[i].children = locationData
    }
    for (let i in givenData) {
        let instance = givenData[i]
        for (const prop in instance) {
            let found = false
            if (prop !== "time" && prop !== "location") {
                for (let report in obj.children) {
                    let child = obj.children[report]
                    if (child.name === prop) {
                        for (let location in child.children) {
                            if (child.children[location].name === cityDict[givenData[i].location] && givenData[i][prop] !== 0) {
                                child.children[location].value += 1
                                found = true
                            }
                            if (found) {
                                break
                            }
                        }
                    }
                    if (found) {
                        found = false
                        break
                    }
                }
            }
        }
    }
    for (let i = 0; i < obj.children.length; i++) {
        let children = obj.children[i].children
        children.sort(function (a, b) {
            let x = b.value
            let y = a.value
            return x < y ? -1 : x > y ? 1 : 0;
        })
        obj.children[i].children = children.slice(0, 5)
    }
    return obj
}

function getSlidingWindowData(leftTime, rightTime) {
    let startIndex = getFirstInstance(leftTime, data)
    let endIndex = getLastInstance(rightTime, data)
    return [startIndex, endIndex]
}

function getFirstInstance(leftTime, data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].time === leftTime) {
            return i
        }
    }
    return -1
}

function getLastInstance(rightTime, data) {
    let count = 0
    let index = 0
    for (let i = 0; i < data.length; i++) {
        if (count === 0) {
            if (data[i].time === rightTime) {
                count += 1
                index = i
            }
        } else {
            if (data[i].time !== rightTime) {
                break
            }
        }
    }
    return index + count - 1
}

function getVariance(dat) {
    const variance = " variance"
    let locations = new Array(20);
    for (let i = 0; i < locations.length; i++) {
        let means = {}
        for (const prop in data[i]) {
            if (prop !== "time" && prop !== "location") {
                means[prop] = 0
                means[prop + variance] = 0
            }
        }
        locations[i] = {data: [], ...means, count: 0, variance: 0}
    }

    for (let i = 0; i < dat.length; i++) {
        let obj = {}
        let instance = dat[i]
        locations[instance.location].count += 1
        for (const prop in data[i]) {
            if (prop !== "time" && prop !== "location") {
                let d = data[i][prop]
                obj[prop] = d
                locations[instance.location][prop] += d
            }
        }
        locations[instance.location].data.push(obj)
    }

    for (let i = 1; i < locations.length; i++) {
        let loc = locations[i]
        if (loc.count !== 0) {
            for (const prop in loc.data[0]) {
                loc[prop] /= loc.count
                for (let j = 0; j < loc.data.length; j++) {
                    loc[prop + variance] += (loc.data[j][prop] - loc[prop]) ** 2
                }
                loc[prop + variance] /= loc.count
                loc.variance += loc[prop + variance]
            }
        }
        loc.variance /= 6
        loc.variance = Math.round(loc.variance * 100) / 100
    }
    locationVariances = locations
    let varianceMap = new Map()
    for (let i = 1; i < locations.length; i++) {
        let loc = locations[i]
        if (loc.count === 0) {
            varianceMap.set(i, -1)
        } else {
            varianceMap.set(i, loc.variance)
        }
    }
    return varianceMap
}