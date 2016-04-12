var CommentControl = React.createClass({

	mixins: [ React.addons.LinkedStateMixin ],

	getInitialState: function() {

		var comment = '';
		if (this.props.feature) {
			comment =
				this.props.feature.properties.tags &&
				this.props.feature.properties.tags.comment || '';
		}

		return { comment: comment };

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
		var comment = '';
		if (feature) {
			comment =
				this.props.feature.properties.tags &&
				this.props.feature.properties.tags.comment || '';
		}
		this.setState({ comment: comment });
	},

	saveToFeature: function(e, feature) {
		// console.log("Save " + this.state.comment);
		feature.properties.tags.comment = this.state.comment;
	},

	render: function() {
		
		var valueLink = this.linkState('comment');

		var handleChange = function(e) {
			valueLink.requestChange(e.target.value);
		}.bind(this);

		return (
			<div className="form-group">
				<label className="label">
					<span>{this.props.label}</span>
				</label>
				<textarea className="form-control" rows="3" name="comment" onChange={handleChange}
					autoComplete="off" value={valueLink.value} >
				</textarea>
			</div>
		);
	}

});

module.exports = CommentControl;