module.exports = {};

module.exports.MarkValidButton = React.createClass({

	handleClick: function(e) {
		this.props.onClick('valid', 'yes', 'feature-marker-valid');
	},

	render: function() {
		return (
			<button className="btn btn-success" onClick={this.handleClick} >
				<span className="glyphicon glyphicon-ok"></span>&nbsp;
				{this.props.label}
			</button>
		);
	}

});

module.exports.AnnotateButton = React.createClass({

	handleClick: function(e) {
		this.props.onClick('valid', '', 'feature-marker-commented');
	},

	render: function() {
		return (
			<button className="btn btn-default" onClick={this.handleClick} >
				<span className="glyphicon glyphicon-pencil"></span>&nbsp;
				{this.props.label}
			</button>
		);
	}

});

module.exports.MarkForDeletionButton = React.createClass({

	handleClick: function(e) {
		this.props.onClick('valid', 'no', 'feature-marker-for-deletion');
	},

	render: function() {
		return (
			<button className="btn btn-danger" onClick={this.handleClick} >
				<span className="glyphicon glyphicon-trash"></span>&nbsp;
				{this.props.label}
			</button>
		);
	}

});

module.exports.CancelButton = React.createClass({

	render: function() {
		return (
			<button className="btn btn-default" onClick={this.props.onClick} >
				<span className="glyphicon glyphicon-remove"></span>&nbsp;
				{this.props.label}
			</button>
		);
	}

});