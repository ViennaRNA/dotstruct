function dotStructLayout(element) {
    var width = 480;
    var containers = {};
    var x, y, r;

    var margin = {top: 60, right: 60, bottom: 60, left: 60},
    innerWidth = width - margin.left - margin.right,
    innerHeight = width - margin.top - margin.bottom;


    function chart(selection) {
        selection.each(function(data) {
            /*
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
               */

            var zoomG = selection.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('class', 'main')

            zoomG.append('svg:rect')
            .attr('width', width*2)
            .attr('height', height)
            .classed('zoom-rect', true)

            var rootG = zoomG.append('g').attr('id', 'root-g');

            function zoom() {
                var t = d3.event.translate,
                s = d3.event.scale;

                rootG.attr("transform", "translate(" + t + ")scale(" + s + ")");
            }

            var zoomer = d3.behavior.zoom()
            .scaleExtent([0.3,2])
            .on("zoom", zoom);

            zoomG.call(zoomer)

            d3.select('body')
            .on('keydown', function() {
                if (d3.event.keyCode === 67) { //c key
                    zoomer.translate([0,0]);
                    zoomer.scale(1);
                
                    rootG.attr('transform', 'translate(0,0)scale(1)'); 
                }
            });

            var gUnder = rootG.append('g');
            var gMiddle = rootG.append('g').attr('pointer-events', 'all').attr('transform', 'translate(' + width + ',0)').attr('id', 'middle-layer');
            var gMain = rootG.append('g').attr('pointer-events', 'all');

            function highlightNucleotide(num1, prefix) {
                gMiddle.selectAll('[nuc_num="' + num1 + '"]')
                .classed('selected', true);

                gMain.selectAll('[' + prefix + 'text-nuc-num="' + num1 + '"]')
                .classed('visible', true)

                gUnder.selectAll('[' + prefix + 'guide-num="' + num1 + '"]')
                .classed('guide-selected', true)
            }

            function unHighlight() {
                gMiddle.selectAll('.rna-base')
                .classed('selected', false);

                var gAll = gMain.selectAll();

                gMain.selectAll('.text-highlight-rect')
                .classed('visible', false);

                gUnder.selectAll('.guide-line')
                .classed('guide-selected', false);
            }


            function ensembleRectangleMouseOver(d) {
                var xx = d3.select(this);
                xx.style('stroke', '#444')
                .style('stroke-width', 4);

                var selectText = '#text-' + d.i + '-' + d.j;
                gMain.selectAll(selectText).classed('visible', true)

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

                var selectText = '#text-' + d.i + '-' + d.j;
                gMain.selectAll(selectText).classed('visible', false)

                //unHighlightPair(d.i, d.j);
                unHighlight();

            }

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

            xScale = d3.scale.ordinal()
            .domain([' '].concat(sequenceNumbers).concat([' ']) )
            .rangeRoundBands([ 0, innerWidth ]);

            yScale = d3.scale.ordinal()
            .domain([' '].concat(sequenceNumbers).concat([' ']))
            .rangeRoundBands([ 0, innerHeight ]);

            var r = d3.scale.linear()
            //.domain([1, d3.max(data.bps.map(function(d) { return d.p; }))])
            //.domain(d3.extent(data.bps.map(function(d) { return d.p; })))
            .domain([0, 1])
            .range([0, xScale.rangeBand()]);

            gMain.selectAll(".topXLabel")
            .data(jSet)
            .enter()
            .append("text")
            .classed('sequence-text', true)
            .attr('transform', function(d) { return 'translate(' + (xScale(d) + xScale.rangeBand() - 2) + ',0)rotate(-90)';})
            .text(function(d) { return d; });

            gMain.selectAll(".rightYLabel")
            .data(iSet)
            .enter()
            .append("text")
            .classed('sequence-text', true)
            .attr('transform', function(d) { return 'translate(' + innerWidth + "," + (yScale(d) + yScale.rangeBand() - 2) + ')';})
            .text(function(d) { return d; });


            gUnder.selectAll(".x-guide-line")
            .data(data.bps)
            .enter().append("svg:line")
            .attr("x1", function(d) { return xScale(d.j) + xScale.rangeBand() / 2; })
            .attr("y1", 0)
            .attr("x2", function(d) { return xScale(d.j) + xScale.rangeBand() / 2; })
            .attr("y2", function(d) { return yScale(d.i) + yScale.rangeBand() / 2; })
            .attr('nucPair', function(d) { return d.i + '-' + d.j; })
            .attr('top-guide-num', function(d) { return d.j; })
            .classed('x-guide-line', true)
            .classed('guide-line', true);

            gUnder.selectAll(".y-guide-line")
            .data(data.bps)
            .enter().append("svg:line")
            .attr("x1", innerWidth)
            .attr("y1", function(d) { return yScale(d.i) + yScale.rangeBand() / 2; })
            .attr("x2", function(d) { return xScale(d.j) + xScale.rangeBand() / 2; })
            .attr("y2", function(d) { return yScale(d.i) + yScale.rangeBand() / 2; })
            .attr('nucPair', function(d) { return d.i + "-" + d.j; })
            .attr('right-guide-num', function(d) { return d.i; })
            .classed('y-guide-line', true)
            .classed('guide-line', true);

            gMain.selectAll("scatter-dots")
            .data(data.bps)
            .enter().append("svg:rect")
            .attr("x", function (d,i) { return xScale(d.j) + (xScale.rangeBand() - r(d.p)) / 2; } )
            .attr("y", function (d) { return yScale(d.i) + (yScale.rangeBand() - r(d.p)) / 2; } )
            .attr("width", function(d) { return r(d.p); } )
            .attr("height", function(d) { return r(d.p); } )
            .attr('fill', function(d) { return color(d.ix); })
            .attr('pointer-events', 'all')
            .on('mouseover', ensembleRectangleMouseOver)
            .on('mouseout', rectangleMouseOut);

            gMain.selectAll(".scatter-dots-text")
            .data(data.bps)
            .enter().append('text')
            .attr('x', function(d,i) { return xScale(d.j) + (xScale.rangeBand() - r(d.p)) / 2 - 5; } )
            .attr("y", function (d) { return yScale(d.i) + (yScale.rangeBand() + r(d.p)) / 2; } )
            .text(function(d) { return "(" + d.i + "," + d.j + "): " + d.p; })
            .attr('id', function(d) { return 'text-' + d.i + "-" + d.j; })
            .classed('scatter-dots-text', true);

            var mfeBps = data.bps.filter(function(d) { return d.ix === 0; });


            gMain.selectAll(".bottomXLabelMfe")
            .data(mfeBps)
            .enter()
            .append("text")
            .classed('sequence-text', true)
            .attr('transform', function(d) { return 'translate(' + (xScale(d.i) + xScale.rangeBand() - 2) + ',' + innerHeight + ')rotate(-90)';})
            .attr('text-anchor', 'end')
            .text(function(d) { return d.i; });

            gMain.selectAll(".leftYLabelMfe")
            .data(mfeBps)
            .enter()
            .append("text")
            .classed('sequence-text', true)
            .attr('transform', function(d) { return 'translate(0, ' + (yScale(d.j) + yScale.rangeBand() - 2) + ')';})
            .attr('text-anchor', 'end')
            .text(function(d) { return d.j; });

            gUnder.selectAll(".x-guide-lineMfe")
            .data(mfeBps)
            .enter().append("svg:line")
            .attr("x1", function(d) { return xScale(d.i) + xScale.rangeBand() / 2; })
            .attr("y1", innerHeight)
            .attr("x2", function(d) { return xScale(d.i) + xScale.rangeBand() / 2; })
            .attr("y2", function(d) { return yScale(d.j) + yScale.rangeBand() / 2; })
            .attr('left-guide-num', function(d) { return d.j; })
            .classed('x-guide-lineMfe', true)
            .classed('guide-line', true);

            gUnder.selectAll(".y-guide-lineMfe")
            .data(mfeBps)
            .enter().append("svg:line")
            .attr("x1", 0)
            .attr("y1", function(d) { return yScale(d.j) + yScale.rangeBand() / 2; })
            .attr("x2", function(d) { return xScale(d.i) + xScale.rangeBand() / 2; })
            .attr("y2", function(d) { return yScale(d.j) + yScale.rangeBand() / 2; })
            .attr('bottom-guide-num', function(d) { return d.i; })
            .classed('y-guide-lineMfe', true)
            .classed('guide-line', true);

            gMain.selectAll("scatter-dots-mfe")
            .data(mfeBps)
            .enter().append("svg:rect")
            .attr("x", function (d,i) { return xScale(d.i) + (xScale.rangeBand() - r(d.p)) / 2; } )
            .attr("y", function (d) { return yScale(d.j) + (yScale.rangeBand() - r(d.p)) / 2; } )
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
            .attr('x', function(d) { return xScale(d[0]); })
            .attr('y', function(d) { return 0; })
            .attr('width', xScale.rangeBand())
            .attr('height', yScale.rangeBand())
            .attr('fill', function(d) { return bpColors(d[1]); });

            gMain.selectAll('.leftProbs')
            .data(data.baseProbs)
            .enter()
            .append('svg:rect')
            .classed('topProbs', true)
            .attr('x', function(d) { return 0; })
            .attr('y', function(d) { return yScale(d[0]); })
            .attr('width', xScale.rangeBand())
            .attr('height', yScale.rangeBand())
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
                return xScale(d.i); 
            })
            .attr('y', -20)
            .classed('sequence-text', true)
            .text(function(d) { return d.s; })
            .each(function(d) { highlightSeq(d, this, 'top-'); });

            gMain.selectAll('.bottomSeq')
            .data(seq)
            .enter()
            .append('text')
            .classed('sequence-text', true)
            .attr('x', function(d) { 
                return xScale(d.i); 
            })
            .attr('y', innerHeight + 25)
            .text(function(d) { return d.s; })
            .each(function(d) { highlightSeq(d, this, 'bottom-'); });

            gMain.selectAll('.leftSeq')
            .data(seq)
            .enter()
            .append('text')
            .classed('sequence-text', true)
            .attr('x', -25)
            .attr('y', function(d) { return yScale(d.i) + 8; })
            .text(function(d) { return d.s; })
            .each(function(d) { highlightSeq(d, this, 'left-'); });

            gMain.selectAll('.rightSeq')
            .data(seq)
            .enter()
            .append('text')
            .classed('sequence-text', true)
            .attr('x', innerWidth + 18)
            .attr('y', function(d) { return yScale(d.i) + 8; })
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

            gUnder.append('svg:line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', innerWidth)
            .attr('y2', innerHeight)
            .classed('diagonal-line', true);


            function divName(d) { 
                return "subopt" + d.name;
            }


            var highlightCircle = gMain.append('circle');
            var highlightCircleMfe = gMain.append('circle');

            highlightCircle.attr('r', xScale.rangeBand())
            .classed('highlight-circle', true)

            highlightCircleMfe.attr('r', xScale.rangeBand())
            .classed('highlight-circle', true)

            function nucleotideMouseOver(d) {
                var pairingPartner = d.rna.pairtable[d.num];
                highlightNucleotide(d.num);

                if (pairingPartner === 0)
                    return;

                var points  = [d.num, pairingPartner];
                points.sort(function(a,b) { return +a - +b;} );

                var selectText = '#text-' + points[0] + '-' + points[1];
                gMain.selectAll(selectText).classed('visible', true)

                highlightCircle
                .attr('cx', xScale(points[1]) + xScale.rangeBand() / 2)
                .attr('cy', yScale(points[0]) + yScale.rangeBand() / 2)
                .style('opacity', 0.3);

                //highlightPair(points[0], points[1]);
                highlightNucleotide(points[0], 'right-');
                highlightNucleotide(points[1], 'top-');

                if (d.structName == '0') {
                    // base pair is in the MFE structure
                    highlightNucleotide(points[1], 'left-');
                    highlightNucleotide(points[0], 'bottom-');

                    highlightCircleMfe
                    .attr('cx', xScale(points[0]) + xScale.rangeBand() / 2)
                    .attr('cy', yScale(points[1]) + yScale.rangeBand() / 2)
                    .style('opacity', 0.3);

                }

            }

            function nucleotideMouseOut(d) {
                highlightCircle.style('opacity', 0);
                highlightCircleMfe.style('opacity', 0);

                unHighlight();

                var selectText = '.scatter-dots-text';
                gMain.selectAll(selectText).classed('visible', false)
            }

            console.log('root:', root);

                var treemap = d3.layout.treemap()
                .size([innerWidth, innerHeight])
                .sticky(false)
                .value(function(d) { return d.size; });

                function positionTreemapRect() {
                    this.attr("width", function(d) { return Math.max(0, d.dx); })
                    .attr("height", function(d) { return Math.max(0, d.dy); });
                }

                console.log('root', root);

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

    function updateInnerWidth() {
        innerWidth = width - margin.left - margin.right,
        innerHeight = width - margin.top - margin.bottom;
    }

    chart.width = function(_) {
        if (!arguments.length) return width;

        width = _;
        height = _;

        updateInnerWidth();

        return chart;
    }

    chart.height = function(_) {
        if (!arguments.length) return height;
        width = _;
        height = _;

        updateInnerWidth();

        return chart;
    }

    return chart;
}

