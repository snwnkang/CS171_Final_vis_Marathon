class PieChart {

    constructor(parentElement, bostonData, allData, geoData, dataType, marathonType, countryCodes) {
        this.parentElement = parentElement;
        this.allData = allData;
        this.bostonData = bostonData;
        this.geoData = geoData;
        this.dataType = dataType;
        this.marathonType = marathonType;
        this.countryCodes = countryCodes;

        this.minYear = 2014;
        this.maxYear = 2023;
        this.marathon = 'all';

        this.minColor = '#d0daf6';
        this.maxColor = '#162f77';

        this.marathonArray = ['Boston', 'Chicago', 'London', 'New York'];
        // this.marathonArray = ['Boston', 'Berlin', 'Chicago', 'London', 'New York'];
        this.genderArray = ['male', 'female'];

        this.initVis()
    }
}