var layer_config = require('./layers.js');
var api_config = require('./api.js');

module.exports = {
    gpp: layer_config.gpp,
    baseLayers: layer_config.baseLayers,
    services: api_config.services,
    // TODO Remove from config
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