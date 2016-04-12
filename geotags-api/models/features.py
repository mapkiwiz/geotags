from bootstrap import db, app
from geoalchemy2 import Geometry, shape
from sqlalchemy.dialects.postgresql import HSTORE
from datetime import datetime
from users import User

class ShapeProperty(object):

    def __init__(self, column='geom', srid=4326):
        self.column = column
        self.srid = srid

    def __get__(self, obj, type=None):
        geom = obj.__getattribute__(self.column)
        return geom is not None and shape.to_shape(obj.geom) or None

    def __set__(self, obj, value):
        if value:
            obj.__setattr__(self.column, shape.from_shape(value, srid=self.srid))
        else:
            obj.__setattr__(self.column, None)

def feature_model_factory(schema):
    """ Generic model """

    class Feature(db.Model):

        def __new__(cls):
            s = super(Feature).__new__(cls)
            s.__name__ = "Feature_%s" % schema
            return s

        __table_args__ = {
            'schema': schema
        }

        id = db.Column(db.Integer, primary_key=True)
        gid = db.Column(db.Integer)
        name = db.Column(db.String)
        label = db.Column(db.Text)
        # rendering = db.Column(db.String)
        geom = db.Column(Geometry('POINT', srid=4326))
        shape = ShapeProperty()
        version = db.Column(db.Integer, db.Sequence('feature_version_seq', schema=schema))
        timestamp = db.Column(db.TIMESTAMP)
        last_contributor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
        last_contributor = db.relationship('User')

        def tag(self, tag_name, value):
            tags = dict([ (tag.name, tag) for tag in self.tags ])
            tag = tags.get(tag_name, None)
            if tag:
                tag.value = value
            else:
                tag = Tag()
                tag.feature = self
                tag.name = tag_name
                tag.value = value
                db.session.add(tag)

        def annotate(self, annotation):
            self.tag('annotation', annotation)

        def stamp(self):
            self.version = db.engine.execute("SELECT nextval('%s.feature_version_seq')" % schema).scalar()
            self.timestamp = datetime.now()
            return self

        def __repr__(self):
            return 'Feature <%d> %s' % (self.id, self.name.encode('utf-8'))

        @property
        def properties(self):
            data = dict({
                    'name': self.name,
                    'label': self.label,
                    'version': self.version,
                    'timestamp': self.timestamp.isoformat(),
                })
            tags = dict([ (tag.name, tag.value) for tag in self.tags ])
            data['tags'] = tags
            return data

    class Tag(db.Model):

        __name__ = 'Tag_%s' % schema
        __table_args__ = {
            'schema': schema
        }

        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String)
        value = db.Column(db.Text)
        feature_id = db.Column(db.Integer, db.ForeignKey(schema + '.feature.id'))
        feature = db.relationship('Feature', backref=db.backref('tags'))

        def __repr__(self):
            return u"Tag <%s:%s>" % (self.name.encode('utf-8'), self.value.encode('utf-8'))

    class ChangeSet(db.Model):

        __name__ = "ChangeSet_%s" % schema
        __table_args__ = {
            'schema': schema
        }

        id = db.Column(db.Integer, primary_key=True)
        timestamp = db.Column(db.TIMESTAMP)
        contributor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
        contributor = db.relationship('User')
        feature_id = db.Column(db.Integer, db.ForeignKey(schema + '.feature.id'))
        feature = db.relationship('Feature', backref=db.backref('changes'))
        values = db.Column(HSTORE)

    @db.event.listens_for(Feature, 'before_insert')
    def feature_before_insert(mapper, connection, target):
        target.stamp()

    @db.event.listens_for(Feature, 'before_update')
    def feature_before_update(mapper, connection, target):
        if db.object_session(target).is_modified(target):
            target.stamp()

    return (Feature, Tag, ChangeSet, feature_before_insert,  feature_before_update)


class FeatureDBO(object):

    def __init__(self, schema):
        (self.Feature, self.Tag, self.ChangeSet,
            self.insert_listener, self.update_listener) = feature_model_factory(schema)
        self.schema = schema

    def __del__(self):
        if db is not None:
            db.event.remove(self.Feature, 'before_insert', self.insert_listener)
            db.event.remove(self.Feature, 'before_update', self.update_listener)

    def __repr__(self):
        return "FeatureDBO <%s>" % self.schema



