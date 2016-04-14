var Message = React.createClass({

	getInitialState: function() {
		return { message: undefined, category: undefined };
	},

	close: function() {
		this.setState({ message: undefined, category: undefined });
	},

	display: function(message, category, delay) {
		var self = this;
		this.setState({ message: message, category: category });
		if (delay) {
			this.timer = setTimeout(function() {
				if (self.timer) {
					clearTimeout(self.timer);
					self.timer = undefined;
				}
				self.close();
			}, delay);
		}
	},

	render: function() {
		if (this.state.message) {
			return (
				<div className={"alert fade in alert-" + this.state.category} role="alert">
					{this.state.message}
					<button className="close" onClick={this.close} ariaLabel="Close">
					  <span ariaHidden="true">&times;</span>
					</button>
				</div>
			);
		} else {
			return (
				<div className="hidden"></div>
			);
		}
			
	}

});

module.exports = Message;