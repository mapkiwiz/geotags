var ExportFeatureAction = require('../export.js');

module.exports = function(config) {

    this.createNew = function(feature) {
        console.log(this);
        var zoom = Math.max(15, this.map.getZoom());
        var latLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        var marker = this.dataLayer.options.pointToLayer(feature, latLng);
        feature.properties.name = 'New Feature #1';
        feature.properties.tags = {
            adresse: feature.properties.label,
            created: 'yes'
        };
        // map.setZoomAround(
        //     latLng,
        //     zoom,
        //     { animate: true }
        // );
        this.map.setView(latLng, zoom, { animate: true });
        marker.addTo(this.dataLayer);
        this.dataLayer.options.onEachFeature(feature, marker);
        this.editor.selectFeature(feature, marker);
    };

    var doCreate = function(feature) {

        $.ajax({
            url: config.services.data.create,
            method: 'PUT',
            data: JSON.stringify(feature),
            dataType: 'json',
            contentType: "application/json; charset=utf-8"
        }).success(function(data) {
            console.log('Ok/Created');
            feature.id = data.id;
            feature.properties = data.properties;
        });

    };

    var doSave = function(feature) {

        var object_url = config.services.data.modify.replace(/{id}/, feature.id);

        $.ajax({
            url: object_url,
            method: 'POST',
            data: JSON.stringify(feature),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
        }).success(function(data) {
            console.log('Ok/Updated');
            feature.properties = data.properties;
        });

    };

    this.saveToBackend = function(feature) {
        console.log("Saving to backend ...");
        console.log(feature);
        if (feature.id) {
            doSave(feature);
        } else {
            doCreate(feature);
        }
    };

    this.addTo = function(map, editor) {

        var self = this;
        this.map = map;
        this.editor = editor;
        this.dataLayer = undefined;

        $.getJSON(config.services.data.all, function(data) {
            self.dataLayer = L.geoJson(data, {      
                pointToLayer: function(feature, latLng) {
                    var icon = L.divIcon({
                            className: 'feature-marker',
                            html: '<span class="glyphicon glyphicon-map-marker"></span>',
                            iconSize: L.point(30, 30),
                            iconAnchor: L.point(15, 30)
                        });
                    return L.marker(latLng, {icon: icon});
                },

                onEachFeature: function(feature, marker) {

                    marker.bindLabel(feature.properties.name, {
                        pane: map.getPanes().popupPane,
                        direction: 'auto' });

                    marker.on("click", function(e) {
                        editor.selectFeature(feature, marker);
                    });

                    marker.on("dragend", function(e) {
                        editor.setGeometry(marker.toGeoJSON().geometry);
                    });

                }

            }).addTo(map);
        });

        $('#action-export').click(function(e) {
            e.preventDefault();
            $.getJSON(config.services.export.url, function(data) {
                var exporter = new ExportFeatureAction();
                exporter.triggerDownload([ JSON.stringify(data) ], config.export.filename);
            });
        });

    };

};