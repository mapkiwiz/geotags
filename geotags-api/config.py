# SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"
SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://geotags:geotags@localhost:5432/geotags"
SQLALCHEMY_TRACK_MODIFICATIONS = True

GEOTAGS_API_PREFIX = "/api/v1"
GEOTAGS_GAZETTEER_MAX_RESULTS = 5
GEOTAGS_SINGLE_DATASET = True
GEOTAGS_SINGLE_DATASET_KEY = 'token'
GEOTAGS_SINGLE_DATASET_SCHEMA = 'public'

USER_ENABLE_EMAIL = True
USER_ENABLE_INVITATION = True
USER_ENABLE_CONFIRM_EMAIL = False
USER_LOGIN_URL = '/user/login'
USER_LOGOUT_URL = '/user/logout'
USER_APP_NAME = "GeoTags"

WTF_CSRF_ENABLED = False

MAIL_DEFAULT_SENDER = "no-reply@geotags.mapkiwiz.fr"

# SERVER_NAME = 'localhost'

SECRET_KEY = '\xf7_\x8b@+\x94=m\\\xb6\xa0X\xaa\xe7\xbcjH\x05W\x95\x8a\xf4\x8aa'