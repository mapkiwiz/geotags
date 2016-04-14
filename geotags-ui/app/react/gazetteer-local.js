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
		this.data = [];
		return { selection: null, results: [] };
	},

	componentDidMount: function() {
		this.control = $('input[name="' + this.props.name + '"]')
		this.control.on('input', this.handleKeyup);
	},

	lookup: function(query) {
		var results = [];
		query = query.toUpperCase();
		this.data.forEach(function(d) {
			if (d.name.contains(query)) {
				results.push(d);
			}
		});
		results.sort(function(a, b) {
			var ta = a.name.startsWith(query);
			var tb = b.name.startsWith(query);
			if (ta && !tb) {
				return -1;
			} else if (tb && !ta) {
				return 1;
			} else {
				var a_sub = a.name.substring(0, query.length),
				    b_sub = b.name.substring(query.length);
				return (a_sub.name == b_sub.name) ? 0 :((a_sub < b_sub) ? 1 : -1);
			}
		});
		return results.slice(0, 5);
	},

	handleKeyup: function(e) {
        var url, target = $(e.target), val = target.val();
        if (val) {
            var results = this.lookup(val);
            this.setState({ selection: null, results: results })
        } else {
            this.setState({ selection: null, results: [] });
        }
    },

    handleSearch: function(e) {
    	var control = $('input[name="' + this.props.name + '"]');
    	var val = control.val();
    	if (val) {
            var results = this.lookup(val);
            this.setState({ selection: null, results: results })
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
				<GazetteerResult key={result.code} value={result} onSelect={self.handleSelect} />
			);
		});
        return (
        	<div>
	        	<div className="form-group">
					<label className="label">
						<span>Par commune</span>
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