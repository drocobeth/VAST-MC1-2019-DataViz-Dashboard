
var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var reportsData;
let pathgeo;
let sewerData;
var scatterSvg;
var changeIt;



// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
   mapSvg = d3.select('#map').append('svg').attr("viewbox", [0, 0, sunWidth + "px", sunWidth + "px"])
  .style("width", sunWidth + "px")
  .style("height", sunWidth + "px")
  .style("align-items", "center")
  .style('font', '10px sans-serif');
  //scatterSvg = d3.select('#scatterplot');
  //changeIt = document.getElementById('scatterplotsvg')
	//changeIt.style.display = 'none';
	//lineWidth = +scatterSvg.style('width').replace('px', '');
	//console.log(lineWidth);
    //lineHeight = +scatterSvg.style('height').replace('px', '');;
    lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
    lineInnerHeight = 100 - lineMargin.top - lineMargin.bottom;
  // Load both files before doing anything else
  Promise.all([d3.json('data/StHimark.geojson'),
               d3.csv('data/dummy_data.csv') ])
          .then(function(values){
    
    mapData = values[0];
     reportsData = {
	 	1:["1","1","1","1","1","1"],
	 	2:["1","1","1","1","1","1"],
	 	3:["1","1","1","1","1","1"],
	 	4:["1","1","1","1","1","1"],
	 	5:["1","1","1","1","1","1"],
	 	6:["1","1","1","1","1","1"],
	 	7:["1","1","1","1","1","1"],
	 	8:["1","1","1","1","1","1"],
	 	9:["1","1","1","1","1","1"],
	 	10:["1","1","1","1","1","1"],
	 	11:["1","1","1","1","1","1"],
	 	12:["1","1","1","1","1","1"],
	 	13:["1","1","1","1","1","1"],
	 	14:["1","1","1","1","1","1"],
	 	15:["1","1","1","1","1","1"],
	 	16:["1","1","1","1","1","1"],
	 	17:["1","1","1","1","1","1"],
	 	18:["1","1","1","1","1","1"],
	 	19:["1","1","1","1","1","1"]
	 }
	//console.log(reportsData);
    //console.log(reportsData);
   // updateGeoMap(1000,1500,damageVariable);
  //  console.log('damage clicked: ',damageClicked);
   updategeoMap(1000,1500);
   
  })

});
async function updategeoMap(startTime,endTime)
{
  return fetch(`http://localhost:5000/getgeoData/${startTime}/${endTime}` ).then((response) => {
    response.json().then(function (data){
      // console.log("Data returned",data);
      reportsData=data;
      drawMap();
      getData(damageClicked);
    });
  });
}

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.


// Draw the map in the #map svg
function drawMap() {

  // create the map projection and geoPath
  var mapWidth = (200 - lineMargin.left - lineMargin.right)/2
    var mapHeight = 200 - lineMargin.left - lineMargin.right

    
	let projection = d3.geoMercator()
                      .scale(110500)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
    
  pathgeo = d3.geoPath()
               .projection(projection);

  var count=1;
	//if(id == "sewer-water-map-bt") {
		
		//sewerData = reportsData.filter(d => d.Year == 1)[0];
		//console.log(sewerData);
	//}
	let extent = [1,10];
    var drawColor = 'interpolateRdYlGn';
    colorScale = d3.scaleSequentialQuantile().domain([100, 1, 13]);
            
    //console.log(colorScale);

  
  
  
  
  
  //console.log(mapData.features);
  
  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', pathgeo)
    .attr('id', d => {  return d.properties.Id})
    .attr('class','countrymap')
    .style('fill', 'white'
     
    )
    .on('mouseover', function(d,i) {
     //console.log('mouseover on ' + d.properties.Id);
    })
    .on('mousemove',function(d,i) {
      //console.log('mousemove on ' + d.properties.name);
    })
    .on('mouseout', function(d,i) {
      //console.log('mouseout on ' + d.properties.name);
    })
    .on('click', function(d,i) {
     // console.log('clicked on ' + d.properties.name);
	  
    });
	//getData();
    
}

