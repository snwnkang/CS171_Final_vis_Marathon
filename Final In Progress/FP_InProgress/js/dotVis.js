/* * * * * * * * * * * * * *
*          DotVis          *
* * * * * * * * * * * * * */

class DotVis {

    constructor(parentElement, combinedTopData, bostonFullData) {

        this.parentElement = parentElement;
        this.combinedTopData = combinedTopData;
        this.bostonFullData = bostonFullData;
        this.displayData = [];

        // Function to find lowest and highest values of a particular column
        function findMinMax(dataset, columnName) {
            return dataset.reduce((acc, data) => {
                const value = data[columnName];
                acc.min = Math.min(acc.min, value);
                acc.max = Math.max(acc.max, value);
                return acc;
            }, { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY });
        }

        // Usage: Find lowest and highest values of the 'value' column
        const column = 'Seconds';
        const { min, max } = findMinMax(combinedTopData, column);

        console.log(`Lowest ${column}:`, min);
        console.log(`Highest ${column}:`, max);

        this.fastestTime = min;
        this.slowestTime = max;

        this.defaultRadius = 6; //MAKE DYNAMIC
        this.highlightedDemographic = 'KEN'; //MAKE DYNAMIC

        this.initVis()
    }

    initVis(){
        let vis = this;

        //console.log('slowest time', vis.slowestTime);
        //console.log('fastest time', vis.fastestTime);

        // margin conventions
        vis.margin = {top: 30, right: 80, bottom: 50, left: 80};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Select the date slider HTML element
        let slider = document.getElementById('slider');

        // Initialize and configure the NoUiSlider
        noUiSlider.create(slider, {
            start: [vis.fastestTime, 10800],
            connect: true,
            step: 120,
            range: {'min': vis.fastestTime, 'max': vis.slowestTime},
            tooltips: [
                {
                    to: value => formatTime(Math.round(value)),
                    from: value => value
                },
                {
                    to: value => formatTime(Math.round(value)),
                    from: value => value
                }
            ],
            //direction: 'rtl'
        });

        // Add an event listener to detect changes in the slider values
        slider.noUiSlider.on('update', function (values, handle) {
            vis.slowestTime = parseInt(values[1]);
            vis.fastestTime = parseInt(values[0]);

            vis.wrangleData();
        });

        // Add an event listener to detect changes in the attribute selector
        d3.select("#attribute-selector").on("change", function() {
            vis.highlightedDemographic = d3.select(this).property("value").toUpperCase();
            vis.updateVis();
        });

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        this.wrangleData();
    }

