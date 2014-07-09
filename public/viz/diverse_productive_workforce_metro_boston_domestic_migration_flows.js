(function() {














var chart
  , config = { 
      path: '/viz/data/domestic_migration_flows_metroboston.csv',
      data: ['Moved from different state', 'Moved to different state']
    , series: 'MSA ID'
    , errorflag: ', margin of error'
    , where: {
        column: 'MSA ID',
        value: '14460'
      }
    , groupBy: {

      }
    , countBy: {

      }
    }

// Graphic
var margin = {top: 20, right: 160, bottom: 30, left: 100},
    width = parseInt(d3.select(window.explainable).style('width'), 10),
    width = width - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse;
var commify = d3.format(",.0f");
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var y2 = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxisLeft = d3.svg.axis()
    .scale(y)
    .tickSize(-width, 0, 0)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });

var svg = d3.select(window.explainable).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var ds = new Miso.Dataset({
  url : config.path,
  delimiter : ','
});

ds.fetch({
  success : function() {

  var output = []; // empty box

  var cut = ds.where({ columns: config.data });

  cut.eachColumn(function(colName, colObject,index) { 
    var values = [];

    this.each(function(row, rowIndex) {
      if (row[colName] !== null)
        {
          values.push({ year: parseDate(ds.rowByPosition(rowIndex)['Year'].toString()), value: row[colName] })
        }
    })

    output.push({ series: colName, values: values })
  })

  console.log("new output", output)

  color.domain(output.map(function(key) { return key.series }));
  x.domain(d3.extent([2005,2006,2007,2008,2009,2010,2011,2012].map(function(d) { return parseDate(d.toString()) })));

  y.domain([60000,130000]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxisLeft)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -65)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Count");


  var city = svg.selectAll(".city")
      .data(output)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.series); })
      .on("mouseover", function(d, i) {
        this.parentNode.parentNode.appendChild(this.parentNode);
        d3.select(this)
          .style("stroke-width", "7"); 
      })
      .on("mouseout", function(d, i) {
        d3.select(this)
          .transition()
          .duration(350)
          .style("stroke-width", "3");
      });

  city.selectAll("circle")
      .data(function(d) { return d.values;})
      .enter().append("svg:circle")
      .attr("cx", function(d) { return x(d.year) })
      .attr("cy", function(d) { return y(d.value) })
      .attr("title", function(d) { return (d.year).getFullYear() })
      .attr("data-content", function(d) { return "Estimate: " + commify(d.value) })
      .attr("r", 3)
      .attr("fill", "black")
      .style("opacity", 0.25)
      .on("mouseover", function(d, i) {
        d3.select(this)
          .attr("r", "6"); 
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(350)
          .attr("r", "3")
      });

  city.append("text")
      .datum(function(d) { return {name: d.series, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.value) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .attr("id", function(d,i) { return "label" + i })
      .text(function(d) { return d.name; });

  $(document).ready(function () {
      $("circle").popover({
          'container': 'body',
          'placement': 'right',
          'trigger': 'hover',
          'html': true
      });
  });

 function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  },

  error : function() {
    console.log("Failure loading data")
  }
});


})();
