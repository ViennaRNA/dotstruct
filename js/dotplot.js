function dotplot(element) {
    var dim = 1200;
    var containers = {};
    var x, y, r;

    var margin = {top: 60, right: 60, bottom: 60, left: 60},
      width = dim - margin.left - margin.right,
      height = dim - margin.top - margin.bottom;

    var chartUnder = d3.select(element)
    .attr('left', 0 + 'px')
    .attr('top', 0 + 'px')
    .attr('width', width + 'px')
    .attr('height', height + 'px')
    .style('position', 'absolute')
	.append('svg:svg')
	.style('width', width + margin.right + margin.left)
	.style('height', height + margin.top + margin.bottom)
	.attr('class', 'chartx')
    .attr('pointer-events', 'none')
    .style('position', 'absolute');

    var mainUnder = chartUnder.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main');
    
    var gUnder = mainUnder.append("svg:g"); 
    
    var treemapDiv = d3.select("#dotplot").append("div")
        .style("position", "absolute")
        .style("width", width + "px")
        .style("height", height + "px")
        .style("left", margin.left + "px")
        .style("top", margin.top + "px")
        .style("opacity", 1);
 
    var chart = d3.select(element)
    .attr('left', 0 + 'px')
    .attr('top', 0 + 'px')
    .attr('width', width + 'px')
    .attr('height', height + 'px')
    .style('position', 'absolute')
	.append('svg:svg')
	.style('width', width + margin.right + margin.left)
	.style('height', height + margin.top + margin.bottom)
	.attr('class', 'chartx')
    .attr('pointer-events', 'none')
    .style('position', 'absolute');

    var highlightCircle;

    var color = d3.scale.category10();

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(false)
        .value(function(d) { return d.size; });

    var main = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main');

    function highlightPair(num1, num2) {
        for (var key in containers) {
           var container = containers[key];
           var circles  = container.options.svg.selectAll("[nuc_num='" + num1 + "'],[nuc_num='" + num2 + "']")
            .select('.node');

           circles.style('opacity', 1.0);
        }

        /*
        var selectStr ="[nucPair=n" + num1+ "]"
        console.log('selectStr', selectStr);
        var lines = chartUnder.selectAll("[nucPair='n']");
        console.log('lines:', lines)
        lines.attr('stroke', '#aaa');
        */

    }

    function unHighlight() {
        console.log('unhiglighting');
        for (var key in containers) {
            var container = containers[key];
            var circles  = container.options.svg.selectAll(".node");

            circles
            .style('opacity', 0.2);
        }
    }


    function rectangleMouseOver(d) {
        var xx = d3.select(this);
        xx.style('stroke', '#444')
        .style('stroke-width', 4);

        highlightPair(d.i, d.j);

    }

    function rectangleMouseOut(d) {
        var xx = d3.select(this);
        xx.style('stroke', '#444')
        .style('stroke-width', 0);

        //unHighlightPair(d.i, d.j);
        unHighlight();

    }

    d3.json('data/4o26.json', function(data) { 
        data.bps.forEach(function(d) {
            d.i = +d.i;
            d.j = +d.j;
            d.p = +d.p;
                });

        self.data = data;

        var iSet = d3.set(data.bps.map(function(d) { return +d.i; })).values();
        var jSet = d3.set(data.bps.map(function(d) { return +d.j; })).values();

        structIxs = data.structs.map(function(d) { return d.ix; });
        color.domain(structIxs);

        var structLength = data.structs[0].struct.length;
        var sequenceNumbers = Array.apply(0, Array(structLength)).map(function(x,y) { return y+1; });

        x = d3.scale.ordinal()
                  .domain([' '].concat(sequenceNumbers).concat([' ']) )
                  .rangeRoundBands([ 0, width ]);
        
        y = d3.scale.ordinal()
                  .domain([' '].concat(sequenceNumbers).concat([' ']))
                  .rangeRoundBands([ 0, height ]);

        var r = d3.scale.linear()
                  //.domain([1, d3.max(data.bps.map(function(d) { return d.p; }))])
                  //.domain(d3.extent(data.bps.map(function(d) { return d.p; })))
                  .domain([0, 1])
                  .range([0, x.rangeBand()]);


        var g = main.append("svg:g"); 

        highlightCircle = g.append('circle');

        highlightCircle.attr('r', x.rangeBand())
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('fill', 'black')
        .style('opacity', 0.3);

        g.selectAll(".topXLabel")
        .data(jSet)
        .enter()
        .append("text")
        .attr('transform', function(d) { return 'translate(' + (x(d) + x.rangeBand() - 2) + ',0)rotate(-90)';})
        .text(function(d) { return d; });

        g.selectAll(".rightYLabel")
        .data(iSet)
        .enter()
        .append("text")
        .attr('transform', function(d) { return 'translate(' + width + "," + (y(d) + y.rangeBand() - 2) + ')';})
        .text(function(d) { return d; });

        
        gUnder.selectAll(".x-guide-line")
         .data(data.bps)
         .enter().append("svg:line")
         .attr("x1", function(d) { return x(d.j) + x.rangeBand() / 2; })
         .attr("y1", 0)
         .attr("x2", function(d) { return x(d.j) + x.rangeBand() / 2; })
         .attr("y2", function(d) { return y(d.i) + y.rangeBand() / 2; })
         .style('stroke', '#eee')
         .style('stroke-width', 2)
         .style('opacity', 1)
         .attr('nucPair', function(d) { return "n"; })
         .classed('x-guide-line', true);

        gUnder.selectAll(".y-guide-line")
         .data(data.bps)
         .enter().append("svg:line")
         .attr("x1", width)
         .attr("y1", function(d) { return y(d.i) + y.rangeBand() / 2; })
         .attr("x2", function(d) { return x(d.j) + x.rangeBand() / 2; })
         .attr("y2", function(d) { return y(d.i) + y.rangeBand() / 2; })
         .style('stroke', '#eee')
         .style('stroke-width', 2)
         .style('opacity', 1)
         .attr('nucPair', function(d) { return d.i + "-" + d.j; })
         .classed('y-guide-line', true);

         g.selectAll("scatter-dots")
         .data(data.bps)
         .enter().append("svg:rect")
         .attr("x", function (d,i) { return x(d.j) + (x.rangeBand() - r(d.p)) / 2; } )
         .attr("y", function (d) { return y(d.i) + (y.rangeBand() - r(d.p)) / 2; } )
         .attr("width", function(d) { return r(d.p); } )
         .attr("height", function(d) { return r(d.p); } )
         .attr('fill', function(d) { console.log('xxx d.ix:', d.ix, 'color:', color(d.ix)); return color(d.ix); })
         .attr('pointer-events', 'all')
         .on('mouseover', rectangleMouseOver)
         .on('mouseout', rectangleMouseOut);


        var xMfe = d3.scale.ordinal()
                  .domain(sequenceNumbers)
                  .rangeRoundBands([ 0, width ]);
        
        var yMfe = d3.scale.ordinal()
                  .domain(sequenceNumbers)
                  .rangeRoundBands([ 0, height ]);

        var mfeBps = data.bps.filter(function(d) { return d.ix === 0; });


        g.selectAll(".bottomXLabelMfe")
        .data(mfeBps)
        .enter()
        .append("text")
        .attr('transform', function(d) { return 'translate(' + (x(d.i) + x.rangeBand() - 2) + ',' + height + ')rotate(-90)';})
        .attr('text-anchor', 'end')
        .text(function(d) { return d.i; });

        g.selectAll(".leftYLabelMfe")
        .data(mfeBps)
        .enter()
        .append("text")
        .attr('transform', function(d) { return 'translate(0, ' + (y(d.j) + y.rangeBand() - 2) + ')';})
        .attr('text-anchor', 'end')
        .text(function(d) { return d.j; });

        gUnder.selectAll(".x-guide-lineMfe")
         .data(mfeBps)
         .enter().append("svg:line")
         .attr("x1", function(d) { return x(d.i) + x.rangeBand() / 2; })
         .attr("y1", height)
         .attr("x2", function(d) { return x(d.i) + x.rangeBand() / 2; })
         .attr("y2", function(d) { return y(d.j) + y.rangeBand() / 2; })
         .style('stroke', '#eee')
         .style('stroke-width', 2)
         .style('opacity', 1)
         .classed('x-guide-lineMfe', true);

        gUnder.selectAll(".y-guide-lineMfe")
         .data(mfeBps)
         .enter().append("svg:line")
         .attr("x1", 0)
         .attr("y1", function(d) { return y(d.j) + y.rangeBand() / 2; })
         .attr("x2", function(d) { return x(d.i) + x.rangeBand() / 2; })
         .attr("y2", function(d) { return y(d.j) + y.rangeBand() / 2; })
         .style('stroke', '#eee')
         .style('stroke-width', 2)
         .style('opacity', 1)
         .classed('y-guide-lineMfe', true);

         g.selectAll("scatter-dots-mfe")
         .data(mfeBps)
         .enter().append("svg:rect")
         .attr("x", function (d,i) { return x(d.i) + (x.rangeBand() - r(d.p)) / 2; } )
         .attr("y", function (d) { return y(d.j) + (y.rangeBand() - r(d.p)) / 2; } )
         .attr("width", function(d) { return r(d.p); } )
         .attr("height", function(d) { return r(d.p); } )
         .attr('fill', function(d) { return color(d.ix); })
         .attr('pointer-events', 'all')
         .on('mouseover', rectangleMouseOver)
         .on('mouseout', rectangleMouseOut);

        var seq = data.seq.split('').map(function(d, i) { return {"s": d, "i": i+1}; });
        console.log('seq',seq);

        /////////////////////////////////////////////////////////////
        g.selectAll('.topSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', function(d) { 
            return x(d.i); 
        })
        .attr('y', -20)
        .text(function(d) { return d.s; });


        console.log('data', data);
        var bpColors = d3.scale.linear().domain([0,1]).range(['white', '#888']);

        g.selectAll('.topProbs')
        .data(data.baseProbs)
        .enter()
        .append('svg:rect')
        .classed('topProbs', true)
        .attr('x', function(d) { return x(d[0]); })
        .attr('y', function(d) { return 0; })
        .attr('width', x.rangeBand())
        .attr('height', y.rangeBand())
        .attr('fill', function(d) { return bpColors(d[1]); });

        g.selectAll('.leftProbs')
        .data(data.baseProbs)
        .enter()
        .append('svg:rect')
        .classed('topProbs', true)
        .attr('x', function(d) { return 0; })
        .attr('y', function(d) { return y(d[0]); })
        .attr('width', x.rangeBand())
        .attr('height', y.rangeBand())
        .attr('fill', function(d) { return bpColors(d[1]); });
        
        g.selectAll('.bottomSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', function(d) { 
            return x(d.i); 
        })
        .attr('y', height + 25)
        .text(function(d) { return d.s; });

        g.selectAll('.leftSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', -25)
        .attr('y', function(d) { return y(d.i) + 8; })
        .text(function(d) { return d.s; });

        g.selectAll('.rightSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', width + 18)
        .attr('y', function(d) { return y(d.i) + 8; })
        .text(function(d) { return d.s; });

        ////////////////////////////////////////////////////////////
        var root = {"name": "graph",
            "children": data.structs.map(function(d) { 
                    return {"name": d.ix, 
                    "struct": d.struct,
                    "size": +d.sprob * 100 };
                    })
        };

        g.append('svg:line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', height)
        .style('stroke', '#888')
        .style('stroke-width', 2);


        function divName(d) { 
            return "subopt" + d.name;
        }


    function positionTreemapDiv() {
      this.style("left", function(d) {  return d.x + "px"; })
          .style("top", function(d) { return d.y + "px"; })
          .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
          .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    }

    function gnodeMouseOver(d) {
        console.log('d:', d);

        var pairingPartner = d.rna.pairtable[d.num];

        if (pairingPartner === 0)
            return;

        var points  = [d.num, pairingPartner];
        points.sort(function(a,b) { return +a - +b;} );
        console.log('points:', points);

        highlightCircle
        .attr('cx', x(points[1]) + x.rangeBand() / 2)
        .attr('cy', y(points[0]) + y.rangeBand() / 2)
        .style('opacity', 0.3);

        highlightPair(points[0], points[1]);
    }

    function gnodeMouseOut(d) {
        highlightCircle.style('opacity', 0);

        unHighlight();
    }

    var fornaContainerOptions = {'applyForce': false, 
        'allowPanningAndZooming': false,
        "labelInterval":0,
        "initialSize": [280, 280],
        "transitionDuration": 0 };

      var node = treemapDiv.datum(root).selectAll(".treemapNode")
          .data(treemap.nodes)
        .enter().append("div")
          .attr("class", "treemapNode")
          .attr("id", divName)
          .call(positionTreemapDiv)
          //.style("background", function(d) { return d.children ? color(d.name) : null; })
          //.text(function(d) { return d.children ? null : d.name; })
          .each(function(d) { 
                  if (typeof d.struct != 'undefined') {
                      console.log('d.name:', d.name);

                      d.container = new FornaContainer("#" + divName(d), fornaContainerOptions);
                      d.container.transitionRNA(d.struct);
                      d.container.setOutlineColor('grey');

                      containers[d.name] = d.container;

                      d.container.options.svg.selectAll('.node')
                      .style('opacity', 0.2);

                      d.container.options.svg.selectAll('.link')
                      .style('opacity', 0.0);

                      var gNodes = d.container.options.svg.selectAll('.gnode')
                      .on('mouseover', gnodeMouseOver)
                      .on('mouseout', gnodeMouseOut);
                  }
            } );

            // highlight the base pairs in each structure
        data.bps.forEach(function(d) {
            containers[d.ix].options.svg
            .selectAll('[nuc_num="' + d.i + '"]')
            .select('.node')
            .style('stroke-width', 3)
            .style('stroke', 'black');

            containers[d.ix].options.svg
            .selectAll('[nuc_num="' + d.j + '"]')
            .select('.node')
            .style('stroke-width', 3)
            .style('stroke', 'black');

            for (var ix in containers) {
                console.log('containers[ix]:', containers[ix]);
                if (containers[ix].newRNA.pairtable[d.i] === d.j) {
                    containers[ix].options.svg
                    .selectAll('[nuc_num="' + d.i + '"]')
                    .select('.node')
                    .style('fill', color(d.ix));

                    containers[ix].options.svg
                    .selectAll('[nuc_num="' + d.j + '"]')
                    .select('.node')
                    .style('fill', color(d.ix));
                }
            }
        });
        
        });
}

