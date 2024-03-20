
// bring information about starting and ending date from UI
// if ending_date is today, remove 15 minutes from ending_clcok and use that as end of today
// there is 1-2 hour time difference because new Date() uses UCT +0 time
// but i will let it be that way, because loosing last couple of hours is not as critical
// as giving too high input, which would crash the program
let now = new Date();
let starting_date = document.getElementById('starting-date-input').value;
let ending_date = document.getElementById('ending-date-input').value;
let ending_date_object = new Date(ending_date);

let starting_clock = "T00:00:00Z";
let ending_clock = "T23:59:59Z"

if (ending_date_object.toDateString() === now.toDateString()) {
    now.setMinutes(now.getMinutes() - 15);
    ending_clock = ending_clock = "T" + now.toISOString().split('T')[1].slice(0, 8) + "Z";
} else {
    ending_clock = "T23:59:59Z";
}

// define some colors to be used later
let leaf_green = "#5ca904"; // production
let carmine_red = "#D70040"; // consumption & solarpower
let ocean_blue = "#4f42b5"; // exportation & hydropower
let teal = "#008080"; // windpower

// store info which button has been lately pressed: 
var overview_on = false;
var renewability_on = false;

// this list stores api_id's of fingrid and allows to load data
let list_of_api_ids = [];

const id_elec_production = "192";
const id_elec_consumption = "193";
const id_elec_exportation = "194";

const id_wind_power = "181";
const id_hydro_power = "191";
const id_solar_power = "248";
const id_nuclear_power = "188";


// this function fetches data from fingrid.fi
function fetchData(api_id) {
    const api_url = `https://api.fingrid.fi/v1/variable/${api_id}/events/csv?start_time=${starting_date}${starting_clock}&end_time=${ending_date}${ending_clock}`;
    return fetch(api_url).
    then(response => response.text()).
    then(data => d3.csvParse(data));
}

