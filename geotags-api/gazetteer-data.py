from bootstrap import db
from shapely.geometry import box
from geoalchemy2.functions import ST_Intersects, ST_Transform
from geoalchemy2.shape import from_shape
import json

def search_communes(bbox):

    coords = map(float, bbox.split(","))
    bbox_wkb = from_shape(box(*coords), 4326)

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
        .where(ST_Intersects(db.column('geom'), ST_Transform(bbox_wkb, 2154))) \
        .order_by(db.desc(db.column("population")))

    features = []
    for row in db.engine.execute(base):
        features.append({
                "code": row['insee_com'],
                "name": row['nom_comm'],
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
    return features

if __name__ == '__main__':
    communes = search_communes("-1.70013427734375,44.36804189293882,0.517730712890625,45.28358331101929")
    print json.dumps(communes)
