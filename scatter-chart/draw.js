function draw(){

    var initialProps = {
        dims: {
          single: { width: 300, height: 225 },
          double: { width: 620, height: 350}
        },
    };
    
    // Returns object with properties and methods representing
    // dimensions, scales, axes, etc.
    var werk = werkHelper.build(initialProps);
    
    
    var line = d3.line()
        .defined(function(d){ return !isNaN(d.y);})
        .x(function(d) { return werk.scales.x(d.x); })
        .y(function(d) { return werk.scales.y(d.y); });
    
    var svg = d3.select("#chart")
        .append("svg")
        .style("background-color","transparent")
        .attr("width", werk.dims.svg.width + werk.dims.margins.left + werk.dims.margins.right)
        .attr("height", werk.dims.svg.height + werk.dims.margins.top + werk.dims.margins.bottom)
      .append("g")
        .attr("transform", "translate(" + werk.dims.margins.left + "," + werk.dims.margins.top + ")");

    chartwerk.axes.base.shadedRegions.forEach(function(shade) {
        var rectLeft = werk.scales.x(werk.parsers.base(shade.min));
        var rectRight = werk.scales.x(werk.parsers.base(shade.max));
        var minWidth = 2;
        var width = Math.max(2, rectRight - rectLeft);
        if (rectRight === rectLeft) {
            svg.append('line')
                .attr("class",'solid-line')
                .attr("y1", 0)
                .attr("y2", werk.scales.y.range()[0])
                .attr("x1", rectLeft)
                .attr("x2", rectLeft);
        } else {
            svg.append('rect')
                .attr("class","shaded-area")
                .attr('y', 0)
                .attr('x', rectLeft)
                .attr('width', width)
                .attr('height', werk.scales.y.range()[0]); 
        }
    });
    
    chartwerk.axes.value.shadedRegions.forEach(function(shade) {
        var rectMin = werk.scales.y(werk.parsers.value(shade.min));
        var rectMax = werk.scales.y(werk.parsers.value(shade.max));
        var height = Math.max(2, rectMin - rectMax);
        if (rectMin === rectMax) {
            svg.append('line')
                .attr("class",'dotted-line')
                .attr("x1", 0)
                .attr("x2", werk.scales.x.range()[1])
                .attr("y1", rectMin)
                .attr("y2", rectMin);
        } else {
            svg.append('rect')
                .attr("class","shaded-area")
                .attr('x', 0)
                .attr('y', rectMax)
                .attr('width', werk.scales.x.range()[1])
                .attr('height', height); 
        }
    });
    

    svg.append("g")
        .attr("class", "y axis")
        .call(werk.axes.y)
      .append("text")
        .attr("class","label")
        .attr("y", -werk.dims.margins.top + 15)
        .attr("x", -werk.dims.margins.left)
        .style("text-anchor", "start")
        .text(chartwerk.axes.value.label);
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + werk.dims.svg.height + ")")
        .call(werk.axes.x)
    .append("text")
        .attr("class","label")
        .attr("y", -5 )
        .attr("x", werk.dims[chartwerk.ui.size].width - werk.dims.margins.right - werk.dims.margins.left)
        .style("text-anchor", "end")
        .text(chartwerk.axes.base.label);
    		
    svg.selectAll(".dot")
      .data(werk.data[0].values)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return werk.scales.x(d.x); })
      .attr("cy", function(d) { return werk.scales.y(d.y); })
      .style("fill", function(d){ return werk.scales.color(d.name);});
    
    //A rect to catch mouse movements
    var pointerRect = svg.append("rect")
    	.attr("height", werk.dims.svg.height)
    	.attr("width", werk.dims.svg.width)
    	.style("fill","none")
    	.style("pointer-events", "fill")
        .on("mouseout",  hideTooltip)
        .on("mousemove", showTooltip);
    
    
    
    var tooltip = d3.select("#chart")
      .append("div")
        .attr("class","tooltip")
        .style("position","absolute");
    tooltip
      .append("div")
      .attr("class","value-label");
    tooltip
      .append("div")
      .attr("class","value-base");
    tooltip
      .append("div")
      .attr("class","value-value");
    
    var trackCirc = svg.append("circle")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",4)
		.style("fill","none")
		.style("stroke-width",2)
		.style("display","none")
        .style("pointer-events", "none");
      
    function hideTooltip(){
        d3.select(".tooltip")
          .style("opacity", 0);
        trackCirc
          .style("display", "none");
    }
    
    function showTooltip(){
        var x0 = d3.mouse(this)[0],
    		y0 = d3.mouse(this)[1],
    
    		//Start dist at a max number so we can check all distances less than
    		dist = werk.scales.x(werk.dataDims.xMax) - werk.scales.x(werk.dataDims.xMin) + werk.scales.y(werk.dataDims.yMax) - werk.scales.y(werk.dataDims.yMin),
    		nearestX = 0,
    		nearestY = 0,
    		colorGroup = "",
    		comma = d3.format(",");
    
    	werk.data.forEach(function(series){
    		series.values.forEach(function(d){
    			if(Math.abs(x0 - werk.scales.x(d.x)) + Math.abs(y0 - werk.scales.y(d.y))  < dist){
    				nearestX = d.x
    				nearestY = d.y
    				label = d.label
    				colorGroup = series.name
    				dist = Math.abs(x0 - werk.scales.x(d.x)) + Math.abs(y0 - werk.scales.y(d.y))
    			}
    		})
    
    	});


	    trackCirc
			.attr("cx", werk.scales.x(nearestX))
			.attr("cy", werk.scales.y(nearestY))
			.style("stroke","#333")
			.style("display","");
			
		d3.select(".tooltip .value-label")
          .style("color", werk.scales.color(colorGroup))
          .text(function(){
              return label;
          });
          
		d3.select(".tooltip .value-base")
          .style("color", werk.scales.color(colorGroup))
          .text(function(){
              var b = chartwerk.axes.base;
              return b.label + ': ' + b.prefix + comma(nearestX) + b.suffix;
          });
          
        d3.select(".tooltip .value-value")
          .style("color", werk.scales.color(colorGroup))
          .text(function(){
              var v = chartwerk.axes.value;
              return v.label + ': ' + v.prefix + comma(nearestY) + v.suffix;
          });
          
        var p = d3.mouse(this.parentElement.parentElement);
        
        d3.select(".tooltip")
            .style("opacity", 1)
            .style("top", function(){
                var s = chartwerk.ui.size,
                    h = werk.dims[s].height,
                    tipH = parseInt(d3.select(".tooltip").style("height"), 10),
                    pos = p[1] > (h / 2) ?
                        p[1] - (tipH + 5) : p[1] + 15;
                return pos.toString() + "px";
            })
            .style("left", function(){
                // We position either left or right of the mouse point based
                // on whether we're past the midpoint of the chart. This protects
                // against tooltips overflowing embedded iframes.
                var s = chartwerk.ui.size,
                    w = werk.dims[s].width,
                    tipW = parseInt(d3.select(".tooltip").style("width"), 10),
                    pos = p[0] > (w / 2) ?
                        p[0] - (tipW + 10) : p[0] + 10;
                return pos.toString() + "px";
            });
    }
}