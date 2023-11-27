console.log('popularityVis.js is loaded');

class PopularityVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredDataF = []; // Initialize as empty arrays
        this.filteredDataM = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 150, bottom: 20, left: 40 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // create svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // define scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // define axes
        vis.xAxis = d3.axisBottom(vis.x);
        vis.yAxis = d3.axisLeft(vis.y);

        // define line generator
        vis.line = d3.line()
            .x(function(d) { return vis.x(d.year); })
            .y(function(d) { return vis.y(d.count); });

        // initialize axes
        vis.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y axis");

        // wrangle data
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.data.forEach(d => {
            d.year = new Date(+d.year, 0, 1); // assuming 'year' is in YYYY format
            d.count = +d.count;
        });

        // Group data by year and gender and sum the counts
        vis.dataByYearGender = Array.from(d3.group(vis.data, d => d.year, d => d.gender), ([year, genderData]) => ({
            year: year,
            values: Array.from(genderData, ([gender, leaves]) => ({
                gender: gender,
                value: d3.sum(leaves, d => d.count)
            }))
        }));

        vis.dataF = [];
        vis.dataM = [];

        vis.dataByYearGender.forEach(d => {
            let year = d.year;
            d.values.forEach(genderData => {
                if (genderData.gender === 'F') {
                    vis.dataF.push({ year: new Date(year), count: genderData.value });
                } else if (genderData.gender === 'M') {
                    vis.dataM.push({ year: new Date(year), count: genderData.value });
                }
            });
        });

        vis.dataF.sort((a, b) => d3.ascending(a.year, b.year));
        vis.dataM.sort((a, b) => d3.ascending(a.year, b.year));

        vis.x.domain(d3.extent([...vis.dataF, ...vis.dataM], d => d.year));
        vis.y.domain([0, d3.max([...vis.dataF, ...vis.dataM], d => d.count)]);

        // call updateVis
        vis.updateVis();
    }

    filterByYearRange(startYear, endYear) {
        let vis = this;

        // Initialize filtered data arrays if they don't exist
        vis.filteredDataF = vis.dataF.filter(d => d.year.getFullYear() >= startYear && d.year.getFullYear() <= endYear);
        vis.filteredDataM = vis.dataM.filter(d => d.year.getFullYear() >= startYear && d.year.getFullYear() <= endYear);

        // Check if the arrays are not empty to avoid errors in the domain setting
        if (vis.filteredDataF.length > 0 && vis.filteredDataM.length > 0) {
            vis.x.domain([new Date(startYear, 0, 1), new Date(endYear, 0, 1)]);
            vis.y.domain([0, d3.max([...vis.filteredDataF, ...vis.filteredDataM], d => d.count)]);
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Define the x and y domains based on the filtered data
        vis.x.domain(d3.extent([...vis.filteredDataF, ...vis.filteredDataM], d => d.year));
        vis.y.domain([0, d3.max([...vis.filteredDataF, ...vis.filteredDataM], d => d.count)]);

        // Adjust x-axis ticks for small range of years
        if (vis.endYear - vis.startYear <= 20 && vis.startYear < 1930) {
            vis.xAxis.ticks(d3.timeYear.every(1));
        } else {
            vis.xAxis.ticks(d3.timeYear.every(10));
        }

        // Adjust y-axis ticks to fit the scale of the data
        let yMax = vis.y.domain()[1];
        let yTickValues;
        if (yMax <= 100) {
            // If the max count is very low, use a step size of 20
            yTickValues = d3.range(0, yMax + 10, 10);
        } else if (yMax <= 500) {
            // If the max count is low, use a step size of 100
            yTickValues = d3.range(0, yMax + 100, 100);
        } else if (yMax <= 5000) {
            // If the max count is between 500 and 5000, use a step size of 500
            yTickValues = d3.range(0, yMax + 500, 500);
        } else {
            // For larger counts, use a step size of 2000
            yTickValues = d3.range(0, Math.ceil(yMax / 2000) * 2000, 2000);
        }

        vis.yAxis.tickValues(yTickValues).tickFormat(d3.format(".0f"));

        // Update the axes with transitions
        vis.svg.select(".x.axis").transition().duration(1000).call(vis.xAxis);
        vis.svg.select(".y.axis").transition().duration(1000).call(vis.yAxis.tickFormat(d3.format("~s")));

        let legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (vis.width + 20) + ",20)");

        legend.append("rect")
            .attr("class", "legend-color")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "#92bae8"); // Color of the Male line

        legend.append("text")
            .attr("class", "legend-label")
            .attr("x", 20)
            .attr("y", 10)
            .text("Male");

        legend.append("rect")
            .attr("class", "legend-color")
            .attr("x", 0)
            .attr("y", 30)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "#6e4366"); // Color of the Female line

        legend.append("text")
            .attr("class", "legend-label")
            .attr("x", 20)
            .attr("y", 40)
            .text("Female");

        // Data join for the lines
        vis.lineF = vis.svg.selectAll(".line-f").data([vis.filteredDataF]);
        vis.lineM = vis.svg.selectAll(".line-m").data([vis.filteredDataM]);

        vis.lineF.enter().append("path")
            .attr("class", "line line-f")
            .merge(vis.lineF)
            .transition()
            .attr("d", vis.line)
            .style("stroke", "#8b5581")
            .style("fill", "none");

        vis.lineM.enter().append("path")
            .attr("class", "line line-m")
            .merge(vis.lineM)
            .transition()
            .attr("d", vis.line)
            .style("stroke", "#92bae8")
            .style("fill", "none");

        // Exit for lines
        vis.lineF.exit().remove();
        vis.lineM.exit().remove();

        // Data join for the dots
        let dotsF = vis.svg.selectAll(".dot-f").data(vis.filteredDataF, d => d.year);
        let dotsM = vis.svg.selectAll(".dot-m").data(vis.filteredDataM, d => d.year);

        // Enter + update for dots with proper transition
        dotsF.enter().append("circle")
            .attr("class", "dot dot-f")
            .merge(dotsF)
            .transition()
            .attr("cx", d => vis.x(d.year))
            .attr("cy", d => vis.y(d.count))
            .attr("r", 3)
            .style("fill", "#6e4366");

        dotsM.enter().append("circle")
            .attr("class", "dot dot-m")
            .merge(dotsM)
            .transition()
            .attr("cx", d => vis.x(d.year))
            .attr("cy", d => vis.y(d.count))
            .attr("r", 3)
            .style("fill", "#2970c2");

        // Exit for dots
        dotsF.exit().remove();
        dotsM.exit().remove();

        vis.svg.selectAll(".dot")
            .on("mouseover", (event, d) => {
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                vis.tooltip.html(`Year: ${d.year.getFullYear()}<br/>Count: ${d.count}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }
}