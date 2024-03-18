
// bring information about starting and ending date from UI
// if ending_date is today, remove 15 minutes from ending_clcok and use that as end of today
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

// this list stores api_id's of fingrid and allows to load data
let list_of_api_ids = [];

const id_elec_production = "192";
const id_elec_consumption = "193";
const id_elec_import = "194";

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

// if overview button was pressed, we use this function to draw the linegraph
function draw_new_overview_graph() {
    starting_date = document.getElementById('starting-date-input').value;
    ending_date = document.getElementById('ending-date-input').value;
    list_of_api_ids = [id_elec_production, id_elec_consumption, id_elec_import];

    Promise.all(list_of_api_ids.map(fetchData)).then(function(datas) {

        // split data, so it has no more useless information
        // this case we want only dateclock and value for each data type
        // so we must parse the times of data to date objects
        const date_parser = d3.timeParse("%Y-%m-%dT%H:%M:%S+0000") 

        let elec_production_data = datas[0];
        let elec_consumption_data = datas[1];
        let elec_import_data = datas[2]; // value > 0 = export, value < 0 import

        elec_production_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time)
        });
        elec_consumption_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time)
        });
        elec_import_data.forEach(function(d) {
            delete d.end_time;
            d.start_time = date_parser(d.start_time)
        });

        console.log(elec_production_data);
        console.log(elec_consumption_data);
        console.log(elec_import_data);

        // access the html svg element to use it for drawing
        let svg = document.getElementById("electricity-visualization");
        let width = svg.clientWidth;
        let height = svg.clientHeight;

        // create dimensions for the graph
        let dimensions = {
            width: width,
            height: height,
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

        console.log("Leveys: " + dimensions.boundedHeight);
        console.log("Korkeus: " + dimensions.boundedWidth);


    }); // Promise ends
    
} // draw_new_overview_graph ends

// if renewability button was pressed, we use this function to draw the linegraph
function draw_new_renewability_graph() {
    starting_date = document.getElementById('starting-date-input').value;
    ending_date = document.getElementById('ending-date-input').value;
    list_of_api_ids = [id_elec_production, id_wind_power, id_hydro_power, id_solar_power];

    Promise.all(list_of_api_ids.map(fetchData)).then(function(datas) {
        console.log(datas);
    });
}



async function draw_linechart(datas) {
    // Data has been already read, 
    const dateParser = d3.timeParse("%Y-%m-%dT%H:%M:%S+0000")
      // create timeParser function using d3.timeParse, so u can change the str variable into date variable
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



function main () {  
    document.getElementById("overview-button").addEventListener("click", draw_new_overview_graph);
    document.getElementById("renewability-button").addEventListener("click", draw_new_renewability_graph);
    histogram_is_overview = false;
}

main();