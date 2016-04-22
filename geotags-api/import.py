from main import app, db
from controllers.resolver import resolve_dbo
from shapely import wkb

dbo = resolve_dbo('token')

def to_tag(key, value, feature):                                       
    tag = dbo.Tag()
    tag.feature = feature
    tag.name = key
    tag.value = unicode(value)
    db.session.add(tag)
    return tag

cols = [ 'gid', 'pk', 'name', 'adresse', 'insee', 'commune', 'geom' ]
query = db.engine.execute(
    """
    SELECT gid, pk, str_nom as name, adr_gcd as adresse, insee, commune, st_transform(geom, 4326) as geom
    FROM import.eaje33
    """)

count = 0
for row in query:
    data = dict(zip(cols, row))
    f = dbo.Feature()
    f.gid = data['gid']
    f.name = data['name']
    f.shape = wkb.loads(data['geom'], hex=True)
    db.session.add(f)
    for key, value in zip(cols, row):
        if key not in ('gid', 'name', 'geom'):
            to_tag(key, value, f)
    count += 1

db.session.commit()

print count, "features imported"
