it.SphereInteraction = function (network) {
	mono.BaseInteraction.call(this, network);
	this.domElement = this.network.getRootView();
	this.rotateSpeed = 1;
	this.zoomSpeed = 1;
	var mouseX, mouseY;
	var camera = network.getCamera();
	var angleH, angleV, length;

	this.touchSeq =  [1,2,3];

	var touchLength;

	this.update = function () {
		var target = camera.t();
		var y = length * Math.sin(angleV), xz = length * Math.cos(angleV);
		var x = xz * Math.sin(angleH), z = xz * Math.cos(angleH);
		camera.p(x, y, z);
		camera.lookAt(target);
	};

	var self = this;
	computeInitValue();
	function computeInitValue() {
		var pos = camera.p(), target = camera.t();
		var sub = pos.clone().sub(target);
		length = sub.length();
		var x = sub.x, y = sub.y, z = sub.z;
		var sqrtXZ = Math.sqrt(x * x + z * z);
		angleH = Math.atan2(x, z);
		angleV = Math.asin(y / length);
		// console.log(angleH);
		self.update();
	}

	this.handle_mousedown = function (event) {
		event.preventDefault();
		mouseX = event.clientX;
		mouseY = event.clientY;
		this.addListener('mousemove');
		this.addListener('mouseup');
	};

	this.handle_mousemove = function (event) {
		event.preventDefault();
		var clientX = event.clientX, clientY = event.clientY;
		updateAngle(clientX,clientY);
	};

	function updateAngle(clientX,clientY,adjustCount){
		adjustCount = adjustCount || 500;
		var offsetX = clientX - mouseX, offsetY = clientY - mouseY;
		var rotateHSpeed = self.rotateHSpeedFunction(angleH),
			rotateVSpeed = self.rotateVSpeedFunction(angleV);
		angleH -= offsetX / adjustCount * rotateHSpeed, angleV += offsetY / adjustCount * rotateVSpeed;
		if (angleV > Math.PI / 2) {
			angleV = Math.PI / 2;
		}
		if (angleV < -Math.PI / 2) {
			angleV = -Math.PI / 2
		}
		mouseX = clientX, mouseY = clientY;
		self.update();
	}

	this.handle_mouseup = function (event) {
		event.preventDefault();
		mouseX = null
		mouseY = null;
		this.removeListener('mousemove');

		this.afterHandleMouseUp();
	};

	this.handle_touchstart = function(event) {
		switch (event.touches.length){
			case this.touchSeq[0]:
			// event.preventDefault(); // 2018-01-10不能阻止，一阻止双击事件就监听不到了
			mouseX = event.touches[0].pageX;
			mouseY = event.touches[0].pageY;
			break;
			case this.touchSeq[1]:
			var dx = event.touches[0].pageX - event.touches[1].pageX;
			var dy = event.touches[0].pageY - event.touches[1].pageY;

			touchLength = Math.sqrt(dx * dx + dy * dy);
			break;
			default:
			return;
		}
		
	};

	 this.handle_touchmove = function(event) {
	 	switch (event.touches.length){
			case this.touchSeq[0]:
			event.preventDefault();
			pageX = event.touches[0].pageX;
			pageY = event.touches[0].pageY;
			if(mouseX != null && mouseY != null){
				updateAngle(pageX,pageY);
			}
			break;
			case this.touchSeq[1]:
			var dx = event.touches[0].pageX - event.touches[1].pageX;
			var dy = event.touches[0].pageY - event.touches[1].pageY;
			var l = Math.sqrt(dx * dx + dy * dy);
			length = length * l / touchLength;
			if (this.minDistance != null && length < this.minDistance) {
				length = this.minDistance;
			}
			if (this.maxDistance != null && length > this.maxDistance) {
				length = this.maxDistance;
			}
			this.update();
			break;
			default:
			return;
		}

	};

	this.handle_touchend = function(event) {
	 	// event.preventDefault(); // 2018-01-10不能阻止，一阻止双击事件就监听不到了
		mouseX = null
		mouseY = null;
		touchLength = null;
		this.afterHandleMouseUp();
	};

	this.wrapMouseWheelDelta = function(event){
		var delta = 0;
		if (event.wheelDelta) {// WebKit / Opera / Explorer 9
			if (event.wheelDelta % 120 === 0) {
				delta = event.wheelDelta / 40;
			} else if (Math.abs(event.wheelDelta) >= 100) {
				delta = event.wheelDelta / 40;
			} else {
				delta = event.wheelDelta;
			}
		} else if (event.detail) {// Firefox
			delta = -event.detail / 3;
		}
		return delta;
	};

	this.handle_mousewheel = function (event) {
		event.preventDefault();
		// event.stopPropagation();
		var delta = this.wrapMouseWheelDelta(event);
		
		if (delta) {
			length -= delta * this.zoomSpeed;
		}
		if (this.minDistance != null && length < this.minDistance) {
			length = this.minDistance;
		}
		if (this.maxDistance != null && length > this.maxDistance) {
			length = this.maxDistance;
		}
		this.update();
	};


	this.handle_DOMMouseScroll = function (event) {
		this.handle_mousewheel(event);
	};

	this.setAngleH = function (v, animateTime) {
		if (animateTime) {
			var self = this;
			var oAngleH = angleH;
			new mono.Animate({
				from: 0,
				to: 1,
				type: 'number',
				dur: animateTime,
				easing: 'easeNone',
				onUpdate: function (value) {
					angleH = oAngleH + value * (v - oAngleH);
					self.update();
				},
				onDone: function(){
					self.rollbackDone && self.rollbackDone()
				}
			}).play();
		} else {
			angleH = v;
			this.update();
		}

	};

	this.getAngleH = function () {
		return angleH
	};

	this.setAngleV = function (v, animateTime) {
		if (animateTime) {
			var self = this;
			var oAngleV = angleV;
			new mono.Animate({
				from: 0,
				to: 1,
				type: 'number',
				dur: animateTime,
				easing: 'easeNone',
				onUpdate: function (value) {
					angleV = oAngleV + value * (v - oAngleV);
					self.update();
				}
			}).play();
		} else {
			angleV = v;
			this.update();
		}
	};

	this.getAngleV = function () {
		return angleV;
	};
};

mono.extend(it.SphereInteraction, mono.BaseInteraction, {

	__accessor: ['rotateSpeed', 'zoomSpeed', 'panSpeed', 'yLowerLimitAngle', 'yUpLimitAngle', 'minDistance', 'maxDistance', 'easing', 'touchSeq'],
	rotateHSpeedFunction: function (angleH) {
		return this.rotateSpeed || 1;
	},

	rotateVSpeedFunction: function (angleV) {
		return this.rotateSpeed || 1;
	},
	afterHandleMouseUp: function () {

	},
	/**
	 * @private
	 */
	setUp: function () {
		// this.addListener('mousedown', 'touchstart', 'touchend', 'touchmove', 'mousewheel', 'DOMMouseScroll', 'dblclick', 'keydown', 'keyup');
		this.addListener('mousedown', 'touchstart', 'touchend', 'touchmove','mousewheel', 'DOMMouseScroll');
	},
	/**
	 * @private
	 */
	tearDown: function () {
		this.removeListener('mousedown', 'touchstart', 'touchend', 'touchmove', 'mousewheel', 'DOMMouseScroll', 'dblclick', 'keydown', 'keyup');
	},
	/**
	 * @private
	 */
	beforeUpdate: function () {

	},

});

