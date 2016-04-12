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
			value: this.props.feature.properties[this.props.property]
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

	onSelectionChanged: function(e, feature) {
		if (feature) {
			this.state.value = feature.properties[this.props.property];
			this.has_change = false;
		} else {
			this.state.value = undefined;
			this.has_change = false;
		}
	},

	saveToFeature: function(e, feature) {
		if (this.has_change) {
			feature.properties[this.props.property] = this.state.value;
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