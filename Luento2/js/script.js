async function drawChart() {
  // 1. Lue datatiedosto
  const dataset = await d3.json("../Data/my_weather_data.json");

  const xAccessor = (d) => d.humidity;
  const yAccessor = (d) => (d.dewPoint - 32) * (5/9);
  const colorAccessor = (d) => d.cloudCover;

  console.log(dataset[220]);

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

      //----------------- TEORIAA ---------------------------------------------------------
      // lineaarinen regressio lasketaan y = mx + b 
      // eli (ennustettava arvo) = (kulmakerroin * selittävä arvo) + vakiotermi

      // kulmakerroin lasketaan kaavalla: 
        // SIGMA { (x - x:n keskiarvo) * (y - y:n keskiarvo) } / SIGMA { (x - x:n keskiarvo)^2 }
        // HUOM. kaavassa x = selittävä ja y = ennustettava data

      // vakiotermi lasketaan kaavalla b = (y:n keskiarvo) - (kulmakerroin * x:n keskiarvo)

      // valitsen ennustettavaksi arvoksi kastepisteen lämpötilan ja selittäväksi arvoksi ilman kosteuden
      // huomaa se, että toisen asteikko on noin 0.3... 1.0 ja toisen -25... 25. eli data pitää ensin normalisoida
      // muussa tapauksessa kulmakerroin vaatisi todella ison kertoimen, jotta viiva näyttäisi miltä "odottaisi"
      //------------------------------------------------------------------------------------

  // tuon ensin datan ja talletan sen taulukoihin käyttäen map funktiota:
  // MUISTA MUUTTAA FAHRENHEITIT TAAS CELSIUKSEKSI
  var predictiveData = dataset.map(d => (d.dewPoint - 32) * (5/9));
  var explanatoryData = dataset.map(d => d.humidity);

  // seuraavaksi normalisoi datat välille 0 ja +1
   predictiveData = normalize(predictiveData);
   explanatoryData = normalize(explanatoryData);

   // funktio joka normalisoi:
   function normalize(data) {
    const min = d3.min(data);
    const max = d3.max(data);
    return data.map(value => (value - min) / (max - min));
   }

  console.log(predictiveData);

  // talletan kulmakertoimen ja vakiotermin muuttujiin:
  var kulmakerroin = 0;
  var vakiotermi = 0;

  // luon funktion, joka laskee kulmakertoimen
  function calculate_slope() {
    // HUOM: Data on jo luotu nimikkeillä predictiveData ja explanatoryData
    // alusta kulmakertoimen muuttuja
    var slope = 0;
    // laske ennustettavan ja selittävän datan keskiarvot
    predictiveMean = d3.mean(predictiveData);
    explanatoryMean = d3.mean(explanatoryData);
    // luo muuttujat, joihin voit tallettaa sigma-loopilla läpi käydyt vastaukset
    var jaettava = 0;
    var jakaja = 0;
    // laske jaettavan arvo kulmakertoimessa SIGMA { (x - x:n keskiarvo) * (y - y:n keskiarvo) }
    // HUOM. kaavassa x = selittävä ja y = ennustettava data
    for (i = 0; i < explanatoryData.length; i++) {
      jaettava += (explanatoryData[i] - explanatoryMean) * (predictiveData[i] - predictiveMean);
    }
    // laske jakajan arvo kulmakertoimessa SIGMA { (x - x:n keskiarvo)^2 }
    // HUOM. kaavassa x = selittävä ja y = ennustettava data
    for (i = 0; i < explanatoryData.length; i++) {
      jakaja += (explanatoryData[i] - explanatoryMean)^2;
    }
    // jaa osoittaja nimittäjällä saadaksesi kulmakerroin
    slope = jaettava / jakaja;
    // palauta kulmakerroin
    return slope;
  } // calculate_slope() function ENDS !!!!!!!!!!

  // kutsun kulmakertoimen laskevaa funktiota
  kulmakerroin = calculate_slope();
  console.log(`kulmakerroin: ${kulmakerroin}`);

  // laske vakiotermi kaavalla b = (y:n keskiarvo) - (kulmakerroin * x:n keskiarvo)
  vakiotermi = predictiveMean - (kulmakerroin * explanatoryMean);
  console.log(`vakiotermi: ${vakiotermi}`);

  // normalisoi myös xScale ja yScale, jotta ne toimivat välillä 0... 1 lineaarista regressiota varten:
  xScale.domain([0, 1]);
  yScale.domain([0, 1]);

  // luo generaattori joka piirtää lineaarisen regression
  const regressionLineGenerator = d3.line()
    .x((d, i) => xScale(explanatoryData[i]))
    .y((d, i) => yScale(kulmakerroin * explanatoryData[i] + vakiotermi));

  // piirrä viiva käyttäen em. generaattoria
  boundingBox.append("path")
  .datum(predictiveData)
  .attr("d", regressionLineGenerator)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 2);
  

}

drawChart();
