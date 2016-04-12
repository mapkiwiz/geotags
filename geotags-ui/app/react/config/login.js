var API_PREFIX = '/api/v1';

module.exports = {
    services: {
        auth: {
            login: API_PREFIX + '/auth/login',
            logout: API_PREFIX + '/auth/logout',
            user: API_PREFIX + '/auth/user'
        }
    }
};