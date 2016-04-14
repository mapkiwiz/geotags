# coding: utf-8

from flask.ext.wtf import Form
from wtforms import BooleanField, HiddenField, PasswordField, SubmitField, StringField, DateField, TextAreaField
from wtforms import validators, ValidationError

class CampaignInfoForm(Form):

	title = StringField('Titre', validators=[
			validators.DataRequired('Champ obligatoire')
		])
	description = TextAreaField('Description',
		render_kw={ "rows": 10 },
		validators=[
			validators.DataRequired('Champ obligatoire')
		])
	closing_at = DateField('Fin des contributions', validators=[
			validators.DataRequired('Champ obligatoire')
		])
	closed = BooleanField(u'Collecte fermée')

	submit = SubmitField('Enregistrer')