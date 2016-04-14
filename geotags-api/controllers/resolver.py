from bootstrap import app
from models.features import FeatureDBO

def resolve_schema(key):
	return "s%s" % key

if app.config.get('GEOTAGS_SINGLE_DATASET', True):

    dbo_key = app.config.setdefault('GEOTAGS_SINGLE_DATASET_KEY', 'token')
    schema = app.config.setdefault('GEOTAGS_SINGLE_DATASET_SCHEMA', 'public')
    dbo = FeatureDBO(schema)

    def resolve_dbo(key):
    	""" Static Feature DBO Mapping
    	"""
        if key == dbo_key:
            return dbo
        else:
            return None

else:

	from pylru import lrudecorator as cache
	cache_size = app.config.setdefault('GEOTAGS_FEATURETYPES_CACHE_SIZE', 20)

	if cache_size > 0:
		@cache(cache_size)
		def resolve_dbo(key):
			""" Dynamic Feature DBO Mapping
			"""
			schema = resolve_schema(key)
			return FeatureDBO(schema)
	else:
		def resolve_dbo(key):
			""" Dynamic Feature DBO Mapping
			"""
			schema = resolve_schema(key)
			return FeatureDBO(schema)