function getData(clickedVariable) {
   damageClicked=clickedVariable;
   damageVariable=damageDict[damageClicked];
   updateScatter(startTime, endTime, damageVariable);
	 mapSvg.selectAll("*").remove();
	var count=1;
	if(clickedVariable == "sewer-water-map-bt") {
		// console.log("Sewer data");
    var tempData={}
		for(let i=1;i<20;i++)
    {
      tempData[i]=reportsData[i][0];
    }
		sewerData = tempData;
		//console.log(sewerData);
		colorScale = d3.scaleSequential(d3.interpolateBlues).domain([1,100]);
		//console.log(sewerData);
	}
	
	if(clickedVariable == "power-map-bt") {
		// console.log("Power Data");
		var tempData={}
		for(let i=1;i<20;i++)
    {
      tempData[i]=reportsData[i][1];
    }
		sewerData = tempData;
    // console.log("Power Data Value: ", sewerData);
		colorScale = d3.scaleSequential(d3.interpolateReds).domain([1,100]);
		//console.log(sewerData);
	}
	
	if(clickedVariable == "roads-bridges-map-bt") {
		// console.log("Road data");
		var tempData={}
		for(let i=1;i<20;i++)
    {
      tempData[i]=reportsData[i][2];
    }
		sewerData = tempData;
		colorScale = d3.scaleSequential(d3.interpolateGreys).domain([1,100]);
		//console.log(sewerData);
	}
	
	
	if(clickedVariable == "medical-map-bt") {
		// console.log("Medical data");
		var tempData={}
		for(let i=1;i<20;i++)
    {
      tempData[i]=reportsData[i][3];
    }
		sewerData = tempData;
		colorScale = d3.scaleSequential(d3.interpolateGreens).domain([1,100]);
		//console.log(sewerData);
	}
	
	if(clickedVariable == "buildings-map-bt") {
		// console.log("Buildings data");
		
		
		var tempData={}
		for(let i=1;i<20;i++)
    {
      tempData[i]=reportsData[i][4];
    }
    // console.log("Building Data: ",tempData);
		sewerData = tempData;
		
		colorScale = d3.scaleSequential(d3.interpolateRdPu).domain([1,100]);
		//console.log(sewerData);
	}
	
	if(clickedVariable == "shake-intensity-map-bt") {
		// console.log("Shake Intensity data");
		
		
		var tempData={}
    // console.log("This is the reports Data: ",reportsData);
		for(let i=1;i<20;i++)
    {
      tempData[i]=reportsData[i][5];
    }
    // console.log("Shake Intensity data: ",tempData);
		sewerData = tempData;
		
		colorScale = d3.scaleSequential(d3.interpolatePurples).domain([1,100]);
		//console.log(sewerData);
	}
	
      //console.log(colorScale);

   var div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
  
  //console.log(mapData.features);
  
  // draw the map on the #map svg
  let g = mapSvg.append('g');
  
  const linearGradient = g.append("linearGradient")
        .attr("id", "linear-gradient");
		
   linearGradient.selectAll("path")
        .data(colorScale.ticks().map((t, i, n) => ({
            offset: `${100*i/n.length}%`,
            color: colorScale(t)
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);       
    //console.log(colorScale);
	legend = g.append("rect")
        .data(mapData.features)
        .attr('transform', `translate(${lineMargin.left}, 50)`)
        .attr('transform', `translate(30,${540 - lineMargin.bottom})`)
        .attr("width", 350 - lineMargin.right - lineMargin.left)
        .attr("height", 20)

        .style("fill", "url(#linear-gradient)")
		;
		
		axisScale = d3.scaleLinear()
        .domain([1,10])
        .range([lineMargin.left-70, 220]);
		
	const axisBottom1 = d3.axisBottom(axisScale);
    
  
  
  
  
  
  
  
  g.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr('d', pathgeo)
    .attr('id', d => {  return d.properties.Id})
    .attr('class','countrymap')
    .style('fill', d => {
      let val1 = +sewerData[d.properties.Id];
	 //console.log("The values are: "+sewerData);
      if(isNaN(val1)) 
		//console.log("I came here")
        return 'white';
      return colorScale(val1);
    })	
    .on('mouseover', function(event,d) {
      //console.log(d3.pointer(event));
            d3.select(this).style('stroke', 'Cyan')
                .attr('stroke-width', 4);
            div.style("opacity", 1);
			//console.log(mapData.features);
			//console.log("Here");
			//console.log(county1);
            let info = 'Neighborhood: ' + d.properties.Nbrhood + '<br>' + 'Intensity Rate: ' + sewerData[d.properties.Id]/10;
			//console.log(info);
            div.html(info)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
    })
    
    .on('mouseout', function(d,i) {
      
	  //console.log('mouseout on ' + d.properties.Id);
            d3.select(this).style('stroke', 'Black')
                .attr('stroke-width', 1);
            div.style("opacity", 0);
    });
   
	
	g.append('g').attr("class", `x-axis`)
        .attr("transform", `translate(0,${540-lineMargin.bottom})`)
        .call(d3.axisBottom(axisScale)
            .ticks(4)
            .tickSize(20));
		
}

