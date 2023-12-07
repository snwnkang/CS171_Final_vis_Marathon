/* * * * * * * * * * * * * *
*          ViolinVis          *
* * * * * * * * * * * * * */

class ViolinVis {

    constructor(parentElement, combinedTopData, bostonFullData) {

        this.parentElement = parentElement;
        this.combinedTopData = combinedTopData;
        this.bostonFullData = bostonFullData;
        this.displayData = [];

        this.fastestTime = parseInt(bostonFullData[0].Seconds);
        this.slowestTime = parseInt(bostonFullData[bostonFullData.length - 1].Seconds);

        this.initVis()



    }


    initVis() {
        let vis = this;

        //console.log('slowest time', vis.slowestTime);
        //console.log('fastest time', vis.fastestTime);

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

        // Build and Show the Y scale
        vis.y = d3.scaleLinear()
            .domain([vis.fastestTime, vis.slowestTime])          // Note that here the Y scale is set manually
            .range([vis.height, 0])
        vis.svg.append("g").call( d3.axisLeft(vis.y) )

        // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
        vis.x = d3.scaleBand()
            .range([ 0, vis.width ])
            .domain(["Boston", "Berlin", "London", "Chicago", "New York"])
            .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
        vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x))

        this.wrangleData();
    }

    wrangleData(){
        let vis = this;

        //console.log('full boston 2019 data', vis.bostonFullData);

        // console.log('slowest time', vis.slowestTime);
        // console.log('fastest time', vis.fastestTime);

        // sort runners by time
        let filteredData = vis.combinedTopData.filter(d => d.Year === '2019')
            /*.sort((a, b) => a.Seconds - b.Seconds)
            .filter(d => {
                const currentSeconds = parseInt(d.Seconds);
                const withinRange = currentSeconds >= vis.fastestTime && currentSeconds <= vis.slowestTime;
                return withinRange;
            });*/

        //console.log('Fastest Time:', vis.fastestTime, 'Slowest Time:', vis.slowestTime);
        //console.log('Display Data:', vis.displayData);

        // 2 functions needed for kernel density estimate
        function kernelDensityEstimator(kernel, X) {
            return function(V) {
                return X.map(function(x) {
                    return [x, d3.mean(V, function(v) { return kernel(x - v); })];
                });
            };
        }
        function kernelEpanechnikov(k) {
            return function(v) {
                return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
            };
        }

        // Features of density estimate
        let kde = kernelDensityEstimator(kernelEpanechnikov(.2), vis.y.ticks(50))

        // Compute the binning for each group of the dataset
        let groupedData = d3.group(filteredData, (d) => d.Marathon)  // nest function allows to group the calculation per level of a factor

        vis.displayData = d3.rollup(groupedData,
            function(d) {   // For each key..
                // console.log('d',d)
                let input = d.map(function(g) { return g.Seconds;})    // Keep the variable called Sepal_Length
                let density = kde(input)   // And compute the binning on it.
                return(density)
            },
            d => d[0].Marathon // Specify the key accessor function
        );
            /*.key(function(d) { console.log('d',d); return d.Marathon;})
            .rollup(function(d) {   // For each key..
                let input = d.map(function(g) { return g.Seconds;})    // Keep the variable called Sepal_Length
                let density = kde(input)   // And compute the binning on it.
                return(density)
            })
            .entries(filteredData)*/

        // console.log('vis.displayData', vis.displayData);

        //vis.updateVis();

    }


    updateVis() {
        let vis = this;



        // What is the biggest value that the density estimate reach?
        let maxNum = 0
        for ( let i in vis.displayData ){
            let allBins = vis.displayData[i].value
            let kdeValues = allBins.map(function(a){return a[1]})
            let biggest = d3.max(kdeValues)
            if (biggest > maxNum) { maxNum = biggest }
        }

        // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
        let xNum = d3.scaleLinear()
            .range([0, vis.x.bandwidth()])
            .domain([-maxNum,maxNum])

        // Add the shape to this svg!
        vis.svg.selectAll("myViolin")
            .data(vis.displayData)
            .enter()        // So now we are working group per group
            .append("g")
            .attr("transform", function(d){ return("translate(" + vis.x(d.key) +" ,0)") } ) // Translation on the right to be at the group position
            .append("path")
            .datum(function(d){ return(d.value)})     // So now we are working density per density
            .style("stroke", "none")
            .style("fill","#69b3a2")
            .attr("d", d3.area()
                .x0(function(d){ return(xNum(-d[1])) } )
                .x1(function(d){ return(xNum(d[1])) } )
                .y(function(d){ return(y(d[0])) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )

    }


}