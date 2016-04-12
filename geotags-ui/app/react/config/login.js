var API_PREFIX = require('./api.js').API_PREFIX;

module.exports = {
    services: {
        auth: {
            login: API_PREFIX + '/auth/login',
            logout: API_PREFIX + '/auth/logout',
            user: API_PREFIX + '/auth/user'
        }
    }
};