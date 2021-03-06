function draw(){

    var size = chartwerk.ui.size;

    var VALUE_KEY = chartwerk.datamap.value;
    var UNIT_SPACING = 4;
    var UNITS_PER_ROW = size === 'double' ? 10 : 6;
    var CHART_WIDTH = size === 'double' ? 620 : 300;
    
    var unitSize = ((CHART_WIDTH) / UNITS_PER_ROW) - UNIT_SPACING;
    var totalUnits = chartwerk.data.reduce(function(m, d) {
        return m + d[VALUE_KEY];
    }, 0);
    
    var chartHeight = Math.ceil(totalUnits / UNITS_PER_ROW) * (UNIT_SPACING + unitSize);

    var werk = werkHelper.build({
        dims: {
          single: {
            width: CHART_WIDTH,
            height: chartHeight
          },
          double: {
            width: CHART_WIDTH,
            height: chartHeight
          }
        }
    });

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', werk.dims.svg.width + werk.dims.margins.left + werk.dims.margins.right)
        .attr('height', werk.dims.svg.height + werk.dims.margins.top + werk.dims.margins.bottom)
      .append('g')
        .attr('transform', 'translate(' + werk.dims.margins.left + ',' + werk.dims.margins.top + ')');

    var i = 0;
    var data = chartwerk.data.map(function(d) {
      return d3.range(d[VALUE_KEY]).map(function() {
        var e = JSON.parse(JSON.stringify(d));
        e.idx = i++;
        return e;
      });
    });
    
    var facets = svg.selectAll('.facet')
      .data(data)
      .enter().append('g')
      .attr('class', 'facet');
    
    if ( chartwerk.datamap.custom.image ) {
        facets.selectAll('.unit')
          .data(function(d) {
            return d;
          })
          .enter()
          .append('image')
          .attr('class', 'unit')
          .attr('width', unitSize)
          .attr('height', unitSize)
          .attr('xlink:href', function(d) {
              return d[chartwerk.datamap.custom.image];
          })
          .attr('x', function(d) {
            return d.idx % UNITS_PER_ROW * (unitSize + UNIT_SPACING);
          })
          .attr('y', function(d) {
            return Math.floor(d.idx / UNITS_PER_ROW) * (unitSize + UNIT_SPACING);
          });
    }
    else {
        facets.selectAll('.unit')
          .data(function(d) {
            return d;
          })
          .enter()
          .append('rect')
          .attr('class', 'unit')
          .attr('width', unitSize)
          .attr('height', unitSize)
          .attr('fill', function(d) {
            return werk.scales.color(d[chartwerk.datamap.scale]);
          })
          .attr('x', function(d) {
            return d.idx % UNITS_PER_ROW * (unitSize + UNIT_SPACING);
          })
          .attr('y', function(d) {
            return Math.floor(d.idx / UNITS_PER_ROW) * (unitSize + UNIT_SPACING);
          });
    }

  facets
    .on('mouseover', function(d) {
      var highlighted = d3.select(this).classed('highlight', true);
      d3.select('.tooltip .title').text(d[0][chartwerk.datamap.scale]);
      d3.select('.tooltip .value').text(d[0][VALUE_KEY]);

      highlighted.selectAll('.unit')
        .attr('stroke', d3.rgb(werk.scales.color(d[0][chartwerk.datamap.scale])).darker())
        .attr('stroke-width', 2)
      
      tooltip.style('opacity', 1);
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .classed('highlight', false)
        .selectAll('.unit')
          .attr('stroke-width', 0);
      
      tooltip.style('opacity', 0);
    })
    .on('mousemove', function(d) {
      var p = d3.mouse(this.parentElement.parentElement);
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