from flask import Response, jsonify, request, abort
from flask_cors import cross_origin
from flask_user import current_user
from functools import wraps
from bootstrap import app, db
from config import API_PREFIX
from shapely.geometry import asShape
from models import *
import geojson

def _call_or_get(function_or_property):
    return function_or_property() if callable(function_or_property) else function_or_property

def auth_required(func):
    """ This decorator ensures that the current user is logged in before calling the actual view.
        Calls the unauthorized_view_function() when the user is not logged in."""
    @wraps(func)
    def decorated_view(*args, **kwargs):
        # User must be authenticated
        if not _call_or_get(current_user.is_authenticated):
            return abort(403)

        # Call the actual view
        return func(*args, **kwargs)
    return decorated_view

@app.route(API_PREFIX + "/")
def index():
    return "Hello World"

@app.route(API_PREFIX + "/config")
def config():
    return jsonify({
        "version": "1"
    })

@app.route(API_PREFIX + "/feature/<int:id>", methods=[ 'GET' ])
def feature(id):
    f = Feature.query.get(id)
    if f is None:
        return abort(404)
    if request.method == 'GET':
        return feature_get(f)
    elif request.method == 'POST':
        return feature_update(f)

def feature_get(feature):
    return jsonify(feature.properties)

@app.route(API_PREFIX + "/feature/<int:id>.geojson", methods=[ 'GET', 'POST' ])
@cross_origin()
def feature_geojson(id):
    f = Feature.query.get(id)
    if f is None:
        return abort(404)
    if request.method == 'GET':
        return feature_get_geojson(f)
    elif request.method == 'POST':
        return feature_update(f)

def feature_get_geojson(feature):
    if feature is not None:
        data = {
            'id': feature.id,
            'type': 'Feature',
            'geometry': feature.shape.__geo_interface__,
            'properties': feature.properties
        }
        return jsonify(data)
    else:
        return abort(404)

# UPDATE name, label, geom
# DELETE feature()
# @auth_required
def feature_update(feature):
    json = request.get_json()
    submitted = geojson.feature.Feature.to_instance(json)
    feature.name = submitted.properties.get('name', feature.name)
    feature.shape = asShape(submitted.geometry)
    tags = submitted.properties.get('tags')
    if tags:
        for tag, tag_value in tags.items():
            feature.tag(tag, tag_value)
    db.session.commit()
    return feature_get_geojson(feature)

@app.route(API_PREFIX + "/feature/<int:id>/tag", methods=[ 'POST' ])
@cross_origin()
@auth_required
def feature_tag(id):
    f = Feature.query.get(id)
    if f is None:
        return abort(404)
    # if tag already exit, update tag
    # otherwise, create tag
    data = request.get_json()

@app.route(API_PREFIX + "/feature/<int:id>/mark", methods=[ 'POST' ])
@cross_origin()
@auth_required
def feature_mark(id):
    f = Feature.query.get(id)
    if f is None:
        return abort(404)

@app.route(API_PREFIX + "/feature/<int:id>/geometry", methods=[ 'GET', 'POST' ])
@cross_origin()
@auth_required
def feature_geometry(id):
    f = Feature.query.get(id)
    if f is None:
        return abort(404)
    if request.method == 'GET':
        data = geojson.dumps(f.shape)
        return data, 200, { 'Content-Type': 'application/json' }


