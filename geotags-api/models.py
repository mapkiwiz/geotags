from bootstrap import db, app
from geoalchemy2 import Geometry, shape
from sqlalchemy.dialects.postgresql import HSTORE
from datetime import datetime

# Generic Model

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

class Feature(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    gid = db.Column(db.Integer)
    name = db.Column(db.String)
    label = db.Column(db.Text)
    # rendering = db.Column(db.String)
    geom = db.Column(Geometry('POINT', srid=4326))
    version = db.Column(db.Integer, db.Sequence('feature_version_seq'))
    timestamp = db.Column(db.TIMESTAMP)
    shape = ShapeProperty()

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
        self.version = db.engine.execute("SELECT nextval('feature_version_seq')").scalar()
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

@db.event.listens_for(Feature, 'before_insert')
def feature_before_insert(mapper, connection, target):
    target.stamp()

@db.event.listens_for(Feature, 'before_update')
def feature_before_update(mapper, connection, target):
    if db.object_session(target).is_modified(target):
        target.stamp()

class Tag(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    value = db.Column(db.Text)
    feature_id = db.Column(db.Integer, db.ForeignKey('feature.id'))
    feature = db.relationship('Feature', backref=db.backref('tags'))

    def __repr__(self):
        return u"Tag <%s:%s>" % (self.name.encode('utf-8'), self.value.encode('utf-8'))

class ChangeSet(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.Integer)
    timestamp = db.Column(db.TIMESTAMP)
    feature_id = db.Column(db.Integer, db.ForeignKey('feature.id'))
    feature = db.relationship('Feature', backref=db.backref('changes'))
    values = db.Column(HSTORE)

# Meta Model

FeatureTypeTags = db.Table('feature_type_tags',
    db.metadata,
    db.Column('feature_type_id', db.Integer, db.ForeignKey('feature_type.id')),
    db.Column('tag_definition_id', db.Integer, db.ForeignKey('tag_definition.id'))
)

class FeatureType(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.Text)
    table = db.Column(db.String)
    tags = db.relationship('TagDefinition', secondary=FeatureTypeTags, back_populates="implementing_features")

class TagDefinition(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.Text)
    implementing_features = db.relationship('FeatureType', secondary=FeatureTypeTags, back_populates='tags')

class TagValue(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    tag_definition_id = db.Column(db.Integer, db.ForeignKey('tag_definition.id'))
    tag_definition = db.relationship('TagDefinition', backref=db.backref('values'))
    value = db.Column(db.Text)

# User management

from flask_user import UserMixin

class User(db.Model, UserMixin):

    id = db.Column(db.Integer, primary_key=True)

    # User Authentication information
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False, default='')
    reset_password_token = db.Column(db.String(100), nullable=False, default='')

    # User Email information
    email = db.Column(db.String(255), nullable=False, unique=True)
    confirmed_at = db.Column(db.DateTime())

    # User information
    is_enabled = db.Column(db.Boolean(), nullable=False, default=False)
    first_name = db.Column(db.String(50), nullable=False, default='')
    last_name = db.Column(db.String(50), nullable=False, default='')

    def is_active(self):
      return self.is_enabled

class UserInvitation(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    invited_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    email = db.Column(db.String(255), nullable=False)
    token =  db.Column(db.String(100), nullable=False, default='')

    # invited_by_user = db.relationship('User')