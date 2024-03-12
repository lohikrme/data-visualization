async function drawMap() {
  // 1. Lue data
  const countryShapes = await d3.json("./../../Data/world_countries.geojson");
  console.log(countryShapes);
  const countryNameAccessor = (d) => d.properties["NAME"];
  const countryIdAccessor = (d) => d.properties["ADM0_A3_RU"];
  const dataset = await d3.csv("./../../Data/world_bank_data.csv");
  const metric = "Population growth (annual %)";
  console.log(dataset[metric]);
  let metricDataByCountry = {};
  dataset.forEach((d) => {
    if (d["Series Name"] == metric) {
      return (metricDataByCountry[d["Country Code"]] =
        +d["2017 [YR2017]"] || 0);
    }
  });

  // 2. Tee mitoitus
  let dimensions = {
    width: window.innerWidth * 0.9,
    margins: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margins.left - dimensions.margins.right;

  const sphere = { type: "Sphere" };
  const projection = d3
    .geoEqualEarth()
    .fitWidth(dimensions.boundedWidth, sphere);
  const pathGenerator = d3.geoPath(projection);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere);
  console.log(y1);
  dimensions.boundedHeight = y1;
  dimensions.height = y1 + dimensions.margins.top + dimensions.margins.bottom;

  // 3. Piirrä svg
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("height", dimensions.height)
    .attr("width", dimensions.width);

  const boundingBox = wrapper.append("g").style(
    "transform",
    `translate(
          ${dimensions.margins.left}px,
          ${dimensions.margins.top}px)`
  );

  // 4. Määritä skaalaimet
  const metricValues = Object.values(metricDataByCountry);
  const metricValueExtents = d3.extent(metricValues);
  console.log(metricValueExtents);
  const maxChange = d3.max([-metricValueExtents[0], metricValueExtents[1]]);
  const colorScale = d3
    .scaleLinear()
    .domain([-maxChange, 0, maxChange])
    .range(["blue", "white", "red"]);

  // 5. piirrä data
  const earth = boundingBox
    .append("path")
    .attr("class", "earth")
    .attr("d", pathGenerator(sphere));

  const graticuleJSON = d3.geoGraticule10();

  const graticule = boundingBox
    .append("path")
    .attr("class", "graticule")
    .attr("d", pathGenerator(graticuleJSON));

  const countries = boundingBox
    .selectAll(".country")
    .data(countryShapes.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", pathGenerator)
    .attr("fill", (d) => {
      const metricValue = metricDataByCountry[countryIdAccessor(d)];
      if (typeof metricValue == "undefined") return "black";
      return colorScale(metricValue);
    });

  const legendGroup = wrapper
    .append("g")
    .attr("class", "legendGroup")
    .attr(
      "transform",
      `translate(${120},${
        dimensions.width < 800
          ? dimensions.boundedHeight - 30
          : dimensions.boundedHeight * 0.5
      })`
    );

  const legendTitle = legendGroup
    .append("text")
    .attr("y", -5)
    .attr("class", "legend-title")
    .style("text-anchor", "middle")
    .text("Population growth");

  const legendByline = legendGroup
    .append("text")
    .attr("y", 30)
    .attr("class", "legend-byline")
    .style("text-anchor", "middle")

    .text("Percent change in 2017");

  const defs = wrapper.append("defs");
  const legendGradientId = "legend-gradient";
  const gradient = defs
    .append("linearGradient")
    .attr("id", legendGradientId)
    .selectAll("stop")
    .data(colorScale.range())
    .join("stop")
    .attr("stop-color", (d) => d)
    .attr("offset", (d, i) => `${(i * 100) / 2}%`);

  const legendWidth = 120;
  const legendHeight = 16;
  const legendGradient = legendGroup
    .append("rect")
    .attr("x", -legendWidth / 2)
    .attr("height", legendHeight)
    .attr("width", legendWidth)
    .style("fill", `url(#${legendGradientId})`);

  const legendValueRight = legendGroup
    .append("text")
    .attr("class", "legend-value")
    .attr("x", legendWidth / 2 + 10)
    .attr("y", legendHeight / 2 + 5)
    .text(`${d3.format(".1f")(maxChange)}%`);
  const legendValueLeft = legendGroup
    .append("text")
    .attr("class", "legend-value")
    .attr("x", -legendWidth / 2 - 10)
    .attr("y", legendHeight / 2 + 5)
    .text(`${d3.format(".1f")(-maxChange)}%`)
    .style("text-anchor", "end");

  const tooltip = d3.select("#tooltip");
  const formatter = d3.format(".2f");
  boundingBox
    .selectAll(".country")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave);

  function onMouseEnter(event, d) {
    tooltip.select("#name").text(countryNameAccessor(d));
    tooltip
      .select("#value")
      .text(formatter(metricDataByCountry[countryIdAccessor(d)]));
    tooltip.style("opacity", 1);
    const [tooltipX, tooltipY] = pathGenerator.centroid(d);
    console.log(tooltipX, tooltipY);
    tooltip.style(
      "transform",
      `translate(
        calc(-50% + ${tooltipX}px + ${dimensions.margins.left}px), 
        calc(-100% + ${tooltipY}px + ${dimensions.margins.top}px))`
    );
  }
  function onMouseLeave() {
    tooltip.style("opacity", 0);
  }
}

drawMap();
