from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail

__all__ = [ 'app', 'db', 'mail' ]

app = Flask("geotags-api")
app.config.from_pyfile('config.py')

db = SQLAlchemy(app)
mail = Mail(app)