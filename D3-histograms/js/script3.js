async function drawChart() {

  // Read data
  const dataset = await d3.json("./../../Data/my_weather_data.json");
  console.table(dataset[0]);

  // Create dimensions

  let width;

  function updateWidth() {
    if (window.innerWidth > 650) {
      width = 600;
    } else {
      width = window.innerWidth * 0.9;
    }
  }
  updateWidth();
  window.addEventListener('resize', updateWidth);

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

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;


  // Draw canvas and inner wrapper
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const boundingBox = wrapper
    .append("g")
    .attr("id", "boundingBox")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // Create all static elements. Notice how they are not
  // set as variables. These will be selected by their
  // class name.

  // group for all bars
  boundingBox.append("g").attr("class", "barsGroup");
  // line for mean value
  boundingBox.append("line").attr("class", "line");
  boundingBox.append("text").attr("class", "meanLineText");
  boundingBox
    .append("g")
    // group for x-axis content
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    // text element for x-axis label inside x-axis group
    .append("text")
    .attr("class", "x-axis-label");

  // SUBFUNCTION
  const drawHistogram = (metric) => {
    const metricAccessor = (d) => d[metric];
    const yAccessor = (d) => d.length;

    // Create scales (and groups in this case)
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, metricAccessor))
      .range([0, dimensions.boundedWidth])
      .nice();

    const groupGenerator = d3
      .histogram()
      .domain(xScale.domain())
      .value(metricAccessor)
      .thresholds(11);

    const groups = groupGenerator(dataset);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(groups, yAccessor)])
      .range([dimensions.boundedHeight, 0])
      .nice();

    // Draw data

    const barPadding = 4;

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
    barGroups.exit().remove();

    // create empty groups for bars and name them
    const newBarGroups = barGroups
      .enter()
      .append("g")
      .attr("class", "barGroup");

    // add rect element for each group
    newBarGroups.append("rect");
    // add text element for each group
    newBarGroups.append("text");

    // merge new bars with old ones if exist
    barGroups = newBarGroups.merge(barGroups);

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because rects are already there
    const rects = barGroups
      .select("rect")
      .attr("x", (d) => xScale(d.x0) + barPadding / 2)
      .attr("y", (d) => yScale(yAccessor(d)))
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
      .attr("height", (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
      .attr("fill", "lightblue");

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because texts are already there
    const barText = barGroups
      .select("text")
      .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", 0)
      .style("transform", (d) => `translateY(${yScale(yAccessor(d)) - 5}px)`)
      .text(yAccessor)
      .attr("fill", "blue")
      .style("font-size", "13px")
      .style("font-family", "arial")
      .style("text-anchor", "middle");

    const mean = d3.mean(dataset, metricAccessor);

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because line is already there
    const line = boundingBox
      .select(".line")
      .style("transform", `translateX(${xScale(mean)}px)`)
      .attr("y1", -10)
      .attr("y2", dimensions.boundedHeight);

    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because text is already there
    const meanLineText = boundingBox
      .select(".meanLineText")
      .style("transform", `translateX(${xScale(mean)}px)`)
      // .attr("x", xScale(mean))
      .attr("y", -15)
      .text("mean " + mean.toFixed(2));

    // Draw axes
    const xAxisGenerator = d3.axisBottom().scale(xScale)

    const xAxis = boundingBox.select(".x-axis").call(xAxisGenerator);
    // in the old code we made transform here, it's not
    // needed since we made it already
    // This looks the same as the old code but,
    // note: you make a select here, not append
    // because text is already there
    const xAxisLabel = xAxis
      .select(".x-axis-label")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 10)
      .attr("fill", "black")
      .text(metric)
      .style("font-size", "16px")
      .style("text-transform", "capitalize");
  }; // Draw histogram function closes here

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
} // drawChart function closes here
drawChart();
