/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, hundredData, geoData, dataType) {
        this.parentElement = parentElement;
        this.hundredData = hundredData;
        this.geoData = geoData;
        this.dataType = dataType;

        this.minYear = 2014;
        this.maxYear = 2023;
        this.marathon = 'all';

        this.minColor = 'lightblue';
        this.maxColor = 'blue';

        console.log(hundredData)

        // define colors
        // this.colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b']

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
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
            .translate([vis.width / 2, vis.height / 2])
            .scale(scaleFactor * 150);

        // Define geo generator and pass in projection
        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.countries = vis.svg.selectAll("path")
            .data(vis.geoData.features)
            .enter().append("path")
            .attr("d", vis.path)
            .style('stroke', 'black');

        vis.colorScale = d3.scaleLinear()
            .range([vis.minColor, vis.maxColor]);

        // Handle legend
        vis.legendHeight = 20;
        vis.legendWidth = 200;

        // Create continuous color scale gradient for legend
        const gradient = vis.svg.append("defs")
            .append("linearGradient")
            .attr("id", "color-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", vis.minColor);

        gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", vis.maxColor);

        // Create a svg rectangle to display gradient
        vis.svg.append("rect")
            .attr("width", vis.legendWidth)
            .attr("height", vis.legendHeight)
            .style("fill", "url(#color-gradient)")
            .attr("x", 10);

        // Create a scale for the legend axis
        vis.legendScale = d3.scaleLinear()
            .range([0, vis.legendWidth]);

        // Initialize the legend axis
        vis.legendAxis = d3.axisBottom()
            .scale(vis.legendScale)
            .ticks(5)
            .tickFormat(d3.format(".0s"));

        vis.svg.append("g")
            .attr("class", "legend-axis axis")
            .attr("transform", "translate(" + (10) + "," + (vis.legendHeight) + ")");

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')

        vis.wrangleData()
    }


    wrangleData() {
        let vis = this;

        vis.displayData = [];

        // Set the number of data points to be included based on what user has selected
        let cutoff = 1;

        if (vis.dataType === 'winner') {
            cutoff = 1;
        }
        else if (vis.dataType === 'topThree') {
            cutoff = 3;
        }
        else {
            cutoff = 100;
        }


        // Sort the data in ascending order
        let sortedData = vis.hundredData.sort(function(a, b) {
            return a.Seconds - b.Seconds;
        });

        // Group the data based on marathon, year, and gender
        let groupedData = d3.group(sortedData, d => d.Marathon, d => d.Year, d => d.Gender);

        // Select the top cutoff athletes from each subgroup
        let topAthletes = new Map();

        groupedData.forEach((marathonMap, marathon) => {
            topAthletes.set(marathon, new Map());

            marathonMap.forEach((yearMap, year) => {
                topAthletes.get(marathon).set(year, new Map());

                yearMap.forEach((genderArray, gender) => {

                    topAthletes.get(marathon).get(year).set(gender, genderArray.slice(0, cutoff));
                });
            });
        });

        let countryCountArray = [];

        // Iterate through the nested maps
        topAthletes.forEach((marathonMap, marathon) => {
            marathonMap.forEach((yearMap, year) => {
                yearMap.forEach((genderArray, gender) => {
                    // Count occurrences of each 'Country' value
                    genderArray.forEach(athlete => {
                        const country = athlete.Country;

                        // Find the index of the 'Country' in the array
                        const countryIndex = countryCountArray.findIndex(obj => obj.country === country);

                        if (countryIndex === -1) {
                            // If the 'Country' is not in the array, add a new object with counts for all marathons
                            const newCountryEntry = {
                                country: country,
                                total: 1
                            };

                            topAthletes.forEach((_, marathon) => {
                                newCountryEntry[marathon] = 0; // Set the default count to 0
                            });

                            newCountryEntry[marathon] = 1; // Update the count for the specific marathon

                            countryCountArray.push(newCountryEntry);
                        } else {
                            // If the 'Country' is in the array, update the counts
                            countryCountArray[countryIndex].total += 1;

                            if (!countryCountArray[countryIndex].hasOwnProperty(marathon)) {
                                countryCountArray[countryIndex][marathon] = 1;
                            } else {
                                countryCountArray[countryIndex][marathon] += 1;
                            }
                        }
                    });
                });
            });
        });



        vis.displayData = countryCountArray;

        console.log(vis.displayData);

        vis.updateVis()
    }
//
    updateVis() {
        let vis = this;

        vis.colorScale.domain([0, d3.max(vis.displayData, d => d.total)]);
        vis.legendScale.domain([0, d3.max(vis.displayData, d => d.total)]);

        // Display the axis
        vis.svg.select(".legend-axis")
            .transition()
            .duration(800)
            .call(vis.legendAxis);

        vis.countries
            // Update states color based on number of winners
            .attr("fill", d => {
                let match = vis.displayData.find(obj => obj.country === d.properties.ISO_A3);
                if (match) {
                    return vis.colorScale(match.total);
                }
                // Handle case where there is not data
                else {
                    return "lightgrey";
                }
            })

    }
}