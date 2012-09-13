f = function(doc, g, u) {
	var wrapper = doc.getElementById('f'),
		meterOutter = doc.getElementById('h'),
		meter = doc.getElementById('i'),
		canvasElement = doc.getElementById('g'),
		context = canvasElement.getContext('2d'),
		fishing = g.e('fishing'),
		isKeyDown = false,
		arcs = [],
		rotation = 0,
		powerMeter = 0,
		powerMeterMax = 3000,
		pi2 = Math.PI * 2,
		defaultArcStyle = "rgb(0,0,0)",
		pointerStyle,
		highlightArcStyle,
		arcStyle,
		IDLE = 0,
		FISHING = 1,
		GOTAWAY = 2,
		CAUGHT = 3,
		TUTORIAL = 4,
		state = IDLE,
		first = true,
		fishingFor;

	canvasElement.height = canvasElement.width = 350;

	function inArc(rotation, arc) {
		//if(arc.e > arc.s) {
		//	return arc.s <= rotation && arc.e >= rotation;
		//}
		//return arc.s <= rotation && arc.e + pi2 >= rotation;
		return arc.s <= rotation && arc.s + arc.l >= rotation || arc.s <= rotation + pi2 && arc.s + arc.l >= rotation + pi2;
	}

	function hide() {
		state = IDLE;
		wrapper.style.display = 'none';
	}

	fishing.on('update', function(elapsed) {
		if(state!=FISHING) {
			return;
		}

		arcStyle = pointerStyle = 0;

		if(isKeyDown) {
			if(inArc(rotation, arcs[0]) || inArc(rotation, arcs[1]))
			{
				powerMeter += elapsed * 2;
				if(!highlightArcStyle) {
					var center = canvasElement.height / 2;
					highlightArcStyle = context.createRadialGradient(center,center,10,center,center,center);
					highlightArcStyle.addColorStop(0.6, "#0F0");
					highlightArcStyle.addColorStop(1, "#00C100");
				}
				pointerStyle = arcStyle = highlightArcStyle;
			} else {
				powerMeter -= elapsed;
				pointerStyle = "#C00";
			}
		}

		rotation += 0.05;
		rotation = rotation >= pi2 ? rotation - pi2 : rotation;

		if(powerMeter >= powerMeterMax) {
			// Caught the fish
			state = CAUGHT;
			fishing.t('tooltip', -1, 0, 0, 300, function() {
				hide();
				fishing.t('catch', fishingFor);
			}, 'Congratulations! You just caught a <strong>' + fishingFor.n + '</strong>.', isKeyDown ? 32 : null);
		}
		if(powerMeter<=0) {
			// Fish got away because we ran out of power
			state = GOTAWAY;
			fishing.t('tooltip', 5, 0, 0, 300, function() {
				hide();
				fishing.t('gotaway');	
			}, 0, isKeyDown ? 32 : null);
		}

		// Degrade power
		powerMeter -= elapsed / 10;

		// Determine if the arcs should switch directions
		if(u.r(1000) > 990) {
			arcs[0].d = -arcs[0].d;
		}
		if(u.r(1000) > 990) {
			arcs[1].d = -arcs[1].d;
		}

		function updateArc(position, delta) {
			position += delta;
			if(position < 0) {
				position += pi2;
			}
			if(position >= pi2) {
				position -= pi2;
			}
			return position;
		}

		// Update the arcs position
		arcs[0].s = updateArc(arcs[0].s, arcs[0].d);
		arcs[0].e = updateArc(arcs[0].e, arcs[0].d);
		arcs[1].s = updateArc(arcs[1].s, arcs[1].d);
		arcs[1].e = updateArc(arcs[1].e, arcs[1].d);
	}).on('draw', function() {
		if(!state) {
			return;
		}

		var center = canvasElement.height / 2;

		context.clearRect(0, 0, canvasElement.width, canvasElement.height);

		context.beginPath();
		context.lineWidth = 1;
		context.strokeStyle = defaultArcStyle;
		context.arc(center, center, center - 30, 0, pi2, false);
		context.stroke();

		arcs.forEach(function(arc) {
			context.beginPath();
			context.lineWidth = 30;
			context.strokeStyle = arcStyle || defaultArcStyle;
			context.arc(center, center, center - context.lineWidth, arc.s, arc.e, false);
			context.stroke();
		});

		context.fillStyle = pointerStyle || defaultArcStyle;
		context.beginPath();
		context.arc(center, center, center, rotation - 0.05, rotation + 0.05, false);
		context.lineTo(center, center);
		context.fill();

		meter.style.height = (powerMeter / powerMeterMax) * 300;
	}).on('keydown', function(eventArgs, key) {
		if(state!=FISHING) {
			return;
		}
		isKeyDown = key == 32;
	}).on('keyup', function(eventArgs, key) {
		if(state!=FISHING) {
			return;
		}
		isKeyDown &= key != 32;
		if(!isKeyDown) {
			arcStyle = 0;
		}

		// Escape causes the fish to get away right away
		if(key == 27) {
			state = GOTAWAY;
			fishing.t('tooltip', 5, 0, 0, 300, function() {
				hide();
				fishing.t('gotaway');	
			});
		}
	}).on('fish', function(fishTypes, zone, rodLength, length) {
		if(state) {
			return;
		}

		// Determine the type of fish that we will be fishing for
		// This is done by looking at all of the rarities
		var concentrations = zone.c,
			spot = u.u(zone.tc),
			fishIndex = 0,
			total = 0;

		// We loop through the concentrations until we have found our fish
		for(var concentration in zone.c) {
			total += zone.c[concentration];
			if(total >= spot) {
				fishIndex = concentration;
				break;
			}
		}

		fishingFor = fishTypes[fishIndex];

		// Create the arcs
		length = fishingFor.d + rodLength;

		arcs = [];
		arcs[0] = {
			s: u.u(pi2, 0)
		};
		arcs[0].e = arcs[0].s + length;
		arcs[0].d = u.u(0.07,0.01) - 0.035;
		arcs[1] = {
			s: u.u(arcs[0].s + pi2 - length, arcs[0].e)
		};
		arcs[1].s = arcs[1].s > pi2 ? arcs[1].s - pi2 : arcs[1].s;
		arcs[1].e = arcs[1].s + length;
		arcs[1].d = u.u(0.07,0.01) - 0.035;
		arcs[0].l = arcs[1].l = length;

		state = FISHING;
		isKeyDown = rotation = 0;
		powerMeter = 1000;
		wrapper.style.display = '';

		if(first) {
			state = TUTORIAL;
			first = false;
			fishing.t('tooltip', 4, 20, 0, 300, function() {
				state = FISHING;
			});
		}
	});
};