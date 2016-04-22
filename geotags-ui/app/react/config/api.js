var API_PREFIX = '/api/v1';

module.exports = {
    API_PREFIX: API_PREFIX,
    services: {
        ban: {
            url: '//api-adresse.data.gouv.fr/search/?q={q}',
            reverse: '//api-adresse.data.gouv.fr/reverse/?lon={lon}&lat={lat}'
        },
        gazetteer: {
            url: API_PREFIX + '/search/communes?q={q}'
        },
        export: {
            url: API_PREFIX + '/' + TOKEN + '/export/points.geojson'
        },
        data: {
            all: API_PREFIX + '/' + TOKEN + '/features.geojson', // dataset
            get: API_PREFIX + '/' + TOKEN + '/feature/{id}.geojson', // fetchone
            modify: API_PREFIX + '/' + TOKEN + '/feature/{id}.geojson',
            create: API_PREFIX + '/' + TOKEN + '/features'
        }
    }
};