var ExportFeatureAction = function() {};

ExportFeatureAction.prototype = {

    keys: [ 'name', 'version' ],
    tags: [ 'insee', 'commune', 'pk', 'adresse', 'annotation', 'valid', 'created' ],

    exportFeatures: function(collection, filename) {

        var flattenedFeatures = [], self = this;
        collection.forEach(function(d) {
            flattenedFeatures.push(self.flatten(d));
        });

        var data = [ JSON.stringify({
                    type: "FeatureCollection",
                    features: flattenedFeatures
                }) ];

        this.triggerDownload(data, filename);

    },

    flatten: function(feature) {

        var flat_props = {},
            other_tags = {},
            properties = feature.properties,
            flattened;

        for(var key in properties.tags) {
            if (properties.tags.hasOwnProperty(key)) {
                if (this.tags.indexOf(key) >= 0) {
                    flat_props[key] = properties.tags[key]
                } else {
                    other_tags[key] = properties.tags[key];
                }
            }
        }

        for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
                if (this.keys.indexOf(key) >= 0) {
                    flat_props[key] = properties[key];
                }
            }
        }

        flat_props.tags = other_tags;

        flattened = $.extend(true, {}, feature);
        flattened.properties = flat_props;
        return flattened;

    },

    triggerDownload: function(data, filename) {

        var mimeType = "application/json;charset=utf-8;";
        var blob = new Blob(data, { type: mimeType });
        var fileName = filename;

        if (window.navigator.msSaveOrOpenBlob) {

          window.navigator.msSaveBlob(blob, fileName);

        } else {

          var downloadLink = document.createElement("a");
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.download = fileName;

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

        }

    }

};

module.exports = ExportFeatureAction;