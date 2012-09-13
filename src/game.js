(function(doc, gaim, u) {
	var canvasElement = doc.getElementById('c'),
		context = canvasElement.getContext('2d'),
		reverseCanvas = doc.getElementById('z'),
		reverseContext = reverseCanvas.getContext('2d'),
		g = new gaim(canvasElement),
		world = g.e('world'),
		player = g.e('player,move1d,inventory'),
		camera = g.e('camera'),
		cloud1 = g.e('c'),
		cloud2 = g.e('c'),
		cloud3 = g.e('c'),
		cloud4 = g.e('c'),
		cloud5 = g.e('c'),
		waterGradient,
		skyGradient,
		welcomeShown,
		firstDiscovery = true,
		fishTypes = [
			{
				n: 'Rockfish',
				z: [],
				p: 50,
				d: 2
			},
			{
				n: 'Grouper',
				z: [],
				p: 100,
				d: 1.8
			},
			{
				n: 'Snapper',
				z: [],
				p: 100,
				d: 1.5
			},
			{
				n: 'Tuna',
				z: [],
				p: 500,
				d: 1.1
			},
			{
				n: 'Marlin',
				z: [],
				p: 1000,
				d: 1
			},
			{
				n: 'Sailfish',
				z: [],
				p: 1000,
				d: 0.9
			},
			{
				n: 'Salmon',
				z: [],
				p: 200,
				d: 1.1
			},
			{
				n: 'Ahab',
				z: [],
				p: 1000000,
				d: 0.5
			}
		],
		itemTypes = [
			'Gas x10',
			'Gas x100',
			'Small Engine',
			'Large Engine',
			'Super Engine',
			'Small Rod',
			'Large Rod',
			'Magic Rod',
			'Sensor',
			'Map',
			'Small Fuel Tank',
			'Large Fuel Tank',
			'X-Large Fuel Tank'
		], itemPrices = [
			100, // gas
			1000, // gas 2
			-1, // engine 1
			5000, // engine 2
			15000, // engine 3
			-1, // rod 1
			10000, // rod 2
			30000, // rod 3
			1000, // sensor
			5000, // map
			-1, // fuel tank 1
			10000, // fuel tank 2
			20000 // fuel tank 3
		], cityNames = [
			'York',
			'Hampshire',
			'Carolina',
			'Dakota',
			'Jersey',
			'Falls',
			'Edwards',
			'Green',
			'Franklin',
			'Athens',
			'Oak',
			'Bern',
			'Berlin',
			'London',
			'Shanghai',
			'Paris',
			'Rio',
			'Seattle',
			'Tokyo',
			'Madison'
		], cityPrefixes = [
			'North',
			'South',
			'East',
			'West',
			'Isle of',
			'Grand',
			'New',
			'Saint',
			'Fort',
			'Bowling'
		];

	// Setup the fishing minigame
	f(doc, g, u);

	// Setup the menu
	m(doc, g, u);

	// Setup the tool tips
	tt(doc,g);

	g.c('camera', function(e) {
		e.y = e.x = 0;
	});

	g.c('c', function(e) {
		e.x = e.y = e.h = e.w = 0;
		e.m = new Image();
		e.m.src = 'cloud.png';
		e.m.onload = function() {
			e.j = 1;
		};
	});
	g.cs('draw', 'c', function() {
		if(this.j) {
			context.drawImage(this.m, this.x, this.y, this.w, this.h);
		}
	});
	g.cs('update', 'c', function(elapsed, temp1) {
		// Reposition the cloud
		temp1 = 500;
		var offscreenX = u.r(temp1,0);
		if(this.x + this.w < camera.x - temp1 || this.x > camera.x + camera.w + temp1) {
			if(player.a > 0) { // put on the right side of the screen
				this.x = camera.x + camera.w + offscreenX;
			}
			if(player.a < 0) { // put on the left side of the screen
				this.x = camera.x - this.w - offscreenX;
			}
			this.y = u.r(280-this.h,0);
		}
	});

	g.c('move1d', function(e) {
		e.v = 0;
		e.a = 0;
	});
	g.cs('update', 'move1d', function(elapsed) {
		this.v = this.v * this.d + this.a * this.s * 0.4;
		this.x += this.v * (elapsed / 1000);

		if(this.x < -camera.w) {
			this.x = world.length + camera.w + player.w - 100;
		}
		if(this.x > world.length + camera.w + player.w) {
			this.x = -camera.w + 100;
		}
		//this.x += this.a * this.s * (elapsed / 1000);
	});

	// City Component
	g.c('city', function(e, temp1, temp2, temp3) {
		// Set city as not discovered
		e.d = false;

		// Determine city topology
		e.t = u.r(10);
		temp2 = "#B28B54";
		if(e.t>1) { // Grass
			temp1 = "#00C800";
		}
		if(!e.t) { // Desert
			temp1 = "#FCE18B";
			temp2 = "#DDCFA1";
		}
		if(e.t == 1) { // Snow
			temp1 = "#fff";
		}
		e.style = temp1;
		e.style2 = temp2;

		// Determine the Name
		function uniqueCityName(otherCity) {
			return otherCity.n == temp3;
		}

		temp2 = g.f('city');
		do
		{
			temp1 = u.r(cityPrefixes.length + 5);
			temp3 = temp1 < cityPrefixes.length ? cityPrefixes[temp1] + ' ' : '';
			temp3 += cityNames[u.r(cityNames.length)];
		} while(temp2.some(uniqueCityName));
		e.n = temp3;

		// Empty array for buildings
		e.b = [];
	});
	g.cs('draw', 'city', function() {
		if(notInView(this.x, this.w)) {
			return;
		}

		drawRect(this.x, 265, this.x+this.w, 280, this.style);
		drawRect(this.x, 280, this.x+this.w, innerHeight, this.style2);

		for(var buildingKey in this.b) {
			var building = this.b[buildingKey],
				yCoordinate;
			drawRect(building.x, 265 - building.h, building.x + 51, 265, building.c);

			// windows
			for(var wY = 6; wY < building.h - 10; wY += 12.5) {
				yCoordinate = Math.floor(265 - wY - 4);
				drawRect(building.x + 3, yCoordinate, building.x + 5, yCoordinate - 6, '#000');
				drawRect(building.x + 13, yCoordinate, building.x + 15, yCoordinate - 6, '#000');
				drawRect(building.x + 23, yCoordinate, building.x + 25, yCoordinate - 6, '#000');
				drawRect(building.x + 33, yCoordinate, building.x + 35, yCoordinate - 6, '#000');
				drawRect(building.x + 43, yCoordinate, building.x + 45, yCoordinate - 6, '#000');
			}
		}
	});
	g.cs('update', 'city', function() {
		// If the city and the player are at the same location discover the city
		this.d |= player.x >= this.x && player.x <= this.x + this.w || player.x + player.w >= this.x && player.x + player.w <= this.x + this.w;

		// First discovery, show a tool tip helping the player
		if(firstDiscovery && this.d && !player.paused) {
			firstDiscovery = false;
			player.paused = true;
			player.t('tooltip', 6, 0, 0, 400, function() {
				player.paused = false;
			});
		}

		// Create some buildings if none exist
		if(!this.b.length) {
			var totalBuildings = u.r(this.w / 50, 1),
				startX = this.x + (this.w - totalBuildings * 50)/2,
				colors = ['#C0C0C0','#999999','#ABABAB','#888888','#DADADA','#362E68','#201B3D','#45305D','#515151','#514B2B','#A5852B','#705A1E','#7E7E7E','#3a3a3a','#EFEFEF'];
			for(var index = 0; index < totalBuildings; index++) {
				this.b.push({x: startX + index * 50, h: u.r(7,0)*25, c: colors[u.r(colors.length)]});
			}
		}
	});

	// Inventory Component
	g.c('inventory', function(e) {
		e.i = {
			f: {},
			i: e === player ? [0,0,1,0,0,1,0,0,0,0,1,0,0] : [1,1,0,1,1,0,1,1,1,1,0,1,1]
		};
		for(var i in fishTypes) {
			e.i.f[fishTypes[i].n] = 0;
		}
	});

	// Fishing Zone Component
	g.c('zone', function(e, temp) {
		e.c = [];
		e.mc = e.tc = 0;
		for(var key in fishTypes) {
			temp = Math.random() * (fishTypes[key].d - 0.47);
			temp = temp > 1 ? 1 : temp;
			e.c.push(temp);
			e.tc += temp;
			e.mc = temp > e.mc ? temp : e.mc;
		}
		e.w = u.r(1500,200);
	});
	g.cs('draw', 'zone', function() {
		// Draw a school of fish
		if(this.mc > 0.75) {

		}
	});

	// Find the zone that contains the specific X element
	function zoneAt(x, zones) {
		zones = g.f('zone');
		for(var index in zones)
		{
			if(zones[index].x <= x && zones[index].x + zones[index].w >= x) {
				return zones[index];
			}
		}
		return null;
	}

	generateWorld(g, world, fishTypes);
	world.at = function(x) {
		for(var i in world.c) {
			var c = world.c[i];
			if(c.x <= x && c.x + c.w >= x)
			{
				return c;
			}
		}
		return null;
	};

	// Player Setup
	player.on('draw', function() {
		doc.getElementById('w').innerHTML = "$"+player.u;
		if(player.j) {
			context.drawImage(player.dir > 0 ? player.n : player.m,player.x,player.y);
		}
	}).on('update', function(elapsed) {
		if(player.paused) {
			player.a = 0;
			return;
		}

		// Sensor
		if(player.i.i[8]) {
			if(!player.z || !(player.z.x <= player.x + player.w/2 && player.z.x + player.z.w >= player.x + player.w/2)) {
				player.z = zoneAt(player.x + player.w/2);
			}
		}

		player.a = 0;
		if(player.key) {
			if(player.key == 37) {	// left
				player.a = -1;
				player.dir = -1;
			}
			if(player.key == 39) {	// right
				player.a = 1;
				player.dir = 1;
			}
			
			// Out of Gas
			if(!player.f) {
				player.a = 0;
				player.t('tooltip', 7, 0, 0, 400);
			}

			// If moving... lower fuel
			if(player.a) {
				player.f -= 0.25;
			}

			// Open up the city menu
			if(player.key == 66) { // b
				var c = world.at(player.x + player.w/2);
				if(c) {
					player.paused = true;
					player.t('menu', player, c, fishTypes, itemTypes, itemPrices);
				}
			}

			// Open up the fishing minigame
			if(player.key == 70) { // f
				player.paused = true;
				player.t('fish', fishTypes, zoneAt(player.x + player.w/2), player.r);
			}

			// for debug purposes and also a nice secret to keep
			if(player.key == 192) {
				player.u += 10000;
			}
		}
		player.key=0;
	}).on('keydown', function(eventArgs,key) {
		player.key = key;
	}).on('catch', function(fish) {
		player.i.f[fish.n]++;
		player.paused = false;
	}).on('start', function() {
		player.paused = false;
	}).on('buy', function(itemIndex, price) {
		player.i.i[itemIndex]++;
		player.u -= price;

		// Modify player attributes based on items
		switch(itemIndex)
		{
			case '0':
			case '1':
				player.f += !itemIndex ? player.deltaF : 1000;
				player.f = player.f > player.maxF ? player.maxF : player.f;
				player.i.i[itemIndex]=0;
				break;
			case '4': // upgrade boat 
				player.speed += 75;
				break;
			case '3': // upgrade boat
				player.speed += 50;
				break;
			case '7': // upgrade rod
				player.r += 0.25;
				break;
			case '6': // upgrade rod
				player.r += 0.15;
				break;
			case '8': // fish sensor
				player.paused = true;
				player.z = zoneAt(player.x + player.w/2);
				player.t('tooltip', 3, 80, 40, 400, function() {
					player.paused = false;
				});
				break;
			case '11': // upgrade fuel tank
			case '12':
				player.maxF += 50;
				break;
		}
	}).on('sell', function(fishName, price, index) {
		// Add to the wallet and zero out the quantity
		player.u += price * player.i.f[fishName];
		player.i.f[fishName] = 0;
	});
	player.x = Math.floor(world.length/2);
	player.y = 220;
	player.d = 0.98;
	player.dir = 1;
	player.w = 200;		// width
	player.h = 87;		// height
	player.s = 40;	// speed
	player.u = 0;		// wallet
	player.maxF = player.f = 100;	// fuel
	player.deltaF = 10;
	player.paused = false;
	player.r = 0;	// rod size
	player.m = new Image();
	player.n = new Image();
	player.m.src = 'boat.png';
	player.j = 0; // images available

	// Create a flipped version of the boat
	player.m.onload = function() {
		reverseContext.save();
		reverseContext.scale(-1,1);
		reverseContext.drawImage(player.m,-player.w,0,player.w,player.h);
		player.n.src = reverseCanvas.toDataURL("image/png");
		player.n.onload = function() {
			player.j = 1;
		};
		reverseContext.restore();
	};

	camera.on('postdraw', function() {
		context.restore();

		// Draw the water
		if(!waterGradient) {
			waterGradient = context.createLinearGradient(0,300,0,500);
			waterGradient.addColorStop(0,'rgba(20,20,200,0.5)');
			waterGradient.addColorStop(0.3,'rgba(10,10,150,0.7)');
			waterGradient.addColorStop(1,'rgba(10,10,150,0.95)');
		}
		drawRect(0, 300, camera.w, camera.h, waterGradient);

		// Draw the HUD
		drawMap(world.c, world.length);
		drawFuelGauge();
		drawSensor();
	}).on('update', function() {
		camera.x = player.x - (camera.w/2) + player.w/2;

		// Predraw setup
		context.save();
		context.translate(-camera.x, 0);
		context.clearRect(camera.x, 0, camera.w, camera.h);

		// Draw the sky
		if(!skyGradient) {
			skyGradient = context.createLinearGradient(0,0,0,300);
			skyGradient.addColorStop(0,'#A3A4FF');
			skyGradient.addColorStop(0.9, '#C8C8FF');
		}
		drawRect(camera.x, 0, camera.x + camera.w, 300, skyGradient);
	});
	camera.w = canvasElement.width = innerWidth;
	camera.h = canvasElement.height = innerHeight;

	// Cloud setup
	cloud1.h = 20;
	cloud1.w = 30;
	cloud1.x = u.r(player.x+camera.w,player.x-camera.w);
	cloud1.y = u.r(200);

	cloud2.h = 30;
	cloud2.w = 40;
	cloud2.x = u.r(player.x+camera.w,player.x-camera.w);
	cloud2.y = u.r(200);

	cloud3.h = 40;
	cloud3.w = 80;
	cloud3.x = u.r(player.x+camera.w,player.x-camera.w);
	cloud3.y = u.r(200);

	cloud4.h = 50;
	cloud4.w = 65;
	cloud4.x = u.r(player.x+camera.w,player.x-camera.w);
	cloud4.y = u.r(200);

	cloud4.h = 54;
	cloud4.w = 90;
	cloud4.x = u.r(player.x+camera.w,player.x-camera.w);
	cloud4.y = u.r(200);

	g.r();

	player.t('tooltip', 0, 0, 0, 400, function() { // Welcome tool tip
		player.t('tooltip', 1, 45, 40, 400, function() {	// fuel gauge tool tip
			player.t('tooltip', 2, 0, 40, 400, function() {
				player.t('start');
			});
		});
	});
	player.paused = true;

	function drawRect(x1, y1, x2, y2, style) {	
		var x = x1 < x2 ? x1 : x2,
			y = y1 < y2 ? y1 : y2;
		context.fillStyle = style;
		context.fillRect(x, y, Math.abs(x2-x1), Math.abs(y2-y1));
	}

	function drawMap(cities, length, temp1, temp2) {
		temp2 = 5;
		drawRect(temp2/2,10+temp2/2-2*temp2,camera.w-temp2/2,10+temp2/2+2*temp2,"rgba(0,0,0,0.5)");
		for(var cityIndex in cities) {
			if(player.i.i[9] || cities[cityIndex].d) {
				temp1 = Math.floor((cities[cityIndex].x + cities[cityIndex].w / 2) * camera.w / world.length);
				context.fillStyle = cities[cityIndex].style;
				context.fillRect(temp1 - temp2/2, 10, temp2, temp2);
			}
		}
		temp1 = Math.floor((player.x + player.w / 2) * camera.w / world.length);
		context.fillStyle = "#FF0";
		context.fillRect(temp1 - temp2/2, 10, temp2, temp2);
	}

	function drawFuelGauge(temp1) {
		temp1 = player.f/player.maxF;
		drawRect(10,30,35,130,"rgba(0,0,0,0.5)");
		drawRect(10,130-100*temp1,35,130,temp1<0.3?"#C10000":"#00C100");
	}

	// Draw the sensor if the player owns it
	function drawSensor() {
		if(player.i.i[8] && player.z) {
			temp1 = player.z.tc/fishTypes.length;
			drawRect(40,30,65,130,"rgba(0,0,0,0.5)");
			drawRect(40,130-100*temp1,65,130,'#aaa');
		}
	}

	function generateWorld(g, world, fishTypes, temp) {
		world.c = [];
		world.length = u.r(50000,10000);
		
		// Setup the different fish zones
		for(var x = 0; x < world.length;) {
			temp = g.e('zone');
			temp.x = x;
			x = temp.x + temp.w;
		}

		// Put the prized fish into one of the zones randomly
		var prizedZone = zoneAt(u.r(world.length)),
			previousTotalConcentration = prizedZone.tc,
			previousConcentration = prizedZone.c[prizedZone.length - 1];
		prizedZone.mc = prizedZone.c[prizedZone.length - 1] = 1;
		prizedZone.tc -= previousConcentration + 1;

		// setup the cities
		var totalCities = u.r(world.length/800,1);
		for(temp = 0; temp < totalCities; temp++) {
			var c = g.e('city,inventory');
			c.x = u.r(world.length,0);
			c.w = u.r(700,200);
			world.c.push(c);
		}
	}

	function notInView(x1, w) {
		return x1 + w < camera.x || x1 > camera.x + camera.w;
	}
})(document, g, u);

