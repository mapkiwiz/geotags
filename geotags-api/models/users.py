from bootstrap import db, app
from flask_user import UserMixin

__all__ = [ 'User', 'UserInvitation' ]

# User management

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