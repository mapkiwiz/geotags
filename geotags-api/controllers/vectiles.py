from bootstrap import app, db
from resolver import resolve_dbo
from config import GEOTAGS_API_PREFIX
from ModestMaps.OpenStreetMap import Provider
from ModestMaps.Core import Coordinate
from shapely.geometry import box
from flask import jsonify, abort
from time import time

def as_bbox(se, nw, srid=4326):
    wkt = box(nw.lon, se.lat, se.lon, nw.lat).wkt
    return 'SRID=%d;%s' % (srid, wkt)

@app.route(GEOTAGS_API_PREFIX + '/<key>/tiles/<int:z>/<int:x>/<int:y>.geojson', methods=[ 'GET' ])
def tile(key, x, y, z):

    dbo = resolve_dbo(key)
    if key is None:
        return abort(404)

    start = time()
    # TODO Add z limit -> 204 No Content
    c = Coordinate(y, x, z)
    nw = OSM.coordinateLocation(c)
    se = OSM.coordinateLocation(c.down().right())
    box = as_bbox(se, nw, 4326)
    query = dbo.Feature.query.filter(Feature.geom.intersects(box))
    features = []
    for f in query:
        feature = {
            'type': 'Feature',
            'id': f.id,
            'properties': f.properties,
            'geometry': f.shape.__geo_interface__
        }
        features.append(feature)
    data_time = time() - start
    response = jsonify({
            'type': 'FeatureCollection',
            'features': features
        })
    serialize_time = time() - start - data_time
    # print (x,y,z), "Data:", data_time, "Serialize:", serialize_time
    return response