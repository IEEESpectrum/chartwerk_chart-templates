function draw(){

    var initialProps = {
        dims: {
          single: { width: 300, height: 225 },
          double: { width: 620, height: 250}
        },
    };
    
    var barHeight = 24;
    var barSpace = 2;
    
    // Returns object with properties and methods representing
    // dimensions, scales, axes, etc.
    var werk = werkHelper.build(initialProps);
    
    var comma = d3.format(",");
    
    var div = d3.select("#chart")
        .append("div")
        .style("margin", 
            werk.dims.margins.top + "px " +
            werk.dims.margins.right + "px " +
            werk.dims.margins.bottom + "px " +
            werk.dims.margins.left + "px "
        );
    
    var response = div.selectAll(".response")
        .data(chartwerk.data)
      .enter().append("div")
        .attr("class","response");
    
    response.append("div")
        .attr("class","name label")
        .style("height", ((chartwerk.axes.color.domain.length * barHeight) + ((chartwerk.axes.color.domain.length - 1) * barSpace)) + 'px')
        .style("width", werk.dims.margins.left + 'px')
        .style("margin-left", "-" + werk.dims.margins.left + 'px')
      .append("p")
        .text(function(d){
            return d[chartwerk.datamap.base];
        });

    var bar = response.selectAll(".bar")
        .data(
            function(d) {
                var keys = chartwerk.axes.color.domain.sort();

                return keys.map(function(key) { return {key: key, value: d[key]}; });
            }
        )
      .enter().append("div")
        .attr("class", "bar")
        .style("background-color", function(d) { 
            return werk.scales.color(d.key); 
        })
        .style("width", function(d){ return werk.scales.x(d.value) + 'px'; })
        .style("height", barHeight + 'px')
        .style("margin-top", barSpace + 'px');
        
    bar.append("div")
        .attr("class","value label")
      .append("p")
        .attr("class", function(d){
            return werk.scales.x(d.value) < 75 ?
                'offset' : '';
        })
        .style("width", function(d){
            return werk.scales.x(d.value) < 75 ?
                werk.dims.div.width - this.parentElement.parentElement.clientWidth + 'px' : '';
        })
        .style("margin-left", function(d){
            return werk.scales.x(d.value) < 75 ?
                this.parentElement.parentElement.clientWidth + 'px' : '';
        })
        .style("line-height", barHeight + 'px')
        .text(function(d){
            return chartwerk.axes.value.prefix + comma(String(d.value)) + chartwerk.axes.value.suffix;
        });
    

}