/* * * * * * * * * * * * * * * *  *
*         StackedBarChart         *
* * * * * * * * * * * * * * * * * */

class StackedBar {
    constructor(parentElement, data, countryCodes, legendElement) {
        this.parentElement = parentElement;
        this.legendElement = legendElement;
        this.data = data;
        this.countryCodes = countryCodes;

        this.repeatColor = '#265073'
        this.newColor = '#ef476f'

        this.dataType = 'winner';

        this.tooltipColor = '#FD941C';

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 30, right: 60, bottom: 20, left: 90};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width - 80]);

        vis.y = d3.scaleBand()
            .range([0, vis.height - 55])
            .paddingInner(0.35)
            .domain(d3.range(0, 5));

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(5)
            .tickFormat(d3.format(".0s"));

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate("+ 40 + "," + (vis.height - 30) +")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Initialize the tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "largerTooltip")
            .attr('id', 'barTooltip');

        // Axis title
        vis.svg.append("text")
            .attr("class", "stackedBarAxisLabel")
            .attr("x", (vis.width - 40)/2)
            .attr("y", vis.height - 2)
            .text("Number of Runners");

        // Create color legend
        vis.legendMargin = {top: 0, right: 0, bottom: 0, left: 0};
        vis.legendWidth = document.getElementById(vis.legendElement).getBoundingClientRect().width - vis.legendMargin.left - vis.legendMargin.right;
        vis.legendHeight = document.getElementById(vis.legendElement).getBoundingClientRect().height - vis.legendMargin.top - vis.legendMargin.bottom;


        vis.legendSvg = d3.select("#" + vis.legendElement).append("svg")
            .attr("width", vis.legendWidth)
            .attr("height", vis.legendHeight)
            .attr('transform', `translate (${vis.legendMargin.left}, ${vis.legendMargin.top})`);

        vis.legendSvg.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", this.repeatColor)
            .attr("x", 0)
            .attr("y", vis.legendHeight/2);

        vis.legendSvg.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", this.newColor)
            .attr("x", vis.legendWidth/2)
            .attr("y", vis.legendHeight/2);

        vis.legendSvg.append("text")
            .attr("x", 20)
            .attr("y", vis.legendHeight/2 + 10)
            .attr("class", "stackedBarLegendLabel")
            .style("text-anchor", "start")
            .text("Repeat Finishers");

        vis.legendSvg.append("text")
            .attr("x", vis.legendWidth/2 + 20)
            .attr("y", vis.legendHeight/2 + 10)
            .attr("class", "stackedBarLegendLabel")
            .style("text-anchor", "start")
            .text("One-Off Finishers");


        vis.wrangleData();
    }

    wrangleData () {
        let vis = this;

        let tempData = [];

        if (vis.dataType === 'winner') {
            let sortedTop3 = vis.data.sort(function (a, b) {
                return a.Seconds - b.Seconds;
            });

            // Group the data based on marathon, year, and gender
            let groupedTop3 = d3.group(sortedTop3, d => d.Marathon, d => d.Year, d => d.Gender);

            groupedTop3.forEach((marathonMap, marathon) => {
                marathonMap.forEach((yearMap, year) => {
                    yearMap.forEach((genderArray, gender) => {
                        tempData = tempData.concat(genderArray.slice(0, 1));
                    });
                });
            });
        }
        else {
            tempData = vis.data;
        }

        let groupedData = d3.group(tempData, d => d.Country);

        const entriesArray = Array.from(groupedData, ([key, array]) => ({ key, array }));

        // Select only the countries with the most relevant finishes
        const topCountries = entriesArray
            .filter(entry => entry.key !== '' && Array.isArray(entry.array))
            .sort((a, b) => b.array.length - a.array.length)
            .slice(0, 5);

        let nameCountryData = [];
        let repeatCountryData = [];

        // Group repeat wins by an athlete and count repeat vs non-repeat wins
        topCountries.forEach((countryArray) => {

            let knownNames = [];
            let nameCount = [];

            let repeatWins = 0;
            let newWins = 0;
            let totalWins = 0;

            countryArray.array.forEach(d => {
                let forwardName = d['First Name'] + " " + d['Last Name'];
                let backwardName = d['Last Name'] + " " + d['First Name'];
                if (knownNames.includes(forwardName) || knownNames.includes(backwardName)) {
                    let index = knownNames.indexOf(forwardName);
                    nameCount[index] += 1;
                    repeatWins += 1;
                    totalWins += 1;
                }
                else {
                    knownNames.push(forwardName);
                    nameCount.push(1);
                    newWins += 1;
                    totalWins += 1;
                }
            })
            let nameMap = knownNames.map((name, index) => ({ name, wins: nameCount[index] }));
            let repeatMap = {repeat: repeatWins, new: newWins, total: totalWins};

            nameCountryData[countryArray.key] = nameMap;
            repeatCountryData[countryArray.key] = repeatMap;
        })

        // vis.displayData = repeatCountryData;
        vis.displayData = Object.entries(repeatCountryData).map(([key, value]) => ({ key, ...value }));
        vis.individualData = nameCountryData;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // console.log(vis.displayData)

        // Update domains
        vis.x.domain([0, d3.max(Object.values(vis.displayData), d => d.total)]);
        vis.y.domain(vis.displayData.map(d => d.key)); // Update the domain based on keys

        // Draw repeat win bars
        let repeatBars = vis.svg.selectAll(".repeatBar")
            .data(vis.displayData);

        repeatBars.enter().append("rect")
            .attr("class", "repeatBar")
            .merge(repeatBars)
            .on('mouseover', function(event, d){

                d3.select(this)
                    .style('fill', vis.tooltipColor);

                vis.tooltip
                    .style("opacity", 0.9)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(obj => {
                        if (vis.dataType === "winner") {
                            return `
                            <div>
                                 <h4><b>${vis.countryCodes.find(obj => obj.iso3 === d.key).name}</b><h3>
                                 <h5>Total Winners: ${d.total}</h5>
                                 <h5>Repeat Winners: ${d.repeat} (${Math.round(d.repeat / d.total * 100)}%)</h5>
                                 <h5>One-Off Winners: ${d.new} (${Math.round(d.new / d.total * 100)}%) </h5>                            
                             </div>`
                        }
                        else {
                            return `
                            <div>
                                 <h4><b>${vis.countryCodes.find(obj => obj.iso3 === d.key).name}</b></h4>
                                 <h5>Total Finishers: ${d.total}</h5>
                                 <h5>Repeat Finishers: ${d.repeat} (${Math.round(d.repeat / d.total * 100)}%)</h5>
                                 <h5>One-Off Finishers: ${d.new} (${Math.round(d.new / d.total * 100)}%)</h5>                             
                             </div>`
                        }
                    });
            })
            .on('mouseout', function(event, d){

                d3.select(this)
                    .style('fill', vis.repeatColor);

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

            .transition()
            .duration(800)
            .attr("height", vis.y.bandwidth())
            .attr("width", function (d) {
                return vis.x(d.repeat);
            })
            .attr("y", function (d) {
                return vis.y(d.key) + 20;
            })
            .attr("x", function (d) {
                return 40;
            })
            .style('fill', vis.repeatColor);

        repeatBars.exit().remove();

        // Draw new win bars
        let newBars = vis.svg.selectAll(".newBar")
            .data(vis.displayData);

        newBars.enter().append("rect")
            .attr("class", "newBar")
            .merge(newBars)
            .on('mouseover', function(event, d){

                d3.select(this)
                    .style('fill', vis.tooltipColor);

                vis.tooltip
                    .style("opacity", 0.9)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(obj => {
                        if (vis.dataType === "winner") {
                            return `
                            <div>
                                 <h4><b>${vis.countryCodes.find(obj => obj.iso3 === d.key).name}</b><h3>
                                 <h5>Total Winners: ${d.total}</h5>
                                 <h5>Repeat Winners: ${d.repeat} (${Math.round(d.repeat / d.total * 100)}%)</h5>
                                 <h5>One-Off Winners: ${d.new} (${Math.round(d.new / d.total * 100)}%) </h5>                            
                             </div>`
                        }
                        else {
                            return `
                            <div>
                                 <h4><b>${vis.countryCodes.find(obj => obj.iso3 === d.key).name}</b></h4>
                                 <h5>Total Finishers: ${d.total}</h5>
                                 <h5>Repeat Finishers: ${d.repeat} (${Math.round(d.repeat / d.total * 100)}%)</h5>
                                 <h5>One-Off Finishers: ${d.new} (${Math.round(d.new / d.total * 100)}%)</h5>                             
                             </div>`
                        }
                    });
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('fill', vis.newColor);

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(800)
            .attr("height", vis.y.bandwidth())
            .attr("width", function (d) {
                return vis.x(d.new);
            })
            .attr("y", function (d) {
                return vis.y(d.key) + 20;
            })
            .attr("x", function (d) {
                return vis.x(d.repeat) + 40;
            })
            .style('fill', vis.newColor);

        newBars.exit().remove();

        // Draw the axes
        vis.svg.select(".x-axis")
            .transition()
            .duration(800)
            .call(vis.xAxis);

        // vis.svg.select(".y-axis")
        //     .call(vis.yAxis);

        // Create bar labels
        const labels = vis.svg.selectAll(".bar-label")
            .data(vis.displayData);

        labels.enter()
            .append("text")
            .attr("class", "bar-label")
            .merge(labels)
            .transition()
            .duration(800)
            .attr("x", 40)
            .attr("y", d => vis.y(d.key) + 15)
            .text(d => {
                // Return full country name
                return vis.countryCodes.find(obj => obj.iso3 === d.key).name;
            });

        labels.exit().remove();

        // Create left bar percent label
        const leftLabels = vis.svg.selectAll(".left-percent-label")
            .data(vis.displayData, d => d.key);

        leftLabels.enter()
            .append("text")
            .attr("class", "left-percent-label")
            .style("text-anchor", "end")
            // .style("fill", "white")
            // .style("font-size", "10px")
            .merge(leftLabels)
            // .on('mouseover', function(event, d){
            //     vis.tooltip
            //         .style("opacity", 1)
            //         .style("left", event.pageX + 20 + "px")
            //         .style("top", event.pageY + "px")
            //         .html(`
            //                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
            //                      <h3>${d.key}<h3>
            //                      <h4>Total Finishes: ${d.total}</h4>
            //                      <h4>Repeat Finishes: ${d.repeat} (${Math.round(d.repeat / d.total * 100)}%) </h4>
            //                      <h4>Individual Finishes: ${d.new} (${Math.round(d.new / d.total * 100)}%)  </h4>
            //                  </div>`);
            // })
            // .on('mouseout', function(event, d){
            //     vis.tooltip
            //         .style("opacity", 0)
            //         .style("left", 0)
            //         .style("top", 0)
            //         .html(``);
            // })
            .transition()
            .duration(800)
            .attr("x", 38)
            .attr("y", d => vis.y(d.key) + vis.y.bandwidth() / 2 + 23)
            .text(d => {
                if (d.repeat > 0) {
                    return Math.round(d.repeat / d.total * 100) + "%";
                }
                else {
                    return "";
                }
            });

        leftLabels.exit().remove();

        // Create right bar percent label
        const rightLabels = vis.svg.selectAll(".right-percent-label")
            .data(vis.displayData, d => d.key);

        rightLabels.enter()
            .append("text")
            .attr("class", "right-percent-label")
            // .style("fill", "white")
            .style("text-anchor", "start")
            // .style("font-size", "10px")
            .merge(rightLabels)
            // .on('mouseover', function(event, d){
            //     vis.tooltip
            //         .style("opacity", 1)
            //         .style("left", event.pageX + 20 + "px")
            //         .style("top", event.pageY + "px")
            //         .html(`
            //                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
            //                      <h3>${d.key}<h3>
            //                      <h4>Total Finishes: ${d.total}</h4>
            //                      <h4>Repeat Finishes: ${d.repeat} (${Math.round(d.repeat / d.total * 100)}%) </h4>
            //                      <h4>Individual Finishes: ${d.new} (${Math.round(d.new / d.total * 100)}%)  </h4>
            //                  </div>`);
            // })
            // .on('mouseout', function(event, d){
            //     vis.tooltip
            //         .style("opacity", 0)
            //         .style("left", 0)
            //         .style("top", 0)
            //         .html(``);
            // })
            .transition()
            .duration(800)
            .attr("x", d => vis.x(d.total) + 46)
            .attr("y", d => vis.y(d.key) + vis.y.bandwidth() / 2 + 23)
            .text(d => {
                if (d.new > 0) {
                    return Math.round(d.new / d.total * 100) + "%";
                }
                else {
                    return "";
                }
            });

        rightLabels.exit().remove();
    }
}