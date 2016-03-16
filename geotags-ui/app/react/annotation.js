var React = require('react');

var AnnotationForm = React.createClass({

	getInitialState: function() {
		return { feature: null, marker: null, comment: '' };
	},

	handleMarkValid: function(e) {
		$(this.state.marker._icon).addClass('feature-marker-valid');
		this.saveComment();
		this.emptySelection();
	},

	handleMarkForDeletion: function(e) {
		$(this.state.marker._icon).addClass('feature-marker-for-deletion');
		this.saveComment();
		this.emptySelection();
	},

	handleAnnotate: function(e) {
		$(this.state.marker._icon).addClass('feature-marker-commented');
		this.saveComment();
		this.emptySelection();
	},

	handleComment: function(e) {
		
		this.state.comment = $(e.target).val();
		this.setState(this.state);

	},

	saveComment: function() {
		this.state.feature.properties.tags.comment = this.state.comment;
	},

	render: function() {

		if (this.state.feature) {
			return this.renderForm();
		} else {
			return this.renderPlaceHolder();
		}

	},

	emptySelection: function() {
		this.deselectFeature(this.state.feature, this.state.marker);
		this.setState({ feature: null, marker: null, comment: '' });
	},

	deselectFeature: function(feature, marker) {

		marker.dragging.disable();
		$(marker._icon).removeClass('feature-marker-selected');

	},

	selectFeature: function(feature, marker) {
		
		if (this.state.marker) {
			this.deselectFeature(this.state.feature, this.state.marker);
		}

        marker.dragging.enable();
        $(marker._icon).addClass('feature-marker-selected');

        this.setState({ feature: feature, marker: marker, comment: feature.properties.tags.comment || '' });
        $('#tab-annotate').tab('show');

	},

	renderPlaceHolder: function() {

		return (
			<div className="annotation details">

				<label className="label">
					<span>INSTRUCTIONS</span>
				</label>
				<div>Sélectionner un objet en cliquant sur la carte.</div>

				<label className="label">
					<span>LOCALISATION</span>
				</label>
				<div>Pour modifier/préciser la localisation d'un objet,
				déplacer le sur la carte après l'avoir sélectionné.</div>

				<label className="label">
					<span>LÉGENDE</span>
				</label>
				<table className="table">
					<tbody>
						<tr>
							<td><span className="glyphicon glyphicon-map-marker feature-marker feature-marker-valid"></span> Objet validé</td>
							<td><span className="glyphicon glyphicon-map-marker feature-marker feature-marker-selected"></span> Objet sélectionné</td>
						</tr>
						<tr>
							<td><span className="glyphicon glyphicon-map-marker feature-marker feature-marker-commented"></span> Objet annoté</td>
							<td><span className="glyphicon glyphicon-map-marker feature-marker"></span> Objet à traiter</td>
						</tr>
						<tr>
							<td><span className="glyphicon glyphicon-map-marker feature-marker feature-marker-for-deletion"></span> Objet à supprimer</td>
							<td></td>
						</tr>
					</tbody>
				</table>

			</div>
		);

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
			
				<div className="form-group">
					<label className="label">
						<span>COMMENTAIRE</span>
					</label>
					<textarea className="form-control" rows="3" name="comment" onChange={this.handleComment}
						autoComplete="off" value={this.state.comment} >
					</textarea>
				</div>
			
				<div className="btn-toolbar">
					<button className="btn btn-success" onClick={this.handleMarkValid} >
						<span className="glyphicon glyphicon-check"></span>&nbsp;
						Valider
					</button>

					<button className="btn btn-default" onClick={this.handleAnnotate} >
						<span className="glyphicon glyphicon-pencil"></span>&nbsp;
						Annoter
					</button>

					<button className="btn btn-danger pull-right" onClick={this.handleMarkForDeletion} >
						<span className="glyphicon glyphicon-trash"></span>
					</button>

					<button className="btn btn-default pull-right" onClick={this.emptySelection} >
						<span className="glyphicon glyphicon-remove"></span>&nbsp;
						Annuler
					</button>

				</div>
			
			</div>
		);
	}

});

module.exports = AnnotationForm;