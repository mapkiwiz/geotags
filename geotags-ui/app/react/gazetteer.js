// var React = require('react');

var GazetteerResult = React.createClass({

	handleSelect: function(e) {
		this.props.onSelect(this.props.value);
	},

	render: function() {
		return (
			<li onClick={this.handleSelect}>{this.props.value.text}</li>
		);
	}

});

var Gazetteer = React.createClass({

	getInitialState: function() {
		return { selection: null, results: [] };
	},

	componentDidMount: function() {
		this.control = $('input[name="' + this.props.name + '"]')
		this.control.on('keyup', this.handleKeyup);
	},

	handleKeyup: function(e) {
        var url, target = $(e.target), val = target.val();
        if (val) {
            // url = '/v1/search/communes?q=' + val + '&bbox=' + map.getBounds().toBBoxString();
            url = this.props.service.replace(/{q}/, val);
            $.getJSON(url, function(data) {
                this.setState({ text: val, results: data.results });
            }.bind(this));
        } else {
            this.setState({ selection: null, results: [] });
        }
    },

    handleSelect: function(d) {
    	this.props.map.fitBounds(
			L.latLngBounds(
		        L.latLng(d.south_west.lat, d.south_west.lon),
		        L.latLng(d.north_east.lat, d.north_east.lon))
		);
		this.setState({ selection: d, results: [] });
		this.control.val(d.text);
    },

    render: function() {
    	var self = this, items = this.state.results.map(function(result) {
			return (
				<GazetteerResult key={result.properties.code} value={result} onSelect={self.handleSelect} />
			);
		});
        return (
        	<div>
	        	<div className="form-group">
	        		<label className="label">
						<span>PAR COMMUNE</span>
					</label>
	    			<input className="form-control" type="text" name={this.props.name} placeholder={this.props.placeholder} />
	    		</div>
	    		<ul className="list" id="search-results">
					{items}
				</ul>
    		</div>
        );
    }

});

module.exports = Gazetteer;