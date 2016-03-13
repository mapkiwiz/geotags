# SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"
SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://geotags:geotags@localhost:5432/geotags"
SQLALCHEMY_TRACK_MODIFICATIONS = True
API_PREFIX = "/v1"
GAZETTEER_MAX_RESULTS = 5