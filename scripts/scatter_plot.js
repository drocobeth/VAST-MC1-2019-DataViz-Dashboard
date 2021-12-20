
var scatterSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };
let pathscatter;
var scatterSvg;
// var dataset1 = [[90, 20], [20, 100], [66, 44], [53, 80], [24, 182], [80, 72], [10, 76], [33, 150], [100, 15]];
var cityDict= {
	1:"Palace Hills",
	2:"Northwest",
	3:"Old Town",
		4:"Safe Town",
		5:"Southwest",
		6:"Downtown",
		7:"Wilson Forest",
		8:"Scenic Vista",
		9:"Broadview",
		10:"Chapparal",
		11:"Terrapin Springs",
		12:"Pepper Mill",
		13:"Cheddarford",
		14:"Easton",
		15:"Weston",
		16:"Southton",
		17:"Oak Willow",
		18:"East Parton",
		19:"West Parton"	
}
  
var first; 
var second; 
var third; 
var fourth;
  

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  
  scatterSvg = d3.select("#scatter").append('svg').attr("viewbox", [0, 0, width + "px", sunWidth + "px"])
            .style("width", width+60 + "px")
            .style("height", sunWidth-60 + "px")
            .style("align-items", "center")
            .style('font', '10px sans-serif');
  
	lineWidth = +scatterSvg.style('width').replace('px', '');
	//console.log("hello");
    lineHeight = +scatterSvg.style('height').replace('px', '');
    lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
    lineInnerHeight = 530 - lineMargin.top - lineMargin.bottom;
  // Load both files before doing anything else
 
 // console.log("damage Variable in Scatter: ",damageVariable);  
  updateScatter('1000','1500',damageVariable);

});

async function updateScatter(startTime,endTime,damageValue)
{
  return fetch(`http://localhost:5000/getScatterData/${startTime}/${endTime}/${damageValue}` ).then((response) => {
    response.json().then(function (data){
     // console.log("Data returned",data);
      var locationIndex={}
        locationIndex[data['topLocations'][0]] = 1 
        locationIndex[data['topLocations'][1]] = 2 
        locationIndex[data['topLocations'][2]] = 3 
        locationIndex[data['topLocations'][3]] = 4 
    
      let dataList=[]
      for(let i=0;i<data['location'].length;i++)
      {
        let temp=Array(9).fill(5000);
        temp[0]=data['time'][i];

        if(data['value'][i]>0){
          temp[locationIndex[data['location'][i]]]=data['value'][i];
        }
        temp[5]= data['topLocations'][0];
        temp[6]=data['topLocations'][1];
        temp[7]=data['topLocations'][2];
        temp[8]=data['topLocations'][3];
        dataList.push(temp);
		
      }
     // console.log(dataList);
	  // dataList = [['2020-04-06 10:45:00',12,10,11,9,1,2,3,4],['2020-04-07 10:45:00',5,4,7,8,1,3,4,5],['2020-04-08 10:45:00',8,9,6,10,2,1,12,15]]
      drawScatter(dataList);
    });
  });
}


// Draw the scatter in the #map svg

