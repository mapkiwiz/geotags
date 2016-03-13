from controllers import *
from bootstrap import app

# Start development web server
if __name__== '__main__':
    app.secret_key = '\xf7_\x8b@+\x94=m\\\xb6\xa0X\xaa\xe7\xbcjH\x05W\x95\x8a\xf4\x8aa'
    app.run(host='0.0.0.0', port=5000, debug=True)
