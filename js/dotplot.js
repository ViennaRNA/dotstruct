function dotplot(element) {
    var dim = 480;
    var containers = {};
    var x, y, r;

    var margin = {top: 60, right: 60, bottom: 60, left: 60},
      width = dim - margin.left - margin.right,
      height = dim - margin.top - margin.bottom;

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

    var rootG = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('class', 'main');

    var gUnder = rootG.append('g');
    var gMiddle = rootG.append('g').attr('pointer-events', 'all');
    var gMain = rootG.append('g').attr('pointer-events', 'all');

    function highlightNucleotide(num1, prefix) {
        gMiddle.selectAll('[nuc_num="' + num1 + '"]')
        .classed('selected', true);

        gMain.selectAll('[' + prefix + 'text-nuc-num="' + num1 + '"]')
        .classed('text-selected', true)

        gUnder.selectAll('[' + prefix + 'guide-num="' + num1 + '"]')
        .classed('guide-selected', true)
    }

    function unHighlight() {
        gMiddle.selectAll('.rna-base')
        .classed('selected', false);

        var gAll = gMain.selectAll();

        gMain.selectAll('.text-highlight-rect')
        .classed('text-selected', false);

        gUnder.selectAll('.guide-line')
        .classed('guide-selected', false);
    }


    function ensembleRectangleMouseOver(d) {
        var xx = d3.select(this);
        xx.style('stroke', '#444')
        .style('stroke-width', 4);

        //highlightPair(d.i, d.j);
        highlightNucleotide(d.i, 'right-');
        highlightNucleotide(d.j, 'top-');

    }

    function mfeRectangleMouseOver(d) {
        var xx = d3.select(this);
        xx.style('stroke', '#444')
        .style('stroke-width', 4);

        //highlightPair(d.i, d.j);
        highlightNucleotide(d.j, 'left-');
        highlightNucleotide(d.i, 'bottom-');

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

        var color = d3.scale.category10().domain(structIxs);

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



        gMain.selectAll(".topXLabel")
        .data(jSet)
        .enter()
        .append("text")
        .attr('transform', function(d) { return 'translate(' + (x(d) + x.rangeBand() - 2) + ',0)rotate(-90)';})
        .text(function(d) { return d; });

        gMain.selectAll(".rightYLabel")
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
         .attr('nucPair', function(d) { return d.i + '-' + d.j; })
         .attr('top-guide-num', function(d) { return d.j; })
         .classed('x-guide-line', true)
         .classed('guide-line', true);

        gUnder.selectAll(".y-guide-line")
         .data(data.bps)
         .enter().append("svg:line")
         .attr("x1", width)
         .attr("y1", function(d) { return y(d.i) + y.rangeBand() / 2; })
         .attr("x2", function(d) { return x(d.j) + x.rangeBand() / 2; })
         .attr("y2", function(d) { return y(d.i) + y.rangeBand() / 2; })
         .attr('nucPair', function(d) { return d.i + "-" + d.j; })
         .attr('right-guide-num', function(d) { return d.i; })
         .classed('y-guide-line', true)
         .classed('guide-line', true);

         gMain.selectAll("scatter-dots")
         .data(data.bps)
         .enter().append("svg:rect")
         .attr("x", function (d,i) { return x(d.j) + (x.rangeBand() - r(d.p)) / 2; } )
         .attr("y", function (d) { return y(d.i) + (y.rangeBand() - r(d.p)) / 2; } )
         .attr("width", function(d) { return r(d.p); } )
         .attr("height", function(d) { return r(d.p); } )
         .attr('fill', function(d) { return color(d.ix); })
         .attr('pointer-events', 'all')
         .on('mouseover', ensembleRectangleMouseOver)
         .on('mouseout', rectangleMouseOut);


        var mfeBps = data.bps.filter(function(d) { return d.ix === 0; });


        gMain.selectAll(".bottomXLabelMfe")
        .data(mfeBps)
        .enter()
        .append("text")
        .attr('transform', function(d) { return 'translate(' + (x(d.i) + x.rangeBand() - 2) + ',' + height + ')rotate(-90)';})
        .attr('text-anchor', 'end')
        .text(function(d) { return d.i; });

        gMain.selectAll(".leftYLabelMfe")
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
         .attr('left-guide-num', function(d) { return d.j; })
         .classed('x-guide-lineMfe', true)
         .classed('guide-line', true);

        gUnder.selectAll(".y-guide-lineMfe")
         .data(mfeBps)
         .enter().append("svg:line")
         .attr("x1", 0)
         .attr("y1", function(d) { return y(d.j) + y.rangeBand() / 2; })
         .attr("x2", function(d) { return x(d.i) + x.rangeBand() / 2; })
         .attr("y2", function(d) { return y(d.j) + y.rangeBand() / 2; })
         .attr('bottom-guide-num', function(d) { return d.i; })
         .classed('y-guide-lineMfe', true)
         .classed('guide-line', true);

         gMain.selectAll("scatter-dots-mfe")
         .data(mfeBps)
         .enter().append("svg:rect")
         .attr("x", function (d,i) { return x(d.i) + (x.rangeBand() - r(d.p)) / 2; } )
         .attr("y", function (d) { return y(d.j) + (y.rangeBand() - r(d.p)) / 2; } )
         .attr("width", function(d) { return r(d.p); } )
         .attr("height", function(d) { return r(d.p); } )
         .attr('fill', function(d) { return color(d.ix); })
         .attr('pointer-events', 'all')
         .on('mouseover', mfeRectangleMouseOver)
         .on('mouseout', rectangleMouseOut);

        var seq = data.seq.split('').map(function(d, i) { return {"s": d, "i": i+1}; });

        /////////////////////////////////////////////////////////////

        var bpColors = d3.scale.linear().domain([0,1]).range(['white', '#888']);

        gMain.selectAll('.topProbs')
        .data(data.baseProbs)
        .enter()
        .append('svg:rect')
        .classed('topProbs', true)
        .attr('x', function(d) { return x(d[0]); })
        .attr('y', function(d) { return 0; })
        .attr('width', x.rangeBand())
        .attr('height', y.rangeBand())
        .attr('fill', function(d) { return bpColors(d[1]); });

        gMain.selectAll('.leftProbs')
        .data(data.baseProbs)
        .enter()
        .append('svg:rect')
        .classed('topProbs', true)
        .attr('x', function(d) { return 0; })
        .attr('y', function(d) { return y(d[0]); })
        .attr('width', x.rangeBand())
        .attr('height', y.rangeBand())
        .attr('fill', function(d) { return bpColors(d[1]); });

        highlightSeq = function(d, node, prefix ) {
            svgRect = node.getBBox();
            var parentNode = d3.select(node.parentNode);

            parentNode.append('rect')
            .attr('x', svgRect.x-2)
            .attr('y', svgRect.y)
            .attr('height', svgRect.height)
            .attr('width', svgRect.width + 2)
            .attr(prefix + 'text-nuc-num', d.i) // enable highlighting of nucleotide numbers
            .classed('text-highlight-rect', true);

        }

        gMain.selectAll('.topSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', function(d) { 
            return x(d.i); 
        })
        .attr('y', -20)
        .text(function(d) { return d.s; })
        .each(function(d) { highlightSeq(d, this, 'top-'); });
        
        gMain.selectAll('.bottomSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', function(d) { 
            return x(d.i); 
        })
        .attr('y', height + 25)
        .text(function(d) { return d.s; })
        .each(function(d) { highlightSeq(d, this, 'bottom-'); });

        gMain.selectAll('.leftSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', -25)
        .attr('y', function(d) { return y(d.i) + 8; })
        .text(function(d) { return d.s; })
        .each(function(d) { highlightSeq(d, this, 'left-'); });

        gMain.selectAll('.rightSeq')
        .data(seq)
        .enter()
        .append('text')
        .attr('x', width + 18)
        .attr('y', function(d) { return y(d.i) + 8; })
        .text(function(d) { return d.s; })
        .each(function(d) { highlightSeq(d, this, 'right-'); });

        ////////////////////////////////////////////////////////////
        var root = {"name": "graph",
            "children": data.structs.map(function(d) { 
                    return {"name": d.ix, 
                    "structure": d.struct,
                    "sequence": self.data.seq,
                    "size": +d.sprob * 100 };
                    })
        };

        gMain.append('svg:line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', height)
        .style('stroke', '#888')
        .style('stroke-width', 2);


        function divName(d) { 
            return "subopt" + d.name;
        }


    var highlightCircle = gMain.append('circle');
    var highlightCircleMfe = gMain.append('circle');

    highlightCircle.attr('r', x.rangeBand())
    .classed('highlight-circle', true)

    highlightCircleMfe.attr('r', x.rangeBand())
    .classed('highlight-circle', true)

    function nucleotideMouseOver(d) {
        var pairingPartner = d.rna.pairtable[d.num];
        highlightNucleotide(d.num);

        if (pairingPartner === 0)
            return;

        var points  = [d.num, pairingPartner];
        points.sort(function(a,b) { return +a - +b;} );

        highlightCircle
        .attr('cx', x(points[1]) + x.rangeBand() / 2)
        .attr('cy', y(points[0]) + y.rangeBand() / 2)
        .style('opacity', 0.3);

        //highlightPair(points[0], points[1]);
        highlightNucleotide(points[0], 'right-');
        highlightNucleotide(points[1], 'top-');

        if (d.structName == '0') {
            // base pair is in the MFE structure
            highlightNucleotide(points[1], 'left-');
            highlightNucleotide(points[0], 'bottom-');

            highlightCircleMfe
            .attr('cx', x(points[0]) + x.rangeBand() / 2)
            .attr('cy', y(points[1]) + y.rangeBand() / 2)
            .style('opacity', 0.3);

        }

    }

    function nucleotideMouseOut(d) {
        highlightCircle.style('opacity', 0);
        highlightCircleMfe.style('opacity', 0);

        unHighlight();
    }

    var fornaContainerOptions = {'applyForce': false, 
        'allowPanningAndZooming': false,
        "labelInterval":0,
        "initialSize": [280, 280],
        "transitionDuration": 0 };

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(false)
        .value(function(d) { return d.size; });

        function positionTreemapRect() {
              this.attr("width", function(d) { return Math.max(0, d.dx); })
              .attr("height", function(d) { return Math.max(0, d.dy); });
        }

      var treemapGnodes = gMiddle.datum(root).selectAll(".treemapNode")
          .data(treemap.nodes)
        .enter()
        .append('g')
        .attr('class', 'treemapNode')
        .attr('id', divName)
        .each(function(d) { 
            // create a background rectangle for each RNA structure
            d3.select(this).attr('transform', function(d) { return 'translate(' + d.x + "," + d.y + ')' })
            .append('rect')
            //.attr('fill', function(d) { return color(d.name); })
            .classed('structure-background-rect', true)
            .call(positionTreemapRect)

            var chart = rnaPlot()
            .width( Math.max(0, d.dx))
            .height( Math.max(0, d.dy))
            .labelInterval(0)
            .rnaEdgePadding(10)
            .showNucleotideLabels(false);

            if ('structure' in d) {
                //let's draw an RNA!

                d3.select(this)
                .call(chart)
                .classed('rnaStruct', true)
                .attr('struct_id', function(n) { return "struct"+n.name; })
                .selectAll('.rna-base')
                .attr('nuc_num', function(n) { return n.num; })
                .on('mouseover', nucleotideMouseOver)
                .on('mouseout', nucleotideMouseOut);
            
            }
        });

        data.bps.forEach(function(d) {
            var rnaStruct = gMiddle.selectAll('[struct_id=struct' + d.ix + ']')

            rnaStruct.selectAll('[nuc_num="' + d.i + '"],[nuc_num="' + d.j + '"]')
            .classed('from-this-structure', true)
            .style('fill', color(d.ix))

            var containers = gMiddle.selectAll(".rnaStruct")
            .each(function(c) {
                if (c.rnaGraph.pairtable[d.i] === d.j) {
                        //this base is paired in this structure
                d3.select(this).selectAll('[nuc_num="' + d.i + '"],[nuc_num="' + d.j + '"]')
                .style('fill', color(d.ix))

                }
            });

        });

    });
}

