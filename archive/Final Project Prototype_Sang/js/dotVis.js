/* * * * * * * * * * * * * *
*          DotVis          *
* * * * * * * * * * * * * */

class DotVis {

    constructor(parentElement, combinedTopData, bostonFullData) {

        this.parentElement = parentElement;
        this.combinedTopData = combinedTopData;
        this.bostonFullData = bostonFullData;
        this.displayData = [];

        this.fastestTime = parseInt(bostonFullData[0].Seconds);
        this.slowestTime = parseInt(bostonFullData[bostonFullData.length - 1].Seconds);

        this.defaultRadius = 5; //MAKE DYNAMIC
        this.highlightedDemographic = 'KEN'; //MAKE DYNAMIC

        this.initVis()
    }

    initVis(){
        let vis = this;

        console.log('slowest time', vis.slowestTime);
        console.log('fastest time', vis.fastestTime);

        // margin conventions
        vis.margin = {top: 30, right: 30, bottom: 50, left: 50};
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
            start: [vis.fastestTime, 10000],
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
            direction: 'rtl'
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

        console.log('full boston 2019 data', vis.bostonFullData);

        console.log('slowest time', vis.slowestTime);
        console.log('fastest time', vis.fastestTime);

        // sort runners by time
        vis.displayData = vis.bostonFullData
            .sort((a, b) => a.Seconds - b.Seconds)
            .filter(d => {
                const currentSeconds = parseInt(d.Seconds);
                const withinRange = currentSeconds >= vis.fastestTime && currentSeconds <= vis.slowestTime;
                return withinRange;
            });

        console.log('Fastest Time:', vis.fastestTime, 'Slowest Time:', vis.slowestTime);
        console.log('Display Data:', vis.displayData);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        vis.x = d3.scaleLinear(
            d3.extent(vis.displayData, d => d.Seconds),
            [vis.width, 0]
        );

        vis.svg.select('.x-axis').remove();
        vis.svg.append('g')
            .attr('class', 'x-axis')
            .call(
                d3.axisBottom(vis.x)
                    .tickFormat(d => formatTime(d))
                    .tickSizeOuter(0)
            )
            .attr('transform', `translate(0, ${vis.height})`);

        let beeswarm = vis.beeswarmForce()
            .x(d => vis.x(d.Seconds))
            .y(vis.height / 2)
            .r(d => {
                let isHighlighted = d.Country === vis.highlightedDemographic;
                return isHighlighted ? vis.defaultRadius * 2 : vis.defaultRadius;
            });

        let circles = vis.svg.selectAll('circle').data(beeswarm(vis.displayData));

        circles.exit()
            .transition()
            .duration(500) // Adjust duration as needed
            .attr('r', 0)
            .remove(); // Remove circles that are not needed

        circles.enter()
            .append('circle')
            .attr('r', 0) // Set initial radius to 0 for entering circles
            .merge(circles)
            .transition()
            .duration(500) // Adjust duration as needed
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)
            .attr('stroke', 'black')
            .attr('fill', d => {
                let isHighlighted = d.data.Country === vis.highlightedDemographic;
                return isHighlighted ? 'darkblue' : 'dodgerblue';
            })
            .attr('fill-opacity', 0.8)
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
            })*/;

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

            let dotPadding = 0.5;

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