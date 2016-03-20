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

	getInitialState: function() {
		return {
			value: this.props.feature.properties[this.props.property]
		}
	},

	componentDidMount: function() {
		this.props.listenTo.on('featurechanged', this.onFeatureChanged);
		this.props.listenTo.on('beforesave', this.saveToFeature);
	},

	componentWillUnmount: function() {
		this.props.listenTo.off('featurechanged', this.onFeatureChanged);
		this.props.listenTo.off('beforesave', this.saveToFeature);
	},

	onFeatureChanged: function(e, feature) {
		if (feature) {
			this.state.value = feature.properties[this.props.property];
		} else {
			this.state.value = undefined;
		}
	},

	saveToFeature: function(e, feature) {
		feature.properties[this.props.property] = this.state.value;
	},

	render: function() {

		var valueLink = this.linkState('value');
		
		var handleChange = function(e) {
			valueLink.requestChange(e.target.value);
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