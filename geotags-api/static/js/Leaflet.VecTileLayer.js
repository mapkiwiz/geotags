L.TileLayer.VecTileLayer = L.TileLayer.extend({

    onAdd: function(map) {
        var self = this;
        L.TileLayer.prototype.onAdd.call(this, map);
        this.container = L.featureGroup().addTo(map);
        this.on("tileunload", function(d) {
            if (d.tile.xhr) {
                d.tile.xhr.abort();
                d.tile.xhr = null;
            }
            if (d.tile.featureGroup) {
                // d.tile.featureGroup.getLayers().forEach(function(layer) {
                //     d.tile.featureGroup.removeLayer(layer);
                // });
                self.container.removeLayer(d.tile.featureGroup);
                d.tile.featureGroup = null;
            }
        });
    },

    _loadTile: function(tile, tilePoint) {
        var url, self = this;
        this._adjustTilePoint(tilePoint);
        url = this.getTileUrl(tilePoint);
        if (!tile.xhr) {
            tile.xhr = $.getJSON(url, function(data) {
                tile.featureGroup = L.geoJson(data, {
                    onEachFeature: function(feature, marker) {
                        marker.on("click", function(e) {
                            marker.dragging.enable();
                        });
                    }
                });
                tile.featureGroup.addTo(self.container);
                tile.xhr = null;
            });
        }
    }

});

L.TileLayer.vectileLayer = function(template_url) {
    var layer = new L.TileLayer.VecTileLayer(template_url);
    return layer;
};