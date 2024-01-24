async function drawChart() {
  // 1. Lue datatiedosto
  const dataset = await d3.json("../Data/my_weather_data.json");

  const xAccessor = (d) => d.humidity;
  const yAccessor = (d) => (d.dewPoint - 32) * (5/9);
  const colorAccessor = (d) => d.cloudCover;

  console.log(dataset[0]);

  // 2. Tee mitoitus

  var screenheight = window.innerHeight;
  var screenwidth = window.innerWidth;
  var screensize = d3.min([screenheight, screenwidth]);

  // console.log(`screenheight: ${screenheight}, screenwidth: ${screenwidth}, screensize: ${screensize}`);

  var width = 500;

  if (screensize < 400) {
   width = screensize * 0.7;
  }
  else if (screensize < 600) {
    width = screensize * 0.8
  }
  else {
    width = screensize * 0.9
  }

  let dimensions = {
    width: width,
    height: width,
    margins: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margins.left - dimensions.margins.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margins.top - dimensions.margins.bottom;

  // 3. Piirrä graafille pohja-svg
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

  // 4. Tee skaalaimet
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const colorScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, colorAccessor))
    .range(["blue", "red"]);

  console.log(xScale.domain());
  console.log(yScale.domain());
  console.log(colorScale.domain());

  // 5. Piirrä data

  var radius =  3;

  if (screensize < 400) {
    radius = 2;
   }
   else if (screensize < 600) {
     radius = 3;
   }
   else {
     radius = 4;
   }

  const points = boundingBox
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("fill", (d) => colorScale(colorAccessor(d)))
    .attr("r", radius);

  console.log(points);

  // 6. Piirrä akselit

  var xAxisTickValues = d3.range(0, 1.1, 0.1);

  const xAxisGenerator = d3.axisBottom().scale(xScale).tickValues(xAxisTickValues);
  const xAxis = boundingBox
    .append("g")
    .attr("class", "xAxis")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxisLabel = xAxis
    .append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margins.bottom - 10)
    .attr("fill", "black")
    .style("font-size", "14px")
    .text("Ilman suhteellinen kosteus");

  const yAxisGenerator = d3.axisLeft().scale(yScale);
  const yAxis = boundingBox
    .append("g")
    .attr("class", "yAxis")
    .call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margins.left + 12)
    .attr("fill", "black")
    .style("font-size", "14px")
    .html("Kastepiste (&deg;C)") 
    .style("text-anchor", "middle")
    .style("transform", "rotate(-90deg)");


  // (7. Lisää interaktiot)


  // 8. lisää lineaarinen regressio muuttujien kastepiste ja humidity välille

  // lineaarinen regressio lasketaan y = mx + b 
  // eli (ennustettava arvo) = (kulmakerroin * selittävä arvo) + vakiotermi

  // kulmakerroin lasketaan kaavalla: 
    // SIGMA { (x - x:n keskiarvo) * (y - y:n keskiarvo) } / SIGMA{ (x - x:n keskiarvo)^2 }

  // vakiotermi lasketaan kaavalla b = (y:n keskiarvo) - (kulmakerroin * x:n keskiarvo)

  // valitsen ennustettavaksi arvoksi kastepisteen lämpötilan (joka on myös merkitty y-akselille)

  var vakiotermi = 0;
  var kulmakerroin = 0;

  






}

drawChart();
