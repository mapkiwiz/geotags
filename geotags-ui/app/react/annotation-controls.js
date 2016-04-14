module.exports = {};

module.exports.Property = React.createClass({

	render: function() {
		return (
			<div>
				<label className="label">
					<span>
						{this.props.label}
					</span>
				</label>
				<div className={this.props.className}>
					{this.props.value}
				</div>
			</div>
		);
	}

});

module.exports.EditableProperty = React.createClass({

	mixins: [ React.addons.LinkedStateMixin ],
	has_change: false,

	getInitialState: function() {
		return {
			value: this.property(this.props.feature)
		}
	},

	componentDidMount: function() {
		this.props.listenTo.on('selectionchanged', this.onSelectionChanged);
		this.props.listenTo.on('beforesave', this.saveToFeature);
	},

	componentWillUnmount: function() {
		this.props.listenTo.off('selectionchanged', this.onSelectionChanged);
		this.props.listenTo.off('beforesave', this.saveToFeature);
	},

	property: function(obj) {
		var value = obj.properties;
		this.props.property.split('.').forEach(function(p) {
			if (value != undefined) {
				value = value[p];
			}
		});
		return value;
	},

	setProperty: function(obj, value) {
		var parent = obj;
		var child = parent.properties;
		var target = undefined;
		this.props.property.split('.').forEach(function(p) {
			if (child != undefined) {
				parent = child;
				child = child[p];
				target = p;
			}
		});
		parent[target] = value;
	},

	onSelectionChanged: function(e, feature) {
		if (feature) {
			this.state.value = this.property(feature);
			this.has_change = false;
		} else {
			this.state.value = undefined;
			this.has_change = false;
		}
	},

	saveToFeature: function(e, feature) {
		if (this.has_change) {
			this.setProperty(feature, this.state.value);
			feature.properties.tags['modified'] = 'yes';
		}
	},

	render: function() {

		var self = this;
		var valueLink = this.linkState('value');
		
		var handleChange = function(e) {
			valueLink.requestChange(e.target.value);
			self.has_change = true;
		};

		return (
			<div>
				<label className="label">
					<span>
						{this.props.label}
					</span>
				</label>
				<input type="text" className={"form-control " + this.props.className}
			    	   value={valueLink.value} onChange={handleChange} />
			</div>
		);
	}

});