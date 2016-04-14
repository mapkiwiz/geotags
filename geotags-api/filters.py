from flask_babel import format_date
from markdown import markdown
from bootstrap import app

@app.template_filter('date')
def date_filter(date):
    return format_date(date)

@app.template_filter('markdown')
def markdown_filter(text):
	return markdown(text)