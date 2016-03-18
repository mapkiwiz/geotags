// var React = require('react');

// TagButton
// TagControl
// ReadOnlyProperty
// PropertyControl
// CommentControl

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
		this.props.listenTo.on('featurechanged', this.onFeatureChanged);
		this.props.listenTo.on('beforesave', this.saveToFeature);
	},

	componentWillUnmount: function() {
		this.props.listenTo.off('featurechanged', this.onFeatureChanged);
		this.props.listenTo.off('beforesave', this.saveToFeature);
	},

	onFeatureChanged: function(e, feature) {
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

var MarkValidButton = React.createClass({

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

var AnnotateButton = React.createClass({

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

var MarkForDeletionButton = React.createClass({

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

var CancelButton = React.createClass({

	render: function() {
		return (
			<button className="btn btn-default" onClick={this.props.onClick} >
				<span className="glyphicon glyphicon-remove"></span>&nbsp;
				{this.props.label}
			</button>
		);
	}

});

var PlaceHolder = React.createClass({

	onClick: function(e) {
		e.preventDefault();
		$('#tab-instructions').click();
	},

	render: function() {

		return (
			<div className="annotation">
				<div style={{ width: '50%', display: 'inline-block' }}>
					<label className="label">
						<span>INSTRUCTIONS</span>
					</label>
					<div>Sélectionner un objet.</div>
				</div>
				<a className="btn btn-default pull-right" href="#" onClick={this.onClick} style={{ color: 'gray', marginTop: '20px' }}>
					<span className="glyphicon glyphicon-question-sign"></span>
					&nbsp;
					Afficher les instructions
				</a>
			</div>
		);

	},

});

var AnnotationForm = React.createClass({

	getInitialState: function() {
		this.observer = $({});
		return { feature: null, marker: null, comment: '' };
	},

	markAndSave: function(tag, tag_value, feature_class) {

		if (tag) {
			this.state.feature.properties.tags[tag] = tag_value;
		}

		$(this.state.marker._icon).addClass(feature_class);
		this.save();
		this.emptySelection();

	},

	save: function() {
		this.observer.trigger('beforesave', this.state.feature);
		this.props.save(this.state.feature);
	},

	startEditing: function(marker) {

		marker.dragging.enable();
        $(marker._icon).addClass('feature-marker-selected');

	},

	stopEditing: function(marker) {

		marker.dragging.disable();
		$(marker._icon).removeClass('feature-marker-selected');

	},

	cancelEditing: function() {

		var marker = this.state.marker, feature = this.state.feature;
		this.stopEditing(marker);
		this.resetProperties(feature);
		marker.setLatLng(L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]));
		this.emptySelection();

	},

	resetProperties: function(feature) {

		feature.properties = this.state.original.properties;
		feature.geometry = this.state.original.geometry;

	},

	emptySelection: function() {

		var marker = this.state.marker;
		this.stopEditing(marker);

		this.observer.trigger('featurechanged', undefined);
		this.setState({ feature: null, marker: null, comment: '' });

	},

	selectFeature: function(feature, marker) {
		
		if (this.state.marker) {
			this.emptySelection();
		}

        this.setState({
        	feature: feature,
        	original: $.extend(true, {}, feature),
        	marker: marker,
        	comment: feature.properties.tags.comment || '' });
        $('#tab-annotate').tab('show');

        this.observer.trigger('featurechanged', feature);
        this.startEditing(marker);

	},

	render: function() {

		if (this.state.feature) {
			return this.renderForm();
		} else {
			return (
				<PlaceHolder />
			);
		}

	},

	renderForm: function() {

		var properties = this.state.feature.properties || { tags: {} };
		return (
			<div className="annotation details">

				<label className="label">
					<span>NOM</span>
				</label>
				<div className="detail detail-name">{properties.name}</div>

				<label className="label">
					<span>ADRESSE</span>
				</label>
				<div className="detail detail-address">{properties.tags.adresse}</div>
			
				<CommentControl label="COMMENTAIRE" listenTo={this.observer} feature={this.state.feature} />
			
				<div className="btn-toolbar">
					
					<MarkValidButton label="Valider" onClick={this.markAndSave} />
					<AnnotateButton label="Annoter" onClick={this.markAndSave} />

					<div className="btn-toolbar pull-right">
						<CancelButton label="Annuler" onClick={this.cancelEditing} />
						<MarkForDeletionButton label="" onClick={this.markAndSave} />
					</div>

				</div>
			
			</div>
		);
	}

});

module.exports = AnnotationForm;