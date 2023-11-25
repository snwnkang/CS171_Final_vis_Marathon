/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// // init global variables, switches, helper functions

let myMapVis,
    myDotVis;

//
// function updateAllVisualizations(){
//     myPieChart.wrangleData()
//     myMapVis.wrangleData()
// }

// Load data using promises
let promises = [
    d3.csv("data/combined_updated_dataAll.csv"),
    d3.json("data/countries.geojson"),
    d3.csv("data/full2019boston.csv")
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
    let networkVis = new NetworkVis("network-vis", allDataArray[0]);
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
