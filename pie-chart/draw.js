function draw(){
    
    var initialProps = {
        dims: {
          single: { width: 300, height: 225 },
          double: { width: 620, height: 250}
        },
    };
    
    // Returns object with properties and methods representing
    // dimensions, scales, axes, etc.
    var werk = werkHelper.build(initialProps);

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', werk.dims.svg.width + werk.dims.margins.left + werk.dims.margins.right)
        .attr('height', werk.dims.svg.height + werk.dims.margins.top + werk.dims.margins.bottom)
      .append('g')
        .attr(
            'transform', 'translate(' + werk.dims.margins.left + ',' + werk.dims.margins.top +')')
      .append('g')
        .attr('transform', 'translate(' + (werk.dims.svg.width / 2) + ',' + (werk.dims.svg.height / 2) + ')');
      
    var radius = Math.min(werk.dims.svg.width, werk.dims.svg.height) / 2;
    
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
        
    var pie = d3.pie()
        .value(function(d) { return d[chartwerk.datamap.value]; })
        .sort(null);
    
    var facets = svg.selectAll('.facet')
      .data(pie(chartwerk.data))
      .enter().append('path')
      .attr('d', arc)
      .attr('class', 'facet')
      .attr('fill', function(d) {
          return werk.scales.color(d.data[chartwerk.datamap.scale]);
      });

  facets
    .on('mouseover', function(d) {
      d3.select(this)
        .classed('highlight', true)
        .attr('d',arc.outerRadius(radius + 5));
      d3.select('.tooltip .title').text(d.data[chartwerk.datamap.scale]);
      d3.select('.tooltip .value').text(d.data[chartwerk.datamap.value] + '%');
      
      tooltip.style('opacity', 1);
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .classed('highlight', false)
        .attr('d',arc.outerRadius(radius));
      
      tooltip.style('opacity', 0);
    })
    .on('mousemove', function(d) {
      tooltip
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY + 30 - d3.select('#chart').node().offsetTop) + "px");
    });

    var tooltip = d3.select("#chart")
      .append("div")
        .attr("class","tooltip")
        .style("position","absolute");
        
    tooltip
      .append("div")
      .attr("class","title")
      .text(chartwerk.datamap.scale);
      
    tooltip
      .append("div")
      .attr("class","value");
}