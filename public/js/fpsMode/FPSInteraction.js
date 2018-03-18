
it.FPSInteraction = function(network){
	TGL.BaseInteraction.call(this, network);
	var pitch = new mono.Element();
	var yaw = new mono.Element();
	pitch.setParent(yaw);
	var camera = network.getCamera();
	this.object = camera;
	var position = camera.p();
	var rotation = camera.getRotation();
	var target = camera.getTarget();
	var sub = position.clone().sub(target);
	var length = sub.length();
	this.moveSpeed = 1;
	this.rotateSpeed = 1;
	function init(){
		yaw.p(position);
		var x = sub.x,y = sub.y,z = sub.z;
		var ry = Math.atan(z,x)  - Math.PI/2;
		var rx = Math.asin(-y / Math.sqrt(x * x + z * z));
		yaw.setRotation(0,ry,0);
		pitch.setRotation(rx,0,0);
	}
	init();
	var moveForward,moveLeft,moveBackward,moveRight,canJump = false;
	this.domElement = this.network.getRootView();
	var lastX = 0,lastY = 0,mousedown = false,prevTime = null;
	var offsetX = 0,offsetY = 0;
	var PI_2 = Math.PI / 2;
	 this.handle_mousedown = function(event) {
	 	event.preventDefault();
	 	this.addListener('mousemove', 'mouseup');
	 	lastX = event.clientX,lastY = event.clientY,mousedown = true;
	 }

	 this.handle_dblclick = function(event) {
		// console.log('dblclick')
	}

  	this.updateCamera = function(pos,tar){
	 	position = pos;
	 	target = tar;
	 	sub = target.clone().sub(position)
	 	length = sub.length();
	 	camera.p(pos);
	 	camera.lookAt(tar);
	 	rotation = camera.getRotation();
	 	init();
	 	this.network.dirtyNetwork();
	}

	 this.handle_mousemove = function(event){
	 	event.preventDefault();
	 	if(mousedown){
	 		offsetX = event.clientX - lastX;
	 		offsetY = event.clientY - lastY;
	 		lastX = event.clientX;
	 		lastY = event.clientY;
	 		var ry = yaw.getRotationY(),rx = pitch.getRotationX();
	 		ry += offsetX/ 200 * this.rotateSpeed;
	 		rx += offsetY/200 * this.rotateSpeed;
	 		yaw.setRotationY(ry);
	 		rx = Math.max( - PI_2, Math.min( PI_2, rx ) );
	 		pitch.setRotationX(rx);

	 		this.network.dirtyNetwork();
	 	}
	 }

	 this.handle_mouseup = function(){
	 	this.removeListener('mousemove','mouseup');
	 	mousedown = false;
	 }

	 this.handle_keydown  = function(){
	 	switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true; break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
				break;

		}
		this.network.dirtyNetwork();
	 }

	 this.handle_keyup = function(){
	 	switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
		prevTime = null;
		this.network.dirtyNetwork();
	 }

	 this.update = function(){
		var time = new Date().getTime();
		
		var delta = (time - prevTime)/ 1000;
		if(prevTime == null){
			delta = 0;
		}
		if(delta > 10){
			delta = 10;
		}
		var velocity = new mono.Vec3();
		var speed = 20 * this.moveSpeed;
		if(moveForward){
			velocity.z -= speed * delta;
		}
		if(moveBackward){
			velocity.z += speed *delta;
		}
		if(moveLeft){
			velocity.x -= speed * delta;
		}
		if(moveRight){
			velocity.x += speed * delta;
		}
		yaw.translateX(velocity.x);
		yaw.translateZ(velocity.z);
		var pos = yaw.p();
		var target = pos.clone(),rx = pitch.getRotationX(),ry = yaw.getRotationY() + Math.PI/2;
		target.y += length * Math.sin(rx);
		target.x += length * Math.cos(rx) * Math.cos(ry);
		target.z += -length * Math.cos(rx) * Math.sin(ry);
		camera.p(pos);
		camera.lookAt(target)

		prevTime = time;
	 },

	 this.handleCameraChange = function(){

	 }
}

mono.extend(it.FPSInteraction,mono.BaseInteraction,{

	 setUp : function() {
	 	this.addListener('mousedown', 'touchstart', 'touchend', 'touchmove',  'dblclick', 'keydown', 'keyup');
	 	if(this.object){
	 		this.object.addPropertyChangeListener(this.handleCameraChange,this);
	 	}
	 },

	 tearDown : function() {
	 	this.removeListener('mousedown', 'touchstart', 'touchend', 'touchmove' ,'dblclick', 'keydown', 'keyup');
	 	if(this.object){
	 		this.object.removePropertyChangeListener(this.handleCameraChange,this);	
	 	}
	 },
});