function drawScatter(dataset1) {
	
	scatterSvg.selectAll("*").remove();
	const xyz = lineMargin.top+400; //changing here from 340 to 400
    const g = scatterSvg.append('g')
        .attr('width', lineWidth + lineMargin.left + lineMargin.right)
        .attr('height', lineHeight + lineMargin.top + lineMargin.bottom)
        .attr('transform', 'translate(' + lineMargin.left + ', ' + xyz + ')');

   	
	 var div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
		
	
	
	var xScale = d3.scaleTime()
        .domain(d3.extent(dataset1, function (d) {
          return new Date(d[0]);
     }))

        .range([-1, lineInnerWidth-290]); //Subtract 180 from lineInnerWidth
    let yMax=0;
    for(let i=0;i<dataset1.length;i++)
    {
     if(dataset1[i][1]<20) {yMax=Math.max(yMax,dataset1[i][1]);}
     if(dataset1[i][2]<20) {yMax=Math.max(yMax,dataset1[i][2]);}
     if(dataset1[i][3]<20) {yMax=Math.max(yMax,dataset1[i][3]);}
    }
    var yScale = d3.scaleLinear()
        .domain([0, yMax+1])
        .range([lineInnerHeight, -350]);
		
	 g.append("g")
    .call(d3.axisLeft(yScale));
        
       
    
     g.append("g")
    .attr("transform", "translate("+ 1+"," + lineInnerHeight + ")")
    .call(d3.axisBottom(xScale))
	.attr("dx", "10px")
        .attr("dy", "10px");
    
	
	g.append('g')
    .selectAll("dot")
    .data(dataset1)
    .enter()
    .append("circle")
	
      .attr("cx", function (d) { return xScale(new Date(d[0])); } )
        .attr("cy", function (d) { first = cityDict[d[5]]; return yScale(d[1]); } )
		
      .attr("r",8)
      .style("fill", "#7570b3")
	   .on('mouseover', function(event,d) {
      //console.log(d3.pointer(event));
           
            div.style("opacity", 1);
			var cityName = cityDict[d[5]];
			
            let info = 'Neighborhood: ' + cityName + '<br>' + 'Intensity Rate: ' + d[1];
			
            div.html(info)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
    })
    
    .on('mouseout', function(d,i) {
      
            
            div.style("opacity", 0);
    });
	  
	  
	  
	  
	  
	  g.append('g')
    .selectAll("dot")
    .data(dataset1)
    .enter()
    .append("circle")
	
      .attr("cx", function (d) { return xScale(new Date(d[0])); } )
        .attr("cy", function (d) { second = cityDict[d[6]]; return yScale(d[2]); } )
		
      .attr("r",8)
      .style("fill", "#ffd92f")
	   .on('mouseover', function(event,d) {
      //console.log(d3.pointer(event));
           
            div.style("opacity", 1);
			var cityName = cityDict[d[6]];
			
            let info = 'Neighborhood: ' + cityName + '<br>' + 'Intensity Rate: ' + d[2];
			
            div.html(info)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
    })
    
    .on('mouseout', function(d,i) {
      
            
            div.style("opacity", 0);
    });
	
	
	  
	   g.append('g')
    .selectAll("dot")
    .data(dataset1)
    .enter()
    .append("circle")
	
      .attr("cx", function (d) { return xScale(new Date(d[0])); } )
        .attr("cy", function (d) {third = cityDict[d[7]]; return yScale(d[3]); } )
		
      .attr("r",8)
      .style("fill", "#e7298a")
	  .on('mouseover', function(event,d) {
      //console.log(d3.pointer(event));
           
            div.style("opacity", 1);
			var cityName = cityDict[d[7]];
			
            let info = 'Neighborhood: ' + cityName + '<br>' + 'Intensity Rate: ' + d[3];
			
            div.html(info)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
    })
    
    .on('mouseout', function(d,i) {
      
            
            div.style("opacity", 0);
    });
	
	 g.append('g')
    .selectAll("dot")
    .data(dataset1)
    .enter()
    .append("circle")
	
      .attr("cx", function (d) { return xScale(new Date(d[0])); } )
        .attr("cy", function (d) {fourth = cityDict[d[8]]; return yScale(d[4]); } )
		
      .attr("r",8)
      .style("fill", "#66a61e")
	  .on('mouseover', function(event,d) {
      //console.log(d3.pointer(event));
           
            div.style("opacity", 1);
			var cityName = cityDict[d[8]];
			
            let info = 'Neighborhood: ' + cityName + '<br>' + 'Intensity Rate: ' + d[4];
			
            div.html(info)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
    })
    
    .on('mouseout', function(d,i) {
      
            
            div.style("opacity", 0);
    });
	  
	  
	  
	  
	   // X label
        g.append('text')
        .attr('x', lineInnerWidth/2 )
        .attr('y', lineInnerHeight+50)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', "15px")
        .text('Time');
        var heightY = lineInnerHeight-200
        // Y label
        g.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(-50,' + heightY + ')rotate(-90)')
        .style('font-family', 'Helvetica')
        .style('font-size', "15px")
        .text('Intensity');

        //Legend
	 g.append("circle")
   .style("fill", "#7570b3")            
   .attr('r', 10)
   .attr('transform', 'translate(1210,-315)');

g.append('text')
.attr('y', '-311px')
.attr('x', '1225px')
.attr('font-size', '14px')
.text(first);

g.append("circle")
   .style("fill", "#ffd92f")            
   .attr('r', 10)
   .attr('transform', 'translate(1210,-285)');

g.append('text')
.attr('y', '-281px')
.attr('x', '1225px')
.attr('font-size', '14px')
.text(second);

g.append("circle")
   .style("fill", "#e7298a")            
   .attr('r', 10)
   .attr('transform', 'translate(1210,-255)');

g.append('text')
.attr('y', '-251px')
.attr('x', '1225px')
.attr('font-size', '14px')
.text(third);


g.append("circle")
   .style("fill", "#66a61e")            
   .attr('r', 10)
   .attr('transform', 'translate(1210,-225)');

g.append('text')
.attr('y', '-221px')
.attr('x', '1225px')
.attr('font-size', '14px')
.text(fourth);
}



