class NetworkVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        //Set margins and dimensions
        vis.margin = { top: 40, right: 120, bottom: 60, left: 120 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;



        //Create the SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);


        //Define the size scale, but don't set the domain yet
        vis.sizeScale = d3.scaleSqrt().range([5, 30]);

        //Initialize the simulation
        vis.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("collide", d3.forceCollide(d => vis.sizeScale(d.count || 0) + 6))
            .force("radial", d3.forceRadial(function(d) {
                return d.group === 'Marathon' ? 0 : 150;
            }, vis.width / 2, vis.height / 2).strength(0.8))
            .force("bounds", function() {
                vis.nodes.forEach(d => {
                    d.x = Math.max(vis.margin.left + vis.sizeScale(d.count || 0), Math.min(vis.width - vis.margin.right - vis.sizeScale(d.count || 0), d.x));
                    d.y = Math.max(vis.margin.top + vis.sizeScale(d.count || 0), Math.min(vis.height - vis.margin.bottom - vis.sizeScale(d.count || 0), d.y));
                });
            });

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        //Create a unique list of marathons
        vis.marathons = Array.from(new Set(vis.data.map(d => d.Marathon)));

        //Create a unique list of countries
        vis.countries = Array.from(new Set(vis.data.map(d => d.Country)));

        //Initialize the nodes array with the marathon nodes
        vis.nodes = vis.marathons.map(marathon => {
            return { id: marathon, group: 'Marathon' };
        });

        vis.countries.forEach(country => {
            vis.nodes.push({
                id: country,
                group: 'Country',
                count: vis.data.filter(d => d.Country === country).length
            });
        });

        const initialPositions = {
            'Boston': { x: vis.width * 0.1, y: vis.height * 0.7},
            'Chicago': { x: vis.width * 0.1, y: vis.height * 0.3},
            'New York': { x: vis.width / 2, y: vis.height/2 },
            'London': { x: vis.width * 0.9, y: vis.height * 0.3},
            'Berlin': { x: vis.width * 0.9, y: vis.height * 0.7},
        };

        if (vis.selectedMarathon !== 'all') {
            // Reset positions for all nodes to allow for new layout
            vis.nodes.forEach(node => {
                node.fx = null;
                node.fy = null;
            });

            // Find the selected marathon node and set it to the center
            vis.nodes.forEach(node => {
                if (node.id === vis.selectedMarathon) {
                    node.fx = vis.width / 2;
                    node.fy = vis.height / 2;
                }
            });
        } else {
            // When all marathons are selected, assign initial positions
            vis.nodes.forEach(node => {
                if (node.group === 'Marathon') {
                    node.fx = initialPositions[node.id].x;
                    node.fy = initialPositions[node.id].y;
                } else {
                    // Allow country nodes to be positioned by the force simulation
                    node.fx = null;
                    node.fy = null;
                }
            });
        }
        let maxCount = d3.max(vis.data, d => d.count);

        // Update the domain of the size scale with the new max count value
        vis.sizeScale.domain([0, maxCount]);

        //Create the links between marathon nodes and country nodes
        vis.links = [];
        vis.marathons.forEach(marathon => {
            vis.data.filter(d => d.Marathon === marathon).forEach(entry => {
                vis.links.push({
                    source: marathon,
                    target: entry.Country
                });
            });
        });

        //Removing duplicate links
        vis.links = Array.from(new Map(vis.links.map(link => [JSON.stringify([link.source, link.target]), link])).values());

        //Once the data is prepared, call updateVis
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let marathonColors = {
            'Boston': '#8dae86',
            'Chicago': '#9886ae',
            'New York': '#ae8692',
            'London': '#ae9b86',
            'Berlin': '#81a3b3'
        };

        //Update the size scale domain after processing the data
        vis.sizeScale.domain([0, d3.max(vis.nodes, d => d.count || 0)]);

        //Draw the links (paths)
        vis.linkElements = vis.svg.selectAll(".link")
            .data(vis.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", .3)
            .style("stroke", "#9a9a93");

        function dragStarted(event, d) {
            if (!event.active) vis.simulation.alphaTarget(0.05).restart();

            if (d.group === 'Marathon') {
                //Increase the charge strength to push unrelated nodes further away
                vis.simulation.force("charge", d3.forceManyBody().strength(-1600));

                //Apply a strong radial force to pull connected country nodes closer
                vis.simulation.force("radial", d3.forceRadial()
                    .radius(30)
                    .x(d.x)
                    .y(d.y)
                    .strength(node => {
                        return vis.links.some(link =>
                            (link.source === d && link.target === node) ||
                            (link.target === d && link.source === node)
                        ) ? 2.2 : 0.05; //Lower strength for nodes not connected to the dragged marathon
                    })
                );
            }

            //Fix position of dragged node (for marathon nodes)
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            //Constrain the dragged position to within the bounds of the SVG
            d.fx = Math.max(vis.sizeScale(d.count || 0), Math.min(vis.width - vis.sizeScale(d.count || 0), event.x));
            d.fy = Math.max(vis.sizeScale(d.count || 0), Math.min(vis.height - vis.sizeScale(d.count || 0), event.y));

            if (d.group === 'Marathon') {
                // If a marathon node is dragged, update the radial force center to the marathon node's new position
                vis.simulation.force("radial").x(d.fx).y(d.fy);
            }

            //Restart the simulation to apply the positional constraints
            vis.simulation.alphaTarget(0.05).restart();
        }


        function dragEnded(event, d) {
            if (!event.active) vis.simulation.alphaTarget(0).restart();

            setTimeout(() => vis.simulation.alphaTarget(0), 1000);

            if (d.group === 'Marathon') {
                // Reset the charge force strength
                vis.simulation.force("charge", d3.forceManyBody().strength(-400));

                // Remove the radial force
                vis.simulation.force("radial", null);

                // Release country nodes if they are not being dragged
                vis.nodes.forEach(node => {
                    if (node.group === 'Country') {
                        node.fx = null;
                        node.fy = null;
                    }
                });
            }

            // If the node is fixed after dragging, keep its position
            d.fx = d.group === 'Marathon' ? event.x : null;
            d.fy = d.group === 'Marathon' ? event.y : null;

            // Restart the simulation to let nodes settle
            vis.simulation.alpha(1).restart();
        }

        //Draw the nodes (circles)
        //Here we use a function to determine the radius based on whether the node is a country or a marathon
        vis.nodeElements = vis.svg.selectAll(".node")
            .data(vis.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", d => d.group === 'Marathon' ? 15 : vis.sizeScale(d.count))
            .style("fill", d => {
                //Apply different colors to marathon and country nodes
                if (d.group === 'Marathon') {
                    return marathonColors[d.id]; //Specific color for marathon nodes
                } else {
                    return "#f6905e"; //Specific color for country nodes
                }
            })
            .style("stroke", "#26113f")
            .style("stroke-width", d => d.group === 'Marathon' ? 2 : 0.5);

        vis.nodeElements.call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

        //Labels for the nodes
        vis.textElements = vis.svg.selectAll(".node-text")
            .data(vis.nodes)
            .join("text")
            .attr("class", d => `node-text ${d.group === 'Marathon' ? 'marathon-text' : 'country-text'}`)
            .attr("dx", d => d.group === 'Marathon' ? 20 : 15)
            .attr("dy", 4)
            .text(d => d.id || "Unknown");

        //Update and restart the simulation.
        vis.simulation
            .nodes(vis.nodes)
            .on("tick", ticked);

        vis.simulation.force("link")
            .links(vis.links);

        function ticked() {
            vis.linkElements
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            vis.nodeElements
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            vis.svg.selectAll("line")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            vis.svg.selectAll("text")
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        }
    }
}