// draw an overview graph
function draw_new_overview_graph() {
    // update dates and api_id's for the overview graph
    starting_date = document.getElementById('starting-date-input').value;
    ending_date = document.getElementById('ending-date-input').value;
    list_of_api_ids = [id_elec_production, id_elec_consumption, id_elec_exportation];

    // fetch the data from fingrid.fi
    Promise.all(list_of_api_ids.map(fetchData)).then(function(datas) {
        // split and clean data
        // this case we want only dateclock and value for each data type
        // so we must parse the times of data to date objects
        const date_parser = d3.timeParse("%Y-%m-%dT%H:%M:%S+0000") 

        let elec_production_data = datas[0];
        let elec_consumption_data = datas[1];
        let elec_exportation_data = datas[2]; // value > 0 = export, value < 0 import

        elec_production_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time);
            d.value = +d.value;
        });
        elec_consumption_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time);
            d.value = +d.value;
        });
        elec_exportation_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time);
            d.value = +d.value;
        });

        console.log(elec_production_data);
        console.log(elec_consumption_data);
        console.log(elec_exportation_data);

        // access the html svg element to use it for drawing
        let original_svg_element = document.getElementById("electricity-visualization");
        let svg = d3.select("#electricity-visualization");

        // clear the svg so it is clean grey before drawing
        svg.selectAll("*").remove();
        svg.style("background-color", "#D5D5D5");

        // create dimensions for the graph
        let width = original_svg_element.clientWidth;
        let height = original_svg_element.clientHeight;

        let dimensions = {
            width: width,
            height: height,
            margins: {
            top: 25,
            right: 15,
            bottom: 40,
            left: 100,
            },
        }; 
        
        dimensions.boundedWidth =
            dimensions.width - dimensions.margins.left - dimensions.margins.right;
        dimensions.boundedHeight =
            dimensions.height - dimensions.margins.top - dimensions.margins.bottom;

        console.log("Leveys: " + dimensions.boundedHeight);
        console.log("Korkeus: " + dimensions.boundedWidth);

        // add to svg a boundingBox, so there is room for the x and y accessor
        const boundingBox = svg.append("g") // create a boundingBox using group element, later draw lines inside this box
        .style(
        "transform",
        `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`
        );

        // to scale data, we must find minimum and maximum values for both x and y
        let max_prod = d3.max(elec_production_data, d => d.value);
        let min_prod = d3.min(elec_production_data, d => d.value);
        let max_cons = d3.max(elec_consumption_data, d => d.value);
        let min_cons = d3.min(elec_consumption_data, d => d.value);
        let max_exp = d3.max(elec_exportation_data, d => d.value);
        let min_exp = d3.min(elec_exportation_data, d => d.value);
        let total_max = d3.max([max_prod, max_cons, max_exp]);
        let total_min = d3.min([min_prod, min_cons, min_exp]);

        console.log(max_prod);
        console.log(max_cons);
        console.log(max_exp);
        console.log(min_prod);
        console.log(min_cons);
        console.log(min_exp);
        console.log(total_max);
        console.log(total_min);

        let min_date = d3.min(elec_production_data, d => d.start_time);
        let max_date = d3.max(elec_production_data, d => d.start_time);
        console.log(min_date);
        console.log(max_date);

        // functions to scale the x and y axis
        yScale = d3.scaleLinear()
            .domain([total_min, total_max])
            .range([dimensions.boundedHeight, 0]);

        xScale = d3.scaleTime()
            .domain([min_date, max_date])
            .range([0, dimensions.boundedWidth]);

        // function to scale the line_production of chart
        const line_generator_production = d3.line() // create a new d3 line generator
            .x((d) => xScale(d.start_time)) // define x coordinate of the line
            .y((d) => yScale(d.value)); // define y coordinate of the line

        // draw line_production
        const line_production = boundingBox.append("path") 
            .attr("d", line_generator_production(elec_production_data))
            .attr("fill", "none") 
            .attr("stroke", leaf_green)
            .attr("stroke-width", 3); 

        // function to scale line_consumption
        const line_generator_consumption = d3.line()
            .x((d) => xScale(d.start_time))
            .y((d) => yScale(d.value));

        // draw line_consumption
        const line_consumption = boundingBox.append("path")
            .attr("d", line_generator_consumption(elec_consumption_data))
            .attr("fill", "none")
            .attr("stroke", carmine_red)
            .attr("stroke-width", 3);

        // function to scale line_exportation
        const line_generator_exportation = d3.line()
            .x((d) => xScale(d.start_time))
            .y((d) => yScale(d.value));

        // draw line_exportation
        const line_exportation = boundingBox.append("path")
            .attr("d", line_generator_exportation(elec_exportation_data))
            .attr("fill", "none")
            .attr("stroke", ocean_blue)
            .attr("stroke-width", 3);

        // write megawatts to left up corner of boundingbox
        boundingBox.append("text")
            .attr("x", 0) 
            .attr("y", -5) 
            .text("Megawatts"); 

        // draw y-axis using axisLeft() function
        const yAxisGenerator = d3.axisLeft()
            .scale(yScale)
        const yAxis = boundingBox.append("g").call(yAxisGenerator);
        
        // draw x-axis using axisBottom() function
        let tick_count;
        if (dimensions.boundedWidth >= 350) {
            tick_count = 10;
        }
        else if (dimensions.boundedWidth >= 300) {
            tick_count = 8;
        } 
        else if (dimensions.boundedWidth >= 250) {
            tick_count = 6;
        } 
        else {
            tick_count = 5;
        }

        const xAxisGenerator = d3.axisBottom()
            .scale(xScale)
            .ticks(tick_count);
        const xAxis = boundingBox
            .append("g")
            .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`);

        // draw a dashed line from y-axis value 0 to right, 
        // so it gets more clear when exportation and when importation
        boundingBox.append("line")
            .attr("x1", 0)
            .attr("y1", yScale(0))
            .attr("x2", dimensions.boundedWidth)
            .attr("y2", yScale(0))
            .style("stroke", "black")
            .style("stroke-dasharray", ("3, 3"));

        // add legend (explanatory box) for production to the left of svg
        let legend_x = 22;
        let legend_text_x = 10;
        let legend_production_y = 100;

        svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_production_y)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", leaf_green);

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_production_y - 25)
            .text("Electricity")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_production_y - 15)
            .text("production")
            .style("font-size", "10px");

            svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_production_y - 5)
            .text("in Finland")
            .style("font-size", "10px");

        // add legend (explanatory box) for consumption to the left of svg
        let legend_consumption_y = 170;

        svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_consumption_y)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", carmine_red);

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_consumption_y - 25)
            .text("Electricity")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_consumption_y - 15)
            .text("consumption")
            .style("font-size", "10px");

            svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_consumption_y - 5)
            .text("in Finland")
            .style("font-size", "10px");

        // add legend (explanatory box) for exportation to the left of svg
        let legend_exportation_y = 240;

        svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_exportation_y)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", ocean_blue);

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_exportation_y - 25)
            .text("Electricity")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_exportation_y - 15)
            .text("exportation")
            .style("font-size", "10px");

            svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_exportation_y - 5)
            .text("in Finland")
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

    }); // Promise ends
    
} // overview_graph ends


// --------------------------------------------------------------------------
// ---------------------------------------------------------------------------
function draw_new_renewability_graph() {
    starting_date = document.getElementById('starting-date-input').value;
    ending_date = document.getElementById('ending-date-input').value;
    list_of_api_ids = [id_elec_production, id_wind_power, id_hydro_power, id_solar_power];

    // fetch the data from fingrid.fi
    Promise.all(list_of_api_ids.map(fetchData)).then(function(datas) {
        // split and clean data
        // this case we want only dateclock and value for each data type
        // so we must parse the times of data to date objects
        const date_parser = d3.timeParse("%Y-%m-%dT%H:%M:%S+0000") 

        let elec_production_data = datas[0];
        let elec_windpower_data = datas[1];
        let elec_hydropower_data = datas[2];
        let elec_solarpower_data = datas[3];

        elec_production_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time);
            d.value = +d.value;
        });
        elec_windpower_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time);
            d.value = +d.value;
        });
        elec_hydropower_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time);
            d.value = +d.value;
        });
        elec_solarpower_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time);
            d.value = +d.value;
        });

        // because solarpower is one observation per hour
        // i will generate a new elec_solarpower_data2
        // that has 3 min distance between observation
        // so i divide value by 20 to make it match 3 min
        let elec_solarpower_data2 = [];

        elec_solarpower_data.forEach((d, i) => {
            if (i < elec_solarpower_data.length - 1) {
                for (let j = 0; j < 20; j++) {
                    let interpolatedTime = new Date(d.start_time.getTime() + j * 3 * 60 * 1000); // add three minutes
                    let interpolatedValue = d.value / 20;
                    elec_solarpower_data2.push({start_time: interpolatedTime, value: interpolatedValue});
                }
            }
        });

        // make sure datas look as they should after data cleaning
        console.log(elec_production_data);
        console.log(elec_windpower_data);
        console.log(elec_hydropower_data);
        console.log(elec_solarpower_data2);
        console.log(elec_solarpower_data);

        // access the html svg element to use it for drawing
        let original_svg_element = document.getElementById("electricity-visualization");
        let svg = d3.select("#electricity-visualization");

        // clear the svg so it is clean grey before drawing
        svg.selectAll("*").remove();
        svg.style("background-color", "#D5D5D5");

        // create dimensions for the graph
        let width = original_svg_element.clientWidth;
        let height = original_svg_element.clientHeight;

        let dimensions = {
            width: width,
            height: height,
            margins: {
            top: 25,
            right: 15,
            bottom: 40,
            left: 100,
            },
        }; 
        
        dimensions.boundedWidth =
            dimensions.width - dimensions.margins.left - dimensions.margins.right;
        dimensions.boundedHeight =
            dimensions.height - dimensions.margins.top - dimensions.margins.bottom;

        console.log("Leveys: " + dimensions.boundedHeight);
        console.log("Korkeus: " + dimensions.boundedWidth);

        // add to svg a boundingBox, so there is room for the x and y accessor
        const boundingBox = svg.append("g") // create a boundingBox using group element, later draw lines inside this box
        .style(
        "transform",
        `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`
        );

        // to scale data, we must find minimum and maximum values for both x and y
        let max_prod = d3.max(elec_production_data, d => d.value);
        let min_prod = d3.min(elec_production_data, d => d.value);
        let max_wind = d3.max(elec_windpower_data, d => d.value);
        let min_wind = d3.min(elec_windpower_data, d => d.value);
        let max_hydro = d3.max(elec_hydropower_data, d => d.value);
        let min_hydro = d3.min(elec_hydropower_data, d => d.value);
        let max_solar = d3.max(elec_solarpower_data2, d => d.value);
        let min_solar = d3.min(elec_solarpower_data2, d => d.value);

        let total_max = d3.max([max_prod, max_wind, max_hydro, max_solar]);
        let total_min = d3.min([min_prod, min_wind, min_hydro, min_solar]);

        console.log(max_prod);
        console.log(max_wind);
        console.log(max_hydro);
        console.log(max_solar);
        console.log(min_prod);
        console.log(min_wind);
        console.log(min_hydro);
        console.log(min_solar);
        console.log(total_max);
        console.log(total_min);

        // use solarpower_data2 as the origin of dates, because it has
        // a bit less dates compared to other data sets
        let min_date = d3.min(elec_solarpower_data2, d => d.start_time);
        let max_date = d3.max(elec_solarpower_data2, d => d.start_time);
        console.log(min_date);
        console.log(max_date);

        // functions to scale the x and y axis
        // because total_min was so close to zero, just use zero
        yScale = d3.scaleLinear()
            .domain([0, total_max])
            .range([dimensions.boundedHeight, 0]);

        xScale = d3.scaleTime()
            .domain([min_date, max_date])
            .range([0, dimensions.boundedWidth]);

        // function to scale the line_production of chart
        const line_generator_production = d3.line() // create a new d3 line generator
            .x((d) => xScale(d.start_time)) // define x coordinate of the line
            .y((d) => yScale(d.value)); // define y coordinate of the line

        // draw line_production
        const line_production = boundingBox.append("path") 
            .attr("d", line_generator_production(elec_production_data))
            .attr("fill", "none") 
            .attr("stroke", leaf_green)
            .attr("stroke-width", 3); 

        // function to scale line_windpower
        const line_generator_windpower = d3.line()
            .x((d) => xScale(d.start_time))
            .y((d) => yScale(d.value));

        // draw line_windpower
        const line_windpower = boundingBox.append("path")
            .attr("d", line_generator_windpower(elec_windpower_data))
            .attr("fill", "none")
            .attr("stroke", teal)
            .attr("stroke-width", 3);

        // function to scale line_hydropower
        const line_generator_hydropower = d3.line()
            .x((d) => xScale(d.start_time))
            .y((d) => yScale(d.value));

        // draw line_hydropower
        const line_hydropower = boundingBox.append("path")
            .attr("d", line_generator_hydropower(elec_hydropower_data))
            .attr("fill", "none")
            .attr("stroke", ocean_blue)
            .attr("stroke-width", 3);

        // function to scale line_solarpower
        const line_generator_solarpower = d3.line()
            .x((d) => xScale(d.start_time))
            .y((d) => yScale(d.value));

        // draw line_solarpower
        const line_solarpower = boundingBox.append("path")
            .attr("d", line_generator_solarpower(elec_solarpower_data))
            .attr("fill", "none")
            .attr("stroke", carmine_red)
            .attr("stroke-width", 3);

        // write megawatts to left up corner of boundingbox
        boundingBox.append("text")
            .attr("x", 0) 
            .attr("y", -5) 
            .text("Megawatts"); 

        // draw y-axis using axisLeft() function
        const yAxisGenerator = d3.axisLeft()
            .scale(yScale)
        const yAxis = boundingBox.append("g").call(yAxisGenerator);
        
        // draw x-axis using axisBottom() function
        let tick_count;
        if (dimensions.boundedWidth >= 350) {
            tick_count = 10;
        }
        else if (dimensions.boundedWidth >= 300) {
            tick_count = 8;
        } 
        else if (dimensions.boundedWidth >= 250) {
            tick_count = 6;
        } 
        else {
            tick_count = 5;
        }

        const xAxisGenerator = d3.axisBottom()
            .scale(xScale)
            .ticks(tick_count);
        const xAxis = boundingBox
            .append("g")
            .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`);

        // add legend (explanatory box) for production to the left of svg
        let legend_x = 22;
        let legend_text_x = 10;
        let legend_production_y = 100;

        svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_production_y)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", leaf_green);

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_production_y - 35)
            .text("Total")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_production_y - 25)
            .text("electricity")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_production_y - 15)
            .text("production")
            .style("font-size", "10px");

            svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_production_y - 5)
            .text("in Finland")
            .style("font-size", "10px");

        // add legend (explanatory box) for windpower production to the left side of the svg
        let legend_windpower_y = 170;

        svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_windpower_y)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", teal);

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_windpower_y - 25)
            .text("Windpower")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_windpower_y - 15)
            .text("production")
            .style("font-size", "10px");

            svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_windpower_y - 5)
            .text("in Finland")
            .style("font-size", "10px");

        // add legend (explanatory box) for hydropower production to the left side of the svg
        let legend_hydropower_y = 240;

        svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_hydropower_y)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", ocean_blue);

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_hydropower_y - 25)
            .text("Hydropower")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_hydropower_y - 15)
            .text("production")
            .style("font-size", "10px");

            svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_hydropower_y - 5)
            .text("in Finland")
            .style("font-size", "10px");

        // add legend (explanatory box) for solarpower production production to the left side of the svg
        let legend_solarpower_y = 310;

        svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_solarpower_y)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", carmine_red);

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_solarpower_y - 25)
            .text("Solarpower")
            .style("font-size", "10px");

        svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_solarpower_y - 15)
            .text("production")
            .style("font-size", "10px");

            svg.append("text")
            .attr("x", legend_text_x)
            .attr("y", legend_solarpower_y - 5)
            .text("in Finland")
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

    }); // Promise ends
} // renewability_graph ends

function main () {  
    document.getElementById("overview-button").addEventListener("click", draw_new_overview_graph);
    document.getElementById("renewability-button").addEventListener("click", draw_new_renewability_graph);
}

main();