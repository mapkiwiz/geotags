// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([44.82763029742812, -0.591888427734375], 10);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

drawControl = null;

$.getJSON('/v1/tiles/0/0/0.geojson', function(data) {
        dataLayer = L.geoJson(data).addTo(map);
        map.fitBounds(dataLayer.getBounds());
        drawControl = new L.Control.Draw({
            edit: {
                featureGroup: dataLayer
            }
        }).addTo(map);
    });