    wrangleData(){
        let vis = this;

        let filteredData = vis.combinedTopData.filter(d => d.Year === '2019')

        //console.log('full boston 2019 data', vis.bostonFullData);

        //console.log('slowest time', vis.slowestTime);
        //console.log('fastest time', vis.fastestTime);

        // sort runners by time
        /*vis.displayData = vis.bostonFullData
            .sort((a, b) => a.Seconds - b.Seconds)
            .filter(d => {
                const currentSeconds = parseInt(d.Seconds);
                const withinRange = currentSeconds >= vis.fastestTime && currentSeconds <= vis.slowestTime;
                return withinRange;
            });*/

        //let groupedData = d3.group(filteredData, (d) => d.Marathon)  // nest function allows to group the calculation per level of a factor

        //vis.displayData = groupedData;
        vis.displayData = filteredData;

        console.log('Fastest Time:', vis.fastestTime, 'Slowest Time:', vis.slowestTime);
        console.log('Display Data:', vis.displayData);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        // Extracting unique marathon names
        const marathonNames = Array.from(new Set(vis.displayData.map((d) => d.Marathon)));

        // Creating x scale for each marathon
        /*const xScales = {};
        marathonNames.forEach((marathon, index) => {
            const marathonData = vis.displayData.filter((d) => d.Marathon === marathon);
            xScales[marathon] = d3.scaleLinear()
                .domain(vis.fastestTime, vis.slowestTime)
                .range([0, vis.width]);
        });*/

        vis.x = d3.scaleLinear()
            .domain([vis.fastestTime, vis.slowestTime])
            .range([0, vis.width]);

        // Setting up and appending x-axis
        let xAxis = d3.axisBottom(vis.x).tickFormat((d) => formatTime(d)).tickSizeOuter(0);
        vis.svg.select('.x-axis').remove();
        vis.svg.append('g')
            .attr('class', 'x-axis')
            .call(xAxis)
            .attr('transform', `translate(0, ${vis.height})`);

        // Creating dot plots for each marathon
        marathonNames.forEach((marathon, index) => {

            //add label for marathon
            vis.svg.append('text')
                .attr('class', 'marathon-label')
                .attr('x', -5)
                .attr('y', index * vis.height / 5 + vis.height / 10)
                .attr('text-anchor', 'middle')
                .text(marathon);

            const beeswarm = vis.beeswarmForce()
                .x((d) => vis.x(d.Seconds))
                .y((d) => index * vis.height / 5 + vis.height / 10) // Adjust y position
                .r((d) => {
                    const isHighlighted = d.Country === vis.highlightedDemographic;
                    return isHighlighted ? vis.defaultRadius * 2 : vis.defaultRadius;
                });

            const marathonData = vis.displayData.filter((d) => d.Marathon === marathon);
            const circles = vis.svg.selectAll(`.${marathon}-circles`).data(beeswarm(marathonData));

            circles.exit().remove();

            circles.enter()
                .append('circle')
                .attr('class', `${marathon}-circles`)
                .attr('r', 0)
                .merge(circles)
                .transition()
                .duration(500)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .attr('r', (d) => d.r)
                .attr('stroke', 'black')
                .attr('fill', (d) => {
                    const isHighlighted = d.data.Country === vis.highlightedDemographic;
                    return isHighlighted ? 'darkblue' : 'dodgerblue';
                })
                .attr('fill-opacity', 0.8);
        });
            /*.on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('fill', 'orange');

                if (d.FirstName && d.LastName) {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                        <h3>${d.FirstName} ${d.LastName}<h3>
                        <h4> Country: ${d.Country}</h4>           
                        <h4> Gender: ${d.Gender}</h4>                 
                        <h4> Division: ${d.Division}</h4>
                        <h4> BIB Number: ${d.BIB}</h4>   
                        <h4> Overall Place: ${d.OverallPlace}</h4>
                        <h4> Time: ${d.Time}</h4>
                    </div>`);
                }
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('fill', d => {
                        let isHighlighted = d.data.Country === vis.highlightedDemographic;
                        return isHighlighted ? 'darkblue' : 'dodgerblue';
                    });

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });*/

    }

    beeswarmForce() {
        let x = d => d[0];
        let y = d => d[1];
        let r = d => d[2];
        let ticks = 300;

        function beeswarm(data){
            const entries = data.map(d => {
                return {
                    x0: typeof x === "function" ? x(d) : x,
                    y0: typeof y === "function" ? y(d) : y,
                    r: typeof r === "function" ? r(d) : r,
                    data: d
                }
            });

            let dotPadding = 0.2;

            const simulation = d3.forceSimulation(entries)
                .force("x", d3.forceX(d => d.x0))
                .force("y", d3.forceY(d => d.y0))
                .force("collide", d3.forceCollide(d => d.r + dotPadding));

            for (let i = 0; i < ticks; i++) simulation.tick();

            return entries;
        }

        beeswarm.x = f => f ? (x = f, beeswarm) : x;
        beeswarm.y = f => f ? (y = f, beeswarm) : y;
        beeswarm.r = f => f ? (r = f, beeswarm) : r;
        beeswarm.ticks = n => n ? (ticks = n, beeswarm) : ticks;

        return beeswarm;
    }

}