// var React = require('react');

var GazetteerResult = React.createClass({

	handleSelect: function(e) {
		this.props.onSelect(this.props.value);
	},

	render: function() {
		return (
			<li onClick={this.handleSelect}>{this.props.value.properties.label}</li>
		);
	}

});

var Gazetteer = React.createClass({

	getInitialState: function() {
		return { selection: null, results: [] };
	},

	componentDidMount: function() {
		this.control = $('input[name="' + this.props.name + '"]');
		// this.control.on('keyup', this.handleKeyup);
	},

	handleSearch: function(e) {
        var url, target = $(e.target), val = this.control.val();
        if (val) {
            // url = '/v1/search/communes?q=' + val + '&bbox=' + map.getBounds().toBBoxString();
            url = this.props.service.replace(/{q}/, val);
            $.getJSON(url, function(data) {
                this.setState({ text: val, results: data.features });
            }.bind(this));
        } else {
            this.setState({ selection: null, results: [] });
        }
    },

    handleSelect: function(d) {
    	if (this.props.select) {
    		this.props.select(d);
    	}
		this.setState({ selection: d, results: [] });
		this.control.val(d.properties.label);
    },

    render: function() {
    	var self = this, items = this.state.results.map(function(result) {
			return (
				<GazetteerResult key={result.properties.id} value={result} onSelect={self.handleSelect} />
			);
		});
        return (
        	<div>
	        	<div className="form-group">
	        		<label className="label">
						<span>Rechercher une adresse postale</span>
					</label>
					<div className="input-group">
		    			<input className="form-control" type="text" name={this.props.name} placeholder={this.props.placeholder} />
		    			<span className="input-group-btn">
		    				<button onClick={this.handleSearch} className="btn btn-default">
			    				<span className="glyphicon glyphicon-search"></span>
			    			</button>
			    		</span>
		    		</div>
	    		</div>
	    		<ul className="list" id="search-results">
					{items}
				</ul>
    		</div>
        );
    }

});

module.exports = Gazetteer;