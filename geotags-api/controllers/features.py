from flask import Response, jsonify, request, abort, redirect, url_for
from flask_cors import cross_origin
from flask_user import current_user
from functools import wraps
from bootstrap import app, db
from resolver import resolve_dbo
from config import GEOTAGS_API_PREFIX
from shapely.geometry import asShape
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

def flatten(props, keys, tags):
    flat_props = dict()
    other_tags = dict()
    for k,v in props.get('tags').items():
        if k in tags:
            flat_props[k] = v
        else:
            other_tags[k] = v
    for k,v in props.items():
        if k in keys:
            flat_props[k] = v
    flat_props['tags'] = other_tags
    return flat_props


@app.route(GEOTAGS_API_PREFIX + '/<key>/export/points.geojson')
def export_all_features(key):

    dbo = resolve_dbo(key)
    if dbo is None:
        return abort(404)

    keys = [ 'name', 'version' ]
    tags = [ 'insee', 'commune', 'pk', 'adresse', 'comment', 'valid' ]
    query = dbo.Feature.query.all()
    features = []
    for f in query:
        feature = {
            'type': 'Feature',
            'id': f.id,
            'properties': flatten(f.properties, keys, tags),
            'geometry': f.shape.__geo_interface__
        }
        features.append(feature)
    response = jsonify({
            'type': 'FeatureCollection',
            'features': features
        })
    return response

@app.route(GEOTAGS_API_PREFIX + '/<key>/features.geojson', methods = [ 'GET' ])
@app.route(GEOTAGS_API_PREFIX + '/<key>/features', methods=[ 'GET', 'PUT' ])
def features(key):

    if request.method == 'GET':
        return features_get(key)

    elif request.method == 'PUT':
        return feature_create(key)

def features_get(key):

    dbo = resolve_dbo(key)
    if dbo is None:
        return abort(404)

    query = dbo.Feature.query.all()
    features = []
    for f in query:
        feature = {
            'type': 'Feature',
            'id': f.id,
            'properties': f.properties,
            'geometry': f.shape.__geo_interface__
        }
        features.append(feature)
    response = jsonify({
            'type': 'FeatureCollection',
            'features': features
        })
    return response


@auth_required
def feature_create(key):

    dbo = resolve_dbo(key)
    if dbo is None:
        return abort(404)

    json = request.get_json()
    submitted = geojson.feature.Feature.to_instance(json)
    new_feature = dbo.Feature()
    new_feature.name = submitted.properties.get('name')
    new_feature.shape = asShape(submitted.geometry)
    tags = submitted.properties.get('tags')
    if tags:
        for tag, tag_value in tags.items():
            new_feature.tag(tag, tag_value)
    db.session.add(new_feature)
    db.session.commit()
    return (feature_as_geojson(new_feature), 201)

# @app.route(GEOTAGS_API_PREFIX + "/feature/<int:id>", methods=[ 'GET' ])
# def feature(id):
#     f = Feature.query.get(id)
#     if f is None:
#         return abort(404)
#     if request.method == 'GET':
#         return feature_get(f)
#     elif request.method == 'POST':
#         return feature_update(f)

# def feature_get(feature):
#     return jsonify(feature.properties)

@app.route(GEOTAGS_API_PREFIX + "/<key>/feature/<int:id>.geojson", methods=[ 'GET', 'POST' ])
# @cross_origin()
def feature(key, id):

    dbo = resolve_dbo(key)
    if dbo is None:
        return abort(404)

    f = dbo.Feature.query.get(id)
    if f is None:
        return abort(404)
    if request.method == 'GET':
        return feature_as_geojson(f)
    elif request.method == 'POST':
        return feature_update(f)

def feature_as_geojson(feature):
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
@auth_required
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
    return feature_as_geojson(feature)

# TODO Not yet implemented methods

# @app.route(GEOTAGS_API_PREFIX + "/feature/<int:id>/tag", methods=[ 'POST' ])
# # @cross_origin()
# @auth_required
# def feature_tag(id):
#     f = Feature.query.get(id)
#     if f is None:
#         return abort(404)
#     # if tag already exit, update tag
#     # otherwise, create tag
#     data = request.get_json()

# @app.route(GEOTAGS_API_PREFIX + "/feature/<int:id>/mark", methods=[ 'POST' ])
# # @cross_origin()
# @auth_required
# def feature_mark(id):
#     f = Feature.query.get(id)
#     if f is None:
#         return abort(404)
#     # TODO implement mark method
#     return abort(201)

# @app.route(GEOTAGS_API_PREFIX + "/feature/<int:id>/geometry", methods=[ 'GET', 'POST' ])
# # @cross_origin()
# @auth_required
# def feature_update_geometry(id):
#     f = Feature.query.get(id)
#     if f is None:
#         return abort(404)
#     if request.method == 'GET':
#         data = geojson.dumps(f.shape)
#         return data, 200, { 'Content-Type': 'application/json' }


