async function drawChart() {
  // Data
  const dataset = await d3.json("./../../Data/my_weather_data.json");
  const humidityAccessor = (d) => d.humidity;
  const yAccessor = (d) => d.length;

  // Mitoitus
  const width = 600;

  let dimensions = {
    width: width,
    height: width * 0.6,
    margins: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margins.left - dimensions.margins.right;

  dimensions.boundedHeight =
    dimensions.height - dimensions.margins.top - dimensions.margins.bottom;

  // SVG-pohja
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const boundingBox = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`
    );

  // Skaalaimet
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, humidityAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const groupGenerator = d3
    .histogram()
    .domain(xScale.domain())
    .value(humidityAccessor)
    .thresholds(11);

  const groups = groupGenerator(dataset);
  console.log(groups);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(groups, yAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice();

  // Datan piirtäminen
  const barsGroup = boundingBox.append("g").attr("id", "barsGroup");

  const barGroups = barsGroup
    .selectAll("g")
    .data(groups)
    .enter()
    .append("g")
    .attr("class", "barGroup");

  const barPadding = 2;
  const rects = barGroups
    .append("rect")
    .attr("x", (d) => xScale(d.x0) + barPadding / 2)
    .attr("y", (d) => yScale(yAccessor(d)))
    .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - barPadding)
    .attr("height", (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
    .attr("fill", "lightblue");

  const barText = barGroups
    .filter(yAccessor)
    .append("text")
    .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    .attr("y", (d) => yScale(yAccessor(d)) - 5)
    .text(yAccessor)
    .attr("fill", "blue")
    .style("font-size", "12px")
    .style("font-family", "arial")
    .style("text-anchor", "middle");

  const mean = d3.mean(dataset, humidityAccessor);
  const line = boundingBox
    .append("line")
    .attr("x1", xScale(mean))
    .attr("y1", 0)
    .attr("x2", xScale(mean))
    .attr("y2", dimensions.boundedHeight)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", "5px 2px");

  const meanLineText = boundingBox
    .append("text")
    .attr("x", xScale(mean))
    .attr("y", -10)
    .text("mean " + mean.toFixed(2))
    .style("font-size", "12px")
    .style("font-family", "arial")
    .style("text-anchor", "middle");

  // Akselin piirto
  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = boundingBox
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxisText = xAxis
    .append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .style("font-size", "14px")
    .text("Humidity")
    .style("text-anchor", "middle");

  // 7. interaktiot
  const tooltip = d3.select("#tooltip");
  barGroups
    .select("rect")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave);

  function onMouseEnter(event, d) {
    tooltip.style("opacity", 1);
    tooltip.select("#count").text(yAccessor(d));
    tooltip.select("#range").text([d.x0, d.x1].join(" - "));
    const tooltipX =
      xScale(d.x0) +
      (xScale(d.x1) - xScale(d.x0)) / 2 +
      dimensions.margins.left +
      8;
    const tooltipY = yScale(yAccessor(d)) + dimensions.margins.top + 8;
    tooltip.style(
      "transform",
      `translate(calc(-50% + ${tooltipX}px), calc(-100% + ${tooltipY}px))`
    );
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0);
  }
}

drawChart();
