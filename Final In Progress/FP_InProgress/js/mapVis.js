/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, bostonData, allData, geoData, dataType, marathonType, countryCodes) {
        this.parentElement = parentElement;
        this.allData = allData;
        this.bostonData = bostonData;
        this.geoData = geoData;
        this.dataType = dataType;
        this.marathonType = marathonType;
        this.countryCodes = countryCodes;

        this.minYear = 2014;
        this.maxYear = 2023;
        this.marathon = 'all';

        this.minColor = '#d0daf6';
        this.maxColor = '#162f77';

        this.marathonArray = ['Boston', 'Chicago', 'London', 'New York'];
        // this.marathonArray = ['Boston', 'Berlin', 'Chicago', 'London', 'New York'];
        this.genderArray = ['male', 'female'];

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        let scaleFactor = Math.min(vis.height / 610, vis.width / 965);

        // Create projection
        vis.projection = d3.geoEquirectangular()
            // .translate([vis.width / 2, vis.height / 2])
            .translate([vis.width / 2, vis.height / 2])
            .scale(scaleFactor * 150);

        // Define geo generator and pass in projection
        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.countries = vis.svg.selectAll("path")
            .data(vis.geoData.features)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .style('stroke', 'black');

        // Handle legend
        vis.legendHeight = 20;
        vis.legendWidth = 200;

        // Create continuous color scale gradient for legend
        vis.gradient = vis.svg.append("defs")
            .append("linearGradient")
            .attr("id", "color-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        // Create a svg rectangle to display gradient
        vis.gradientRect = vis.svg.append("rect")
            .attr("width", vis.legendWidth)
            .attr("height", vis.legendHeight)
            .style("fill", "url(#color-gradient)")
            .attr("x", 10);

        // Update the color bar gradient
        vis.gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", vis.minColor);

        vis.gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", vis.maxColor);

        // Initialize color scale
        vis.colorScale = d3.scaleLinear();

        // Create a scale for the legend axis
        vis.legendScale = d3.scaleLinear()
            .range([0, vis.legendWidth]);

        // Initialize the legend axis
        vis.legendAxis = d3.axisBottom()
            .scale(vis.legendScale);

        vis.svg.append("g")
            .attr("class", "legend-axis axis")
            .attr("transform", "translate(" + (10) + "," + (vis.legendHeight) + ")");

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "largeTooltip")
            .attr('id', 'mapTooltip')


        vis.wrangleData()
    }


    wrangleData() {
        let vis = this;

        if (vis.marathonType === 'all') {
            vis.hundredData = vis.allMarathonData;
        }
        else {
            vis.hundredData = vis.bostonData;
        }


        vis.displayData = [];

        // Set the number of data points to be included based on what user has selected
        let cutoff = 1;

        if (vis.dataType === 'winner') {
            cutoff = 1;
        }
        else if (vis.dataType === 'topThree') {
            cutoff = 3;
        }
        else if (vis.dataType === 'topHundred') {
            cutoff = 100;
        }
        else if (vis.marathonType === 'all') {
            cutoff = 100;
        }
        else {
            cutoff = 'all';
        }

        let combinedData = [];

        if (vis.marathonType === 'all') {

            // Create array of active years
            var years = [];
            for (var i = 0; i <= vis.maxYear - vis.minYear; i++) {
                years.push(i + vis.minYear);
            }

            // Get the correct keys
            let relevantKeys = [];
            years.forEach(year => {
                vis.marathonArray.forEach(marathon => {
                    vis.genderArray.forEach(gender => {
                        relevantKeys.push(gender + ' '  + marathon + ' ' + year + ' ' + cutoff);
                    })
                })
            })


            // Sum over each year and marathon
            vis.displayData = vis.allData.reduce((acc, current) => {
                let sum = relevantKeys.reduce((keySum, key) => keySum + +current[key], 0);

                acc[current.Country] = sum;
                return acc;
            }, {});
        }

        else if (vis.marathonType === 'boston') {

            let relevantKeys = [];
            vis.genderArray.forEach(gender => {
                relevantKeys.push(gender + ' ' + cutoff);
            })
            console.log(relevantKeys)

            // Sum over each year and marathon
            vis.displayData = vis.bostonData.reduce((acc, current) => {
                let sum = relevantKeys.reduce((keySum, key) => keySum + +current[key], 0);

                acc[current.Country] = sum;
                return acc;
            }, {});

            console.log(vis.displayData)
            // vis.displayData = vis.bostonData.reduce((acc, obj) => {
            //     acc[obj.Country] = +obj['male ' + cutoff] + +obj['female ' + cutoff];
            //     return acc;
            // }, {});
        };

        vis.updateVis()
    }
//
    updateVis() {
        let vis = this;

        console.log(vis.displayData)
        // console.log('here')

        console.log(vis.countryCodes)

        // Update color scale
        vis.colorScale
            .range([vis.minColor, vis.maxColor])
            .domain([0, d3.max(Object.values(vis.displayData))]);

        // Update legend scale domain
        vis.legendScale.domain([0, d3.max(Object.values(vis.displayData))]);

        // Update the legend axis ticks
        let totalTicks = 2;
        if (d3.max(Object.values(vis.displayData)) < totalTicks) {
            totalTicks = d3.max(Object.values(vis.displayData));
        }

        vis.legendAxis
            .tickValues([vis.legendScale.domain()[0], vis.legendScale.domain()[1]]);

        // Display the axis
        vis.svg.select(".legend-axis")
            .transition()
            .duration(800)
            .call(vis.legendAxis);

        // Update the color gradient for the legend
        d3.select('#color-gradient').selectAll("stop")
            .data([vis.minColor, vis.maxColor])
            .attr("style", function (d, i) {
                return "stop-color:" + d;
            });

        // Update the colors
        vis.countries
            // Update states color based on number of winners
            .attr("fill", d => {
                // let match = vis.displayData.find(obj => obj === d.properties.ISO_A3);
                let match = vis.displayData[d.properties.ISO_A3];
                if (match) {
                    return vis.colorScale(match);
                }
                // Handle case where there is not data
                else {
                    return "lightgrey";
                }
            })

            //// Tooltip ////

            // Handle mouseover
            .on('mouseover', function(event, d){
                let match = vis.displayData[d.properties.ISO_A3];

                // Handle case where there is no data
                if (isNaN(match)) {
                    match = 0;
                }

                // Get plaintext name
                let countryName = vis.countryCodes.find(obj => obj.iso3 === d.properties.ISO_A3).name;

                d3.select(this)
                    .classed('highlighted', true); // Change color/other features for higlighting

                // // This is done here to handle grammar case for 1 finisher
                // let finisherText = '';
                //
                // if (match === 1) {
                //     finisherText = d3.format(',')(match) +  ' Finisher';
                // }
                // else {
                //     finisherText = d3.format(',')(match) +  ' Finishers';
                // }


                // Format and style the tooltip itself
                vis.tooltip
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`<div>
                                <h4>${countryName}</h4>
                                Finishers: ${d3.format(',')(match)}
                            </div>`
                    )
                    .style("opacity", .9);
            })

            // Handle mouseout
            .on('mouseout', function(event, d){
                d3.select(this)
                    .classed('highlighted', false); // Change color back to original

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

    }
}