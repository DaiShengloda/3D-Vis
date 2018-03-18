
/**
 * 点击镜头，模拟镜头看3D场景中物体的情况
 * 
 * 如果data的extend上设置了相关的参数(target,frontDistance,fav等参数)触发，否则双击后还是走以前直接出来视频窗口的界面
 *
 * 注意：如果fov有改变的话，那双击退出时是需要恢复到之前的fov!!! 
 * 
 */
var $SimulateCamera = function(sceneManager){
	this.sceneManager = sceneManager;
	this.dataManager = this.sceneManager.dataManager;
	this.camera = this.sceneManager.network3d.getCamera();
	this.init();
};

mono.extend($SimulateCamera,Object,{
	
    init: function() {
        var callback = main.nodeEventHander.showVideoDialog;
        var self = this;
        main.nodeEventHander.showVideoDialog = function(title, data) {
            self._doSimulateCamera(data, callback);
        };
        this.sceneManager.viewManager3d.addPropertyChangeListener(function(event) {
            if (event.property == "focusNode") {
                self.clear();
            }
        });
    },

    clear: function() {
        if (this.cones && this.cones.length > 0) {
            for (var i = 0; i < this.cones.length; i++) {
                this.sceneManager.network3d.dataBox.remove(this.cones[i]);
            };
            this.cones = [];
        };
    },

    _doSimulateCamera : function(data,callback){
    	if(!data || !data._extend){
    		return callback && callback();
    	}
    	var target = data._extend['target'];
    	var frontDistance = data._extend['frontDistance'];
    	var fov = data._extend['fov'];
    	if (!target && !frontDistance ) {
    		return callback && callback();
    	}
    	var dataNode = this.sceneManager.getNodeByDataOrId(data);
    	if (!dataNode) {
    		return callback && callback();
    	}
    	if (target) {
    		target = new mono.Vec3(parseFloat(target.x)||'0',parseFloat(target.y)||'0',parseFloat(target.z)||'0');
    	}
    	if (!target) {
    		target = dataNode.frontWorldPosition(frontDistance);
    	}
    	var pos = dataNode.getWorldPosition();
        var self = this;
        if (this.cones && this.cones.length > 0) {
            for (var i = 0; i < this.cones.length; i++) {
                this.sceneManager.network3d.dataBox.remove(this.cones[i]);
            };
            this.cones = [];
        };
        var callback = function() {
            var animate = new mono.Animate({
                from: 0,
                to: 1,
                due: 2000,
                onUpdate: function(value) {
                 // var value = 1;
                    if (!self.cones) {
                        self.cones = [];
                    }
                    var cone = self.createCone(fov || 50, 30, 1, 1000*value, pos, target);
                    if (cone) {
                        self.sceneManager.network3d.dataBox.add(cone);
                        self.cones.push(cone);
                    };
                }
            }).play();
        }
        var cameraPos = pos.clone();
        cameraPos = cameraPos.add(dataNode.frontDirection().multiplyScalar(-500)); //镜头的位置要后一点
        cameraPos.setY(cameraPos.y + 100);
    	mono.Utils.playCameraAnimation(this.camera, cameraPos, target, 1000,callback);// 注意这里执行完后不调用那个callback了
    },

    createCone : function(fov,width,aspect,length,cameraPos,cameraTarget){
            if(!fov || !width || !aspect || !length){
                return null;
            }
            var height = width*aspect;
            var dY = Math.sin(fov*Math.PI/360) * length;//最远的那个面的宽度：dy*2+width
            var dPX = dY/2; // 每个shapeNode中心点的偏移量

            // 左右面的path
            var path = new mono.Path();
            path.moveTo(-length/2,-height/2,0);
            path.lineTo(-length/2,height/2,0);
            path.lineTo(length/2,height/2+dY,0);
            path.lineTo(length/2,-height/2-dY,0);
            // left:
            var l_s = new mono.ShapeNode(path);
            l_s.s({
                'm.type':'phong',
                'm.color':'#00aaaa',
                'm.ambient':'#00aaaa',
            });
            l_s.setAmount(1);
            l_s.setZ(-dPX-width/2);
            l_s.setRotationY(fov*Math.PI/360);
            // right:
            var r_s = new mono.ShapeNode(path);
            r_s.s({
                'm.type':'phong',
                'm.color':'#00aaaa',
                'm.ambient':'#00aaaa',
            });
            r_s.setAmount(1);
            r_s.setZ(dPX+width/2);
            r_s.setRotationY(-fov*Math.PI/360);

            //上下面的path：
            path = new mono.Path();
            path.moveTo(-length/2,-width/2,0);
            path.lineTo(-length/2,width/2,0);
            path.lineTo(length/2,width/2+dY,0);
            path.lineTo(length/2,-width/2-dY,0);
            // up:
            var u_s = new mono.ShapeNode(path);
            u_s.s({
                'm.type':'phong',
                'm.color':'#00ffff',
                'm.ambient':'#00ffff',
                // 'm.wireframe':true,
            });
            u_s.setVertical(true);
            u_s.setAmount(1);
            u_s.setY(dPX+height/2);
            u_s.setRotationZ(fov*Math.PI/360);

            // down:
            var d_s = new mono.ShapeNode(path);
            d_s.s({
                'm.type':'phong',
                'm.color':'#00ffff',
                'm.ambient':'#00ffff',
                // 'm.wireframe':true,
            });
            d_s.setVertical(true);
            d_s.setAmount(1);
            d_s.setY(-dPX-height/2);
            d_s.setRotationZ(-fov*Math.PI/360);

            var combo = new mono.ComboNode([l_s,r_s,u_s,d_s],['+']);
            combo.s({
                'm.transparent':true,
                'm.opacity':0.2
            });

            var newPos = new mono.Vec3();
            var angles = this._getVectorAngles(cameraPos,cameraTarget);
            // var angles = this._getVectorAngles(cameraTarget,cameraPos);
            var hAngle = angles[0];
            var vAngle = angles[1];

            newPos.x = cameraPos.x + length/2 * Math.cos(hAngle * mono.Utils.DEGREES_TO_RADIANS);// * Math.cos(vAngle * DEGREES_TO_RADIANS);
            newPos.z = cameraPos.z + length/2 * Math.sin(hAngle * mono.Utils.DEGREES_TO_RADIANS);// * Math.cos(vAngle * DEGREES_TO_RADIANS);
            newPos.y = cameraPos.y + length * Math.sin(vAngle * mono.Utils.DEGREES_TO_RADIANS);
            combo.setPosition(newPos);
            combo.setRotationY((-1)*hAngle * mono.Utils.DEGREES_TO_RADIANS);
            return combo;
        },

        getXZAngle : function(cameraTarget,cameraPos){
            var angleX
        },

    _getVectorAngles: function(v1, v2) {
        var diff = v1;
        if (v2) {
            diff = v2.clone().sub(v1);
        }
        diff = diff.normalize();
        var vAngle = Math.asin(diff.y) * mono.Utils.RADIANS_TO_DEGREES;
        var hAngle = Math.atan2(diff.z, diff.x) * mono.Utils.RADIANS_TO_DEGREES;

        return [hAngle, vAngle];
    }

});

it.SimulateCamera = $SimulateCamera;


