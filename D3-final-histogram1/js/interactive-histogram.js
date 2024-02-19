// define the drawChart function as async, to be able to load the data before drawing
async function drawChart() {

  // ---------- READ DATA -----------------------------------------------

  const dataset = await d3.json("./../../Data/my_weather_data.json");
  console.table(dataset[0]);


  // ---------- CREATE DIMENSIONS ----------------------------------------
  // define width based on the monitor width
  let width;
  if (window.innerWidth > 650) {
    width = 600;
  } else {
    width = window.innerWidth * 0.9;
  }
  // every time monitor width changes, reload the website
  window.onresize = function () {
    location.reload();
  };

  // use these dimensions to easily modify the size of graph
  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };

  // by taking margins from width and height, we know the drawing area size
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
  
  // ---------- CREATE SVG GRAPH FOR DRAWING ----------------------------------------
  // select the 'wrapper' div from HTML and add a SVG graph onto it
  const svg = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  // select the previously made SVG graph and add a group called boundingBox
  // the idea of this variable is to create a group to contain all graphical content 
  const boundingBox = svg
    .append("g")
    .attr("id", "boundingBox")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // ---------- CREATE STATIC GROUP FOR HISTOGRAMS AND STATIC GROUP FOR X-AXIS  ---------------------------

  // add "barsGroup" and "x-axis" groups to boundingBox-group
  // also add the x-axis-label on the x-axis group (e,g humidity reads below x-axis)
  // notice that label y-location is inherited from group x-axis
  // thats why y is not boundingBox.Height but just bottom.margin - 10
  boundingBox.append("g").attr("class", "barsGroup");
  boundingBox.append("g").attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10) 
    .attr("text-anchor", "middle")
    .attr("font-size", 16);

  // line for mean value starts in the middle of chart
  boundingBox.append("line").attr("class", "line")
    .attr("x1", dimensions.boundedWidth / 2)
    .attr("x2", dimensions.boundedWidth / 2)
    .attr("y1", -10)
    .attr("y2", dimensions.boundedHeight);
  boundingBox.append("text").attr("class", "meanLineText")
  .attr("x", dimensions.boundedWidth / 2);

  // ---------- USE SUBFUNCTION TO DRAW 1 HISTOGRAM ------------------------------------------------------
  // ---------- NEEDED TO CREATE AN INTERACTIVE CHART THAT ALLOWS SWITCHING CHARTS -----------------------
  const drawHistogram = (metric) => {
    // load data using selected metric
    const metricAccessor = (d) => d[metric];
    
    // store some measures and times for graph and animations
    const yAccessor = (d) => d.length;
    const barPadding = 4;
    const exitTransition = d3.transition().duration(800);
    const updateTransition = exitTransition.transition().duration(600);

    // Create scales and split data to parts, which are used to draw the histograms
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, metricAccessor))
      .range([0, dimensions.boundedWidth])
      .nice();

    const histogramGenerator = d3
      .histogram()
      .domain(xScale.domain())
      .value(metricAccessor)
      .thresholds(11);

    const groups = histogramGenerator(dataset);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(groups, yAccessor)])
      .range([dimensions.boundedHeight, 0])
      .nice();


    // Draw data

    

    // select the main group inside boundingBox group
    let barGroups = boundingBox
      .select(".barsGroup")
      // select each bar group, empty at the first time,
      // updating later on
      .selectAll(".barGroup")
      // bind current data to the selection
      .data(groups);

    // remove unnecessarry datapoints after new data added
    // exit() tells which to be removed
    // barGroups.exit().remove();

    const oldBarGroups = barGroups.exit();
    oldBarGroups
      .selectAll("rect")
      .attr("fill", "red")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight)
      .attr("height", 0);

    oldBarGroups
      .selectAll("text")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight);

    oldBarGroups.transition(exitTransition).remove();
    console.log(oldBarGroups);

    // create empty groups for bars and name them
    const newBarGroups = barGroups
      .enter()
      .append("g")
      .attr("class", "barGroup");

    // add rect element for each group
    newBarGroups
      .append("rect")
      .attr("x", (d) => xScale(d.x0) - barPadding / 2)
      .attr("y", dimensions.boundedHeight)
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
      .attr("height", 0)
      .attr("fill", "green");
    // add text element for each group
    newBarGroups
      .append("text")
      .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", dimensions.boundedHeight);

    // merge new bars with old ones if exist
    barGroups = newBarGroups.merge(barGroups);

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because rects are already there
    const rects = barGroups
      .select("rect")
      .transition(updateTransition)
      .attr("x", (d) => xScale(d.x0) + barPadding / 2)
      .attr("y", (d) => yScale(yAccessor(d)))
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
      .attr("height", (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
      .transition(updateTransition)
      .attr("fill", "lightblue");

    console.log(rects);

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because texts are already there
    const barText = barGroups
      .select("text")
      .transition(updateTransition)
      .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", (d) => yScale(yAccessor(d)) - 5)
      .text(yAccessor)
      .attr("fill", "blue")
      .style("font-size", "12px")
      .style("font-family", "arial")
      .style("text-anchor", "middle");

    const mean = d3.mean(dataset, metricAccessor);

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because line is already there
    const line = boundingBox
      .select(".line")
      .transition(updateTransition)
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", -10)
      .attr("y2", dimensions.boundedHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .style("stroke-dasharray", "2px 2px");

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because text is already there
    const meanLineText = boundingBox
      .select(".meanLineText")
      .transition(updateTransition)
      .attr("x", xScale(mean))
      .attr("y", -15)
      .text("mean " + mean.toFixed(2))
      .style("font-size", "12px")
      .style("font-family", "arial")
      .style("text-anchor", "middle");

    // Draw axes
    const xAxisGenerator = d3.axisBottom().scale(xScale);

    const xAxis = boundingBox
      .select(".x-axis")
      .transition(updateTransition)
      .call(xAxisGenerator);
    // in the old code we made transform here, it's not
    // needed since we made it already
    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because text is already there
    const xAxisLabel = xAxis
      .select(".x-axis-label")
      .attr("fill", "black")
      .text(metric)
      .style("font-size", "16px")
      .style("text-transform", "capitalize");

  }; // <-------- Draw histogram function closes here

  const metrics = [
    "humidity",
    "dewPoint",
    "temperatureHigh",
    "temperatureLow",
    "pressure",
    "windSpeed",
    "windGust",
    "cloudCover",
    "uvIndex",
  ];

  const button = d3.select("#button");
  button.node().addEventListener("click", clickHandler, false);
  // Old fashioned js option below:
  // const button = document.getElementById("button")
  // button.addEventListener("click", clickHandler, false)

  function clickHandler() {
    metricIndex++;
    if (metricIndex < metrics.length) drawHistogram(metrics[metricIndex]);
    else {
      metricIndex = 0;
      drawHistogram(metrics[metricIndex]);
    }
  }

  let metricIndex = 0;
  drawHistogram(metrics[metricIndex]);

} // <-------- drawChart function closes here

drawChart();
