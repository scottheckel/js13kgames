window.u = {
	u: function(high, low) {
		low = low || 0;
		return Math.random() * (high - low) + low;
	},
	r: function(high, low) {
		low = low || 0;
		return Math.floor(Math.random() * (high - low) + low);
	}
};