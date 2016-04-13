var API_PREFIX = require('./api.js').API_PREFIX;

module.exports = {
	autologin: false,
    services: {
        auth: {
            login: API_PREFIX + '/auth/login',
            logout: API_PREFIX + '/auth/logout',
            user: API_PREFIX + '/auth/user',
            register: API_PREFIX + '/auth/register',
            forgot_password: API_PREFIX + '/auth/forgot_password'
        }
    }
};