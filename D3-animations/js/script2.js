async function createEvent() {
  const rectColors = ["yellow", "green", "blue", "red"];
  const rects = d3
    .select("#svg")
    .selectAll("rect")
    .data(rectColors)
    .enter()
    .append("rect")
    .attr("height", 100)
    .attr("width", 100)
    .attr("x", (d, i) => i * 110)
    .attr("fill", "lightgrey");

  rects.on("mouseenter", (event, d) => {
    d3.select(event.currentTarget).style("fill", d);
  });

  rects.on("mouseleave", (event, d) => {
    d3.select(event.currentTarget).style("fill", "lightgrey");
  });
}

createEvent();
