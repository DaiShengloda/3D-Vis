/**
 * 镜头动画的是实现类
 * @param sceneManager
 * @constructor
 */
var CameraAnimateManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = sceneManager.dataManager;
    this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
    this.defaultInteraction = sceneManager.network3d.getDefaultInteraction();
    this.box = sceneManager.network3d.getDataBox();
    this.camera = sceneManager.network3d.getCamera();
    this.defaultSubtitleBottom = 100;
    this.display = false;
    this.displayList = false;
    this.editModel = false;
    this.listModel = false;
    this.newModel = false;
    this.isPlay = false;
    this.lastCategoryId = null; //上一个动作data的cateogrId
    this.lookAtRack = false;
    this.lookAtDevice = false;
    this.bidQuickFinder = new mono.QuickFinder(this.box, 'bid', 'client');
    this.doorIdQuickFinder = new mono.QuickFinder(this.box, 'doorId', 'client');
    this.newAnimation = null;
    this.dialogPanel = false;
    this.autoPlayMap = {};
    this.init();
}

mono.extend(CameraAnimateManager, Object, {

    init: function () {

        var self = this;
        // this.initDialog();
        // this.initEditor();
        // this.$addBtn.on('click', function () {
        //     var camera = self.camera;
        //     var position = camera.p().clone();
        //     var target = camera.getTarget().clone();
        //     var m = {
        //         name: 'new animate',
        //         position: position,
        //         target: target,
        //         waitTime: 0,
        //         playTime: 1000,
        //         holdTime: 1000,
        //         fpsMode: self.defaultInteraction.fpsMode,
        //     }
        //     self.addRow(m);
        // })
        // this.$playBtn.on('click', function () {
        //     self.preview();
        // })
        // this.$tbody.on('click', '.operation', function () {
        //     var tr = $(this).parent();
        //     layer.confirm(it.util.i18n("CameraAnimateManager_Confirm_delete") + '?', {}, function (index) {
        //         self.removeRow(tr);
        //         layer.close(index);
        //     })
        // })

        // //镜头动画编辑
        // this.$listBox.on('click', 'a', function () {
        //     var a = $(this);
        //     var type = a.data('type');
        //     var id = a.parent().parent().data('id');
        //     if (type == 'edit') {

        //         it.util.api('camera_animate', 'get', {
        //             id: id
        //         }, function (r) {
        //             if (r) {
        //                 self.$tbody.empty();
        //                 self.animate = r;
        //                 self.show();
        //                 self.editModel = true;
        //                 self.hideList();
        //             } else {
        //                 layer.alert(it.util.i18n("CameraAnimateManager_Deleted_need_flush"));
        //                 self.refreshList();
        //                 main.cameraMenu.refreshContentPanel();
        //             }
        //         })
        //     } else if (type == 'remove') {
        //         layer.confirm(it.util.i18n("CameraAnimateManager_Confirm_delete") + '?', {}, function (index) {
        //             layer.close(index);
        //             it.util.api('camera_animate', 'removeAnimate', {
        //                 id: id
        //             }, function (r) {
        //                 layer.alert(it.util.i18n("CameraAnimateManager_Delete_success"))
        //                 self.refreshList();
        //                 main.cameraMenu.refreshContentPanel();
        //             })
        //         })
        //     } else if (type == 'review') {
        //         self.hideList();
        //         self.play(id, function () {
        //             self.showList();
        //         })
        //     } else if (type == 'add') {
        //         self.$tbody.empty();
        //         self.show();
        //         self.editModel = true;
        //         self.hideList();
        //     }

        // })

        //字幕容器
        this.$subtitleBox = $('<div class="subtitleBox"></div>').appendTo($('body'));

        //镜头动画,点击target字段,显示dataPicker界面

        // this.$box.on('click', '.dataPickerField', function () {
        //     var input = $(this);
        //     var val = input.val();
        //     if (val.trim().length > 0) {
        //         main.dataPicker.setData({
        //             id: val
        //         });
        //     }
        //     main.dataPicker.setCallback(function (d) {
        //         if (!d) return;
        //         input.val(d.id);
        //     }).show();
        // })


        //双击界面,停止动画
        var rootView = this.sceneManager.viewManager3d.network.getRootView();
        rootView.addEventListener('dblclick', function () {
            if (self.isPlay) {
                console.warn(it.util.i18n("CameraAnimateManager_Double_click_to_stop"));
                self.stop();
                layer.msg(it.util.i18n("CameraAnimateManager_Double_click_to_stop"));
            }
        })

        //监听场景变化, 判断是否有自动的镜头动画
        this.sceneManager.addSceneChangeListener(function () {
            //如果是动画导致的场景切换, 不做任何处理, 清空标记
            if (self.gotoSceneFlag) {
                console.log("CameraAnimateManager 动画切换场景, 做任何处理");
                self.gotoSceneFlag = false;
                return;
            }

            if (self.isPlay) {
                console.log("停止之前的动画");
                self.stop();
            }
            var data = null;
            var scene = this.sceneManager.getCurrentScene();
            if (scene.getCategoryId() == 'earth' && this.sceneManager.earthScene) {
                data = this.sceneManager.earthScene.rootData
            } else {
                data = this.sceneManager._currentRootData;
            }
            if (!data) return;
            var dataId = data.getId();
            //如果是 url 的方式进入，并且指向的不是园区和 floor，那么禁止自动播放动画
            var id = main.loadDataManager.getIdFromLocation();
            var data = this.sceneManager.dataManager.getDataById(id);
            if (data) {
                var dt = this.sceneManager.dataManager.getDataTypeForData(data);
                var cid = dt.getCategoryId();
                if (cid != 'dataCenter' || cid != 'floor') {
                    return;
                }
            }
            self.tryAutoPlay(dataId);
        }, this)

        this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(function (node) {
            var data = self.sceneManager.getNodeData(node);
            if (!data) return;
            var dataId = data.getId();
            self.tryAutoPlay(dataId);
        }, this)

        this.$controllerBox = $('<div class="animate-controller"></div>').hide().appendTo($('body'));
        this.$playBtn = $('<span class="iconfont icon-pause-circle" title="' + it.util.i18n("CameraAnimateManager_Play") + '"></span>').appendTo(this.$controllerBox);
        this.$stopBtn = $('<span class="iconfont icon-stop-circle" title="' + it.util.i18n("CameraAnimateManager_Stop") + '"></span>').appendTo(this.$controllerBox);

        this.$playBtn.on('click', function () {
            if (self.isPause) {
                $(this).removeClass('icon-play-circle').addClass('icon-pause-circle');
                self.resume();
            } else {
                $(this).removeClass('icon-pause-circle').addClass('icon-play-circle');
                self.pause();
            }
        })
        this.$stopBtn.on('click', function () {
            self.stop();
        })

        self.cacheAutoPlayMap();
    },

    cacheAutoPlayMap:function(){
        var self = this;
        self.autoPlayMap = {};
        self.cacheAutoPlayMapFinish = false;
        it.util.api('camera_animate', 'find', {}, function (r) {
            if(r){
                r.forEach(function(v){
                    self.autoPlayMap[v.id] = v;
                });
                self.cacheAutoPlayMapFinish = true;
            }
        });
    },

    tryAutoPlay: function (parentId) {
        var self = this;
        // it.util.api('camera_animate', 'get', {
        //     auto: true,
        //     parentId: parentId
        // }, function (r) {
        //     if (r) {
        //         console.log('CameraAnimateManager, 场景切换');
        //         console.log('camera_animate ', r);
        //     }
        //     if (r) {
        //         //有自动播放的动画, 开始播放动画
        //         self.play(r.id);
        //     }
        // })
        var f = function(){
            if(!self.cacheAutoPlayMapFinish){
                setTimeout(f,500);
                return;
            }
            for(var p in self.autoPlayMap){
                var item = self.autoPlayMap[p];
                if(item.parentId == parentId && item.auto){
                    self.play(item.id);
                    return;
                }
            }
        }
        f();
    },

    /**
     * 初始化镜头动画编辑界面和动作编辑界面
     */
    initEditor: function () {
        this.$box = $('<div class="animate-editor"></div>').appendTo($('body')).hide();
        this.$toolbar = $('<div class="toolbar"></div>').appendTo(this.$box);
        this.$addBtn = $('<input type="button" class="btn" value="' + it.util.i18n("CameraAnimateManager_Append") + '">').appendTo(this.$toolbar);
        this.$playBtn = $('<input type="button" class="btn" value="' + it.util.i18n("CameraAnimateManager_Preview") + '">').appendTo(this.$toolbar);

        this.$content = $('<div class="content"></div>').appendTo(this.$box);
        this.$animateBox = $('<div class="animateBox"><input type="hidden" data-type="int" name="id"></div>').appendTo(this.$content);

        this.$nameLabel = $('<label>' + it.util.i18n("CameraAnimateManager_Animation_name") + ':</label>').appendTo(this.$animateBox);
        this.$name = $('<input class="name" name="name">').appendTo(this.$nameLabel);

        this.$descLabel = $('<label>' + it.util.i18n("CameraAnimateManager_Animation_description") + ':</label>').appendTo(this.$animateBox);
        this.$desc = $('<input class="description" name="description">').appendTo(this.$descLabel);

        this.$autoLabel = $('<label>' + it.util.i18n("CameraAnimateManager_Animation_auto") + ':</label>').appendTo(this.$animateBox);
        this.$auto = $('<input type="checkbox" class="auto" name="auto">').appendTo(this.$autoLabel);

        this.$repeatLabel = $('<label>' + it.util.i18n("CameraAnimateManager_Animation_repeat") + ':</label>').appendTo(this.$animateBox);
        this.$repeat = $('<input class="repeat" name="repeat">').appendTo(this.$repeatLabel);

        this.$parentIdLabel = $('<label>' + it.util.i18n("CameraAnimateManager_Scene_belong") + ':</label>').appendTo(this.$animateBox);
        this.$parentId = $('<input class="parentId" name="parentId">').appendTo(this.$parentIdLabel);

        this.$actionBox = $('<div class="actionBox"></div>').appendTo(this.$content);
        this.$table = $('' +
            '<table>' +
            '   <thead>' +
            '       <tr>' +
            '           <td class="waitTime">' + it.util.i18n("CameraAnimateManager_Delay") + '</td>' +
            '           <td class="playTime">' + it.util.i18n("CameraAnimateManager_Play_time") + '</td>' +
            '           <td class="holdTime">' + it.util.i18n("CameraAnimateManager_Keep_time") + '</td>' +
            '           <td class="position">' + it.util.i18n("CameraAnimateManager_Camera_position") + '</td>' +
            '           <td class="target">' + it.util.i18n("CameraAnimateManager_Camera_target") + '</td>' +
            '           <td class="subtitle">' + it.util.i18n("CameraAnimateManager_Subtitle") + '</td>' +
            '           <td class="subtitleBottom">' + it.util.i18n("CameraAnimateManager_Position") + '</td>' +
            '           <td class="dataId">' + it.util.i18n("CameraAnimateManager_Data_ID") + '</td>' +
            //'           <td class="event">类型</td>' +
            '           <td class="operation">' + it.util.i18n("CameraAnimateManager_Operation") + '</td>' +
            '       </tr>' +
            '   </thead>' +
            '</table>').appendTo(this.$actionBox);
        this.$tbody = $('<tbody></tbody>').appendTo(this.$table);


        this.$listBox = $('<div class="animate-list-box"></div>').appendTo($('body')).hide();
        this.$listToolbar = $('<div class="toolbar"><a href="javascript:void(0)" data-type="add">' + it.util.i18n("camare_animation_add") + '</a></div>').appendTo(this.$listBox);
        this.$listContent = $('<div class="content"></div>').appendTo(this.$listBox);
        this.$listTable = $('' +
            '<table>' +
            '   <thead>' +
            '       <tr>' +
            '           <td class="parentId">' + it.util.i18n("CameraAnimateManager_Scene_belong") + '</td>' +
            '           <td class="name">' + it.util.i18n("CameraAnimateManager_Animation_name") + '</td>' +
            '           <td class="description">' + it.util.i18n("CameraAnimateManager_Animation_description") + '</td>' +
            '           <td class="auto">' + it.util.i18n("CameraAnimateManager_Animation_auto") + '</td>' +
            '           <td class="repeat">' + it.util.i18n("CameraAnimateManager_Animation_repeat") + '</td>' +
            '           <td class="actionCount">' + it.util.i18n("CameraAnimateManager_Action_count") + '</td>' +
            '           <td class="operation">' + it.util.i18n("CameraAnimateManager_Operation") + '</td>' +
            '       </tr>' +
            '   </thead>' +
            '</table>').appendTo(this.$listContent);
        this.$listTbody = $('<tbody></tbody>').appendTo(this.$listTable);
    },

    /**
     * 添加一行动作记录
     * @param action
     */
    addRow: function (action) {

        // var tr = $('' +
        //     '<tr>' +
        //     '   <td class="waitTime"><input data-type="number" name="waitTime"></td>' +
        //     '   <td class="playTime"><input data-type="number" name="playTime"></td>' +
        //     '   <td class="holdTime"><input data-type="number" name="holdTime"></td>' +
        //     '   <td class="position"><input data-type="json" name="position"></td>' +
        //     '   <td class="target"><input data-type="json" name="target"></td>' +
        //     '   <td class="subtitle"><input name="subtitle"></td>' +
        //     '   <td class="subtitleBottom"><input name="subtitleBottom"></td>' +
        //     '   <td class="dataId"><input class="dataPickerField" name="dataId"></td>' +
        //     //'   <td class="event"><input name="event"></td>' +

        //     '   <td class="operation"><a href="javascript:void(0)">' + it.util.i18n("CameraAnimateManager_Delete") + '</a></td>' +
        //     '</tr>'
        // ).appendTo(this.$tbody);

        // action.position.x = parseFloat(action.position.x.toFixed(2));
        // action.position.y = parseFloat(action.position.y.toFixed(2));
        // action.position.z = parseFloat(action.position.z.toFixed(2));

        // action.target.x = parseFloat(action.target.x.toFixed(2));
        // action.target.y = parseFloat(action.target.y.toFixed(2));
        // action.target.z = parseFloat(action.target.z.toFixed(2));
        // action.position = it.util.o2s(action.position);
        // action.target = it.util.o2s(action.target);
        // action.waitTime /= 1000;
        // action.playTime /= 1000;
        // action.holdTime /= 1000;
        // action.subtitleBottom = parseInt(action.subtitleBottom) || 100;
        // it.util.setBoxModel(tr, action);
        // tr.data('fpsMode', action.fpsMode);
        // if (this.$tbody.children().length % 2 == 1) {
        //     tr.css('background-color', '#fbfbfb');
        // }
    },

    /**
     * 移除一行动作记录
     * @param tr
     */
    removeRow: function (tr) {
        // $(tr).remove();
    },

    /**
     * 取得表格中所有的动作列表
     * @returns {Array}
     */
    getTableData: function () {

        // var result = [];
        // var trs = this.$tbody.find('tr');
        // for (var i = 0; i < trs.length; i++) {
        //     var tr = trs.eq(i);
        //     var d = it.util.getBoxModel(tr);
        //     d.fpsMode = tr.data('fpsMode');
        //     d.waitTime *= 1000;
        //     d.playTime *= 1000;
        //     d.holdTime *= 1000;
        //     d.subtitle = d.subtitle || '';
        //     d.subtitleBottom = parseInt(d.subtitleBottom) || 0
        //     result.push(d);
        // }
        // return result;
    },

    /**
     * 刷新所有动画列表
     */
    refreshList: function () {

        var self = this;
        // this.$listTbody.empty();
        var rootNode = this.sceneManager.getCurrentRootNode();
        var rootData = this.sceneManager.getNodeData(rootNode);
        var parentId = null;
        if (rootData) {
            parentId = rootData.getId();
        }
        it.util.api('camera_animate', 'search', {}, function (r) {

            self.animationALP.animationListPanel('createPage', r, parentId);

            // r.forEach(function (animate, index) {
            //     var tr = $('' +
            //         '<tr>' +
            //         '   <td class="parentId">' + (animate.parentId || '') + '</td>' +
            //         '   <td class="name">' + animate.name + '</td>' +
            //         '   <td class="description">' + (animate.description || '') + '</td>' +
            //         '   <td class="auto">' + (animate.auto ? it.util.i18n("camare_animation_auto") : '') + '</td>' +
            //         '   <td class="repeat">' + ((animate.repeat == 0) ? it.util.i18n("camare_animation_repeat") : (animate.repeat)) + '</td>' +
            //         '   <td class="actionCount">' + animate.actionCount + '</td>' +
            //         '   <td class="operation">' +
            //         '       <a href="javascript:void(0)" data-type="edit">' + it.util.i18n("CameraAnimateManager_Edit") + '</a>' +
            //         '       <a href="javascript:void(0)" data-type="remove">' + it.util.i18n("CameraAnimateManager_Delete") + '</a>' +

            //         '   </td>' +
            //         '</tr>'
            //     ).appendTo(self.$listTbody);
            //     tr.data('id', animate.id);
            //     if (animate.parentId == parentId) {
            //         tr.find('.operation').append(' <a href="javascript:void(0)" data-type="review">' + it.util.i18n("CameraAnimateManager_Play") + '</a>');
            //     }
            //     if (index % 2 == 1) {
            //         tr.css('background-color', '#fbfbfb')
            //     } else {
            //         //tr.css('background-color', '#fcfcfc')
            //     }
            // })

        })
    },

    /**
     * 切换隐藏和显示动作编辑界面
     */
    toggleShow: function () {
        if (this.display) {
            this.hide();
        } else {
            this.show();
        }
    },

    /**
     * 切换隐藏和显示动作编辑界面
     */
    toggleShowList: function () {
        if (this.displayList) {
            this.hideList();
        } else {
            this.showList();
        }
    },

    /**
     * 显示编辑动画界面
     */
    showList: function () {
        // if (this.displayList) {
        //     return;
        // }
        // var self = this;
        // this.displayList = true;
        // this.indexList = layer.open({
        //     type: 1,
        //     id: 'camera_menu_more',
        //     shadeClose: true,
        //     title: it.util.i18n("CameraAnimateManager_Camera_animation"),
        //     skin: 'layui-layer-rim', //加上边框
        //     area: ['870px', '400px'], //宽高
        //     content: this.$listBox,
        //     btn: [it.util.i18n("CameraAnimateManager_Close")],

        //     cancel: function (index) {

        //     },
        //     end: function () {
        //         self.hideList();
        //     },
        // });
        // this.cruiseCP.cruisePanel('removeLis');
        // it.util.api('camera_animate', 'search', {}, function (r) {
        //     if (r) {
        //         var arr = [];
        //         var animationIdArr = [];
        //         r.forEach(function (v, i) {
        //             arr.push(v.name);
        //             animationIdArr.push(v.id);
        //         });
        //         self.cruiseCP.cruisePanel('createLi', arr, 290, animationIdArr);
        //     }
        // })
        this.cruise.dialog('open');
    },

    /**
     * 隐藏编辑动画界面
     */
    hideList: function () {

        // if (!this.displayList) {
        //     return;
        // }
        // this.displayList = false;
        // layer.close(this.indexList);
    },

    /**
     * 显示动作编辑界面
     */
    show: function () {
        // if (this.display) {
        //     return;
        // }
        // var self = this;
        // this.display = true;
        // var title = '';
        // var animate = this.animate;
        // if (animate) {
        //     title = it.util.i18n("CameraAnimateManager_Edit_animation") + ':' + animate.name;
        // } else {
        //     title = it.util.i18n("CameraAnimateManager_Create_camera_animation")
        // }

        // this.index = layer.open({
        //     type: 1,
        //     shadeClose: true,
        //     title: title,
        //     skin: 'layui-layer-rim', //加上边框
        //     area: ['1110px', '400px'], //宽高
        //     content: this.$box,
        //     btn: [it.util.i18n("CameraAnimateManager_Save"), it.util.i18n("CameraAnimateManager_Hide"), it.util.i18n("CameraAnimateManager_Cancel")],
        //     yes: function (index) {
        //         var animateModel = it.util.getBoxModel(self.$animateBox);
        //         if (animateModel.name.trim().length == 0) {
        //             layer.msg(it.util.i18n("CameraAnimateManager_Input_name"))
        //             return false;
        //         }
        //         if (animateModel.parentId.trim().length == 0) {
        //             layer.msg(it.util.i18n("CameraAnimateManager_Input_scene"))
        //             return false;
        //         }
        //         var actions = self.getTableData();
        //         animateModel.actions = actions;
        //         if (actions.length == 0) {
        //             layer.msg(it.util.i18n("CameraAnimateManager_input_animation"))
        //             return false;
        //         }
        //         it.util.api('camera_animate', 'saveAnimate', animateModel, function () {

        //             layer.close(index);
        //             if (self.editModel) {
        //                 self.editModel = false;
        //                 self.showList();
        //                 delete self.animate;
        //                 main.cameraMenu.refreshContentPanel();
        //             } else {
        //                 //新增
        //             }
        //             layer.alert(it.util.i18n("CameraAnimateManager_Save_success"))
        //         });
        //         return false;
        //     },
        //     cancel: function (index) {
        //         //layer.confirm('')
        //         //if (self.editModel) {
        //         //    self.editModel = false;
        //         //    self.showList();
        //         //}
        //     },
        //     btn3: function (index) {
        //         layer.confirm(it.util.i18n("CameraAnimateManager_Confirm_abandon") + '?', {}, function (c) {
        //             layer.close(index);
        //             if (self.editModel) {
        //                 self.editModel = false;
        //                 delete self.animate;
        //             }
        //             layer.close(c);
        //         })
        //         return false;
        //     },
        //     end: function () {
        //         self.hide();
        //     },
        // });
        //如果不是编辑动画模式
        // if (!this.editModel) {
        //     if (animate) {
        //         if (!animate.parentId) {
        //             var rootNode = self.sceneManager.getCurrentRootNode();
        //             var rootData = self.sceneManager.getNodeData(rootNode);
        //             if (rootData) {
        //                 animate.parentId = rootData.getId();
        //             }
        //         }
        //         it.util.setBoxModel(self.$animateBox, animate);
        //         it.util.api('camera_animate_action', 'search', {
        //             cameraAnimateId: animate.id
        //         }, function (r) {
        //             r.forEach(function (item) {
        //                 self.addRow(item);
        //             })
        //         })
        //     } else {
        //         //清空上一次的标记
        //         var params = {
        //             id: '',
        //             name: '',
        //             description: '',
        //             parentId: '',
        //             repeat: 1
        //         };
        //         var rootNode = self.sceneManager.getCurrentRootNode();
        //         var rootData = self.sceneManager.getNodeData(rootNode);
        //         var parentId = '';
        //         if (rootData) {
        //             parentId = rootData.getId();
        //         }
        //         params.parentId = parentId;
        //         it.util.setBoxModel(self.$animateBox, params);
        //     }
        // }
        if (!this.dialogPanel) {
            this.initDialog();
            this.dialogPanel = true;
        }

        var self = this;

        this.cruiseCP.cruisePanel('removeLis');
        it.util.api('camera_animate', 'search', {}, function (r) {
            if (r) {
                var arr = [];
                var animationIdArr = [];
                r.forEach(function (v, i) {
                    var rootNode = self.sceneManager.getCurrentRootNode();
                    var rootData = self.sceneManager.getNodeData(rootNode);
                    var parentId = null;
                    if (rootData) {
                        parentId = rootData.getId();
                    }
                    if (v.parentId == parentId) {
                        arr.push(v.name);
                        animationIdArr.push(v.id);
                    }
                });
                // if (arr.length == 0) {
                //     arr.push('当前场景没有动画');
                // }
                self.cruiseCP.cruisePanel('createLi', arr, 290, animationIdArr);
            }
        })
        this.cruise.dialog('open');
        // this.refreshList();
        if (this.listModel) {
            this.listModel = false;
            this.animationList.dialog('open');
        }
        if (this.editModel) {
            this.editModel = false;
            this.animationList.dialog('open');
            this.editAnimation.dialog('open');
        }
        if (this.newModel) {
            this.newModel = false;
            this.animationList.dialog('open');
            this.newAnimation.dialog('open');
        }
    },

    /**
     * 隐藏动作编辑界面
     */
    hide: function () {
        // if (!this.display) {
        //     return;
        // }
        // this.display = false;
        // layer.close(this.index);
        this.cruise.dialog('close');
        this.animationDescription.dialog('close');
        this.animationList.dialog('close');
        this.editAnimation.dialog('close');
        this.newAnimation.dialog('close');
    },

    setControllerVisible: function (v) {
        if (v) {
            this.$controllerBox.show();
        } else {
            this.$controllerBox.hide();
        }
    },

    /**
     * 预览动画
     * 在编辑动画各个动作是,可以预览一下,预览结束,显示编辑动作界面
     * @returns {boolean}
     */
    preview: function () {
        var self = this;
        var animateModel = it.util.getBoxModel(self.$animateBox);
        if (animateModel.parentId.trim().length == 0) {
            layer.msg(it.util.i18n("CameraAnimateManager_Input_scene"))
            return false;
        }
        var rootNode = this.sceneManager.getCurrentRootNode();
        var rootData = this.sceneManager.getNodeData(rootNode);
        var parentId = null;
        if (rootData) {
            parentId = rootData.getId();
        }
        if (animateModel.parentId != parentId) {
            layer.msg(it.util.i18n("CameraAnimateManager_Enter_first_scene_then_preview"))
            return false;
        }
        var actions = this.getTableData();
        this.lastCategoryId = null;

        this.playAnimate(animateModel, actions, function () {
            console.log('finish..');
            self.show();
        });
        this.hide();
    },


    /**
     * 播放一个镜头动画
     * @param cameraAnimateId 编号
     * @param callback
     */
    play: function (cameraAnimateId, callback) {

        var self = this;
        delete this.isPause;
        var node = self.sceneManager.viewManager3d.getFocusNode();
        if (node && node.getClient('animation') && node.getClient('animated')) { //执行恢复原位动画
            make.Default.playAnimation(node, node.getClient('animation'));
        }
        //var parent = node.getParent();
        //node = parent;
        //if (node && node.getClient('animation') && node.getClient('animated')) {
        //    make.Default.playAnimation(node, node.getClient('animation'));
        //}
        this.lastCategoryId = null;
        it.util.api('camera_animate', 'get', {
            id: cameraAnimateId
        }, function (animate) {
            if (animate) {
                animate.repeatIndex = 0;
                it.util.api('camera_animate_action', 'search', {
                    cameraAnimateId: cameraAnimateId
                }, function (actions) {

                    self.playAnimate(animate, actions, callback);
                })
            } else {
                layer.alert(it.util.i18n("CameraAnimateManager_Deleted_need_flush"));
                self.refreshList();
            }
        })
    },

    /**
     * 暂定
     */
    pause: function () {
        this.isPause = true;
        twaver.Util.pauseAllAnimates();
    },

    /**
     * 恢复
     */
    resume: function () {
        delete this.isPause;
        twaver.Util.resumeAllAnimates();
    },

    /**
     * 停止
     */
    stop: function () {
        delete this.isPause;
        twaver.Util.stopAllAnimates();
        layer.close(this.subtitleIndex);
        this.isPlay = false;
        this.setControllerVisible(false);
        if (this.listModel || this.editModel || this.newModel) {
            this.show();
        } else {
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'cruise');
        }
        main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'block');
    },

    /**
     * 播放动画, 如果不在当前场景中, goto到动画所在的场景
     * @param animate
     * @param callback
     */
    playAnimate: function (animate, actions, callback) {

        var self = this;

        var parentId = animate.parentId;
        var data = this.dataManager.getDataById(parentId);
        if (!data) {
            console.error(it.util.i18n("CameraAnimateManager_Data_not_exist"), action);
            callback && callback();
            return;
        }
        var dataType = this.dataManager.getDataTypeForData(data);
        if (!dataType) {
            console.error(it.util.i18n("CameraAnimateManager_DataType_not_exist"), data);
            callback && callback();
            return;
        }
        animate.repeatIndex = animate.repeatIndex || 0; //循环下标, 默认0
        if (animate.repeat === undefined) {
            animate.repeat = 1; //循环次数, 默认一次
        }

        if (self.isPlay) {
            layer.msg(it.util.i18n("CameraAnimateManager_Stop_Animation"));
            return;
        }
        self.isPlay = true; //开始播放

        var cb = function () {
            if (animate.repeat == 0) {
                playLoop();
            } else if (++animate.repeatIndex < animate.repeat) {
                playLoop();
            } else {
                console.log('playAnimate end ...');
                self.isPlay = false;
                self.setControllerVisible(false);
                callback && callback();
            }
        }
        var playLoop = function () {
            console.log('playAnimate index = ', animate.repeatIndex);
            self.playActions(actions, cb);

        }
        this.setControllerVisible(true);
        if (!this.sceneManager.isCurrentSceneInstance(data)) {
            var sceneAndRootData = this.sceneManager.getSceneAndRootByData(data);
            if (!sceneAndRootData) {
                console.error(it.util.i18n("CameraAnimateManager_Data_not_in_scene"), data);
                callback && callback();
                return;
            }
            //如果不在当前场景, 加载场景,加载完毕等待1s后,开始播放动画
            self.gotoSceneFlag = true; //标记是动画导致场景切换
            this.sceneManager.gotoScene(sceneAndRootData.scene, sceneAndRootData.rootData, function () {
                setTimeout(function () {
                    playLoop();
                }, 1500)
            });
            return;
        } else {
            playLoop();
        }
    },

    /**
     * 执行动作
     * @param actions
     * @param callback
     * @param index
     */
    playActions: function (actions, callback, index) {

        index = index || 0;
        if (index == actions.length || !this.isPlay) {
            callback && callback(true);
            return;
        }
        var self = this;
        var action = actions[index];
        this.playAction(action, function (error) {
                layer.close(self.subtitleIndex);
                if (error) {
                    console.error(error);
                    return;
                }
                self.playActions(actions, callback, index + 1);
            })
            //显示字幕
        if (action.subtitle && action.subtitle.trim().length > 0) {
            action.subtitleBottom = action.subtitleBottom || this.defaultSubtitleBottom;
            this.$subtitleBox.html(action.subtitle);
            this.subtitleIndex = layer.open({
                type: 1,
                shade: false,
                title: false, //不显示标题
                skin: 'subtitleLayer',
                offset: $(document).height() - action.subtitleBottom,
                content: this.$subtitleBox, //捕获的元素
            });
            this.$subtitleBox.parent().parent().find('.layui-layer-close').addClass('iconfont icon-close-circle');
        }
    },
    /**
     * 执行动画前, 判断data是否在当前场景中,如果不在,先加载场景.
     * @param action
     * @param callback
     */
    playAction: function (action, callback) {
        //console.log();
        //console.log('start', moment().format('YYYY-MM-DD, HH:mm:ss'));
        var self = this;
        var options = action;
        var position = new mono.Vec3(options.position.x, options.position.y, options.position.z);
        var target = new mono.Vec3(options.target.x, options.target.y, options.target.z);

        this.perAction(action, function () {
            //切换视角模式
            self.defaultInteraction.fpsMode = !!action.fpsMode;

            var data = self.dataManager.getDataById(action.dataId);
            if (data) {
                var dataType = self.dataManager.getDataTypeForData(data);
                if (dataType) {
                    var catId = dataType.getCategoryId();

                    if (catId == 'equipment' && self.lastCategoryId == 'rack') {
                        //查看设备时, 如果上一个动作是察看机柜, 去掉镜头移动动画,直接显示设备
                        self.doAction(action, callback);
                        return;
                    }
                }
            }
            self.action = it.util.playCameraAnimation(self.camera, position, target,
                options.waitTime, options.playTime, options.holdTime,
                function () {
                    //console.log('end', moment().format('YYYY-MM-DD, HH:mm:ss'));
                    self.doAction(action, function () {
                        self.lastCategoryId = null;
                        var data = self.dataManager.getDataById(action.dataId);
                        if (data) {
                            var dataType = self.dataManager.getDataTypeForData(data);
                            if (dataType) {
                                self.lastCategoryId = dataType.getCategoryId();
                            }
                        }
                        callback && callback();
                    });
                })
        })
    },

    /**
     * 执行动作前
     * 判断data是否在当前场景中,floor单独处理,园区中展开的楼层,楼层不在当前场景中,直接进入楼层了,没有展开楼层的动画.
     * @param action
     * @param callback
     */
    perAction: function (action, callback) {

        var self = this;
        var data = this.dataManager.getDataById(action.dataId);
        //如果 data 存在，可能存在切换场景的功能，这里无法暂停
        if (data) {
            var dataType = this.dataManager.getDataTypeForData(data);
            if (dataType) {
                var categoryId = dataType.getCategoryId();
                if (categoryId == 'dataCenter' && this.sceneManager.earthScene) {
                    this.sceneManager.earthScene.showInfo(this.sceneManager.earthScene.network, '', action.dataId);
                }
                if (categoryId != 'floor' && categoryId != 'dataCenter' && !this.sceneManager.isCurrentSceneInstance(data)) {
                    var sceneAndRootData = this.sceneManager.getSceneAndRootByData(data);
                    if (!sceneAndRootData) {
                        console.error(it.util.i18n("CameraAnimateManager_Data_not_in_scene"), data);
                        callback && callback();
                        return;
                    }
                    self.gotoSceneFlag = true; //标记是动画导致场景切换
                    this.sceneManager.gotoScene(sceneAndRootData.scene, sceneAndRootData.rootData, callback);
                    return;
                }
            }
        } else {

        }
        callback && callback();
    },
    /**
     * 执行动画的效果
     * @param action
     * @param callback
     */
    doAction: function (action, callback) {

        var self = this;
        var dataId = action.dataId;
        var event = action.event;
        var data = this.dataManager.getDataById(dataId);

        var cb = function () {
                self.action_event(action, event, callback);
            }
            //如果data不存在,结束动画
        if (!data) {
            if (dataId) {
                this.action_other(data, event, cb, action);
            } else {
                cb && cb();
            }

            return;
        }

        ////如果data不在当前场景中,结束动画
        //if (!this.sceneManager.isCurrentSceneInstance(data)) {
        //    callback && callback();
        //    return;
        //}
        var dataType = this.dataManager.getDataTypeForData(data);
        if (!dataType) {
            callback && callback('dataType is not exist, data id is ' + dataId);
            return;
        }
        var cat = dataType.getCategoryId();
        var funName = 'action_' + cat;
        if (self[funName]) {
            var fun = self[funName];
            fun.call(this, data, event, cb, action)
        } else {
            this.action_other(data, event, cb, action);
        }
    },


    /**
     * 镜头完毕后,展开进入园区
     * @param data
     * @param event
     * @param callback
     */
    action_dataCenter: function (data, event, callback) {

        var self = this;
        if (this.sceneManager.earthScene) {
            this.sceneManager.earthScene.hideInfo();
        };
        main.sceneManager.cameraManager.callback = function () {
            main.sceneManager.cameraManager.callback = null;
            callback && callback();
        }
        if (this.sceneManager.earthScene) {
            this.gotoSceneFlag = true;
            this.sceneManager.earthScene.dcDoubleClick(data.getId(), null);
        }
    },

    /**
     * 镜头完毕后,展开楼层
     * @param data
     * @param event
     * @param callback
     */
    action_building: function (data, event, callback) {

        var self = this;
        var node = self.sceneManager.getNodeByDataOrId(data);
        var rootNode = self.sceneManager.getCurrentRootNode();
        self.sceneManager.viewManager3d.setFocusNode(node);
        // self.sceneManager.switchToBuilding(node, rootNode, callback);
        this.gotoSceneFlag = true;
        main.sceneManager.adapterManager.buildAndFloorAdaper.switchToBuilding(node, rootNode, callback);
        //callback && callback();
    },

    /**
     * 镜头执行完毕后,双击楼层,展开楼层
     * @param data
     * @param event
     * @param callback
     */
    action_floor: function (data, event, callback) {

        if (event) {

            this.defaultEventHandler.lookAtByData(data, function () {
                callback && callback();
            })

        } else {
            if (this.sceneManager._currentRootData == data) {
                this.defaultEventHandler.lookAtByData(data, function () {
                    callback && callback();
                })
            } else {
                var node = this.sceneManager.getNodeByDataOrId(data);
                var network = this.sceneManager.network3d;
                //main.animateManager.skipAnimate = true;
                this.gotoSceneFlag = true;
                this.sceneManager.handleDoubleClickElement(node, network, data, null, function () {
                    setTimeout(function () {
                        callback && callback();
                    }, 1000);
                });
                //callback && callback();
                //this.sceneManager.handleDoubleClickElement(node, network, data, null, function () {
                //    main.animateManager.skipAnimate = false;
                //    main.animateManager.sceneChangeHandler(null, callback);
                //});
            }

        }

    },

    /**
     * 镜头执行完毕后, 查看机柜
     * @param data
     * @param event
     * @param callback
     */
    action_rack: function (data, event, callback) {

        if (this.lookAtRack) {
            this.defaultEventHandler.lookAtWithOutMoveCamera = true;
            this.defaultEventHandler.lookAtByData(data, function () {
                console.log('action_rack');
                callback && callback();
            });
        } else {
            var node = this.sceneManager.getNodeByDataOrId(data);
            if (this.lastRackNode && this.lastRackNode != node) {
                //如果上次的机柜和当前的不一致，关闭机柜门
                this.sceneManager.viewManager3d.defaultEventHandler.closeDoor(this.lastRackNode);
            } else if (this.lastRackNode && this.lastRackNode == node) {
                //如果是当前的机柜，那么关闭机柜门
                this.sceneManager.viewManager3d.defaultEventHandler.closeDoor(this.lastRackNode);
                delete this.lastRackNode;
                this.sceneManager.viewManager3d.setFocusNode(node); //切换真假机柜，虚化其他的
                callback && callback();
                return;
            }
            this.lastRackNode = node;
            this.sceneManager.viewManager3d.setFocusNode(node); //切换真假机柜，虚化其他的
            this.sceneManager.viewManager3d.defaultMaterialFilter.clear(); //清空虚化效果
            this.sceneManager.viewManager3d.defaultEventHandler.openDoor(node, function (index, count) {
                if (index >= count - 1) { //如果没有门，返回（0， 0） 所以条件要改成 >=
                    callback && callback();
                }
            });
        }
    },

    /**
     * 如果是设备,先查看机柜,然后拉出设备
     * @param data
     * @param event
     * @param callback
     */
    action_equipment: function (data, event, callback) {

        var self = this;
        if (this.lookAtRack) {
            this.defaultEventHandler.lookAtWithOutMoveCamera = true;
            var parent = this.dataManager.getParent(data);
            self.defaultEventHandler.lookAtByData(parent, function () {
                setTimeout(function () {
                    var node = self.sceneManager.getNodeByDataOrId(data);
                    if (node.getClient('animation')) {
                        make.Default.playAnimation(node, node.getClient('animation'), function () {
                            setTimeout(function () {
                                lookAtEquipment();
                            }, 500)
                        });
                    } else {
                        lookAtEquipment();
                    }
                }, 300)
            });
        } else {
            var node = self.sceneManager.getNodeByDataOrId(data);
            self.sceneManager.viewManager3d.setFocusNode(node); //切换真假机柜，虚化其他的
            callback && callback();
        }


        function lookAtEquipment() {
            self.defaultEventHandler.lookAtByData(data, function () {

                //var floor = self.sceneManager.getNodeData(self.sceneManager.getCurrentRootNode());
                //self.defaultEventHandler.lookAtWithOutMoveCamera = true;
                //self.defaultEventHandler.lookAtByData(floor, function () {
                //    callback && callback();
                //});
                callback && callback();
                //setTimeout(function () {
                //
                //    //如果告警数量大于0, 显示告警视图
                //    it.util.api('alarm', 'count', {dataId: data.getId()}, function (count) {
                //        // if (count > 0) {
                //
                //        //     main.info.showInfoDialog(node, null, data, 8);
                //        // } else {
                //        //     main.info.showInfoDialog(node, null, data);
                //        // }
                //        main.nodeEventHander.serverPanel.showServerPanel(data);
                //    })
                //}, 800);
            });
        }
    },

    action_info: function (data, event, callback) {

        this.defaultEventHandler.lookAtByData(data, function () {
            console.log('action_info');
            callback && callback();
        });
    },

    action_other: function (data, event, callback, action) {

        var dataId = action.dataId;
        var list = this.doorIdQuickFinder.find(dataId);
        if (list && list.size() > 0) {
            this.action_other_animate(list, function (complete) {
                if (complete) {
                    callback && callback();
                }
            });
            return;
        }
        list = this.bidQuickFinder.find(dataId);
        if (list && list.size() > 0) {
            this.action_other_animate(list, function (complete) {
                if (complete) {
                    callback && callback();
                }
            });
            return;
        }

        var node = this.box.getDataById(dataId);
        if (node && node.getClient('animation') && node.getClient('animated')) {
            make.Default.playAnimation(node, node.getClient('animation'), callback);
            return;
        }
        if (data) {
            this.defaultEventHandler.lookAtByData(data, function () {
                console.log('action_other');
                callback && callback();
            });
            return;
        }
        callback && callback();
    },
    action_other_animate: function (list, callback) {
        var a = list.toArray();
        var flag = true;
        a.forEach(function (node, index) {
            if (node && node.getClient('animation')) {
                if (node.getClient('animated')) {
                    make.Default.playAnimation(node, node.getClient('animation'));
                } else {
                    flag = flag && false;
                    make.Default.playAnimation(node, node.getClient('animation'), function () {
                        // 10s 后自动还原
                        setTimeout(function () {
                            make.Default.playAnimation(node, node.getClient('animation'));
                        }, 10 * 1000);
                        callback && callback(index == a.length - 1);
                    });
                }

            }
        })
        if (flag) {
            callback && callback(true);
        }
    },

    action_event: function (action, event, callback) {

        var fun = this['action_event_' + event];
        if (fun) {
            fun.call(this, action, event, callback)
        } else {
            callback && callback();
        }


        //
        //
        //湿度视图

    },

    /**
     * 资产搜索
     * @param action
     * @param event
     * @param callback
     */
    action_event_IT_SEARCH: function (action, event, callback) {

        //
        if (!main.navBarManager.itvNavPaneShow) {
            main.navBarManager.showNavBar();
        }
        //
        if (!main.navBarManager.appManager.itvToggleBtn.isShow) {
            main.navBarManager.appManager.itvToggleBtn.show();
        }
        $('#ITSearchPane_it_key_text').val(action.eventArgs.id);
        main.navBarManager.appManager.defaultApp.app.inputPane.doClick();
        setTimeout(function () {


            main.navBarManager.appManager.defaultApp.app.inputPane.doClear();
            main.navBarManager.hideNavBar();
            callback && callback();
        }, 5000);


    },

    /**
     * 空间利用率
     * @param action
     * @param event
     * @param callback
     */
    action_event_SPACE_SEARCH: function (action, event, callback) {
        //
        if (!main.navBarManager.itvNavPaneShow) {
            main.navBarManager.showNavBar();
        }
        var app = main.navBarManager.appManager.appMaps["SPACE_SEARCH"];
        if (!app.isInit) {
            app.init();
        }
        app.doShow();
        setTimeout(function () {

            app.doClear();
            callback && callback();
        }, 5000)

    },

    /**
     * 温度云图
     * @param action
     * @param event
     * @param callback
     */
    action_event_TEMP: function (action, event, callback) {

        var app = main.navBarManager.appManager.appMaps["TEMP"];
        if (!app.isInit) {
            app.init();
        }
        app.doShow();
        setTimeout(function () {

            app.doClear();
            callback && callback();
        }, 5000)
    },

    /**
     * 湿度视图
     * @param action
     * @param event
     * @param callback
     */
    action_event_HUMIDITY: function (action, event, callback) {

        var app = main.navBarManager.appManager.appMaps["HUMIDITY"];
        if (!app.isInit) {
            app.init();
        }
        app.doShow();
        setTimeout(function () {

            app.doClear();
            callback && callback();
        }, 5000)
    },

    initDialog: function () {
        var self = this;
        this.cruise = $('<div id="cruise-panel" title="' + it.util.i18n("CameraAnimateManager_Cruise") + '"></div>');
        this.animationDescription = $('<div id="animation_description_panel" title="' + it.util.i18n("CameraAnimateManager_Camera_Animation_Description") + '"></div>');
        this.animationList = $('<div id="animation_list_panel" title="' + it.util.i18n("CameraAnimateManager_Cruise_List") + '"></div>');
        this.newAnimation = $('<div id="new_animation_panel" title="' + it.util.i18n("CameraAnimateManager_New_Animation") + '"></div>');
        this.editAnimation = $('<div id="edit_animation_panel" title="' + it.util.i18n("CameraAnimateManager_Edit_Animation") + '"></div>');

        this.cruiseCP = this.cruise.cruisePanel({
            arr: ['请添加动画'],
            width: 290,
            showAni: function (event) {
                self.animationList.dialog('open');
                self.refreshList();
            },
            help: function (event) {
                self.animationDescription.dialog('open');
            },
            play: function (event, $this) {
                var id = $this.attr('animationId');
                if (id) {
                    self.cruise.dialog('close');
                    main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'none');
                    self.play(id, function () {
                        main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'block');
                        main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'cruise');
                    });
                }
            }
        });
        this.cruise.dialog({
            blackStyle: true,
            width: 330,
            height: 'auto',
            maxHeight: 314,
            //title: ,
            autoOpen: false,
            show: '',
            hide: '',
            resizable: false,
            //position: 'center',
            modal: false, //是否有遮罩模型
        });
        this.cruise.parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
            e.preventDefault();
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'cruise');
        });


        var adp = this.animationDescription.animationDescriptionPanel();
        adp.animationDescriptionPanel('createH4', it.util.i18n("CameraAnimateManager_Camera_Animation_Description"));
        adp.animationDescriptionPanel('createH4', it.util.i18n("CameraAnimateManager_Description1"));
        adp.animationDescriptionPanel('createP', it.util.i18n("CameraAnimateManager_Description2"));
        adp.animationDescriptionPanel('createH4', it.util.i18n("CameraAnimateManager_Description3"));
        adp.animationDescriptionPanel('createP', it.util.i18n("CameraAnimateManager_Description4"));
        adp.animationDescriptionPanel('createP', it.util.i18n("CameraAnimateManager_Description5"));
        adp.animationDescriptionPanel('createP', it.util.i18n("CameraAnimateManager_Description6"));
        adp.animationDescriptionPanel('createP', it.util.i18n("CameraAnimateManager_Description7"));
        adp.animationDescriptionPanel('createP', it.util.i18n("CameraAnimateManager_Description8"));
        adp.animationDescriptionPanel('createH4', it.util.i18n("CameraAnimateManager_Description9"));
        this.animationDescription.dialog({
            blackStyle: true,
            width: 800,
            height: 'auto',
            //title: '',
            autoOpen: false,
            show: '',
            hide: '',
            resizable: false,
            //position: [30, 70],
            modal: true, //是否有遮罩模型
        });


        this.animationALP = this.animationList.animationListPanel({
            showNewAnimation: function (event) {
                var sceneInput = $('#new_animation_panel input[name = "parentId"]');
                var curRootDataId = main.sceneManager._currentRootData.getId();
                sceneInput.val(curRootDataId);
                self.newAnimation.dialog('open');
            },
            editAnimation: function (event, $this) {
                var id = $this.parent().parent().attr('animationId');
                it.util.api('camera_animate', 'get', {
                    id: id
                }, function (r) {
                    if (r) {
                        //保存缓存值，用于和新值比较
                        self.oldEditBoxModel = r;
                        self.editAnimationNAT.newAnimation('removeContent');
                        self.editAnimationNAT.newAnimation('removeAllInput');
                        self.editAnimationNAT.newAnimation('createAllInput', r);
                        self.editAnimationNAT.newAnimation('createContentBox');
                        self.editAnimation.dialog('open');
                        it.util.api('camera_animate_action', 'search', {
                            cameraAnimateId: id
                        }, function (r) {
                            if (r) {
                                self.oldEditContentData = r;
                                r.forEach(function (v) {
                                    self.editAnimationNAT.newAnimation('addRow', v);
                                });
                            }
                        })
                    }
                });
            },
            deleteAnimation: function (event, $this) {
                layer.confirm(it.util.i18n('CameraAnimateManager_Confirm_delete') + '?',
                    function (c) {
                        var id = $this.parent().parent().attr('animationId');
                        it.util.api('camera_animate', 'removeAnimate', {
                            id: id
                        }, function (r) {
                            self.refreshList();
                            self.cacheAutoPlayMap();
                        })
                        layer.close(c);
                    },
                    function (c) {
                        layer.close(c);
                    })
            },
            playAnimation: function (event, $this) {
                self.listModel = true;
                self.animationList.dialog('close');
                self.cruise.dialog('close');
                var id = $this.parent().parent().attr('animationId');
                main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'none');
                self.play(id, function () {
                    main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'block');
                    self.show();
                })
            }
        });
        this.animationList.dialog({
            blackStyle: true,
            width: 850,
            height: 571,
            //title: '',
            autoOpen: false,
            show: '',
            hide: '',
            resizable: false,
            // position: '',
            modal: true, //是否有遮罩模型
        });
        var animateContent = this.animationList.find('.animation-list-content').eq(1);
        animateContent.css({
            'border': 'none'
        })
        var animateDiv = $('<div></div>');
        animateDiv.css({
            'height': '352px',
            'border': '2px solid #494D4E'
        })
        animateContent.wrapAll(animateDiv);

        // $('#animation_list_new_btn').click(function(){
        //     self.newAnimation.dialog('open');
        // });


        self.editAnimationNAT = self.editAnimation.newAnimation({
            add: function () {
                var camera = self.camera;
                var position = camera.p().clone();
                var target = camera.getTarget().clone();
                var m = {
                    name: 'new animate',
                    position: position,
                    target: target,
                    waitTime: 0,
                    playTime: 1,
                    holdTime: 1,
                    fpsMode: self.defaultInteraction.fpsMode,
                }
                self.editAnimation.newAnimation('addRow', m);
            },
            preview: function () {
                self.editModel = true;
                var actions = self.editAnimation.newAnimation('getContentData');
                var animateModel = it.util.getBoxModel($('#edit_animation_panel').children('.all-input'));
                if (animateModel.parentId.trim().length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Input_scene"))
                    return false;
                }
                var rootNode = self.sceneManager.getCurrentRootNode();
                var rootData = self.sceneManager.getNodeData(rootNode);
                var parentId = null;
                if (rootData) {
                    parentId = rootData.getId();
                }
                if (animateModel.parentId != parentId) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Enter_first_scene_then_preview"))
                    return false;
                }
                self.lastCategoryId = null;

                main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'none');
                self.playAnimate(animateModel, actions, function () {
                    console.log('finish..');
                    main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'block');
                    self.show();
                });
                self.hide();
            },
            hide: function () {
                //关闭所有窗口、清除样式
                main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'cruise');
                self.editModel = true;
            },
            save: function (event, $this) {
                var actions = self.editAnimation.newAnimation('getContentData');
                var animateModel = self.editAnimation.newAnimation('getBoxModel');
                if (animateModel.name.trim().length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Input_name"))
                    return false;
                }
                if (animateModel.parentId.trim().length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Input_scene"))
                    return false;
                }
                animateModel.actions = actions;
                animateModel.repeat = animateModel.repeat || 0;
                if (actions.length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_input_animation"))
                    return false;
                }
                it.util.api('camera_animate', 'saveAnimate', animateModel, function () {
                    self.editAnimation.dialog('close');
                    self.cacheAutoPlayMap();
                    self.refreshList();
                });
            },
            cancel: function () {
                //旧值和新值比较，如果有变化则弹窗，无变化则退出
                var newEditBoxModel = self.editAnimation.newAnimation('getBoxModel');
                var newEditContentData = self.editAnimation.newAnimation('getContentData');
                var hasBMChanged = self.newAnimation.newAnimation('hasBMChanged', self.oldEditBoxModel, newEditBoxModel);
                var hasCDChanged = self.newAnimation.newAnimation('hasCDChanged', self.oldEditContentData[0], newEditContentData[0]);
                //如果没变化则退出
                if (!hasBMChanged && !hasCDChanged) {
                    self.editAnimation.dialog('close');
                } else {
                    layer.confirm(it.util.i18n("CameraAnimateManager_Confirm_abandon") + '?',
                        function (c) {
                            layer.close(c);
                            self.editAnimation.dialog('close');
                        },
                        function (c) {
                            layer.close(c);
                        });
                }
            }
        });
        self.editAnimation.dialog({
            blackStyle: true,
            width: 1156,
            height: 650,
            //title: '',
            autoOpen: false,
            show: '',
            hide: '',
            resizable: false,
            //position: [30, 70],
            modal: false, //是否有遮罩模型
        });

        var self = this;
        this.newAnimation.newAnimation({
            add: function () {
                var camera = self.camera;
                var position = camera.p().clone();
                var target = camera.getTarget().clone();
                var m = {
                    name: 'new animate',
                    position: position,
                    target: target,
                    waitTime: 0,
                    playTime: 1,
                    holdTime: 1,
                    fpsMode: self.defaultInteraction.fpsMode,
                }
                self.newAnimation.newAnimation('addRow', m);
            },
            preview: function () {
                self.newModel = true;
                var actions = self.newAnimation.newAnimation('getContentData');
                var animateModel = it.util.getBoxModel($('#new_animation_panel').children('.all-input'));
                if (animateModel.parentId.trim().length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Input_scene"))
                    return false;
                }
                var rootNode = self.sceneManager.getCurrentRootNode();
                var rootData = self.sceneManager.getNodeData(rootNode);
                var parentId = null;
                if (rootData) {
                    parentId = rootData.getId();
                }
                if (animateModel.parentId != parentId) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Enter_first_scene_then_preview"))
                    return false;
                }
                self.lastCategoryId = null;

                main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'none');
                self.playAnimate(animateModel, actions, function () {
                    main.panelMgr.instanceMap.NavBarMgr.$box.css('display', 'block');
                    console.log('finish..');
                    self.show();
                });
                self.hide();
            },
            hide: function () {
                //关闭所有窗口、清除样式
                main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'cruise');
                self.newModel = true;
            },
            save: function (event, $this) {
                var actions = self.newAnimation.newAnimation('getContentData');
                var animateModel = self.newAnimation.newAnimation('getBoxModel');
                if (animateModel.name.trim().length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Input_name"))
                    return false;
                }
                if (animateModel.parentId.trim().length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_Input_scene"))
                    return false;
                }
                animateModel.repeat = animateModel.repeat || 0;
                animateModel.actions = actions;
                if (actions.length == 0) {
                    layer.msg(it.util.i18n("CameraAnimateManager_input_animation"))
                    return false;
                }
                it.util.api('camera_animate', 'saveAnimate', animateModel, function () {
                    self.newAnimation.dialog('close');
                    self.cacheAutoPlayMap();
                    self.refreshList();
                    //清除数据
                    self.newAnimation.newAnimation('removeAllInput');
                    self.newAnimation.newAnimation('removeContent');
                    self.newAnimation.newAnimation('createAllInput', {});
                    self.newAnimation.newAnimation('createContentBox');
                });
            },
            cancel: function () {
                var newContentData = self.newAnimation.newAnimation('getContentData');
                var newBoxModel = self.newAnimation.newAnimation('getBoxModel');
                var isBoxModelExist = self.newAnimation.newAnimation('isBoxModelExist');
                //如果两个都不存在代表没输入
                if (!newContentData.length && !isBoxModelExist) {
                    self.newAnimation.dialog('close');
                } else {
                    layer.confirm(it.util.i18n("CameraAnimateManager_Confirm_abandon") + '?',
                        function (c) {
                            layer.close(c);
                            self.newAnimation.dialog('close');
                            //清除数据
                            self.newAnimation.newAnimation('removeAllInput');
                            self.newAnimation.newAnimation('removeContent');
                            self.newAnimation.newAnimation('createAllInput', {});
                            self.newAnimation.newAnimation('createContentBox');

                        },
                        function (c) {
                            layer.close(c);
                        });
                }
            }
        });
        this.newAnimation.dialog({
            blackStyle: true,
            width: 1156,
            height: 650,
            //title: '',
            autoOpen: false,
            show: '',
            hide: '',
            resizable: false,
            //position: [30, 70],
            modal: false, //是否有遮罩模型
        });
    }
})