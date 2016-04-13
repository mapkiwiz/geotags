from flask import redirect, render_template, abort
from flask_login import current_user
from flask.helpers import safe_join, send_from_directory
from models.meta import Campaign
from bootstrap import app
from config import GEOTAGS_API_PREFIX
import os

@app.route('/')
def index():
	if current_user.is_authenticated:
		return redirect(url_for('static', filename='main.html'))
	else:
		return redirect(url_for('static', filename='index.html'))

ui_webroot = [ 'ui/app', 'ui/.tmp', 'ui' ]
# ui_webroot = [ 'ui/dist' ]

@app.route('/ui/<path:filename>')
def ui(filename):
	for webroot in ui_webroot:
		path = safe_join(webroot, filename)
		if os.path.isfile(path):
			return send_from_directory(webroot, filename)
	return abort(404)

@app.route('/<key>/<path:filename>')
def assets(key, filename):
	if filename == 'login':
		c = Campaign.query.get(key)
		if c is None:
			return abort(404)
		return render_template('login.html',
			token=key,
			title=c.title,
			description=c.description,
			username=c.admin.username,
			closing_at=c.closing_at)
		# return ui('login.html')
	elif filename == 'tags':
		c = Campaign.query.get(key)
		if c is None:
			return abort(404)
		return render_template('geotags.html',
			token=key,
			title=c.title,
			api_prefix=GEOTAGS_API_PREFIX)
		# return ui('geotags.html')
	else:
		components = filename.split('/')
		prefix = components[0]
		if prefix in [ 'scripts', 'images', 'styles', 'fonts', 'images', 'data', 'js', 'bower_components' ]:
			return ui(filename)
	return abort(404)