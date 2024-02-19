async function drawChart() {
    // Read data
  
    const dataset = await d3.json("./../../Data/my_weather_data.json");
    console.table(dataset[0]);
  
  
    // Create dimensions
    /**** Tässä huomidaan pienet näytöt ****/
    let width;
    if (window.innerWidth > 650) {
      width = 600;
    } else {
      width = window.innerWidth * 0.9;
    }
    window.onresize = function () {
      location.reload();
    };
  
  
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


      boundingBox
        .append("line") // luo uuden line-elementin
        .attr("x1", dimensions.boundedWidth / 2) // määrittää viivan alkupisteen x-koordinaatin
        .attr("y1", 0) // määrittää viivan alkupisteen y-koordinaatin
        .attr("x2", dimensions.boundedWidth) // määrittää viivan loppupisteen x-koordinaatin
        .attr("y2", dimensions.boundedHeight / 2) // määrittää viivan loppupisteen y-koordinaatin
        .attr("stroke", "black"); // määrittää viivan värin

        const circle = boundingBox
            .append("circle")
            .attr("cx", 50)
            .attr("cy", 50)
            .attr("r", 20)
            .style("transform", "translate(2px, 10px)")
            .attr("fill", "red")

        function drawCircle() {
            circle.transition()
                .duration(2000)
                .attr("r", 50)
                .transition()
                .duration(1000)
                .attr("r", 20)
                .on("end", drawCircle);
        }

        drawCircle();

        boundingBox
        .append("rect")
        .attr("x", 150)
        .attr("y", 70)
        .attr("width", 100)
        .attr("height", 80)
        .attr("fill", "blue");


} // drawChart function closes here
drawChart();