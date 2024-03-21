async function drawChart() {

    // 1. Lue datatiedosto
    let productionData = await d3.csv("electricityData/tuotanto-suomessa.csv");
    let consumptionData = await d3.csv ("electricityData/kulutus-suomessa.csv");
    let subtractionData = [];

    // create a new dataset which contains subtracter values production - consumption
    productionData.forEach((prodRow, i) => {
        let consRow = consumptionData[i];
        subtractionData.push({
            Date: prodRow["Alkuaika UTC"], // olettaen, että molemmilla riveillä on sama päivämäärä
            Value: +prodRow["Sähköntuotanto Suomessa"] - +consRow["Sähkönkulutus Suomessa"]
        });
    });

    // also modify other datasets to have similar Date and Value variables: 
    productionData = productionData.map(row => ({
        Date: row["Alkuaika UTC"],
        Value: +row["Sähköntuotanto Suomessa"]
    }));
    
    consumptionData = consumptionData.map(row => ({
        Date: row["Alkuaika UTC"],
        Value: +row["Sähkönkulutus Suomessa"]
    }));

    console.log(productionData);
    console.log(consumptionData);
    console.log(subtractionData);

    const dateParser = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ"); 
    const xAccessor = (d) => dateParser(d.Date);
    const yAccessor = (d) => +d["Value"];
  
    // 2. Tee mitoitus
    let dimensions = {
      width: window.innerWidth * 0.9,
      height: 600,
      margins: {
        top: 15,
        right: 15,
        bottom: 40,
        left: 100,
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

    let productionMax = d3.max(productionData, d => +d["Value"]);
    let productionMin = d3.min(productionData, d => +d["Value"]);
    let consumptionMax = d3.max(consumptionData, d => +d["Value"]);
    let consumptionMin = d3.min(consumptionData, d => +d["Value"]);
    let subtractionMax = d3.max(subtractionData, d => +d["Value"]);
    let subtractionMin = d3.min(subtractionData, d => +d["Value"]);

    let totalMax = d3.max([productionMax, consumptionMax, subtractionMax]);
    let totalMin = d3.min([productionMin, consumptionMin, subtractionMin]);

    console.log(productionMax, productionMin, consumptionMax, consumptionMin, totalMax, totalMin);
    

    const yScale = d3.scaleLinear() 
      .domain([totalMin, totalMax]) 
      .range([dimensions.boundedHeight, 0]); 
  
    const xScale = d3.scaleTime() 
      .domain(d3.extent(productionData, xAccessor))
      .range([0, dimensions.boundedWidth]); 
  
    // 5. Piirrä data
    const lineGenerator = d3.line() 
      .x((d) => xScale(xAccessor(d))) 
      .y((d) => yScale(yAccessor(d))); 
  
    const lineProduction = boundingBox.append("path") 
      .attr("d", lineGenerator(productionData)) 
      .attr("fill", "none") 
      .attr("stroke", "#00995D") 
      .attr("stroke-width", 2); ; 
  
    const lineConsumption = boundingBox.append("path") 
      .attr("d", lineGenerator(consumptionData)) 
      .attr("fill", "none") 
      .attr("stroke", "#99001C") 
      .attr("stroke-width", 2); 

    const lineSubtraction = boundingBox.append("path")
        .attr("d", lineGenerator(subtractionData))
        .attr("fill", "none")
        .attr("stroke", "#C10099")
        .attr("stroke-width", 2);
    

    // 6. Piirrä akselit
    boundingBox.append("text")
    .attr("x", 0) 
    .attr("y", 0) 
    .text("Megawatts"); 
    
    const yAxisGenerator = d3.axisLeft()
      .scale(yScale)
  
    const yAxis = boundingBox.append("g").call(yAxisGenerator);
  
    const xAxisGenerator = d3.axisBottom().scale(xScale);
    const xAxis = boundingBox
      .append("g")
      .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundedHeight}px)`);
  

    boundingBox.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", dimensions.boundedWidth)
      .attr("y2", yScale(0))
      .style("stroke", "black")
      .style("stroke-dasharray", ("3, 3"));
  
    // (7. Lisää interaktiot)

    // add legend (explanatory box) for production to the left of svg
    let legend_x = 22;
    let legend_text_x = 10;
    let legend_production_y = 100;

    wrapper.append("rect")
        .attr("x", legend_x)
        .attr("y", legend_production_y)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "#00995D");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_production_y - 25)
        .text("Electricity")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_production_y - 15)
        .text("production")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_production_y - 5)
        .text("in Finland")
        .style("font-size", "10px");

    // add legend (explanatory box) for consumption to the left of svg
    let legend_consumption_y = 170;

    wrapper.append("rect")
        .attr("x", legend_x)
        .attr("y", legend_consumption_y)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "#99001C");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_consumption_y - 25)
        .text("Electricity")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_consumption_y - 15)
        .text("consumption")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_consumption_y - 5)
        .text("in Finland")
        .style("font-size", "10px");

    // add legend (explanatory box) for difference between production and consumption to the left of svg
    let legend_exportation_y = 270;

    wrapper.append("rect")
        .attr("x", legend_x)
        .attr("y", legend_exportation_y)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "#C10099");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_exportation_y - 55)
        .text("Difference")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_exportation_y - 45)
        .text("between")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_exportation_y - 35)
        .text("production")
        .style("font-size", "10px");
    
    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_exportation_y -25)
        .text("and")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_exportation_y - 15)
        .text("consumption")
        .style("font-size", "10px");

    wrapper.append("text")
        .attr("x", legend_text_x)
        .attr("y", legend_exportation_y -5)
        .text("in Finland.")
        .style("font-size", "10px");

    // add a few dash lines that go vertically to ease seeing data relationships
    let interaction_line1 = boundingBox.append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("opacity", 1)
        .style("stroke-dasharray", ("3, 3"))
        .attr("x1", dimensions.boundedWidth/2)
        .attr("y1", 0)
        .attr("x2", dimensions.boundedWidth/2)
        .attr("y2", dimensions.boundedHeight);

    let interaction_line2 = boundingBox.append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("opacity", 1)
        .style("stroke-dasharray", ("3, 3"))
        .attr("x1", dimensions.boundedWidth/4)
        .attr("y1", 0)
        .attr("x2", dimensions.boundedWidth/4)
        .attr("y2", dimensions.boundedHeight);

    let interaction_line3 = boundingBox.append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("opacity", 1)
        .style("stroke-dasharray", ("3, 3"))
        .attr("x1", (dimensions.boundedWidth/4)*3)
        .attr("y1", 0)
        .attr("x2", (dimensions.boundedWidth/4)*3)
        .attr("y2", dimensions.boundedHeight);

  }
  
  drawChart();