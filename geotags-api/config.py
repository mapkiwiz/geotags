# SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"
SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://geotags:geotags@localhost:5432/geotags"
SQLALCHEMY_TRACK_MODIFICATIONS = True
API_PREFIX = "/api/v1"
GAZETTEER_MAX_RESULTS = 5

USER_ENABLE_EMAIL = True
USER_ENABLE_INVITATION = True
USER_ENABLE_CONFIRM_EMAIL = False
USER_LOGIN_URL = '/user/login'
USER_LOGOUT_URL = '/user/logout'
USER_APP_NAME = "GeoTags"

WTF_CSRF_ENABLED = False

MAIL_DEFAULT_SENDER = "no-reply@geotags.mapkiwiz.fr"

# SERVER_NAME = 'localhost'