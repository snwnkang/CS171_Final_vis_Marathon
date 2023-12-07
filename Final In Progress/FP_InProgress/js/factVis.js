class FactVis {
    constructor(parentElement, facts) {
        this.parentElement = parentElement;
        this.facts = facts;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Get dynamic dimensions
        vis.margin = { top: 20, right: 30, bottom: 30, left: 40 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Append SVG to the parent element
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scale for the years
        vis.x = d3.scalePoint()
            .range([0, vis.width])
            .domain(vis.facts.map(d => d.year))
            .padding(1);

        // Draw the line
        vis.svg.append("line")
            .attr("x1", 0)
            .attr("y1", vis.height / 2)
            .attr("x2", vis.width)
            .attr("y2", vis.height / 2)
            .attr("stroke", "black");

        vis.yearGroups = vis.svg.selectAll(".year-group")
            .data(vis.facts)
            .enter().append("g")
            .attr("class", "year-group")
            .attr("transform", d => `translate(${vis.x(d.year)}, ${vis.height / 2})`)
            .on("mouseover", function(event, d) {
                vis.applyHoverEffect(d, 1.3);  // hoveredScale
            })
            .on("mouseout", function(event, d) {
                vis.resetHoverEffect(1);  // regularScale
            })
            .on("click", function(event, d) {
                vis.showFact(d);  // Add the click event to trigger showFact
            });

        vis.yearGroups.append("circle")
            .attr("class", "year-circle")
            .attr("r", 20)
            .style("fill", "lightblue");

        vis.yearGroups.append("text")
            .attr("class", "year-text")
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .text(d => d.year)
            .style("user-select", "none")
            .style("fill", "black");
    }

    applyHoverEffect(d, scale) {
        let vis = this;

        // Scale up the hovered group (both circle and text)
        vis.yearGroups.filter(group => group.year === d.year)
            .select(".year-circle").transition().attr("r", 30 * scale);
        vis.yearGroups.filter(group => group.year === d.year)
            .select(".year-text").transition().style("font-size", "20px");

        // Scale down all other groups
        vis.yearGroups.filter(group => group.year !== d.year)
            .select(".year-circle").transition().attr("r", 15 * (1 / scale));
        vis.yearGroups.filter(group => group.year !== d.year)
            .select(".year-text").transition().style("font-size", "9px");
    }

    resetHoverEffect(scale) {
        let vis = this;

        // Reset all circles to regular size within each group
        vis.yearGroups.select(".year-circle").transition().attr("r", 20);

        // Reset all texts to regular size within each group
        vis.yearGroups.select(".year-text").transition().style("font-size", "15px");
    }

    showFact(d) {
        let vis = this;

        // Hide all other circles and texts
        vis.yearGroups.filter(group => group.year !== d.year)
            .transition().style("opacity", 0);

        // Enlarge and move the clicked circle to the left
        vis.yearGroups.filter(group => group.year === d.year)
            .transition()
            .attr("transform", `translate(50, ${vis.height / 2})`)
            .select(".year-circle").attr("r", 100);

        // Determine the file extension for the image
        let fileExtension = FactVis.getFileExtension(d.year);
        console.log("Year: " + d.year + ", File Extension: " + fileExtension); // Add this line

        let imageWidth = 300;
        let imageHeight = 300;
        let imageX = 200; // Adjust the X position as needed
        let lineCenterY = vis.height / 2;
        let imageY = lineCenterY - (imageHeight / 2); // Center vertically to the line

        vis.svg.append("image")
            .attr("xlink:href", `img/${d.year}${FactVis.getFileExtension(d.year)}`)
            .attr("x", imageX)
            .attr("y", imageY)
            .attr("width", imageWidth)
            .attr("height", imageHeight)
            .attr("class", "year-image");

        vis.svg.append("text")
            .attr("x", 160)
            .attr("y", lineCenterY + 120) // Use lineCenterY as the reference
            .text("Back")
            .attr("class", "back-button")
            .style("cursor", "pointer")
            .on("click", function() {
                // Logic to reset the view goes here
                vis.resetView();
            });
        let maxTextBoxWidth = vis.width - (imageX + imageWidth + 20);

// Calculate the maximum text box height based on the number of lines and font size
        let maxTextBoxHeight = vis.calculateTextBoxHeight(d.fact);

// Set the text box dimensions
        let textBoxWidth = Math.min(maxTextBoxWidth, 650); // Use the smaller of the two
        let textBoxHeight = maxTextBoxHeight;

// Position the text box next to the image with some spacing
        let textBoxX = imageX + imageWidth + 20;
        let textBoxY = lineCenterY - (textBoxHeight / 2);

        // Append the text box
        let foreignObject = vis.svg.append("foreignObject")
            .attr("x", textBoxX)
            .attr("y", textBoxY)
            .attr("width", textBoxWidth)
            .attr("height", textBoxHeight) // Set the height here
            .attr("class", "fact-foreign-object");

        foreignObject.append("xhtml:div")
            .style("background-color", "#2D6E5B") // Updated background color
            .style("color", "white") // Text color
            .style("border", "1px solid black")
            .style("padding", "10px")
            .style("font-size", "14px")
            .style("overflow-y", "auto")
            .html(d.fact);
    }

    resetView() {
        let vis = this;

        // Reset all circles and texts to original state
        vis.yearGroups.transition().style("opacity", 1)
            .attr("transform", d => `translate(${vis.x(d.year)}, ${vis.height / 2})`)
            .select(".year-circle").attr("r", 20);

        // Remove the image and back button
        vis.svg.selectAll(".year-image, .back-button").remove();
        vis.svg.selectAll(".fact-foreign-object").remove();

    }
    static getFileExtension(year) {
        console.log("Received year in getFileExtension: ", year); // Debug log
        year = Number(year); // Ensure year is a number

        switch(year) {
            case 2003:
            case 2004:
                return '.gif';
            case 2000:
            case 2008:
            case 2012:
                return '.jpeg';
            default:
                return '.jpg';
        }
    }
    calculateTextBoxHeight(text) {
        // You can adjust the font size and padding as needed to match the CSS styles
        let fontSize = 14;
        let padding = 20;

        // Estimate the height based on the number of lines and font size
        let lines = text.split('\n').length;
        return lines * fontSize + padding;
    }
}