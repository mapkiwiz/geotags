var gppApiKey = "{GPP_API_KEY}";
var gpp_url = "https://wxs.ign.fr/" + gppApiKey + "/geoportail/wmts";
var API_PREFIX = '/api/v1';

module.exports = {
    backend: 'off',
    gpp: {
        apiKey: gppApiKey
    },
    baseLayers: [
        L.tileLayer.wmts(gpp_url,
            { key: 'plan-ign',
              title: 'Plan IGN',
              layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGN",
              style:  "normal",
              tilematrixSet: "PM",
              format: "image/jpeg",
              attribution: "&copy; <a href='http://www.ign.fr'>IGN</a>" }),
        L.tileLayer.wmts(gpp_url,
            { key: 'carte-ign',
              title: 'Carte IGN',
              layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS",
              style:  "normal",
              tilematrixSet: "PM",
              format: "image/jpeg",
              attribution: "&copy; <a href='http://www.ign.fr'>IGN</a>" }),
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
    ],
    services: {
        ban: {
            url: '//api-adresse.data.gouv.fr/search/?q={q}'
        },
        gazetteer: {
            url: API_PREFIX + '/search/communes?q={q}'
        },
        export: {
            url: API_PREFIX + '/export/points.geojson'
        },
        data: {
            all: API_PREFIX + '/features.geojson',
            get: API_PREFIX + '/feature/{id}.geojson',
            modify: API_PREFIX + '/feature/{id}.geojson',
            create: API_PREFIX + '/features'
        }
    },
    data: {
        communes: 'data/communes-d033.json',
        points: 'data/points-d033.geojson'
    },
    export: {
        filename: 'creches-d033.geojson'
    },
    view: {
        center: [44.82763, -0.59189],
        zoom: 10
    }
};