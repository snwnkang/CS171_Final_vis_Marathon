/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// // init global variables, switches, helper functions

let AllMapVis,
    BostonMapVis,
    myDotVis,
    marathonMapVis,
    networkVis,
    popularityVis,
    myViolinVis,
    factVis;
//
// function updateAllVisualizations(){
//     myPieChart.wrangleData()
//     myMapVis.wrangleData()
// }

const mapOptions = ['all', 'topHundred', 'topThree', 'winner'];
const mapOptionTitles = ['All Finishers', 'Top 100 Finishers', 'Top 3 Finishers', 'Winners'];
let currentMapOption = 0;

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
    d3.csv("data/combined_correct_london.csv"),
    d3.json("data/countries.geojson"),
    d3.csv("data/boston_iso_countries.csv"),
    d3.json("data/boston_marathon.geojson"),
    d3.csv("data/Boston_Field_Size.csv"),
    d3.csv('data/Top_3_Combined.csv'),
    d3.csv('data/iso3.csv'),
    d3.csv('data/boston_counts.csv'),
    d3.csv('data/all_counts.csv'),
    d3.csv('data/facts.csv')
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function initMainPage(allDataArray) {

    worldMapVis = new MapVis('mapDiv', allDataArray[7], allDataArray[8], allDataArray[1], 'all', 'boston', allDataArray[6]);
    // BostonMapVis = new MapVis('bostonMapDiv', allDataArray[2], allDataArray[1], 'all', 'boston');
    myDotVis = new DotVis('dotDiv', allDataArray[0], allDataArray[2]);
    myViolinVis = new ViolinVis('violinDiv', allDataArray[0], allDataArray[2]);
    myStackedBar = new StackedBar('stackedBar', allDataArray[5], allDataArray[6], 'stackedBarLegend');
    networkVis = new NetworkVis("network-vis", allDataArray[0]);
    marathonMapVis = new MarathonMapVis('route-map', 'data/boston_marathon.geojson', cities);
    popularityVis = new PopularityVis('popularity-chart', allDataArray[4]);
    factVis = new FactVis('fact-vis', allDataArray[9]);

    const slider = document.getElementById('yearRangeSlider');
    noUiSlider.create(slider, {
        start: [1900, 2019],
        connect: true,
        step: 1,
        range: {
            'min': 1900,
            'max': 2020
        },
        format: {
            to: function (value) {
                return value.toFixed(0);
            },
            from: function (value) {
                return Number(value);
            }
        }
    });

    slider.noUiSlider.on('update', function (values, handle) {
        let startYear = parseInt(values[0]);
        let endYear = parseInt(values[1]);
        popularityVis.filterByYearRange(startYear, endYear);
    });

    // World Map Slider
    const mapSlider = document.getElementById('mapYearRangeSlider');
    noUiSlider.create(mapSlider, {
        start: [2014, 2023],
        connect: true,
        step: 1,
        range: {
            'min': 2014,
            'max': 2023
        },
        format: {
            to: function (value) {
                return value.toFixed(0);
            },
            from: function (value) {
                return Number(value);
            }
        },
        tooltips: [
            {
                to: value => Math.round(value),
                from: value => value
            },
            {
                to: value => Math.round(value),
                from: value => value
            }
        ],
    });

    mapSlider.noUiSlider.on('update', function (values, handle) {
        worldMapVis.minYear = parseInt(values[0]);
        worldMapVis.maxYear = parseInt(values[1]);
        worldMapVis.wrangleData();
    });

    // Hide all marathon buttons from map vis
    document.getElementById("map-marathon-title").style.display = 'none';
    document.getElementById("map-year-title").style.display = 'none';
    document.getElementById('mapYearRangeSlider').style.display = 'none';

    const marathonDropdown = document.getElementById("marathon-dropdown");
    marathonDropdown.style.display = 'none';
    marathonDropdown.disabled = true;

    observeSection2();
}

const marathonButtons = document.querySelectorAll('.marathon-button');

marathonButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Get the selected marathon from the data attribute
        const selectedMarathon = this.getAttribute('data-marathon');

        // Call a method to update the network visualization
        networkVis.filterByMarathon(selectedMarathon);

        // Remove the "selected" class from all buttons
        marathonButtons.forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add the "selected" class to the clicked button
        this.classList.add('selected');
    });
});


function observeSection2() {
    let section2 = document.getElementById('section2');
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                marathonMapVis.addCityMarkers();
                marathonMapVis.snake();
            } else {
                marathonMapVis.clearCityMarkers();
                marathonMapVis.resetSnake();
            }
        });
    }, { threshold: [0.5] });

    observer.observe(section2);
}

