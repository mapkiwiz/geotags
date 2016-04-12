var API_PREFIX = '/api/v1';

module.exports = {
    API_PREFIX: API_PREFIX,
    backend: 'off',
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
            all: API_PREFIX + '/features.geojson', // dataset
            get: API_PREFIX + '/feature/{id}.geojson', // fetchone
            modify: API_PREFIX + '/feature/{id}.geojson',
            create: API_PREFIX + '/features'
        }
    }
};