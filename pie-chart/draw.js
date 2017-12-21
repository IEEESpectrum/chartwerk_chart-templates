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
            var p = d3.mouse(this.parentElement.parentElement.parentElement);
      tooltip
        .style("left", function(){
            // We position either left or right of the mouse point based
            // on whether we're past the midpoint of the chart. This protects
            // against tooltips overflowing embedded iframes.
            var s = chartwerk.ui.size,
                w = werk.dims[s].width,
                tipW = parseInt(d3.select(".tooltip").style("width"), 10),
                pos = p[0] > (w / 2) ?
                    p[0] - (tipW + 10) : p[0] + 15;
            return pos.toString() + "px";
        })
        .style("top", function(){
            var s = chartwerk.ui.size,
                h = werk.dims[s].height,
                tipH = parseInt(d3.select(".tooltip").style("height"), 10),
                pos = p[1] > (h / 2) ?
                    p[1] - (tipH + 5) : p[1] + 20;
            return pos.toString() + "px";
        });
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