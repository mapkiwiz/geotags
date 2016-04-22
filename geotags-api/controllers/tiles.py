import TileStache
import ModestMaps
from bootstrap import app
from flask import abort
from flask.helpers import send_file
from io import BytesIO

config = {
    "cache": {
        "name": "Disk",
        "path": "/tmp/stache/tiles",
        "umask": "0000",
        "dirs": "safe",
        "gzip": [ "xml", "json" ],
        "verbose": True
    },
    "layers": {
        "communes": {
            "provider": {
	        "name": "mapnik",
                "mapfile": "mapnik/communes.xml"
            },
            "projection": "spherical mercator"
	    },
    },
    # "logging": "debug"
}

tileconfig = TileStache.Config.buildConfiguration(config)

@app.route('/tiles/<layer>/<int:z>/<int:x>/<int:y>')
def tiles(layer,x,y,z):
    if not tileconfig.layers.has_key(layer):
        return abort(404)
    coord = ModestMaps.Core.Coordinate(y,x,z)
    type, bytes = TileStache.getTile(tileconfig.layers[layer], coord, 'png')
    buf = BytesIO(bytes)
    return send_file(buf, mimetype=type)
