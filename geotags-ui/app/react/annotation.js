var CommentControl = require('./annotation-comment.js');
var controls = require('./annotation-controls.js');
var buttons = require('./annotation-buttons.js');

var PlaceHolder = React.createClass({

	showInstructions: function(e) {
		e.preventDefault();
		$('#tab-instructions').click();
	},

	render: function() {

		return (
			<div className="annotation" style={{ width: "100%" }}>
				<div>
					<label className="label">
						<span>Instructions</span>
					</label>
					<div>Sélectionner un objet sur la carte.</div>
				</div>
				<div>
					<label className="label">
						<span>Localisation</span>
					</label>
					<div>Pour modifier/préciser la localisation d'un objet,
					déplacer le sur la carte après l'avoir sélectionné.</div>
				</div>
				<div className="btn-toolbar" style={{ marginTop: "20px" }}>
					<a className="btn btn-default" href="#" onClick={this.showInstructions} style={{ color: 'gray' }}>
						<span className="glyphicon glyphicon-question-sign"></span>
						&nbsp;
						Légende
					</a>
				</div>
			</div>
		);

	},

});

var AnnotationForm = React.createClass({

	getInitialState: function() {
		this.dispatcher = $({});
		return { feature: null, marker: null, comment: '' };
	},

	markAndSave: function(tag, tag_value, feature_class) {

		this.state.feature.properties.tags[tag] = tag_value;

		if (feature_class) {
			var el = $(this.state.marker._icon)[0];
			el.className = el.className.replace(/feature-marker-.*?\b/g, '');
			$(this.state.marker._icon).addClass(feature_class);
		}

		this.save();
		this.emptySelection();

	},

	save: function() {
		this.dispatcher.trigger('beforesave', this.state.feature);
		this.props.save(this.state.feature);
		this.state.marker.updateLabelContent(this.state.feature.properties.name);
	},

	setGeometry: function(geometry) {
		if (this.state.feature) {
			this.state.feature.properties.tags['geometry_modified'] = 'yes';
			this.state.feature.geometry = geometry;
		}
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

		this.dispatcher.trigger('selectionchanged', undefined);
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

        this.dispatcher.trigger('selectionchanged', feature);
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

				<controls.EditableProperty
				    label="Nom" property="name"
				    className="property" feature={this.state.feature}
				    listenTo={this.dispatcher} />

				<controls.EditableProperty
					label="Adresse" property="tags.adresse"
					className="property" feature={this.state.feature}
				    listenTo={this.dispatcher} />
			
				<CommentControl
				    label="Commentaire" feature={this.state.feature}
				    listenTo={this.dispatcher} />
			
				<div className="btn-toolbar">
					
					<buttons.MarkValidButton label="Valider" onClick={this.markAndSave} />
					<buttons.AnnotateButton label="À vérifier" onClick={this.markAndSave} />

					<div className="btn-toolbar pull-right">
						<buttons.CancelButton label="Annuler" onClick={this.cancelEditing} />
						<buttons.MarkForDeletionButton label="" onClick={this.markAndSave} />
					</div>

				</div>
			
			</div>
		);
	}

});

module.exports = AnnotationForm;