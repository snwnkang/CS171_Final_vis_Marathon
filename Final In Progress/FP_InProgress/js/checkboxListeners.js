// Map Vis Sex Checkbox Listeners

// Male Case
const maleCheckbox = document.getElementById('maleCheckbox')

maleCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.genderArray.push('male');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.genderArray.indexOf('male');
        if (index > -1) {
            worldMapVis.genderArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// Female Case
const femaleCheckbox = document.getElementById('femaleCheckbox')

femaleCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.genderArray.push('female');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.genderArray.indexOf('female');
        if (index > -1) {
            worldMapVis.genderArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// Map Vis Marathon Checkbox Listeners
// Boston Case
const bostonCheckbox = document.getElementById('bostonCheckbox')

bostonCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('Boston');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('Boston');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// New York Case
const nyCheckbox = document.getElementById('nyCheckbox')

nyCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('New York');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('New York');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// Chicago Case
const chicagoCheckbox = document.getElementById('chicagoCheckbox')

chicagoCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('Chicago');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('Chicago');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// London Case
const londonCheckbox = document.getElementById('londonCheckbox')

londonCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('London');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('London');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// // Berlin Case
// const berlinCheckbox = document.getElementById('berlinCheckbox')
//
// berlinCheckbox.addEventListener('change', (event) => {
//     if (event.currentTarget.checked) {
//         // Add male to list of genders shown on map
//         worldMapVis.marathonArray.push('Berlin');
//     } else {
//
//         // Remove male from list of genders shown on map
//         const index = worldMapVis.marathonArray.indexOf('Berlin');
//         if (index > -1) {
//             worldMapVis.marathonArray.splice(index,1);
//         }
//     }
//     worldMapVis.wrangleData();
// });