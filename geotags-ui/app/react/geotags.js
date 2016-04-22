var config = require('./config/geotags.js');
var GazetteerBAN = require('./gazetteer-ban.js');
var LayerSwitcher = require('./layer-switcher.js');
var AnnotationForm = require('./annotation.js');
var AppMessage = require('./message.js');
var DataStore;
var Gazetteer;

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView(config.view.center, config.view.zoom);
var dataLayer = null;
var drawControl = null;

var historyControl = new L.Control.Html5History();
historyControl.addTo(map);

if (config.backend == "on") {

    DataStore = require('./store/remote-api.js')
    Gazetteer = require('./gazetteer-api.js');
    ReactDOM.render(
     <Gazetteer map={map} service={config.services.gazetteer.url} name="search-communes" placeholder="Rechercher une commune"  />,
     document.getElementById('locate')
    );

} else {

    console.log("Running standalone with local data ...");
    DataStore = require('./store/local.js')
    Gazetteer = require('./gazetteer-local.js');
    var gazetteer = ReactDOM.render(
     <Gazetteer map={map} name="search-communes" placeholder="Rechercher une commune"  />,
     document.getElementById('locate')
    );

    $.getJSON(config.data.communes, function(data) {
        gazetteer.data = data;
    });

}

var store = new DataStore(config);

var aForm = ReactDOM.render(
    <AnnotationForm save={store.saveToBackend.bind(store)} />,
    document.getElementById('annotate')
);

var createNew = function(result) {
    var feature = {
        properties: {
            name: 'Nouvel objet #1',
            tags: {
                adresse: result.properties.label,
                insee: result.properties.citycode,
                citycode: result.properties.citycode,
                postcode: result.properties.postcode,
                ban_score: result.properties.score,
                created: 'yes',
            }
        },
        geometry: result.geometry,
        type: 'Feature'
    };
    store.createNew(feature, { zoom: true });
};

ReactDOM.render(
    <GazetteerBAN map={map} name="search-ban" service={config.services.ban.url} placeholder="Rechercher une adresse" select={createNew}  />,
    document.getElementById('create-new-by-address')
);

ReactDOM.render(
    <LayerSwitcher map={map} title="Fonds de plan" layers={config.baseLayers} />,
    document.getElementById('layer-control-baselayer')
);

ReactDOM.render(
    <LayerSwitcher map={map} title="Autres couches de données" layers={config.overlays} />,
    document.getElementById('layer-control-overlays')
);

window.appMessage = ReactDOM.render(
    <AppMessage />,
    document.getElementById('message-container')
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

store.addTo(map, aForm);

window.map = map;
window.store = store;

window.handler = new L.Draw.Marker(map, {
    icon: L.divIcon({
        className: 'feature-marker',
        html: '<span class="glyphicon glyphicon-map-marker"></span>',
        iconSize: L.point(30, 30),
        iconAnchor: L.point(16, 45)
    })
});

map.on('draw:created', function(e) {
    // TODO Reverse geocode
    var feature = e.layer.toGeoJSON();
    feature.properties.name = 'Nouvel objet #1';
    feature.properties.tags = {
        created: 'yes'
    };
    store.createNew(feature);
});

$('#tab-create-new-by-point').on('show.bs.tab', function(e) {
    window.handler.enable();
});

$('#tab-create-new-by-point').on('hidden.bs.tab', function(e) {
    window.handler.disable();
});

$('#tab-create-new').on('hidden.bs.tab', function(e) {
    window.handler.disable();
});

$('.leaflet-control-zoom').hide();