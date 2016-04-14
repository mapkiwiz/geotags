from flask import redirect, render_template, abort, request, url_for
from flask_user import current_user, login_required
from flask_babel import format_date
from flask.helpers import safe_join, send_from_directory
from models.meta import Campaign
from bootstrap import app, db
from config import GEOTAGS_API_PREFIX
import os
from forms import CampaignInfoForm

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

@app.route('/<key>:<token>/')
@app.route('/<key>:<token>/admin')
# @login_required
def admin(key, token):
	""" Administration view """
	c = Campaign.query.get(key)
	if c is None:
		return abort(404)
	if token != c.admin_token:
		return abort(403)

	return render_template('admin.html',
		token=key,
		campaign=c)

@app.route('/<key>:<token>/describe', methods=[ 'GET', 'POST' ])
# @login_required
def describe(key, token):
	""" Edit data campaign description """
	c = Campaign.query.get(key)
	if c is None:
		return abort(404)
	if token != c.admin_token:
		return abort(403)
	form = CampaignInfoForm(request.form)

	if request.method == 'POST' and form.validate():
		c.title = form.title.data
		c.description = form.description.data
		c.closing_at = form.closing_at.data
		c.closed = form.closed.data
		db.session.commit()
		return redirect(url_for('admin', key=key, token=token))

	if request.method == 'GET':
		form.title.data = c.title
		form.description.data = c.description
		form.closing_at.data = c.closing_at
		form.closed.data = c.closed
	return render_template('describe.html',
		form=form,
		title="Modifier la description de la collecte")

@app.route('/<key>/')
@app.route('/<key>/tags')
def tags(key):

	c = Campaign.query.get(key)
	if c is None:
		return abort(404)

	if not current_user.is_authenticated:
		return redirect(url_for('login', key=key))

	return render_template('geotags.html',
		token=key,
		title=c.title,
		api_prefix=GEOTAGS_API_PREFIX)

@app.route('/<key>/login')
def login(key):

	c = Campaign.query.get(key)
	if c is None:
		return abort(404)

	return render_template('login.html',
		token=key,
		title=c.title,
		description=c.description,
		username=c.admin.username,
		closing_at=format_date(c.closing_at))

@app.route('/<key>/<path:filename>')
def assets(key, filename):
	if filename == 'login':
		return login(key)
		# return ui('login.html')
	elif filename == 'tags':
		return tags(key)
		# return ui('geotags.html')
	else:
		components = filename.split('/')
		prefix = components[0]
		if prefix in [ 'scripts', 'images', 'styles', 'fonts', 'images', 'data', 'js', 'bower_components' ]:
			return ui(filename)
	return abort(404)