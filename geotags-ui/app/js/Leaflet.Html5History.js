(function() {

	var pendingMoves = [];

	L.Control.Html5History = L.Control.extend({

		onAdd: function(map) {
			// L.Control.prototype.onAdd.call(this, map);
			this.saveInitialView(map);
			map.on('moveend', this.trackMove, this);
			window.addEventListener('popstate', this.restoreView.bind(this));
			return L.DomUtil.create('div');
		},

		onRemove: function(map) {
			map.off('moveend', this.trackMove);
			window.removeEventListener('popstate', this.restoreView);
		},

		toQueryParams: function(view) {
			return [ L.Util.formatNum(view.center.lng, 4), L.Util.formatNum(view.center.lat, 4) ].join(",") + '@' + view.zoom;
		},

		trackMove: function(e) {
			if (pendingMoves.length > 0) {
				pendingMoves.pop();
				return;
			}
			var map = e.target;
			var view = {
				center: map.getCenter(),
				zoom: map.getZoom()
			};
			window.history.pushState(view, document.title, "#" + this.toQueryParams(view));
		},

		restoreView: function(e) {
			pendingMoves.push(e.state);
			this._map.setView(e.state.center, e.state.zoom, { animate: true });
			return true;
		},

		saveInitialView: function(map) {
			var view = {
				center: map.getCenter(),
				zoom: map.getZoom()
			};
			window.history.replaceState(view, "GeoTags", "#" + this.toQueryParams(view));
			this.initialView = view;
		},

	});

})();