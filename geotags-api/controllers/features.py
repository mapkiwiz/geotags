from flask import Response, jsonify, request
from bootstrap import app
from config import API_PREFIX
from models import *
import geojson

@app.route(API_PREFIX + "/")
def index():
    return "Hello World"

@app.route(API_PREFIX + "/config")
def config():
    return jsonify({
        "version": "1"
    })

@app.route(API_PREFIX + "/feature/<int:id>", methods=[ 'GET', 'POST' ])
def feature(id):
    f = Feature.query.get(id)
    if f is None:
        return ('Not Found', 404)
    if request.method == 'GET':
        return feature_get(f)
    elif request.method == 'POST':
        return feature_update(f)

def feature_get(feature):
    return jsonify(feature.properties)

# UPDATE name, label, geom
# DELETE feature
def feature_update(feature):
    pass

@app.route(API_PREFIX + "/feature/<int:id>.geojson")
def feature_geojson(id):
    f = Feature.query.get(id)
    if f is not None:
        data = {
            'id': f.id,
            'type': 'Feature',
            'geometry': f.shape.__geo_interface__,
            'properties': f.properties
        }
        return jsonify(data)
    else:
        return ('Not Found', 404)

@app.route(API_PREFIX + "/feature/<int:id>/tag", methods=[ 'POST' ])
def feature_tag(id):
    f = Feature.query.get(id)
    if f is None:
        return ('Not Found', 404)
    # if tag already exit, update tag
    # otherwise, create tag
    data = request.get_json()

@app.route(API_PREFIX + "/feature/<int:id>/mark", methods=[ 'POST' ])
def feature_mark(id):
    f = Feature.query.get(id)
    if f is None:
        return ('Not Found', 404)

@app.route(API_PREFIX + "/feature/<int:id>/geometry", methods=[ 'GET', 'POST' ])
def feature_geometry(id):
    f = Feature.query.get(id)
    if f is None:
        return ('Not Found', 404)
    if request.method == 'GET':
        data = geojson.dumps(f.shape)
        return data, 200, { 'Content-Type': 'application/json' }


