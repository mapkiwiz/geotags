from bootstrap import db, app

__all__ = [ 'FeatureType', 'TagDefinition', 'TagValue', 'FeatureTypeTags', 'Campaign' ]

# Meta Model

FeatureTypeTags = db.Table('feature_type_tags',
    db.metadata,
    db.Column('feature_type_id', db.Integer, db.ForeignKey('feature_type.id')),
    db.Column('tag_definition_id', db.Integer, db.ForeignKey('tag_definition.id'))
)

class FeatureType(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    # schema = db.Column(db.String, length=32)
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

class Campaign(db.Model):

    # QeBWZ8BZBozoT8y
    id = db.Column(db.String(length=8), primary_key=True)
    title = db.Column(db.String(length=100))
    description = db.Column(db.Text)
    schema = db.Column(db.String(length=32))
    # feature_type_id = db.Column(db.Integer, db.ForeignKey('feature_type.id'))
    # feature_type = db.relationship('FeatureType')
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    admin = db.relationship('User')
    admin_token = db.Column(db.String(length=16))
    created_at = db.Column(db.Date)
    closing_at = db.Column(db.Date)
    closed = db.Column(db.Boolean)

