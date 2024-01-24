async function drawChart() {
  // 1. Lue datatiedosto
  const dataset = await d3.json("../../Data/my_weather_data.json"); // asynch open json
  const yAccessor = (d) => (d.temperatureMax - 32) * (5/9); // create a function to return yAxis a celsiusvalue calculates based on the fahrenheits
  const dateParser = d3.timeParse("%Y-%m-%d"); // create timeParser function using d3.timeParse, so u can change the str variable into date variable
  const xAccessor = (d) => dateParser(d.date); // now find the 'date' variable from the row, return a parsed date

  // 2. Tee mitoitus
  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 600,
    margins: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }; 

  dimensions.boundedWidth =
    dimensions.width - dimensions.margins.left - dimensions.margins.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margins.top - dimensions.margins.bottom;

  // 3. Piirrä graafille pohja-svg
  const wrapper = d3 .select("#wrapper") // select wrapper from html
    .append("svg") // change empty wrapper into svg image using svg tag
    .attr("width", dimensions.width) // add width attribute to the wrapper
    .attr("height", dimensions.height); // add height attribute to the wrapper

  const boundingBox = wrapper.append("g") // create a boundingBox using group element, later draw lines inside this box
    .style(
      "transform",
      `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`
    );

  // 4. Tee skaalaimet
  const yScale = d3.scaleLinear() // scaleLinear is a function used to scale different temperature values into different pixel distances
    .domain(d3.extent(dataset, yAccessor)) // extent finds minimum and maximum values, giving temperature values to scale
    .range([dimensions.boundedHeight, 0]); // range will give the pixel distances to scale

  const xScale = d3.scaleTime() // scaleTime automatically splits x-axis to months during scaling unless specified else
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]); 

  // 5. Piirrä data
  const lineGenerator = d3.line() // create a new d3 line generator
    .x((d) => xScale(xAccessor(d))) // define x coordinate of the line
    .y((d) => yScale(yAccessor(d))); // define y coordinate of the line

  const line = boundingBox.append("path") // add a new path element 'line'
    .attr("d", lineGenerator(dataset)) // define the direction of line between each point using parameter d and the lineGenerator
    .attr("fill", "none") 
    .attr("stroke", "#99001C") // make the line carmine red
    .attr("stroke-width", 2); 

  // 6. Piirrä akselit

  boundingBox.append("text")
  .attr("x", 0) // sijainti x-akselilla
  .attr("y", 0) // sijainti y-akselilla
  .text("°C"); // teksti, joka näytetään
  
  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)

  const yAxis = boundingBox.append("g").call(yAxisGenerator);

  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const xAxis = boundingBox
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);


  // (7. Lisää interaktiot)
}

drawChart();