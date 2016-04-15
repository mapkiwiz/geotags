import TileStache
import ModestMaps
from bootstrap import app
from flask import abort
from flask.helpers import send_file
from io import BytesIO

GEOREF_BASE_URL = "http://georef.application.i2/cartes/mapserv?"
GEOREF_WMS_TEMPLATE = GEOREF_BASE_URL + "service=WMS&version=1.3.0&request=GetMap&layers=%(layers)s&crs=EPSG:4326&bbox=$ymin,$xmin,$ymax,$xmax&width=$width&height=$height&format=%(format)s&transparent=true"

config = {
    "cache": {
        "name": "Disk",
        "path": "/tmp/stache",
        "umask": "0000",
        "dirs": "safe",
        "gzip": [ "xml", "json" ],
        "verbose": True
    },
    "layers": {
        "georef-scan25": {
            "provider": {
                "name": "url template",
                "template": GEOREF_WMS_TEMPLATE % { "layers": "scan25", "format": "image/png" },
                "source projection": "WGS84"
            },
            "projection": "spherical mercator"
        },
        "georef-fla": {
            "provider": {
                "name": "url template",
                "template": GEOREF_WMS_TEMPLATE % { "layers": "limites_administratives", "format": "image/png" },
                "source projection": "WGS84"
            },
            "projection": "spherical mercator"
        },
    },
    # "logging": "debug"
}

tileconfig = TileStache.Config.buildConfiguration(config)

@app.route('/wms/proxy/<layer>/<int:z>/<int:x>/<int:y>')
def wms(layer,x,y,z):
    if not tileconfig.layers.has_key(layer):
        return abort(404)
    coord = ModestMaps.Core.Coordinate(y,x,z)
    type, bytes = TileStache.getTile(tileconfig.layers[layer], coord, 'png')
    buf = BytesIO(bytes)
    return send_file(buf, mimetype=type)
