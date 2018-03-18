/**
 * 告警动画(模拟巡检告警动作)  设备 rack67_E02
 * @param sceneManager
 * @constructor
 */
var AlarmAnimateManager = function () {


    this.holdTime = 0;
    this.playTime = 1000;
    this.waitTime = 10;
    this.camera = main.sceneManager.network3d.getCamera();
    this.dataBox = main.sceneManager.network3d.getDataBox();
    this.defaultInteraction = main.sceneManager.network3d.getDefaultInteraction();
    this.finder = new mono.QuickFinder(this.dataBox, 'bid', 'client');

    //移动到门前
    //开门
    //移动到机柜前
    //lookAt 机柜, 拉出设备
    // rack69的位置  {x: -6150, y: 1111, z: -685}
    this.p0 = {x: -6732, y: 1111, z: -2160};
    this.p1 = {x: -6732, y: 1111, z: -160};
    this.p2 = {x: -6500, y: 1111, z: -160};
    this.p3 = {x: -6500, y: 1111, z: -830};
    this.p4 = {x: -6150, y: 1111, z: -830};
    this.p5 = {x: -6150, y: 1111, z: -685};
    this.dis = 10;
    this.left = -150;
    this.right = 150;
    this.back = -150;
    this.front = 150;
    this.actions = [
        {
            type: 'move',//起始点
            p: this.p0,
            dir: 'front'
        },
        {
            type: 'animate',
            target: ['floor02-49-right', 'floor02-49-left'],
        },
        {
            type: 'move',//
            p: this.p1,
            dir: 'front',
            waitTime: 500,
            playTime: 2000,
        },
        {
            type: 'animate',
            target: ['floor02-49-right', 'floor02-49-left'],
            async: true,
        },
        {
            type: 'move',//
            p: this.p1,
            dir: 'right',
        },
        {
            type: 'animate',
            target: 'floor02-112',
        },
        {
            type: 'move',//
            p: this.p2,
            dir: 'right',
            waitTime: 1000,
        },
        {
            type: 'move',//
            p: this.p2,
            dir: 'back',
        },
        {
            type: 'animate',
            target: 'floor02-112',
            async: true,
        },
        {
            type: 'move',//
            p: this.p3,
            dir: 'back',
        },
        {
            type: 'move',//
            p: this.p3,
            dir: 'right',
        },
        {
            type: 'move',//
            p: this.p4,
            dir: 'right',
        },
        {
            type: 'move',//
            p: this.p4,
            dir: 'front',
            holdTime: 1000,
        },
        {
            type: 'focus',//
            target: "rack69",
        },
        {
            type: 'animate',//
            target: "rack69_E01",
        }
    ];

};

mono.extend(AlarmAnimateManager, Object, {

    play: function () {

        var self = this;
        var c = this.camera;
        var position = c.p().clone();
        var target = c.getTarget().clone();
        var p = new mono.Vec3(position.x, position.y, position.z);
        var t = new mono.Vec3(target.x, target.y, target.z);
        this.playActions(this.actions, 0, function () {
            console.log('alarm animate complete ...')
        })
    },
    playActions: function (actions, index, calback) {

        var self = this;
        index = index || 0;
        var action = actions[index];
        this.playAction(action, function () {

            if (index + 1 <= actions.length - 1) {
                setTimeout(function(){
                    self.playActions(actions, index + 1, calback)
                }, 10)
            } else {
                calback && calback()
            }

        })

    },

    playAction: function(action, callback){

        if (action.async) {
            callback && callback();
            callback = function () {
                console.log('async');
            }
        }

        if (action.type == 'move') {
            this.action_move(action, callback);
        } else if (action.type == 'focus') {

            var data = main.sceneManager.dataManager.getDataById(action.target)
            if (!data) {
                callback && callback();
                return;
            }
            var d = main.sceneManager.viewManager3d.getDefaultEventHandler();
            d.lookAtByData(data, function () {
                callback && callback();
            })
        } else {

            var target = action.target;
            if (target instanceof Array) {
                var node0 = this.findTarget(target[0]);
                var node1 = this.findTarget(target[1]);
                if (!node0 && !node1) {
                    callback && callback();
                    return;
                } else if (node0 && !node1) {
                    var animation = node0.getClient('animation');
                    make.Default.playAnimation(node0, animation, function () {

                        callback && callback();
                    })
                } else if (!node0 && node1) {
                    var animation = node1.getClient('animation');
                    make.Default.playAnimation(node1, animation, function () {

                        callback && callback();
                    })
                } else {
                    var animation = node0.getClient('animation');
                    make.Default.playAnimation(node0, animation)
                    var animation = node1.getClient('animation');
                    make.Default.playAnimation(node1, animation, function () {

                        callback && callback();
                    })
                }

            } else {
                var node = this.findTarget(target);
                if (!node) {
                    callback && callback();
                    return;
                }
                var animation = node.getClient('animation');
                make.Default.playAnimation(node, animation, function () {

                    callback && callback();
                })
            }
        }

    },

    findTarget: function (target) {

        var node = main.sceneManager.getNodeByDataOrId(target);
        if (!node) {
            node = this.dataBox.getDataById(target);
        }
        if (!node) {
            node = this.finder.findFirst(target);
        }
        return node;
    },

    action_move: function (action, callback) {

        var dir = action.dir;
        var target = null;
        if (dir == 'left') {
            target = {x: action.p.x + this.left, y: action.p.y, z: action.p.z};
        } else if (dir == 'right') {
            target = {x: action.p.x + this.right, y: action.p.y, z: action.p.z};
        } else if (dir == 'back') {
            target = {x: action.p.x, y: action.p.y, z: action.p.z + this.back};
        } else if (dir == 'front') {
            target = {x: action.p.x, y: action.p.y, z: action.p.z + this.front};
        }
        action.t = target;
        action.waitTime = action.waitTime || this.waitTime;
        action.playTime = action.playTime || this.playTime;
        action.holdTime = action.holdTime || this.holdTime;
        util.playCamera(this.camera, action, callback);
    },


});

