;(function(window, undefined) {
    "use strict";

    function extend() {
        for(var i=1; i < arguments.length; i++) {
            for(var key in arguments[i]) {
                if(arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        return arguments[0];
    }

    var pluginName = "tinyscrollbar"
    ,   defaults = {
            axis: 'y'
        ,   wheel: true
        ,   wheelSpeed: 60
        ,   wheelLock: true
        ,   touchLock: true
        ,   trackSize: false
        ,   thumbSize: false
        ,   thumbSizeMin: 1
		,	arrows:	true
		,	autoWrap: false
        }
    ;

    function Plugin($container, options) {
        /**
         * The options of the carousel extend with the defaults.
         *
         * @property options
         * @type Object
         * @default defaults
         */
        this.options = extend({}, defaults, options);

        /**
         * @property _defaults
         * @type Object
         * @private
         * @default defaults
         */
        this._defaults = defaults;

        /**
         * @property _name
         * @type String
         * @private
         * @final
         * @default 'tinyscrollbar'
         */
        this._name = pluginName;
		
		if(this.options.autoWrap) {
			_wrapHtml();
		}

        var self = this
        ,   $body = document.querySelectorAll("body")[0]
        ,   $viewport = $container.querySelectorAll(".viewport")[0]
        ,   $overview = $container.querySelectorAll(".overview")[0]
        ,   $scrollbar = $container.querySelectorAll(".scrollbar")[0]
        ,   $track = $scrollbar.querySelectorAll(".track")[0]
        ,   $thumb = $scrollbar.querySelectorAll(".thumb")[0]
		,	$arrowInc = $scrollbar.querySelectorAll(".increment")[0]
		,	$arrowDec = $scrollbar.querySelectorAll(".decrement")[0]

        ,   mousePosition = 0
        ,   isHorizontal = this.options.axis === 'x'
        ,   hasTouchEvents = ("ontouchstart" in document.documentElement)
        ,   wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : 
                             document.onmousewheel !== undefined ? "mousewheel" :
                             "DOMMouseScroll"	// browser compatibility

        ,   sizeLabel = isHorizontal ? "width" : "height"
        ,   posiLabel = isHorizontal ? "left" : "top"
        ,   moveEvent = document.createEvent("HTMLEvents")
        ;

        moveEvent.initEvent("move", true, true);

        /**
         * The position of the content relative to the viewport.
         *
         * @property contentPosition
         * @type Number
         * @default 0
         */
        this.contentPosition = 0;

        /**
         * The height or width of the viewport.
         *
         * @property viewportSize
         * @type Number
         * @default 0
         */
        this.viewportSize = 0;

        /**
         * The height or width of the content.
         *
         * @property contentSize
         * @type Number
         * @default 0
         */
        this.contentSize = 0;

        /**
         * The ratio of the content size relative to the viewport size.
         *
         * @property contentRatio
         * @type Number
         * @default 0
         */
        this.contentRatio = 0;

        /**
         * The combined height or width of both scrollbar arrows.
         *
         * @property totalArrowSize
         * @type Number
         * @default 0
         */
        this.totalArrowSize = 0;

        /**
         * The height or width of the content.
         *
         * @property trackSize
         * @type Number
         * @default 0
         */
        this.trackSize = 0;

        /**
         * Optional inc/dec arrows.
         *
         * @property arrows
         * @type Boolean
         * @default true
         */
        this.arrows = true;

        /**
         * Optional HTML auto-wrap.
         *
         * @property autoWrap
         * @type Boolean
         * @default false
         */
        this.autoWrap = false;

        /**
         * The size of the track relative to the size of the content.
         *
         * @property trackRatio
         * @type Number
         * @default 0
         */
        this.trackRatio = 0;

        /**
         * The height or width of the thumb.
         *
         * @property thumbSize
         * @type Number
         * @default 0
         */
        this.thumbSize = 0;

        /**
         * The position of the thumb relative to the track.
         *
         * @property thumbPosition
         * @type Number
         * @default 0
         */
        this.thumbPosition = 0;

        /**
         * Will be true if there is content to scroll.
         *
         * @property hasContentToScroll
         * @type Boolean
         * @default false
         */
        this.hasContentToScroll = false;

        /**
         * Will be true when user is activating arrows.
         *
         * @property arrowActive
         * @type Boolean
         * @default false
         */
        this.arrowActive = false;

        /**
         * Will be true when user is using arrows.
         *
         * @property arrowInterval
         * @type Function
         * @default null
         */
        this.arrowIntervals = [];

        /**
         * Kills an active autoScroll.
         *
         * @property autoKill
         * @type Function
         * @default void
         */
        this.autoKill = function(){void(0)};

        /**
         * @method _initialize
         * @private
         */
        function _initialize() {
            self.update();
            _setEvents();

            return self;
        }

        /**
         * You can use the update method to adjust the scrollbar to new content or to move the scrollbar to a certain point.
         *
         * @method update
         * @chainable
         * @param {Number|String} [scrollTo] Number in pixels or the values "relative" or "bottom". If you dont specify a parameter it will default to top
         */
        this.update = function(scrollTo) {
            var sizeLabelCap = sizeLabel.charAt(0).toUpperCase() 
				+ 	sizeLabel.slice(1).toLowerCase()
            , 	scrcls = $scrollbar.className;
			
			this.totalArrowSize = !this.options.arrows ? 0 :
					$arrowInc['client' + sizeLabelCap]
				+	$arrowDec['client' + sizeLabelCap];
            this.viewportSize = $viewport['offset'+ sizeLabelCap];
            this.contentSize = $overview['scroll'+ sizeLabelCap];
            this.contentRatio = this.viewportSize / this.contentSize;
			
            this.trackSize = (this.options.trackSize - this.totalArrowSize)
				|| this.viewportSize;
            this.thumbSize = Math.min(this.trackSize
				, Math.max(this.options.thumbSizeMin
					, (this.options.thumbSize 
						|| (this.trackSize * this.contentRatio)
						)
					)
				);
            this.trackRatio = (this.contentSize - this.viewportSize) / (this.trackSize - this.thumbSize);
            this.hasContentToScroll = this.contentRatio < 1;

            $scrollbar.className = this.hasContentToScroll ? scrcls.replace(/disable/g, "") : scrcls.replace(/ disable/g, "") + " disable";

            switch (scrollTo) {
                case "bottom":
                    this.contentPosition = Math.max(this.contentSize - this.viewportSize, 0);
                    break;

                case "relative":
                    this.contentPosition = Math.min(Math.max(this.contentSize - this.viewportSize, 0), Math.max(0, this.contentPosition));
                    break;

                default:
                    this.contentPosition = parseInt(scrollTo, 10) || 0;
            }

            this.thumbPosition = self.contentPosition / self.trackRatio;

            _setCss();

            return self;
        };

        /**
         * You can use the set method to set new scrollbar properties
         *
         * @method set
         * @chainable
         * @param Object An object of tinyscrollbar properties
         */
		this.set = function(opts,scrollTo){
			this.options = extend({}, self.options, opts);
			return this.update(scrollTo);
		};

        /**
         * You can use the autoScroll method to scroll to a preset location
         *
         * @method autoScroll
         * @chainable
         * @param Object An object of autoScroll properties
         */
		this.autoScroll = function(parameters){
            var posiLabelCap = posiLabel.charAt(0).toUpperCase() 
				+ 	posiLabel.slice(1).toLowerCase()
			,	sizeLabelCap = sizeLabel.charAt(0).toUpperCase() 
				+ 	sizeLabel.slice(1).toLowerCase();
			
			var asDefaults = {
					from : self.contentPosition
				,	to : self.contentPosition
				,	t : 3
				,	delay : 0
				,	onAutoKill : function(){void(0);}
				,	onComplete : function(){void(0);}
				}
			,	start = null
			,	dlyStart = +new Date()
			,	params = extend({}, asDefaults, parameters)
			,	frames = []
			,	killed = false
			,	dur = params.t * 1000
			,	dly = params.delay * 1000;
			
			params.to = params.to == 'max' ?
					self.contentSize - self.viewportSize
				:	typeof params.to == 'object' ?
						params.to['offset'+posiLabelCap] - $container['client' + sizeLabelCap]
					:	params.to;
			
			var _tween = function(t,T,t0,xf,x0){
				return t*(xf-x0)/T+x0;	// returns current x value
			}
			
			this.autoKill = function autoKill(){
				
				killed = true;
				
				while(frames.length > 0) {
					window.cancelAnimationFrame(frames[0]);
					frames.length--;
				}
				
				$scrollbar.removeEventListener('mousedown',autoKill);
				$thumb.removeEventListener('mousedown',autoKill);
				$container.removeEventListener(wheelEvent,autoKill);
				
				params.onAutoKill.call();
			}
			
			var step = function(timestamp) {
				
				if(!dlyStart) {
					dlyStart = timestamp;
					step(+new Date());
				}
				if(timestamp < (dlyStart + dly)) {
					frames[frames.length] = window.requestAnimationFrame(function(){step(+new Date);});
					return;
				}
				if(!start) { start = timestamp; }
				var t = timestamp - start
				,	pos = _tween(t,dur,start,params.to,params.from);
				
				if(t >= dur){
					killed = true;
					params.onComplete.call();
				}
				
				if(killed) {return;}
				
				self.update(Math.min(pos, params.to));
				
				if (t < dur) {
					frames[frames.length] = window.requestAnimationFrame(function(){step(+new Date);});
				}
			}
				
			$scrollbar.addEventListener('mousedown',this.autoKill);
			$thumb.addEventListener('mousedown',this.autoKill);
			$container.addEventListener(wheelEvent,this.autoKill);

			frames[frames.length] = window.requestAnimationFrame(function(){step(+new Date);});
			
			return self;
		};

        /**
         * @method _setCss
         * @private
         */
        function _setCss() {
            $thumb.style[posiLabel] = self.thumbPosition + "px";
            $overview.style[posiLabel] = -self.contentPosition + "px";
            $scrollbar.style[sizeLabel] = (self.trackSize + self.totalArrowSize) + "px";
            $track.style[sizeLabel] = self.trackSize + "px";
            $thumb.style[sizeLabel] = self.thumbSize + "px";
        }

        /**
         * @method _setEvents
         * @private
         */
        function _setEvents() {
            if(hasTouchEvents) {
                $viewport.ontouchstart = function(event) {
                    if(1 === event.touches.length) {
                        _start(event.touches[0]);
                        event.stopPropagation();
                    }
                };
            }
            else {
                $thumb.onmousedown = function(event) {
                    event.stopPropagation();
                    _start(event);
					return false;
                };

                $track.onmousedown = function(event) {
                    _start(event, true);
					return false;
                };
            }

            window.addEventListener("resize", function() {
               self.update("relative");
            }, true);

            if(self.options.wheel && window.addEventListener) {
                $container.addEventListener(wheelEvent, _wheel, false );
            }
            else if(self.options.wheel) {
                $container.onmousewheel = _wheel;
            }
			
			if(self.options.arrows && window.addEventListener) {
				$arrowInc.addEventListener('mousedown',function(){_arrowOn(1);});
				$arrowDec.addEventListener('mousedown',function(){_arrowOn(-1);});
				
				$arrowInc.addEventListener('mouseup',function(){_arrowOff();});
				$arrowDec.addEventListener('mouseup',function(){_arrowOff();});
				
				$arrowInc.addEventListener('mouseout',function(){_arrowOff();});
				$arrowDec.addEventListener('mouseout',function(){_arrowOff();});
			}
        }

        /**
         * @method _isAtBegin
         * @private
         */
        function _isAtBegin() {
            return self.contentPosition > 0;
        }

        /**
         * @method _isAtEnd
         * @private
         */
        function _isAtEnd() {
            return self.contentPosition <= (self.contentSize - self.viewportSize) - 5;
        }

        /**
         * @method _start
         * @private
         */
        function _start(event, gotoMouse) {
            if(self.hasContentToScroll) {
                var posiLabelCap = posiLabel.charAt(0).toUpperCase() + posiLabel.slice(1).toLowerCase();
                mousePosition = gotoMouse ? $thumb.getBoundingClientRect()[posiLabel] : (isHorizontal ? event.clientX : event.clientY);

                $body.className += " noSelect";

                if(hasTouchEvents) {
                    document.ontouchmove = function(event) {
                        if(self.options.touchLock || _isAtBegin() && _isAtEnd()) {
                            event.preventDefault();
                        }
                        _drag(event.touches[0]);
                    };
                    document.ontouchend = _end;
                }
                else {
                    document.onmousemove = _drag;
                    document.onmouseup = $thumb.onmouseup = _end;
                }
				
				self.update('relative');

                _drag(event);
            }
        }

        /**
         * @method _wheel
         * @private
         */
        function _wheel(event) {
            if(self.hasContentToScroll) {
				self.update('relative');	// expensive quick fix - consider removing
                var evntObj = event || window.event
                ,   wheelSpeedDelta = -(evntObj.deltaY || evntObj.detail || (-1 / 3 * evntObj.wheelDelta)) / 40
                ,   multiply = (evntObj.deltaMode === 1) ? self.options.wheelSpeed : 1
                ;

                self.contentPosition -= wheelSpeedDelta * self.options.wheelSpeed;
                self.contentPosition = Math.min((self.contentSize - self.viewportSize), Math.max(0, self.contentPosition));
                self.thumbPosition = self.contentPosition / self.trackRatio;

                $container.dispatchEvent(moveEvent);

                $thumb.style[posiLabel] = self.thumbPosition + "px";
                $overview.style[posiLabel] = -self.contentPosition + "px";

                if(self.options.wheelLock || _isAtBegin() && _isAtEnd()) {
                    evntObj.preventDefault();
                }
            }
        }

        /**
         * @method _drag
         * @private
         */
        function _drag(event) {
            if(self.hasContentToScroll)
            {
                var mousePositionNew = isHorizontal ? event.clientX : event.clientY
                ,   thumbPositionDelta = hasTouchEvents ? (mousePosition - mousePositionNew) : (mousePositionNew - mousePosition)
                ,   thumbPositionNew = Math.min((self.trackSize - self.thumbSize), Math.max(0, self.thumbPosition + thumbPositionDelta))
                ;

                self.contentPosition = thumbPositionNew * self.trackRatio;

                $container.dispatchEvent(moveEvent);

                $thumb.style[posiLabel] = thumbPositionNew + "px";
                $overview.style[posiLabel] = -self.contentPosition + "px";
            }
        }


        /**
         * @method _end
         * @private
         */
        function _end() {
            self.thumbPosition = parseInt($thumb.style[posiLabel], 10) || 0;

            $body.className = $body.className.replace(" noSelect", "");
            document.onmousemove = document.onmouseup = null;
            $thumb.onmouseup = null;
            $track.onmouseup = null;
            document.ontouchmove = document.ontouchend = null;
        }


        /**
         * @method _arrowScroll
         * @private
         */
        function _arrowScroll(direction) {
			var arrowDelta = 3
			,	newPos = self.contentPosition + (direction * arrowDelta);
			
			if(newPos < 0) {
				self.update(0);
			} else if(newPos > (self.contentSize - self.viewportSize)) {
				self.update(self.contentSize - self.viewportSize);
			} else {
				self.update(newPos);
			}
        }


        /**
         * @method _arrowDown
         * @private
         */
        function _arrowOn(direction) {
			if(!self.arrowActive) {
				self.arrowActive = true;
				self.arrowIntervals[self.arrowIntervals.length] = setInterval(function(){
					_arrowScroll(direction);
				},1);
			}
        }


        /**
         * @method _arrowOff
         * @private
         */
        function _arrowOff() {
			if(self.arrowActive) {
				self.arrowActive = false;
				_clearAllIntervals(self.arrowIntervals);
			}
		}
		


        /**
         * @method _clearAllIntervals
         * @private
         */
        function _clearAllIntervals(intervals) {
			for(var i = 0; i < intervals.length; i++){
				clearInterval(intervals[i]);
				intervals.length--;
			}
        }

        /**
         * @method _wrapHtml
         * @private
         */
        function _wrapHtml() {
			$container.innerHTML = 
				 '<div class="scrollbar">'
				+	'<div class="decrement"></div>'
				+	'<div class="increment"></div>'
				+	'<div class="track">'
				+		'<div class="thumb"></div>'
				+	'</div>'
				+'</div>'
				+'<div class="viewport">'
				+	'<div class="overview">'
				+		$container.innerHTML
				+	'</div>'
				+'</div>';
			$container.style.overflow = 'hidden';
        }

        return _initialize();
    }

    /**
    * @class window.tinyscrollbar
    * @constructor
    * @param {Object} [$container] Element to attach scrollbar to.
    * @param {Object} options
        @param {String} [options.axis='y'] Vertical or horizontal scroller? ( x || y ).
        @param {Boolean} [options.wheel=true] Enable or disable the mousewheel.
        @param {Boolean} [options.wheelSpeed=40] How many pixels must the mouswheel scroll at a time.
        @param {Boolean} [options.wheelLock=true] Lock default window wheel scrolling when there is no more content to scroll.
        @param {Number} [options.touchLock=true] Lock default window touch scrolling when there is no more content to scroll.
        @param {Boolean|Number} [options.trackSize=false] Set the size of the scrollbar to auto(false) or a fixed number.
        @param {Boolean|Number} [options.thumbSize=false] Set the size of the thumb to auto(false) or a fixed number
        @param {Boolean} [options.thumbSizeMin=1] Minimum thumb size.
		@param {Boolean} [options.arrows=false] Turns arrows on or off
    */
    var tinyscrollbar = function($container, options) {
        return new Plugin($container, options);
    };

    if(typeof define == 'function' && define.amd) {
        define(function(){ return tinyscrollbar; });
    }
    else if(typeof module === 'object' && module.exports) {
        module.exports = tinyscrollbar;
    }
    else {
        window.tinyscrollbar = tinyscrollbar;
    }
})(window);
