function draw(){

    var initialProps = {
        dims: {
          single: { width: 300, height: 225 },
          double: { width: 620, height: 300}
        },
    };
    
    // Returns object with properties and methods representing
    // dimensions, scales, axes, etc.
    var werk = werkHelper.build(initialProps);
    
    
    var area = d3.area()
        .defined(function(d){ return !isNaN(d.y);})
        .x(function(d) { return werk.scales.x(d.x); })
        .y1(function(d) { return werk.scales.y(d.y); })
        .y0(function() { return werk.scales.y(0); });
    
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
        .call(werk.axes.x);
    
    
    var series = svg.selectAll(".series")
        .data(werk.data)
      .enter().append("g")
        .attr("class","series");
    
    series.append("path")
    		.attr("class","area")
    		.attr("d", function(d){ return area(d.values);})
    		.style("opacity", ((1 + werk.data.length) / (2 * werk.data.length) ))
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
        
    tooltip.append("div")
      .attr("class","title");
      
    tooltip.selectAll("value")
      .data(chartwerk.datamap.series)
    .enter()
      .append("div")
      .attr("class","value");
    
    var trackLine = svg.append("line")
		.attr("x1",chartwerk.di)
		.attr("x2",chartwerk.di)
		.attr("y1",werk.scales.y.range()[0])
		.attr("y2",werk.scales.y(werk.dataDims.yMax))
		.style("fill","none")
		.style("stroke-width",2)
		.style("display","none")
        .style("pointer-events", "none");
      
    function hideTooltip(){
        d3.select(".tooltip")
          .style("opacity", 0);
        trackLine
          .style("display", "none");
    }
    
    function showTooltip(){
        var x0 = werk.scales.x.invert(d3.mouse(this)[0]),
    		y0 = werk.scales.y.invert(d3.mouse(this)[1]),
    
    		//Start dist at a max number so we can check all distances less than
    		dist = werk.dataDims.xMax - werk.dataDims.xMin,
    		nearestX = 0,
    		comma = d3.format(",");
    		dollar = d3.format(",.2f")
    
    	chartwerk.data.forEach(function(d){
			if(Math.abs(x0 - werk.parsers.base(
                            String(d[chartwerk.datamap.base]))) < dist){
				nearestX = d;
				dist = Math.abs(x0 - werk.parsers.base(
                            String(d[chartwerk.datamap.base])))
			}
    	});

	    trackLine
			.attr("x1", werk.scales.x(werk.parsers.base(
                            String(nearestX[chartwerk.datamap.base]))))
			.attr("x2", werk.scales.x(werk.parsers.base(
                            String(nearestX[chartwerk.datamap.base]))))
			.attr("y2", werk.scales.y(d3.max(chartwerk.datamap.series,function(d){ return nearestX[d]; })))
			.style("stroke","#666")
			.style("shape-rendering","crisp-edges")
			.style("display","");
		
		tooltip.select(".title")
		  .text(function(d){
		      var format = d3.timeFormat("%B %d, %Y");
		      return format(werk.parsers.base(String(nearestX[chartwerk.datamap.base]))); });
		
        tooltip.selectAll(".value")
          .text(function(d){
              var v = chartwerk.axes.value;
              return d + ": " + v.prefix + dollar(nearestX[d]) + v.suffix;
          })
          .style("color", function(d){ return werk.scales.color(d); })
          .sort(function(a,b) { return nearestX[b] - nearestX[a]; });
          
        var p = d3.mouse(this.parentElement.parentElement);
        d3.select(".tooltip")
            .style("opacity", 1)
            .style("top", werk.scales.y(d3.max(chartwerk.datamap.series,function(d){ return nearestX[d]; })) + "px")
            .style("left", function(){
                // We position either left or right of the mouse point based
                // on whether we're past the midpoint of the chart. This protects
                // against tooltips overflowing embedded iframes.
                var s = chartwerk.ui.size,
                    w = werk.dims[s].width,
                    tipW = parseInt(d3.select(".tooltip").style("width"), 10),
                    pos = p[0] > (w / 2) ?
                        p[0] - (tipW + 20) : p[0] + 20;
                return pos.toString() + "px";
            });
    }
}