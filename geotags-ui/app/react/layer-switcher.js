// var React = require('react');

var LayerEntry = React.createClass({

	select: function() {
		this.props.onSelect(this.props.value);
	},

	render: function() {
		if (this.props.value.selected) {
			return (
				<li className='selected' >
					{this.props.value.options.title}
					&nbsp;
					<span className="glyphicon glyphicon-ok"></span>
				</li>
			);
		} else {
			return (
				<li onClick={this.select} >
					{this.props.value.options.title}
				</li>
			);
		}
	}

});

var LayerSwitcher = React.createClass({

	getInitialState: function() {
		return { baseLayer: null };
	},

	componentDidMount: function() {
		this.changeBaseLayerTo(this.props.layers[0]);
	},

	changeBaseLayerTo: function(layer) {
		var map = this.props.map;
		if (this.state.baseLayer) {
			this.state.baseLayer.selected = false;
			map.removeLayer(this.state.baseLayer);
		}
		layer.addTo(map);
		layer.selected = true;
		this.setState({ baseLayer: layer });
	},

	render: function() {
		var self = this, items = this.props.layers.map(
			function(layer) {
				return (
					<LayerEntry key={layer.options.key} value={layer} onSelect={self.changeBaseLayerTo} />
				);
			});
		return (
			<div>
				<label className="label"><span>{this.props.title}</span></label>
				<ul className="list">
					{items}
				</ul>
			</div>
		);
	}

});

module.exports = LayerSwitcher;