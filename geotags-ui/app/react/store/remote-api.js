var ExportFeatureAction = require('../export.js');

module.exports = function(config) {

    this.createNew = function(feature, options) {
        
        options = options || {};

        var latLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        var marker = this.dataLayer.options.pointToLayer(feature, latLng);
        feature.properties.name = 'Nouvel objet #1';
        feature.properties.tags = {
            adresse: feature.properties.label,
            created: 'yes'
        };
        
        if (options.zoom) {
            // map.setZoomAround(
            //     latLng,
            //     zoom,
            //     { animate: true }
            // );
            var zoom = Math.max(15, this.map.getZoom());
            this.map.setView(latLng, zoom, { animate: true });
        }

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
            appMessage.display("Enregistré (Nouveau)", "success", 300);
            feature.id = data.id;
            feature.properties = data.properties;
        }).error(function(xhr, a, msg) {
            appMessage.display("Une erreur est survenue pendant l'enregistrement des données", "danger");
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
            appMessage.display("Enregistré (Mise à jour)", "success", 300);
            feature.properties = data.properties;
        }).error(function(xhr, a, msg) {
            appMessage.display("Une erreur est survenue pendant l'enregistrement des données", "danger");
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

            var getDisplayClass = function(feature) {
                var classes = [ 'feature-marker' ];
                var tags = feature.properties.tags || {};
                if (tags.valid == '') {
                    classes.push('feature-marker-for-validation');
                } else if (tags.valid == 'no') {
                    classes.push('feature-marker-deleted');
                } else if (tags.valid == 'yes') {
                    if (tags.created == 'yes') {
                        classes.push('feature-marker-created');
                    } else if (tags.geometry_modified == 'yes') {
                        classes.push('feature-marker-modified');
                    } else {
                        classes.push('feature-marker-valid');
                    }
                }
                return classes.join(' ');
            };

            self.dataLayer = L.geoJson(data, {

                pointToLayer: function(feature, latLng) {
                    
                    var icon = L.divIcon({
                            className: getDisplayClass(feature),
                            html: '<span class="glyphicon glyphicon-map-marker"></span>',
                            iconSize: L.point(30, 30),
                            iconAnchor: L.point(16, 30)
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