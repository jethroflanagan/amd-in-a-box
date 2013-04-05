(function()
{
	var listeners = [];
	var $ = null;

	function init(jQuery) {
		$ = jquery;
	}


	function onMouseDown(target, callback, args, includeEvent)
	{
		var run = function(e)
		{
			runCallback(callback, e, args, includeEvent);
		}

		target.on('touchstart', run);
		target.on('mousedown', run);
	}

	function onMouseUp(target, callback, args, includeEvent)
	{
		var run = function(e)
		{
			runCallback(callback, e, args, includeEvent);
		}

		target.on('touchend', run);
		target.on('mouseup', run);
	}

	function onMouseOver(target, callback, args, includeEvent)
	{
		var run = function(e)
		{
			runCallback(callback, e, args, includeEvent);
		}

		target.on('mouseover', run);
	}

	function onMouseOut(target, callback, args, includeEvent)
	{
		var run = function(e)
		{
			runCallback(callback, e, args, includeEvent);
		}

		target.on('mouseout', run);
	}

	function onClick(target, callback, args, includeEvent)
	{
		var run = function(e)
		{
			runCallback(callback, e, args, includeEvent);
		}

		target.on('tap', run);
		target.on('click', run);
	}

	function onKeyDown(target, callback, args, includeEvent)
	{
		var run = function(e)
		{
			runCallback(callback, e, args, includeEvent);
		}

		$(window).keydown(run);
	}

	function removeClick(target, callback)
	{
		target.off('tap', run);
		target.off('click', run);
	}

	/* PRIVATE */
	function runCallback(callback, e, args, includeEvent)
	{
		//deref args or stacking occurs

		var a = null;
		if (args != undefined)
			a = args.slice();
		else
			a = [];

		if (includeEvent === true)
			a.unshift(e);

		callback.apply(this, a);
	}

	/**
	 *
	 * @param eventType
	 * @param target:   set as null to dispatch from the context
	 * @param params:   object
	 */
	function dispatch(target, eventType, data)
	{
        if (eventType == null)
            throw new Error('Event type cannot be undefined');

		var ids = getListeners(target, eventType);
        //console.log('dispatch event [ target =', target, ', type =', eventType, ', data =', data, ', ids =', ids != -1 ? ids.join(', ') : '' , ']');

		if (ids == -1)
			return;

		for (var i = 0; i < ids.length; i++) {
			var callback = listeners[ids[i]].callback;
			callback(new Event(target, eventType, data));
		}
	}

	function addListener(target, eventType, callback)
	{
        if (eventType == null)
            throw new Error('Event type cannot be undefined');

		var ids = getListeners(target, eventType, callback);
		if (ids == -1)
			listeners.push({target: target, eventType: eventType, callback: callback});
	}

	function removeListener(target, eventType, callback)
	{
		var ids = getListeners(target, eventType, callback);

		if (ids == -1)
			return;

		for (var i = 0; i < ids.length; i++) {
			listeners.splice(ids[i], 1);
		}
	}

	/**
	 *
	 * @param target
	 * @param eventType
	 * @param callback:     May be null, if you need to find the callback itself
	 * @return {Number}
	 */
	function getListeners(target, eventType, callback)
	{
		var matchedIds = [];

		for (var i = 0; i < listeners.length; i++)
		{
			var listener = listeners[i];
			////////console.log(target,'=', listener.target, '|', eventType, '=', listener.eventType);
			if (listener.target == target && listener.eventType == eventType)
			{
				if (callback === undefined || listener.callback == callback)
					matchedIds.push(i);
			}
		}

		return (matchedIds.length > 0) ? matchedIds : -1;
	}

	function Event(target, eventType, data)
	{
		this.target = target;
		this.eventType = eventType;
		this.data = data;
		return this;
	}

	function EventType(id)
	{
		this.id = id;
		return this;
	}

	/** 
	 for creating event ids.
	 do something like 
	 	var create = box.event.createEvent('my event type');
	
	 	return {
	 		myEvent: create('my event')
	 	};
	 where 'my event type' can be anything (and is better as an object to prevent collisions)

	 or (more formally, and consistently):
		var type = new box.event.EventType('my event type');
	 	var create = box.event.createEvent(type);

	 	return {
	 		myEvent: create('my event')
	 	};
	 
	 The event type does not have to be a string. The best and simplest case for non-colliision would be to 
	 make each type id an empty object ({}). A string is just helpful in debugging.
	*/
	function createEvent(type) {
		return function(id) {
			return {type: type, id: id};
		}
	}

	window.box.event = {
		onMouseDown: onMouseDown,
		onMouseUp: onMouseUp,
		onMouseOver: onMouseOver,
		onMouseOut: onMouseOut,
		onClick: onClick,
		onKeyDown: onKeyDown,
		removeClick: removeClick,
		addListener: addListener,
		removeListener: removeListener,
		dispatch: dispatch,
		init: init,
		createEvent: createEvent, 
		EventType: EventType
	};
	box.scriptLoaded();
})();
