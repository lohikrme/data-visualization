
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
let leaf_green = "#5ca904";
let carmine_red = "#D70040";
let ocean_blue = "#4f42b5";

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

        // draw production line
        const line_production = boundingBox.append("path") 
            .attr("d", line_generator_production(elec_production_data))
            .attr("fill", "none") 
            .attr("stroke", leaf_green)
            .attr("stroke-width", 2); 

        // function to scale consumption line
        const line_generator_consumption = d3.line()
            .x((d) => xScale(d.start_time))
            .y((d) => yScale(d.value));

        // draw consumption line
        const line_consumption = boundingBox.append("path")
            .attr("d", line_generator_consumption(elec_consumption_data))
            .attr("fill", "none")
            .attr("stroke", carmine_red)
            .attr("stroke-width", 2);

        // function to scale exportation line
        const line_generator_exportation = d3.line()
            .x((d) => xScale(d.start_time))
            .y((d) => yScale(d.value));

        const line_exportation = boundingBox.append("path")
            .attr("d", line_generator_exportation(elec_exportation_data))
            .attr("fill", "none")
            .attr("stroke", ocean_blue)
            .attr("stroke-width", 2);

        // draw the x and y axis and their description texts

        boundingBox.append("text")
            .attr("x", 0) 
            .attr("y", -5) 
            .text("Megawatts"); 

        const yAxisGenerator = d3.axisLeft()
            .scale(yScale)
        
        const yAxis = boundingBox.append("g").call(yAxisGenerator);
        
        const xAxisGenerator = d3.axisBottom().scale(xScale);
        const xAxis = boundingBox
            .append("g")
            .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`);

    }); // Promise ends
    
} // draw_new_overview_graph ends




// --------------------------------------------------------------------------
// ---------------------------------------------------------------------------
function draw_new_renewability_graph() {
    starting_date = document.getElementById('starting-date-input').value;
    ending_date = document.getElementById('ending-date-input').value;
    list_of_api_ids = [id_elec_production, id_wind_power, id_hydro_power, id_solar_power];

    Promise.all(list_of_api_ids.map(fetchData)).then(function(datas) {
        console.log(datas);
    });
}

function main () {  
    // svg.style("background-color", "#D5D5D5");
    document.getElementById("overview-button").addEventListener("click", draw_new_overview_graph);
    document.getElementById("renewability-button").addEventListener("click", draw_new_renewability_graph);
}

main();