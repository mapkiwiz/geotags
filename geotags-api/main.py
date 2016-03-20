from controllers import *
from bootstrap import app, db
from flask import redirect
from flask_user import UserManager, SQLAlchemyAdapter, current_user
from models import User, UserInvitation

__all__ = [ 'app', 'db', 'user_manager' ]

app.secret_key = '\xf7_\x8b@+\x94=m\\\xb6\xa0X\xaa\xe7\xbcjH\x05W\x95\x8a\xf4\x8aa'
user_adapter = SQLAlchemyAdapter(db, User, UserInvitationClass=UserInvitation)
user_manager = UserManager(user_adapter, app)

@app.route('/')
def index():
	if current_user.is_authenticated:
		return redirect('/static/main.html')
	else:
		return redirect('/static/index.html')

# Start development web server
if __name__== '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
