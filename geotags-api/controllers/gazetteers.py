from bootstrap import app, db
from config import API_PREFIX, GAZETTEER_MAX_RESULTS
from flask import request, stream_with_context, Response, jsonify
from shapely.geometry import box
from geoalchemy2.functions import ST_Intersects, ST_Transform
from geoalchemy2.shape import from_shape

@app.route(API_PREFIX + '/search/communes', methods=[ 'GET' ])
def search_communes():
    query = request.args.get('q')
    if not query:
        return 'Bad Request', 401
    query = query.upper()
    table = db.table('communes',
                db.column('insee_com'),
                db.column('nom_comm'),
                db.column('x_min'),
                db.column('y_min'),
                db.column('x_max'),
                db.column('y_max'))
    table.schema = 'geofla'
    base = db.select(
            [ table ]) \
        .where(db.column('nom_comm').contains(query)) \
        .order_by(
            db.desc(db.column('nom_comm').startswith(query)),
            db.desc(db.column("population"))) \
        .limit(GAZETTEER_MAX_RESULTS)
    # Add BBOX support
    # http://localhost:5000/v1/search/communes?q=BO&bbox=-1.4845,44.5004,0.3021,45.1539
    bbox = request.args.get('bbox')
    if bbox:
        coords = map(float, bbox.split(","))
        bbox_wkb = from_shape(box(*coords), 4326)
        base = base.where(ST_Intersects(db.column('geom'), ST_Transform(bbox_wkb, 2154)))
    features = []
    for row in db.engine.execute(base):
        features.append({
                "code": row['insee_com'],
                "text": row['insee_com'] + ' ' + row['nom_comm'],
                "south_west": { 
                        "lon" : round(row['x_min'], 6),
                        "lat": round(row['y_min'], 6)
                    },
                "north_east": {
                        "lon": round(row['x_max'], 6),
                        "lat": round(row['y_max'], 6)
                    }
            })
    return jsonify({
            "max_results": GAZETTEER_MAX_RESULTS,
            "results": features
        })

def toto():
    @stream_with_context
    def generate():
        query = request.args['q'].upper()
        table = db.table('communes',
                    db.column('insee_com'),
                    db.column('nom_comm'),
                    db.column('envelope_json'))
        table.schema = 'geofla'
        base = db.select(
                [ table ]) \
            .where(db.column('nom_comm').contains(query)) \
            .order_by(db.desc(db.column('nom_comm').startswith(query)), db.column('nom_comm')) \
            .limit(10)
        yield '{ "type": "FeatureCollection", "features": [\n'
        for result in db.engine.execute(base):
            properties = '{ "text": ' + result[0] + ' ' + result[1] + '}'
            data = {
                "properties": properties,
                "geometry": result[2]
            }
            yield '{"type": "Feature", "properties": %(properties)s, "geometry": %(geometry)s },\n' % data
        yield ']}'
    return Response(generate(), 200, { 'Content-Type': 'application/json' })
