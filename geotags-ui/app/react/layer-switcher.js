// var React = require('react');

var LayerEntry = React.createClass({

	contextTypes: {
		dispatcher: React.PropTypes.object
	},

	getInitialState: function() {
		return { selected: false };
	},

	componentDidMount: function() {
		var self = this;
		this.dispatchToken = this.context.dispatcher.register(function(e) {
			if (e.type == 'select-layer') {
				if (e.key == self.props.value.options.key) {
					self.setState({ selected: true });
				} else {
					self.setState({ selected: false });
				}
			}
		});
	},

	componentWillUnmount: function() {
		this.context.dispatcher.unregister(this.dispatchToken);
	},

	select: function(e) {
		e.preventDefault();
		// this.props.onSelect(this.props.value);
		this.context.dispatcher.dispatch({
			type: 'select-layer',
			key: this.props.value.options.key,
			layer: this.props.value
		});
	},

	unselect: function(e) {
		e.preventDefault();
		this.context.dispatcher.dispatch({
			type: 'unselect-layer',
			key: this.props.value.options.key,
			layer: this.props.value
		})
		this.setState({ selected: false });
	},

	render: function() {
		if (this.state.selected) {
			return (
				<li className='selected' onClick={this.unselect} >
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
		return { baseLayer: undefined };
	},

	componentWillMount: function() {
		this.dispatcher = new Flux.Dispatcher();
	},

	componentDidMount: function() {
		var self = this;
		this.dispatchToken = this.dispatcher.register(
			function(e) {
				if (e.type == 'select-layer') {
					self.changeActiveLayerTo(e.layer);
				} else if (e.type == 'unselect-layer') {
					self.state.baseLayer = undefined;
					self.group.removeLayer(e.layer);
				}
			});
		var baseLayer = this.props.layers[0];
		// TODO add layerGroup
		this.group = L.layerGroup().addTo(this.props.map);
		this.dispatcher.dispatch({
			type: 'select-layer',
			key: baseLayer.options.key,
			layer: baseLayer
		});
	},

	componentWillUnmount: function() {
		this.dispatcher.unregister(this.dispatchToken);
	},

	changeActiveLayerTo: function(layer) {
		if (this.state.baseLayer) {
			this.group.removeLayer(this.state.baseLayer);
		}
		this.state.baseLayer = layer;
		// layer.addTo(map);
		this.group.addLayer(layer);
	},

	childContextTypes: {
		dispatcher: React.PropTypes.object
	},

	getChildContext: function() {
		return {
			dispatcher: this.dispatcher,
		}
	},

	render: function() {
		var self = this;
		var items = this.props.layers.map(
			function(layer) {
				return (
					<LayerEntry key={layer.options.key} value={layer} />
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