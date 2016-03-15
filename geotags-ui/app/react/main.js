var React = require('react');
var ReactDOM = require('react-dom');
var Gazetteer = require('./gazetteer-local.js');
var LayerSwitcher = require('./layer-switcher.js');
// var FeatureList = require('./feature-list.js');
var AnnotationForm = require('./annotation.js');

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([44.82763029742812, -0.591888427734375], 10);
var dataLayer = null;
var drawControl = null;
var gppApiKey = "1oumlowuim4wgxzpkcmug3j1";
var gpp_url = "https://wxs.ign.fr/" + gppApiKey + "/geoportail/wmts";

// add an OpenStreetMap tile layer
var baseLayers = [
    L.tileLayer.wmts(gpp_url,
        { key: 'plan-ign',
          title: 'Plan IGN',
          layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGN",
          style:  "normal",
          tilematrixSet: "PM",
          format: "image/jpeg",
          attribution: "<a href='http://www.ign.fr'>IGN</a>" }),
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    			key: 'osm',
                title: "Open Street Map",
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }),
    L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
    			key: 'stamen-toner-lite',
                title: "Stamen Toner Lite",
                attribution: '&copy; Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            })
];

// baseLayers[0].addTo(map);

// ReactDOM.render(
// 	<Gazetteer map={map} service="/v1/search/communes?q={q}" name="search-communes" placeholder="Rechercher une commune"  />,
// 	document.getElementById('locate')
// );

window.gazetteer = ReactDOM.render(
 <Gazetteer map={map} name="search-communes" placeholder="Rechercher une commune"  />,
 document.getElementById('locate')
);

$.getJSON('data/communes-d033.json', function(data) {
    window.gazetteer.data = data;
});

ReactDOM.render(
	<LayerSwitcher map={map} title="Fonds de plan" layers={baseLayers} />,
	document.getElementById('layer-control')
);

var aForm = ReactDOM.render(
    <AnnotationForm />,
    document.getElementById('annotate')
);

// dataLayer = L.TileLayer.vectileLayer(
//     '/v1/tiles/{z}/{x}/{y}.geojson',
//     {
//         onEachFeature: function(feature, marker) {
//             marker.bindLabel(feature.properties.name, { pane: map.getPanes().popupPane, direction: 'auto' });
//             marker.on("click", function(e) {
//                 marker.dragging.enable();
//                 aForm.setState({ feature: feature });
//                 map.setZoomAround(marker.getLatLng(), 15, { animate: true });
//             });
//         }
//     }).addTo(map);

$.getJSON('data/points-d033.geojson', function(data) {
    L.geoJson(data, {
        
        pointToLayer: function(feature, latLng) {
            var icon = L.divIcon({
                    className: 'feature-marker',
                    html: '<span class="glyphicon glyphicon-map-marker"></span>',
                    iconSize: L.point(30, 30),
                    iconAnchor: L.point(15, 30)
                });
            return L.marker(latLng, {icon: icon});
        },

        onEachFeature: function(feature, marker) {
            marker.bindLabel(feature.properties.name, { pane: map.getPanes().popupPane, direction: 'auto' });
            marker.on("click", function(e) {
                aForm.selectFeature(feature, marker);
            });
        }

    }).addTo(map);
});

var historyControl = new L.Control.Html5History();
historyControl.addTo(map);

window.map = map;
window.dataLayer = dataLayer;
window.aForm = aForm;