// Function used to handle manual selection of data type in the world map visualization
function criteriaChange() {
    worldMapVis.dataType = document.getElementById('mapCriteriaSelector').value;
    worldMapVis.wrangleData()
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


// Function used to toggle the data displayed in the stacked bar visualization upon selection
function updateStackedBar() {
    // Toggle the data type and change the button text
    if (myStackedBar.dataType === 'top3') {
        myStackedBar.dataType = 'winner';
        document.getElementById('stackedBarUpdateButton').innerText = 'Toggle to Top 3 Finishers';
        document.getElementById('stackedBarTitle').innerText = 'Countries with the Most Winners';
    }
    else {
        myStackedBar.dataType = 'top3'
        document.getElementById('stackedBarUpdateButton').innerText = 'Toggle to Winners';
        document.getElementById('stackedBarTitle').innerText = 'Countries with the Most Top 3 Finishers';
    }
    myStackedBar.wrangleData()
}

// Function used to update the world map visualization over time
// function updateMap() {
//     if (currentMapOption === 3) {
//         currentMapOption = 0;
//     }
//     else {
//         currentMapOption += 1;
//     }
//     document.getElementById('criteria-title').innerText = mapOptionTitles[currentMapOption];
//     BostonMapVis.dataType = mapOptions[currentMapOption];
//     BostonMapVis.wrangleData();
// }

// Function used to remove the 'all' option when the world map is toggled to data from multiple WMMs
function removeAllOption() {
    let selectElement = document.getElementById('mapCriteriaSelector');
    let allOption = selectElement.querySelector('option[value="all"]');

    if (allOption) {
        selectElement.removeChild(allOption);
    }
}

// Function used to add back the 'all' option when the world map is toggled to data from Boston 2019
function addAllOption() {
    let selectElement = document.getElementById('mapCriteriaSelector');

    // Check if the 'All' option already exists
    let allOption = selectElement.querySelector('option[value="all"]');
    if (!allOption) {
        // Create a new option element
        let newOption = document.createElement('option');
        newOption.value = 'all';
        newOption.text = 'All Runners';

        // Insert the new option as the first child of the select element
        selectElement.insertBefore(newOption, selectElement.firstChild);
    }
}

// Function used to toggle between Boston 2019 and all WMMs in the world map visualization\
function updateMapDataSource() {

    // Toggle from 'all' to 'boston'
    if (worldMapVis.marathonType === 'all') {
        worldMapVis.marathonType = 'boston';
        worldMapVis.hundredData = promises[2];
        worldMapVis.minColor = '#d0daf6';
        worldMapVis.maxColor = '#162f77';

        // Change the button text
        const button = document.getElementById("mapDataSourceButton");
        button.innerHTML = "Show Data from All Marathons";
        button.style.transition = 'none';
        button.style.backgroundColor = '#C54644';

        // Hide the marathon dropdown menu
        const marathonDropdown = document.getElementById("marathon-dropdown");
        marathonDropdown.style.display = 'none';
        marathonDropdown.disabled = true;

        // Hide the titles
        document.getElementById("map-marathon-title").style.display = 'none';
        document.getElementById("map-year-title").style.display = 'none';

        // Change the overall title
        document.getElementById("mapDivTitle").innerHTML = 'Demographics of Boston 2019 Runners';

        // Hide the year slider
        document.getElementById('mapYearRangeSlider').style.display = 'none';

        addAllOption();
        // document.getElementById('stackedBarUpdateButton').innerText = 'Winner';
    }

    // Toggle from 'boston' to 'all'
    else {
        worldMapVis.marathonType = 'all';
        worldMapVis.hundredData = promises[0];
        worldMapVis.minColor = '#FFCCCB';
        worldMapVis.maxColor = '#C54644';

        // Change the button text
        const button = document.getElementById("mapDataSourceButton");
        button.innerHTML = "Show Data from Boston 2019";
        button.style.transition = 'none';
        button.style.backgroundColor = '#162f77';

        // Show the marathon dropdown menu
        const marathonDropdown = document.getElementById("marathon-dropdown");
        marathonDropdown.style.display = 'block';
        marathonDropdown.disabled = false;

        // Show the dropdown titles
        document.getElementById("map-marathon-title").style.display = 'block';
        document.getElementById("map-year-title").style.display = 'block';

        // Change the text in the overall title
        document.getElementById("mapDivTitle").innerHTML = 'Demographics of Front Runners from 4 World Major Marathons (2014-2023)';

        // Show the year range slider
        document.getElementById('mapYearRangeSlider').style.display = 'block';

        // Change the selection to top 100 if the user is currently viewing all
        if (worldMapVis.dataType === 'all') {
            worldMapVis.dataType = 'topHundred';
            worldMapVis.wrangleData();
            // document.getElementById('mapCriteriaSelector').value = 'topHundred';
        }

        removeAllOption();
        // document.getElementById('stackedBarUpdateButton').innerText = 'Top 3';
    }
    worldMapVis.wrangleData();
}