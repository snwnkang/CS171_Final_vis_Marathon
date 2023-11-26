class MarathonMapVis {
    constructor(mapId, geojsonDataUrl, cities) {
        this.mapId = mapId;
        this.geojsonDataUrl = geojsonDataUrl;
        this.cities = cities;
        this.pathLayer = null;
        this.borderLayer = null;
        this.cityMarkers = [];
        this.initMap();
    }

    initMap() {
        this.map = L.map(this.mapId);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.loadGeojsonData();
    }

    loadGeojsonData() {
        d3.json(this.geojsonDataUrl).then(geojsonData => {
            this.addGeoJsonLayer(geojsonData);
        }).catch(error => {
            console.log('Error loading the GeoJSON data:', error);
        });
    }

    addGeoJsonLayer(geojsonData) {
        this.geojsonData = geojsonData;
        this.pathLayer = L.geoJson(geojsonData, {
            style: () => ({
                color: '#176585', // Blue color for the path
                weight: 9, // Thinner than the border
                opacity: 1,
                dashArray: '3',
                lineCap: 'round',
                lineJoin: 'round'
            })
        }).addTo(this.map);

        this.borderLayer = L.geoJson(geojsonData, {
            style: () => ({
                color: 'white',
                weight: 15,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            })
        }).addTo(this.map);

        this.map.fitBounds(this.pathLayer.getBounds(), { padding: [50, 50] });
    }

    snake() {
        if (this.borderLayer && typeof this.borderLayer.snakeIn === 'function' &&
            this.pathLayer && typeof this.pathLayer.snakeIn === 'function') {
            this.borderLayer.snakeIn();
            this.pathLayer.snakeIn();
        }
    }
    resetSnake() {
        // When resetting, make sure to use `this` to reference the instance properties
        if (this.pathLayer && this.borderLayer) {
            this.map.removeLayer(this.borderLayer);
            this.map.removeLayer(this.pathLayer);
            // You must re-assign the layers after you re-add them.
            this.addGeoJsonLayer(this.geojsonData);
        }
    }

    addCityMarkers() {
        this.clearCityMarkers();

        Object.keys(this.cities).forEach((city, index) => {
            setTimeout(() => {
                const marker = L.circle(this.cities[city], {
                    color: 'white',
                    fillColor: '#176585',
                    fillOpacity: 1,
                    radius: 500
                }).addTo(this.map).bindTooltip(city, {
                    permanent: true,
                    direction: 'top',
                    className: 'city-label-tooltip'
                });

                // Store the marker reference for later removal
                this.cityMarkers.push(marker);
            }, index * 500); // Delay to create an animation effect
        });
    }

    clearCityMarkers() {
        // Remove each city marker from the map and clear the array
        this.cityMarkers.forEach(marker => marker.remove());
        this.cityMarkers = []; // Clear the references
    }
}