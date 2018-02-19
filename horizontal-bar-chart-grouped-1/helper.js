var werkHelper = {
    parse: function(werk){
        if (chartwerk.datamap.base === null) {
            // If the chart doesn't have a base axis, raise an error.
        } else {
            // Otherwise, parse the data as passed.
            werk.data = chartwerk.axes.color.domain.map(function(category){
                return {
                    name: category,
                    values: chartwerk.data.map(function(d){
                        return { x: d[chartwerk.datamap.base], y: d[category] };
                    })
                };
            });
        }
    },
    
    dims: function(werk){
        var s = chartwerk.ui.size;
            w = werk.dims[s].width,
            h = werk.dims[s].height,
            // Add a little extra left margin to accomondate labels
            maxLen = d3.max(werk.data, function(d){ return d.name.length; })
            margins = {
                right: chartwerk.margins[s].right * w,
                left: chartwerk.margins[s].left * w + (maxLen * 4),
                top: chartwerk.margins[s].top * h,
                bottom: chartwerk.margins[s].bottom * h
            },
            div = {
                width: w - margins.left - margins.right,
                height: h - margins.top - margins.bottom
            };
            // console.log(maxLen);
        
        
        werk.dims.margins = margins;
        werk.dims.div = div;
    },

    scales: function(werk){
        var div = werk.dims.div;
        werk.scales = {
            x: d3.scaleLinear()
                .range([0, div.width]),
            y0: d3.scaleBand()
                    .rangeRound([0, 1]),
            y1: d3.scaleBand()
                    .padding(0.05),
            color: chartwerk.axes.color.range.length > 1 ? (
                d3.scaleOrdinal()
                  .domain(chartwerk.axes.color.domain)
                  .range(chartwerk.axes.color.range)
            ) : (
                function(d) { return chartwerk.axes.color.range[0]; }
            )
        };
    },
    
    baseDomain:  function(werk) {
        var keys = chartwerk.axes.color.domain;

        werk.scales.y0.domain(
            chartwerk.data.map(
                function(dataPoint) { return dataPoint[chartwerk.datamap.base]; }
            ).sort()
        );
        werk.scales.y1.domain(keys).rangeRound([0, werk.scales.x0.bandwidth()]);
    },
    
    valueDomain: function(werk) {
        var keys = chartwerk.axes.color.domain;

        var useDefaultMin = (
            (chartwerk.axes.value.min !== null) &&
            (!isNaN(chartwerk.axes.value.min))
        );

        var dataMin = (useDefaultMin) ? (chartwerk.axes.value.min) : (
            d3.min(chartwerk.data, function(d) {
                return d3.min(keys, function(key) { return d[key]; });
            })
        );

        if ((!useDefaultMin) && (dataMin > 0)) { dataMin = 0; }

        var useDefaultMax = (
            (chartwerk.axes.value.max !== null) &&
            (!isNaN(chartwerk.axes.value.max))
        );

        var dataMax = (useDefaultMax) ? (chartwerk.axes.value.max) : (
            d3.max(chartwerk.data, function(d) {
                return d3.max(keys, function(key) { return d[key]; });
            })
        );

        var extents = {
            min: dataMin,
            max: dataMax
        };

        werk.scales.x.domain([extents.min, extents.max]).nice();
    },


    // Build dims, scales and axes.
    build: function(werk){
        this.parse(werk);
        this.dims(werk);
        this.scales(werk);
        this.valueDomain(werk);
        return werk;
    },
};