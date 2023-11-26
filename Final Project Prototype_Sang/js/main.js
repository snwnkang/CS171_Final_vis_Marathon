/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// // init global variables, switches, helper functions

let myMapVis,
    myDotVis,
    marathonMapVis,
    networkVis;
//
// function updateAllVisualizations(){
//     myPieChart.wrangleData()
//     myMapVis.wrangleData()
// }

let cities = {
    Hopkinton: [42.2287, -71.5226],
    Ashland: [42.2580, -71.4634],
    Framingham: [42.2773, -71.4162],
    Natick: [42.2830, -71.3468],
    Wellesley: [42.2968, -71.2924],
    Newton: [42.3370, -71.2092],
    Brookline: [42.3420, -71.1212],
    Boston: [42.3510, -71.0810]
};

// Load data using promises
let promises = [
    d3.csv("data/combined_updated_dataAll.csv"),
    d3.json("data/countries.geojson"),
    d3.csv("data/full2019boston.csv"),
    d3.json("data/boston_marathon.geojson")
    // d3.csv("data/winners.csv")
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(allDataArray) {
    console.log(allDataArray);

    myMapVis = new MapVis('mapDiv', allDataArray[0], allDataArray[1], 'winner');
    myDotVis = new DotVis('dotDiv', allDataArray[0], allDataArray[2]);
    // myStackedBar = new StackedBar('stackedBarDiv', allDataArray[0], allDataArray[1], 'winner');
    networkVis = new NetworkVis("network-vis", allDataArray[0]);
    marathonMapVis = new MarathonMapVis('route-map', 'data/boston_marathon.geojson', cities);
    observeSection2();
}

document.getElementById('marathonSelector').addEventListener('change', function() {
    // Get the selected value
    let selectedMarathon = this.value;

    // Call a method to update the network visualization
    networkVis.filterByMarathon(selectedMarathon);
});

function observeSection2() {
    let section2 = document.getElementById('section2');
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                marathonMapVis.addCityMarkers(); // Add city markers when section comes into view
                marathonMapVis.snake(); // Start snaking when section comes into view
            } else {
                marathonMapVis.clearCityMarkers(); // Remove city markers when section goes out of view
                marathonMapVis.resetSnake(); // Reset snaking when section goes out of view
            }
        });
    }, { threshold: [0.5] });

    observer.observe(section2);
}

function criteriaChange() {
    myMapVis.dataType = document.getElementById('mapCriteriaSelector').value;
    myMapVis.wrangleData()
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
