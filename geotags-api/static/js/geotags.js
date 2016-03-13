// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([44.82763029742812, -0.591888427734375], 10);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

dataLayer = null;
drawControl = null;

// $.getJSON('/v1/tiles/0/0/0.geojson', function(data) {
//         dataLayer = L.geoJson(data).addTo(map);
//         map.fitBounds(dataLayer.getBounds());
//         drawControl = new L.Control.Draw({
//             edit: {
//                 featureGroup: dataLayer
//             }
//         }).addTo(map);
//     });

dataLayer = L.TileLayer.vectileLayer('/v1/tiles/{z}/{x}/{y}.geojson').addTo(map);

$('input[name="search-communes"]').on(
    'keyup',
    function(e) {
        var url, val = $(e.target).val();
        if (val) {
            // url = '/v1/search/communes?q=' + val + '&bbox=' + map.getBounds().toBBoxString();
            url = '/v1/search/communes?q=' + val ;
            $.getJSON(url, function(data) {
                var element = $("#search-results").empty();
                data.results.forEach(function(d) {
                    var item = $("<li>" + d.text + "</li>");
                    item.on("click", function(e) {
                        map.fitBounds(L.latLngBounds(
                            L.latLng(d.south_west.lat, d.south_west.lon),
                            L.latLng(d.north_east.lat, d.north_east.lon)));
                    });
                    element.append(item);
                });
            });
        } else {
            $("#search-results").empty();
        }
    });