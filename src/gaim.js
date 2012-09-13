g = function(gameWrapper) {
	var entityStore = [],
		componentSetup = {},
		currentId = 1,
		events = {},
		isRunning = false;

	// Creates a new entity
	function createEntity(componentsSelector) {
		// Create the entity
		var entity = {
			co : !!componentsSelector ? componentsSelector.split(',') : [],
			id : currentId++,
			on : subscribe,
			t : publish
		};
		entityStore.push(entity);

		// Run component setups
		for(var key in entity.co) {
			var component = entity.co[key];
			if(!!componentSetup[component]) {
				componentSetup[component](entity);
			}
		}

		return entity;
	}

	function createComponent(componentName, setupCallback) {
		// Store the callback for as new entities are created
		componentSetup[componentName] = setupCallback;

		// loop through current entities and setup
		// sh - potential savings
		var entities = find(componentName);
		for(var key in entities) {
			setupCallback(entities[key]);
		}
	}

	// Find by a Component Selector
	function find(selector) {
		var ret = [];
		for(var e in entityStore) {
			for(var c in entityStore[e].co) {
				if(entityStore[e].co[c] == selector) {
					ret.push(entityStore[e]);
				}
			}
		}
		return ret;
	}

	// Allows subscription to events
	function subscribe(eventName, callback) {
		// Event not yet defined
		if(!events[eventName]) events[eventName] = [];

		events[eventName].push({context: this, callback: callback});
		return this;
	}

	function componentSubscribe(eventName, componentName, callback) {
		// Event not yet defined
		if(!events[eventName]) events[eventName] = [];

		events[eventName].push({component: componentName, callback: callback});
		return this;
	}

	// Allows the publishing of events
	function publish(eventName) {
		if(!events[eventName]) return this;
		var args = Array.prototype.slice.call(arguments, 1);
		for ( var i = 0, l = events[eventName].length; i < l; i++ ) {
            var subscription = events[eventName][i];
            if(subscription.context) {
                subscription.callback.apply(subscription.context, args);
            } else {
                var entities = find(subscription.component);
                for(var j in entities) {
                    subscription.callback.apply(entities[j], args);
                }
            }
        }
        return this;
	}

	// Starts the game with a specific step
	function run(step) {
		step = step || (1000/60); // ~60 fps default
		isRunning = true;
		loop(step);
	}

	function loop(step) {
		if(isRunning) {
			publish('update', step);
			publish('predraw');
			publish('draw');
			publish('postdraw');
			setTimeout(function() {loop(step);}, step);
		}
	}

	gameWrapper.onmousedown = function(e) {
		e.isRightClick = e.which ? e.which == 3 : (e.button ? e.button == 2 : false);
		publish('mousedown', e);
	};

	gameWrapper.onmouseup = function(e) {
		publish('mouseup', e);
	};

	gameWrapper.onmousemove = function(e) {
		publish('mousemove', e);
	};

	onkeydown = function(e) {
		publish('keydown', e, e.keyCode);
		return false;
	};

	onkeyup = function(e) {
		publish('keyup', e, e.keyCode);
		return false;
	};

	return {
		e: createEntity,
		c: createComponent,
		cs: componentSubscribe,
		f: find,
		r: run,
		s: function() { isRunning = false; }
	};
};