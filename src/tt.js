window.tt = function(doc, g) {
	var wrapper = doc.getElementById('tt'),
		toolTip = g.e('tooltip'),
		visible = false,
		afterCallback,
		prevKeyDown,
		messages = [
			'<div>Welcome to <em>At Sea</em>! You are a fisherman at sea trying to get the catch of your life. This is a game created for the <a href="http://js13kgames.com" target="_blank">js13kgames competition</a> by <a href="http://scottheckel.com">Scott Heckel</a>.<br><br>Move your ship with<br><br>Buy and sell items at islands with<br><br>Start fishing with<br><br></div><div id="kL">&#9668;</div><div id="kR">&#9658;</div><div id="kF">F</div><div id="kB">B</div>',
			'<div style="text-align:center">To the left is a fuel gauge. Don\'t run out of gas.</div>',
			'<div style="text-align:center">At the top is the map. As you discover islands they will appear here. You can also purchase a map at an island to reveal the entire world.</div>',
			'Congratulations on purchasing the sensor!  The sensor is on the right of your fuel gauge.  Watch it\'s level to tell if this area contains a high concentratoin of fish.',
			'You will need to be patient reeling in your catch.<br><br>Fill up the catch bar on the right by hitting the <strong>\'SPACEBAR\'</strong> when your pointer is over a fishes \'sweet\' spot on the circle.',
			'The fish got away!',
			'You have discovered your first island.  Use the <strong>\'B\'</strong> key to buy and sell items on the island.',
			'You went a little too far away from home and ran out of gas.  Coincidentally, your radio is also broken, so you will remain forever lost at sea.'
		];

	function hide() {
		visible = false;
		wrapper.style.display = 'none';
		if(afterCallback) {
			afterCallback();
		}
	}

	wrapper.onclick = function() { hide(); };

	toolTip.on('keydown', function(eventArgs, key) {
		if(visible && (key == 13 || key == 27 || key == 32) && key != prevKeyDown) {
			hide();
		}
	}).on('keyup', function(eventArgs, key) {
		if(visible && prevKeyDown && prevKeyDown == key) {
			prevKeyDown = null;
		}
	}).on('mousedown', function() {
		if(visible) {
			hide();
		}
	}).on('tooltip', function(messageIndex, x, y, width, callback, msgOverride, keyThatTriggered) {
		afterCallback = callback;
		prevKeyDown = keyThatTriggered;

		// Get the X and Y coordinates if they aren't specified
		var camera = g.f('camera')[0];
		if(!width) {
			width = width || camera.w;
		}
		if(!x) {
			x = camera.w/2-width/2;
		}
		if(!y) {
			y = Math.max(camera.h/2-150, 20);
		}

		// Setup the tool tip
		wrapper.innerHTML = (msgOverride || messages[messageIndex]) + '<p class="ok">Ok</p>';
		wrapper.style.top = y + 'px';
		wrapper.style.left = x + 'px';
		wrapper.style.width = width + 'px';

		visible = true;
		wrapper.style.display = '';
	});
};