from flask_babel import format_date
from bootstrap import app

@app.template_filter('date')
def date_filter(date):
    return format_date(date)