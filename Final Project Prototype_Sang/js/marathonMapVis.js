class MarathonMapVis {
    constructor(mapId, geojsonDataUrl, cities) {
        this.mapId = mapId;
        this.geojsonDataUrl = geojsonDataUrl;
        this.cities = cities;
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
        const pathLayer = L.geoJson(geojsonData, {
            style: () => ({
                color: '#176585', // Blue color for the path
                weight: 9, // Thinner than the border
                opacity: 1,
                dashArray: '3',
                lineCap: 'round',
                lineJoin: 'round'
            })
        }).addTo(this.map);

        const borderLayer = L.geoJson(geojsonData, {
            style: () => ({
                color: 'white',
                weight: 15,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            })
        }).addTo(this.map);

        this.map.fitBounds(pathLayer.getBounds(), { padding: [50, 50] });

        this.addCityMarkers();

        // Include the snaking effect if the plugin is available
        if (typeof pathLayer.snakeIn === 'function' && typeof borderLayer.snakeIn === 'function') {
            console.log("Calling snakeIn on both layers.");
            borderLayer.snakeIn();
            pathLayer.snakeIn();
        } else {
            console.error("Snake animation function is not available. Ensure Leaflet.Polyline.SnakeAnim is included.");
        }
    }

    addCityMarkers() {
        Object.keys(this.cities).forEach((city, index) => {
            setTimeout(() => {
                L.circle(this.cities[city], {
                    color: 'white',
                    fillColor: '#176585',
                    fillOpacity: 1,
                    radius: 500
                }).addTo(this.map).bindTooltip(city, {
                    permanent: true,
                    direction: 'top',
                    className: 'city-label-tooltip'
                }).bringToFront();
            }, index * 500);
        });
    }
}