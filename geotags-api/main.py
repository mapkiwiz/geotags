from bootstrap import app, db
from flask import redirect, url_for, abort, render_template
from flask_user import UserManager, SQLAlchemyAdapter, current_user
from flask_babel import Babel
from models.meta import Campaign
from models.users import User, UserInvitation
from controllers import *
from proxy import ReverseProxied
from config import GEOTAGS_API_PREFIX

__all__ = [ 'app', 'db', 'user_manager' ]

app.secret_key = '\xf7_\x8b@+\x94=m\\\xb6\xa0X\xaa\xe7\xbcjH\x05W\x95\x8a\xf4\x8aa'
user_adapter = SQLAlchemyAdapter(db, User, UserInvitationClass=UserInvitation)
user_manager = UserManager(user_adapter, app)

app.wsgi_app = ReverseProxied(app.wsgi_app)

app.register_blueprint(auth.auth_api, url_prefix="%s/auth" % GEOTAGS_API_PREFIX)

babel = Babel(app, default_locale='fr')


# @app.route('/')
# def index():
# 	if current_user.is_authenticated:
# 		return render_template('main.html')
# 	else:
# 		form = user_manager.login_form()
# 		return render_template('login.html', form=form)

# Start development web server
if __name__== '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
