window.m = function(doc, g, u) {
	var wrapper = doc.getElementById('m'),
		listWrapper = doc.getElementById('o'),
		detailWrapper = doc.getElementById('d'),
		buyMenu = doc.getElementById('b'),
		sellMenu = doc.getElementById('s'),
		okButton = doc.getElementById('ok'),
		cancelButton = doc.getElementById('cancel'),
		closeButton = doc.getElementById('x'),
		cityMenu = g.e('menu'),
		hidden = true,
		buyDescriptions = [
			'Ten units of gas to help you travel the seas.',
			'One hundred units of gas to help you travel the seas.',
			'',
			'Put a little extra oomph in your engine.  A little too fast for your Grandma\'s driving tastes.',
			'This engine is not quite as fast as a jet, but it is fast enough for your needs.',
			'',
			'Help catch fish a little better.',
			'If you can\'t catch the fish with this then you will never be able to catch it.',
			'Helps you discover when lots of fish are hiding.',
			'Find out where all the islands are in the world.',
			'',
			'Get a little bit further before you have to fill up the tank.',
			'You will (maybe) be able to travel the seven seas and back before you have to fill up again.'
		];

	function show(detail) {
		listWrapper.style.display = closeButton.style.display = detail ? 'none' : '';
		detailWrapper.style.display = okButton.style.display = cancelButton.style.display = detail ? '' : 'none';
	}

	cancelButton.onclick = function() {
		show(false);			
	};

	// Close Button
	function close() {
		hidden = true;
		wrapper.style.display = 'none';
		cityMenu.t('start');
	}
	closeButton.onclick = close;

	// Create the Menu
	function createMenu(player, city, fishTypes, itemTypes, itemPrices) {
		// Create the Sell Menu
		var html = '',
			sellCount = 0;
		for(var f in fishTypes) {
			var name = fishTypes[f].n,
				inventoryCount = player.i.f[name];

			if(inventoryCount) {
				html += '<li data-f="' + name + '" data-p="' + fishTypes[f].p + '" data-q="' + inventoryCount + '"><span>' + (fishTypes[f].p * inventoryCount) + '</span>' + inventoryCount + 'x ' + name + '</li>';
				sellCount++;
			}
		}

		if(!sellCount) {
			html += '<li>Nothing to Sell.</li>';
		}

		sellMenu.innerHTML = html;

		// Create the Buy Menu
		html = '';
		for(var i in itemTypes) {
			if(city.i.i[i] && !player.i.i[i]) {
				html += '<li data-i="' + i + '" data-p="' + itemPrices[i] + '"><span>' + itemPrices[i] + '</span>' +  itemTypes[i] + '</li>';
			}
		}

		buyMenu.innerHTML = html;

		// Sell Method
		function sell(html) {
			var fishName = this.getAttribute('data-f'),
				price = this.getAttribute('data-p'),
				quantity = this.getAttribute('data-q');

			show(true);

			detailWrapper.innerHTML = 'Would you like to sell <strong>' + quantity + ' ' + fishName + '</strong> for <strong>$' + (price * quantity) + '</strong>?';
			okButton.innerHTML = 'Sell';

			okButton.onclick = function() {
				cityMenu.t('sell', fishName, price);
				createMenu(player, city, fishTypes, itemTypes, itemPrices);
				show(false);
			};
		}

		// Buy Method
		function buy(html) {
			var itemIndex = this.getAttribute('data-i'),
				price = this.getAttribute('data-p');

			show(true);

			if(player.u >= price) {
				if(itemIndex == 4 && !player.i.i[3] || itemIndex == 7 && !player.i.i[6] || itemIndex == 12 && !player.i.i[11]) {
					html = 'You do not have the prior requirement for this item.';
					okButton.style.display = 'none';
				} else {
					html = '<div>Would you like to purchase a <strong>';
					if(itemIndex > 0) {
						html += itemTypes[itemIndex];
					} else {
						html += player.deltaF + ' units of gas';
					}
					html += '</strong> for <strong>' + price + '</strong>.</div><div><br><strong>Description:</strong> ' + buyDescriptions[itemIndex] + '</div>';
					okButton.innerHTML = "Buy";
				}
			} else {
				html = 'You have insufficient funds to purchase ' + itemTypes[itemIndex] + '.';
				okButton.style.display = 'none';
			}

			detailWrapper.innerHTML = html;

			okButton.onclick = function() {
				cityMenu.t('buy', itemIndex, price);
				createMenu(player, city, fishTypes, itemTypes, itemPrices);
				show(false);
			};
		}

		// Hook up the sells
		if(sellCount > 0) {
			for(var j = 0; j < sellMenu.children.length; j++) {
				sellMenu.children[j].onclick = sell;
			}
		}

		// Hook up the buys
		for(var k = 0; k < buyMenu.children.length; k++) {
			buyMenu.children[k].onclick = buy;
		}
	}

	// Show the city menu
	cityMenu.on('menu', function(player, city, fishTypes, itemTypes, itemPrices) {
		hidden = false;
		doc.getElementById('t').innerHTML = "Welcome to " + city.n;

		createMenu(player, city, fishTypes, itemTypes, itemPrices);

		show(false);
		wrapper.style.display = '';
	}).on('keydown', function(eventArgs, keyCode) {
		if(!hidden && (keyCode == 27 || keyCode == 13)) {
			close();
		}
	});
};