/* * * * * * * * * * * * * * * *  *
*         StackedBarChart         *
* * * * * * * * * * * * * * * * * */

class StackedBar {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.hundredData = hundredData;
        this.geoData = geoData;
        this.dataType = dataType;

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        // TODO

        vis.wrangleData();
    }

    wrangleData () {
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

        vis.updateVis();
    }

    updateVis() {
        // TODO
    }


}