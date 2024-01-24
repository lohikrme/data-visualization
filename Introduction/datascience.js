d3.json("measures.json").then(
    // this function we just made (d3.json) is an asynchronous function, that waits until data is loaded
    // and only then does something
    // so first we load the data into form of dataArray, for easier access
    loaded_data => {
        var dataArray = []
        for (var i in loaded_data) {
            dataArray.push(loaded_data[i].Measures)
        }

        for (var i in dataArray) {
            dataArray[i].AirPressure = dataArray[i].AirPressure.replace(",", ".")
            dataArray[i].AirPressure = parseFloat(dataArray[i].AirPressure)

            dataArray[i].Humidity = dataArray[i].Humidity.replace(",", ".")
            dataArray[i].Humidity = parseFloat(dataArray[i].Humidity)

            dataArray[i].Temp = dataArray[i].Temp.replace(",", ".")
            dataArray[i].Temp = parseFloat(dataArray[i].Temp)
        }

        // console log how the data array looks now with replacements and float numbers
        console.log(dataArray)

        // console log min and max values of different attributes in the dataArray
        var minAirPressure = d3.min(dataArray.filter(d => d.AirPressure !== 0), d => d.AirPressure)
        var minHumidity = d3.min(dataArray.filter(d => d.Humidity !== 0), d => d.Humidity)
        var minTemp = d3.min(dataArray.filter(d => d.Temp !== 0), d => d.Temp)
        var maxAirPressure = d3.max(dataArray, d => d.AirPressure)
        var maxHumidity = d3.max(dataArray, d => d.Humidity)
        var maxTemp = d3.max(dataArray, d => d.Temp)

        console.log(minAirPressure)
        console.log(minHumidity)
        console.log(minTemp)
        console.log(maxAirPressure)
        console.log(maxHumidity)
        console.log(maxTemp)

        // start to create a new data from dataArray, where data is averaged by month
        // to do this you need to use timeFormat() method to select data only by month and year
        var parseTime = d3.timeParse("%a %b %d %H:%M:%S %Y"); // timestamp in "Fri Mar 15 21:42:29 2019" format
        var formatTime = d3.timeFormat("%m-%Y") // output format for month in "Mar 2019" format

        // group the data by month
        var nestedData = d3.nest()
            .key(function (d) { return formatTime(parseTime(d.Timestamp)) }) // convert timestamp to date and then to string, keeping only the year and month
            .entries(dataArray)

        // calculate the monthly average for each measure
        var monthlyAverage = nestedData.map(function (d) {
            return {
                month: d.key,
                airPressure: d3.mean(d.values, function (v) { return v.AirPressure }),
                humidity: d3.mean(d.values, function (v) { return v.Humidity }),
                temperature: d3.mean(d.values, function (v) { return v.Temp })
            }
        })

        // use the monthlyAverage array for your visualization
        console.log(monthlyAverage)

        //********************************/
        // START CREATING SVG GRAPHICS
        //********************************

        // first give basic dimensions for all separate svg-graphics
        var graph_width = 300
        var graph_height = 300

        var margin = {
            top: 50,
            right: 20,
            bottom: 30,
            left: 50
        }

        // then start creating the airpressure-graphic
        var svg_airpressure = d3.select("#airpressure-graph")
            .attr("width", graph_width + margin.left + margin.right)
            .attr("height", graph_height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        svg_airpressure.append("text")
            .attr("x", (graph_width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("font-family", "Arial")
            .text("Kuukausittainen ilmanpaineen keskiarvo")

        var x_airpressure = d3.scaleBand()
            .domain(monthlyAverage.map(item => item.month))
            .range([0, graph_width])
            .padding(0.1)

        var y_airpressure = d3.scaleLinear()
            .domain([940, d3.max(monthlyAverage, item => item.airPressure) + 40])
            .range([graph_height, 0])

        svg_airpressure.selectAll(".bar")
            .data(monthlyAverage)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", item => x_airpressure(item.month))
            .attr("y", item => y_airpressure(item.airPressure))
            .attr("width", x_airpressure.bandwidth())
            .attr("height", item => graph_height - y_airpressure(item.airPressure))
            .attr("fill", "teal")

        var Y_Axis_AirPressure = d3.axisLeft(y_airpressure).tickFormat(d3.format("d"))
        svg_airpressure.append("g")
            .attr("class", "y-axis")
            .call(Y_Axis_AirPressure)


        var X_Axis_Airpressure = d3.axisBottom(x_airpressure);
        svg_airpressure.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graph_height + ")")
            .call(X_Axis_Airpressure)
            .selectAll("text")
            .style("text-anchor", "center")
            .attr("dy", "1em")



        // start creating humidity graph
        var svg_humidity = d3.select("#humidity-graph")
            .attr("width", graph_width + margin.left + margin.right)
            .attr("height", graph_height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        svg_humidity.append("text")
            .attr("x", (graph_width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("font-family", "Arial")
            .text("Kuukausittainen ilmankosteuden keskiarvo")

        var x_humidity = d3.scaleBand()
            .domain(monthlyAverage.map(item => item.month))
            .range([0, graph_width])
            .padding(0.1)

        var y_humidity = d3.scaleLinear()
            .domain([0, d3.max(monthlyAverage, item => item.humidity + 20)])
            .range([graph_height, 0])

        svg_humidity.selectAll(".bar")
            .data(monthlyAverage)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", item => x_humidity(item.month))
            .attr("y", item => y_humidity(item.humidity))
            .attr("width", x_humidity.bandwidth())
            .attr("height", item => graph_height - y_humidity(item.humidity))
            .attr("fill", "LightBlue")

        var Y_Axis_Humidity = d3.axisLeft(y_humidity).tickFormat(d3.format("d"))
        svg_humidity.append("g")
            .attr("class", "y-axis")
            .call(Y_Axis_Humidity)

        var X_Axis_Humidity = d3.axisBottom(x_humidity);
        svg_humidity.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graph_height + ")")
            .call(X_Axis_Humidity)
            .selectAll("text")
            .style("text-anchor", "center")
            .attr("dy", "1em")

        // start creating temperature graph

        var svg_temperature = d3.select("#temperature-graph")
            .attr("width", graph_width + margin.left + margin.right)
            .attr("height", graph_height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        svg_temperature.append("text")
            .attr("x", (graph_width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("font-family", "Arial")
            .text("Kuukausittainen lämpötilan keskiarvo")

        var x_temperature = d3.scaleBand()
            .domain(monthlyAverage.map(item => item.month))
            .range([0, graph_width])
            .padding(0.1)

        var y_temperature = d3.scaleLinear()
            .domain([20, d3.max(monthlyAverage, item => item.temperature + 5)])
            .range([graph_height, 0])

        svg_temperature.selectAll(".bar")
            .data(monthlyAverage)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", item => x_temperature(item.month))
            .attr("y", item => y_temperature(item.temperature))
            .attr("width", x_temperature.bandwidth())
            .attr("height", item => graph_height - y_temperature(item.temperature))
            .attr("fill", "orange")

        var Y_Axis_Temperature = d3.axisLeft(y_temperature).tickFormat(d3.format("d"))
        svg_temperature.append("g")
            .attr("class", "y-axis")
            .call(Y_Axis_Temperature)

        var X_Axis_Temperature = d3.axisBottom(x_temperature);
        svg_temperature.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graph_height + ")")
            .call(X_Axis_Temperature)
            .selectAll("text")
            .style("text-anchor", "center")
            .attr("dy", "1em")
    }

)
