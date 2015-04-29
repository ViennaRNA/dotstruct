function dotplot(element) {
    var margin = {top: 60, right: 60, bottom: 60, left: 60}
      , width = 800 - margin.left - margin.right
      , height = 800 - margin.top - margin.bottom;
    
    var treemapDiv = d3.select("#dotplot").append("div")
        .style("position", "absolute")
        .style("width", width + "px")
        .style("height", height + "px")
        .style("left", margin.left + "px")
        .style("top", margin.top + "px")
        .style("opacity", 0.2);
 
    var chart = d3.select(element)
	.append('svg:svg')
	.style('width', width + margin.right + margin.left)
	.style('height', height + margin.top + margin.bottom)
	.attr('class', 'chartx')

    var color = d3.scale.category10();

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(false)
        .value(function(d) { console.log('d.size:', d.size); return d.size; });

    var main = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main')   

    d3.json('data/4o26.json', function(data) { 
        console.log('data', data);
        data.bps.forEach(function(d) {
            d.i = +d.i;
            d.j = +d.j;
            d.p = +d.p;
                });
        console.log('data', data);

        structIxs = data.structs.map(function(d) { return d.ix; })
        console.log('structIxs', structIxs);
        color.domain(structIxs);

        var structLength = data.structs[0].struct.length;
        var sequenceNumbers = Array.apply(0, Array(structLength)).map(function(x,y) { return y+1});

        var x = d3.scale.ordinal()
                  .domain(sequenceNumbers)
                  .rangeBands([ 0, width ]);
        
        var y = d3.scale.ordinal()
                  .domain(sequenceNumbers)
                  .rangeBands([ 0, height ]);

        var r = d3.scale.linear()
                  //.domain([1, d3.max(data.bps.map(function(d) { return d.p; }))])
                  //.domain(d3.extent(data.bps.map(function(d) { return d.p; })))
                  .domain([0, 1])
                  .range([0, x.rangeBand()])

                  console.log('rangeBand', x.rangeBand(), x)

        var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

        main.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'main axis date')
        .call(xAxis);

        // draw the y axis
        var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

        main.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'main axis date')
        .call(yAxis);

        var g = main.append("svg:g"); 
        
        g.selectAll("scatter-dots")
          .data(data.bps)
          .enter().append("svg:rect")
              .attr("x", function (d,i) { return x(d.j); } )
              .attr("y", function (d) { return y(d.i); } )
              .attr("width", function(d) { return r(d.p); } )
              .attr("height", function(d) { return r(d.p); } )
              .attr('fill', function(d) { return color(d.ix); });

        var root = {"name": "graph",
            "children": data.structs.map(function(d) { 
                    return {"name": d.ix, 
                    "struct": d.struct,
                    "size": +d.sprob * 100 };
                    })
        }
        console.log('root:', root);

        function divName(d) { 
            return "subopt" + d.name;
        }

var options = {'applyForce': false, 
        'allowPanningAndZooming': true,
        "labelInterval":0,
        "initialSize": [280, 280],
        "transitionDuration": 0 }

    function position() {
      this.style("left", function(d) {  return d.x + "px"; })
          .style("top", function(d) { return d.y + "px"; })
          .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
          .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    }

      var node = treemapDiv.datum(root).selectAll(".treemapNode")
          .data(treemap.nodes)
        .enter().append("div")
          .attr("class", "treemapNode")
          .attr("id", divName)
          .call(position)
          //.style("background", function(d) { return d.children ? color(d.name) : null; })
          //.text(function(d) { return d.children ? null : d.name; })
          .each(function(d) { 
                  if (typeof d.struct != 'undefined') {
                      d.container = new FornaContainer("#" + divName(d), options);
                      d.container.transitionRNA(d.struct);
                      d.container.setOutlineColor(color(d.name));
                  }
            } );

        });
        
}
