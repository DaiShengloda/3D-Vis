(function ($) {
    $.widget("hud.overview", {
        // default options
        options: {
            scale: 30,
            width: 400,
            height: 400,
            selectedId: '',
            items: [ //里面的方框等,
                /*{
                    type: 'path',//类型
                    path: [[0, 0], [500, 0], [500, 500], [0, 500]],//路径坐标
                    x: 0,//x坐标
                    y: 0,//y坐标
                    fill: false,
                    selectable: false,
                },
                {
                    type: 'rect',//类型,默认值是 rect
                    w: 100,//宽度
                    h: 20,//高度
                    x: 0,
                    y: -50,
                    fill: true,
                    label: '这里是一号楼'
                },
                {
                    type: 'rect',//类型,默认值是 rect
                    w: 100,//宽度
                    h: 20,//高度
                    x: 0,
                    y: 0,
                    fill: true,
                    label: '这里是二号楼'
                },
                {
                    type: 'rect',//类型,默认值是 rect
                    w: 100,//宽度
                    h: 20,//高度
                    x: 0,
                    y: 50,
                    fill: true,
                    label: '这里是三号楼'
                },*/
            ],
            fillColor: 'rgba(255,255,255, 0.1)',
            selectedColor: 'rgb(0,142,148)',
            // Callbacks
            click: console.log,
            change: null,
            currentScene: 'floor',
            currentFloor: 'floor01',
            // floorDatas: [
            //     // {_id: 'floor03', _name: '3F',}, 
            //     // {_id: 'floor02', _name: '2F',}, 
            //     // {_id: 'floor01', _name: '1F',}, 
            // ],
        },

        _create: function () {
            var self = this;
            var el = this.element;
            // var bar = this.bar = $('<div></div>').appendTo(el);
            // bar.css('height', '5px');
            // bar.css('width', this.options.width);
            // bar.css('background-color', 'rgb(52, 52, 52)');
            // bar.css('top', '-5px');
            // bar.css('position', 'absolute');

            var box = this.box = new twaver.ElementBox();
            var network = this.network = new twaver.vector.Network(box);
            var view = network.getView();
            view.className = 'overviewCanvas';
            view.style.backgroundColor = this.options.backgroundColor || 'rgba(58, 58, 58, 1)';
            el.append(view);
            this._addTip();
            network.setDragToPan(false);
            network.isMovable = function () { return false; }
            network.setRectSelectEnabled(false);
            network.setMinZoom(0.00001);
            network.setMaxZoom(100);
            network.setInteractions([]);
            network.addViewListener(function (e) {
                if (e.kind === 'validateEnd') {
                    network.zoomOverview();
                    // console.log('zoomOverview...');
                    if (self.options.selectedId) {
                        self.selectById(self.options.selectedId)
                    } else {
                        self.$tip.hide();
                    }
                }
            });

            var layerBox = box.getLayerBox();
            var layer1 = new twaver.Layer('bottom', 'bottom layer');
            var layer2 = new twaver.Layer('middle', 'middle layer');
            var layer3 = new twaver.Layer('top', 'top Layer');
            layerBox.add(layer1);
            layerBox.add(layer2);
            layerBox.add(layer3);

            var sm = box.getSelectionModel();
            // sm.setSelectionMode('singleSelection');
            sm.addSelectionChangeListener(function (e) {
                // console.log(e);
                var datas = e.datas;
                if (!datas || datas.size() == 0) {
                    return;
                }
                var node = datas.get(0);
                if (e.kind == 'set') {
                    node.setStyle('vector.fill.color', self.options.selectedColor);
                    var c = node.getCenterLocation();
                    // var c = node.getLocation();
                    //self.tip.setClient('label', node.getClient('label'))
                    setTimeout(function () {
                        //self.tip.setCenterLocation(c.x, c.y - 20);
                        //self.tip.setVisible(true);
                        self.$tip.attr('src', self.getTipImage(node.getClient('label')));
                        setTimeout(function () {
                            self.updateTip(c);
                        }, 10);
                        self.$tip.show();
                    }, 200)
                } else {
                    //self.tip.setVisible(false);
                    self.$tip.hide();
                    node.setStyle('vector.fill.color', self.options.fillColor);
                }
            });
            sm.setFilterFunction(function (data) {
                var selectable = data.getClient('selectable');
                return !!selectable;
            })

            this.resize();
            this.refresh();
            view.addEventListener('click', function (e) {

                var node = network.getElementAt(e);
                if (!node) {
                    //点击空白处，取消选中
                    self.$tip.hide();
                    if (self.selectedNode) {
                        self.selectedNode.setStyle('vector.fill', self.selectedNode.getClient('fill'));
                        self.selectedNode.setStyle('vector.fill.color', self.options.fillColor);
                        delete self.selectedNode;
                    }
                    return;
                };
                if (self.selectedNode === node) {
                    return;
                }
                var selectable = node.getClient('selectable');
                if (!selectable) {
                    //点击了不能选中的节点，取消选中
                    self.$tip.hide();
                    if (self.selectedNode) {
                        self.selectedNode.setStyle('vector.fill', self.selectedNode.getClient('fill'));
                        self.selectedNode.setStyle('vector.fill.color', self.options.fillColor);
                        delete self.selectedNode;
                    }
                    return;
                };
                var params = self.select(node);
                self._trigger('click', e, params);
            });

            var lastEle;
            view.addEventListener('mousemove', function (e) {
                var ele = network.getElementAt(e);
                if (ele) {
                    var id = ele.getId();
                    var node = main.sceneManager.getNodeByDataOrId(id);
                    var focusNode = main.sceneManager.viewManager3d.getFocusNode();
                    var focusCategoryId = self.getCategoryByNode(focusNode);
                    if (node) {
                        var categoryId = self.getCategoryByNode(node);
                    };
                    var focusId = (focusCategoryId == 'rack' || focusCategoryId == 'equipment' || focusCategoryId == 'channel');
                    if ((ele._clientMap.nodeType == 'commonNode') && (!node || (focusId && categoryId == 'room'))) {
                        self.$hoverTip.hide();
                        clearLasetEle();
                        return;
                    }
                    if ((ele._clientMap.nodeType == 'panoNode' && !ele._clientMap.selectable)) {
                        self.$hoverTip.hide();
                        clearLasetEle();
                        return;
                    }
                    if (ele == lastEle) {
                        self.$hoverTip.show();
                        ele.setStyle('outer.width', '1');
                        ele.setStyle('outer.color', '#008e94');
                        return;
                    } else {
                        var c = ele.getCenterLocation();
                        ele.setStyle('outer.width', '1');
                        ele.setStyle('outer.color', '#008e94');
                        self.hover(ele);
                        clearLasetEle();
                    }
                    lastEle = ele;
                } else {
                    self.$hoverTip.hide();
                    clearLasetEle();
                }
            });

            view.addEventListener('mouseleave', function (e) {
                if (lastEle) {
                    self.$hoverTip.hide();
                    clearLasetEle();
                }
            });

            function clearLasetEle() {
                if (lastEle) {
                    lastEle.setStyle('outer.width', '0');
                    lastEle.setStyle('outer.color', '#008e94');
                }
            };

            // this.makeFloorBox();
        },

        getCategoryByNode: function (node) {
            var data = main.sceneManager.getNodeData(node);
            var dt = main.sceneManager.dataManager.getDataTypeForData(data);
            var categoryId = dt.getCategoryId();
            return categoryId;
        },

        // hideFloorBox: function () {
        //     this.floorBox.hide();
        // },

        // showFloorBox: function () {
        //     this.floorBox.show();
        // },

        // makeFloorBox: function () {
        //     var floorBox = this.floorBox = $('<div>').addClass('floor-box');
        //     floorBox.css({
        //         'left': this.options.width - 50,
        //         'height': this.options.height,
        //     })
        //     this.element.append(floorBox);
        //     this.floorTopArrow = this.makeFloorArrow('top');
        //     this.makeFloorDatas();
        //     this.floorDownArrow = this.makeFloorArrow('down');

        //     var l = this.options.floorDatas.length;
        //     var volume = (this.options.height - 60) / 30;
        //     if (volume >= l) {
        //         this.floorTopArrow.css('display', 'none');
        //         this.floorDownArrow.css('display', 'none');
        //     }
        // },

        // makeFloorArrow: function (arrowDirection) {
        //     var arrow = $('<span>').addClass('floor-arrow icon iconfont icon-angle-double-left');
        //     if (arrowDirection == 'top') {
        //         arrow.css('transform', 'rotate(90deg)').addClass('top-arrow');
        //     } else if (arrowDirection == 'down') {
        //         arrow.css('transform', 'rotate(-90deg)').addClass('down-arrow');
        //     }
        //     this.floorBox.append(arrow);
        //     return arrow;
        // },

        // makeFloorDatas: function () {
        //     var datasOut = this.$datasOut = $('<div>').addClass('floor-datas-out');
        //     var datasIn = this.$datasIn = $('<div>').addClass('floor-datas-in');
        //     this.$floorDatasInBox = [];
        //     for (var i = 0; i < this.options.floorDatas.length; i++) {
        //         var dataOut = $('<div>').addClass('floor-data-out');
        //         var dataIn = $('<div>').addClass('floor-data-in').attr('ids', this.options.floorDatas[i]._id).text(this.options.floorDatas[i]._name);
        //         this.$floorDatasInBox.push(dataIn);
        //         dataOut.append(dataIn);
        //         datasIn.append(dataOut);
        //     }
        //     datasOut.append(datasIn)
        //     this.floorBox.append(datasOut);

        //     this.dataInHeight = dataIn && dataIn.innerHeight();
        //     // console.log(this.dataInHeight);

        //     var el = this.element;
        //     var self = this;

        //     var l = self.options.floorDatas.length;
        //     var volume = (self.options.height - 60) / 30;
        //     this._on(el, {
        //         'click .floor-data-out': function (e) {
        //             var btn = $(e.currentTarget);
        //             if (btn.hasClass('active')) return;
        //             for (var i = 0; i < self.$floorDatasInBox.length; i++) {
        //                 self.$floorDatasInBox[i].parent().removeClass('active');
        //             }
        //             self.options.currentFloor = btn.children().attr('ids');
        //             self.setCurrentFloor();
        //             setTimeout(function () {
        //                 self._trigger('doChangeFloor', e, self.options.currentFloor)
        //             }, 10);
        //         },
        //         'click .top-arrow': function (e) {
        //             var btn = $(e.currentTarget);
        //             if (btn.hasClass('disable')) return;

        //             var marginTop = self.$datasIn.css('margin-top');
        //             marginTop = parseInt(marginTop) - 30;
        //             if (marginTop < (l - volume) * (-30)) return;

        //             self.$datasIn.css('margin-top', marginTop);
        //             if (marginTop == (l - volume) * (-30)) {
        //                 btn.addClass('disable');
        //             }
        //             self.floorDownArrow.removeClass('disable');
        //             // for (var i = 0; i < self.options.floorDatas.length; i++) {
        //             // if (self.options.floorDatas[i]._id == self.options.currentFloor) {
        //             // self.options.currentFloor = self.options.floorDatas[i-1]._id;
        //             // self.$floorDatasInBox[i].parent().removeClass('active');
        //             // self.setCurrentFloor();
        //             // setTimeout(function(){
        //             //     self._trigger('doChangeFloor', e, self.options.currentFloor)
        //             // }, 10);
        //             // break;
        //             // }
        //             // }
        //         },
        //         'click .down-arrow': function (e) {
        //             var btn = $(e.currentTarget);
        //             if (btn.hasClass('disable')) return;

        //             var marginTop = self.$datasIn.css('margin-top');
        //             marginTop = parseInt(marginTop) + 30;
        //             if (marginTop > 0) return;
        //             self.$datasIn.css('margin-top', marginTop);
        //             if (marginTop == 0) {
        //                 btn.addClass('disable');
        //             }
        //             self.floorTopArrow.removeClass('disable');

        //             // for (var i = 0; i < self.options.floorDatas.length; i++) {
        //             //     if (self.options.floorDatas[i]._id == self.options.currentFloor) {
        //             // self.options.currentFloor = self.options.floorDatas[i+1]._id;
        //             // self.$floorDatasInBox[i].parent().removeClass('active');
        //             // self.setCurrentFloor();
        //             // setTimeout(function(){
        //             //     self._trigger('doChangeFloor', e, self.options.currentFloor)
        //             // }, 10);
        //             //         break;
        //             //     }
        //             // }
        //         },
        //     })
        // },

        // setCurrentFloor: function () {
        //     for (var i = 0; i < this.options.floorDatas.length; i++) {
        //         if (this.options.currentFloor == this.options.floorDatas[i]._id) {
        //             this.$floorDatasInBox[i].parent().addClass('active');
        //             this.showAndHideArrow(i, this.options.floorDatas.length - 1);
        //             this.changeContentPosition(i);

        //             var l = this.options.floorDatas.length;
        //             var volume = (this.options.height - 60) / 30;
        //             var middleIndex = Math.ceil(volume / 2);
        //             var marginTop = (middleIndex - 1 - i) * 30;
        //             this.floorDownArrow.removeClass('disable');
        //             this.floorTopArrow.removeClass('disable');
        //             if (marginTop >= 0) {
        //                 marginTop = 0;
        //                 this.floorDownArrow.addClass('disable');
        //             } else if (marginTop <= (l - volume) * (-30)) {
        //                 marginTop = (l - volume) * (-30);
        //                 this.floorTopArrow.addClass('disable');
        //             }
        //             this.$datasIn.css('margin-top', marginTop);
        //         } else {
        //             this.$floorDatasInBox[i].parent().removeClass('active');
        //         }
        //     }
        // },

        // changeContentPosition: function (i) {
        //     var boxHeight = this.$datasIn.height();
        //     var length = this.options.floorDatas.length;
        //     var lineHeight = this.dataInHeight;
        //     var contentHeight = lineHeight * length;
        //     var displayLines = Math.abs(boxHeight / lineHeight);
        //     if (boxHeight < contentHeight) {
        //         if (displayLines % 2 == 1) {
        //             if (i < (displayLines - 1) / 2) {
        //                 this.$datasIn.scrollTop(0);
        //             } else if (i > (length - (displayLines - 1) / 2)) {
        //                 this.$datasIn.scrollTop(contentHeight - boxHeight);
        //             } else {
        //                 this.$datasIn.scrollTop(lineHeight * (i - (displayLines - 1) / 2));
        //             }
        //         } else if (displayLines % 2 == 0) {
        //             if (i < displayLines / 2) {
        //                 this.$datasIn.scrollTop(0);
        //             } else if (i > (length - displayLines / 2)) {
        //                 this.$datasIn.scrollTop(boxHeight - contentHeight);
        //             } else {
        //                 this.$datasIn.scrollTop(lineHeight * (i - (displayLines - 1) / 2) * -1);
        //             }
        //         }
        //     }
        // },

        // showAndHideArrow: function (i, max) {
        //     if (i == 0) {
        //         this.floorTopArrow.addClass('disable');
        //         this.floorDownArrow.removeClass('disable');
        //     } else if (i == max) {
        //         this.floorDownArrow.addClass('disable');
        //         this.floorTopArrow.removeClass('disable');
        //     } else {
        //         this.floorTopArrow.removeClass('disable');
        //         this.floorDownArrow.removeClass('disable');
        //     }
        // },

        selectById: function (id) {
            var node = this.box.getDataById(id);
            if (!node) return;
            this.select(node);
        },
        select: function (node) {
            var self = this;
            if (self.selectedNode === node) {
                return;
            }
            if (self.selectedNode) {
                self.selectedNode.setStyle('vector.fill', self.selectedNode.getClient('fill'));
                self.selectedNode.setStyle('vector.fill.color', self.options.fillColor);
            }
            node.setStyle('vector.fill', true);
            node.setStyle('vector.fill.color', self.options.selectedColor);
            var c = node.getCenterLocation();
            self.$tip.attr('src', self.getTipImage(node.getClient('label')));
            setTimeout(function () {
                self.updateTip(c, self.$tip);
            }, 10);
            self.$tip.show();
            self.selectedNode = node;
            self.options.selectedId = node.getId();
            return { id: node.getId(), node: node };
        },
        hover: function (node) {
            var self = this;
            var c = node.getCenterLocation();
            self.$hoverTip.attr('src', self.getTipImage(node.getClient('label')));
            setTimeout(function () {
                self.updateTip(c, self.$hoverTip);
            }, 10);
            self.$hoverTip.show();
        },
        updateTip: function (c, tip) {
            var p = this.getViewLoc(c);
            p.x -= tip.width() / 2;
            p.x = (p.x >= 1) ? p.x : 2;
            p.y -= tip.height();
            p.y -= 3;
            tip.css('left', p.x);
            tip.css('top', p.y);
        },
        getViewLoc: function (p) {
            var zoom = this.network.getZoom();
            var rect = this.network.getViewRect();
            var x = p.x * zoom - rect.x;
            var y = p.y * zoom - rect.y;

            return { x: x, y: y };
        },
        createTip: function ($tip) {
            var el = this.element;
            var $tip = $('<img></img>').appendTo(el).hide();
            $tip.css('position', 'absolute');
            $tip.css('top', '0px');
            $tip.css('left', '0px');
            $tip.css('pointer-events', 'none');
            return $tip;
        },
        _addTip: function () {
            var self = this;
            var $tip = this.$tip = this.createTip($tip);
            var $hoverTip = this.$hoverTip = this.createTip($hoverTip)
        },
        _setOption: function (key, value) {
            // console.log('_setOption')
            this._super(key, value);
            if (key === "items") {
                this.clear();
                this.refresh();
            } else if (key === 'width' || key === 'height' || key === 'currentScene') {
                this.resize();
            } else if (key == 'selectedId') {
                this.selectById(this.options.selectedId)
            }
        },
        resize: function () {
            var self = this;
            var w = this.options.width;
            var h = this.options.height;
            // if (this.options.currentScene == 'floor') w -= 50;
            this.network.adjustBounds({ x: 0, y: 0, width: w, height: h });
            setTimeout(function () {
                self.network.zoomOverview();
            }, 10)
        },
        clear: function () {
            this.box.clear();
            this.$tip.hide();
        },
        refresh: function () {
            //
            var self = this;

            var items = this.options.items || [];
            items.forEach(function (item) {
                self.append(item);
            })
            setTimeout(function () {
                self.network.zoomOverview();
            }, 200)
        },
        append: function (item) {
            if (!item) {
                return;
            }
            var self = this;
            var type = item.type;
            var scale = self.options.scale;
            var node;
            if (type == 'path') {
                item.path.forEach(function (p) {
                    p[0] /= scale;
                    p[1] /= scale;
                })
                node = self.createPathNode(item);
                //node.setLocation(item.x || 0, item.y || 0);
            } else { //默认值 rect
                item.w /= scale;
                item.h /= scale;
                item.x /= scale;
                item.y /= scale;
                node = self.createRectNode(item);
                node.setCenterLocation(item.x || 0, item.y || 0);
            }
            node.setClient('type', type);
            node.setClient('selectable', item.selectable);
            node.setClient('label', item.label || '');
            node.setClient('fill', item.fill);
            node.setClient('nodeType', item.nodeType || 'commonNode');
            self.box.add(node);
        },
        createRectNode: function (data) {
            var self = this;
            var node = new twaver.Node(data.id);
            node.setSize(data.w, data.h);
            node.setAngle(data.angle);
            node.setName('');
            node.setStyle('body.type', 'vector');
            node.setStyle('vector.fill', data.fill);
            node.setStyle('vector.fill.color', self.options.fillColor); //'rgb(90,90,90)'  self.options.selectedColor
            node.setStyle('vector.cap', 'round');
            node.setStyle('vector.outline.width', 1);
            node.setStyle('vector.outline.color', 'rgb(98,98,98)');
            node.setStyle('select.style', 'none');
            node.setLayerId('middle');
            return node;
        },
        createPathNode: function (data) {
            var self = this;
            var node = new twaver.ShapeNode(data.id);
            var points = data.path.map(function (p) {
                return { x: p[0], y: p[1] };
            })
            node.setPoints(new twaver.List(points));
            node.setName('');
            // node.setStyle('body.type', 'vector');
            node.setStyle('vector.fill', data.fill);
            node.setStyle('vector.fill.color', self.options.fillColor); //self.options.selectedColor
            node.setStyle('vector.cap', 'round');
            node.setStyle('vector.outline.width', 1);
            node.setStyle('vector.outline.color', 'rgb(98,98,98)');
            node.setStyle('select.style', 'none');
            node.setStyle('shapenode.closed', data.closed);
            node.setLayerId('bottom');
            return node;
        },
        getTipImage: function (text, context) {
            text = text || '一号楼'
            var width = this._getTipContentWidth(text) + 20;
            var height = 32;
            var canvas = document.createElement('canvas');
            canvas.width = width + 2;
            canvas.height = height;
            var g = context = canvas.getContext('2d');
            this._getTipContent({ context: context, width: width, height: height, radius: 5, arrowWidth: 10, arrowHeight: 8 });

            g.fillStyle = 'rgb(255, 255, 255)';
            g.font = 'NotoSansHans-Light 16px';
            g.textAlign = 'left';
            g.textBaseLine = 'top';
            g.fillText(text, 10, 16);
            // return { width: width, height: height };
            return canvas.toDataURL();
        },
        _getTipContentWidth: function (text) {
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.g = this.canvas.getContext('2d');
                this.g.font = 'NotoSansHans-Light 16px';
            }
            return this.g.measureText(text).width;
        },
        _getTipContent: function (args) {

            args = $.extend({ width: 256, height: 128, radius: 20, arrowWidth: 50, arrowHeight: 30 }, args);
            var width = args.width;
            var height = args.height;
            var radius = args.radius;
            var arrowWidth = args.arrowWidth;
            var arrowHeight = args.arrowHeight;
            var context = args.context;
            context.globalAlpha = args.globalAlpha || 0.8;
            context.lineWidth = 2;
            context.strokeStyle = args.borderColor || 'rgba(0, 255, 255, 1)';
            context.fillStyle = args.bgColor || 'rgba(0, 255, 255, 0.3)';
            context.save();
            context.beginPath();
            context.moveTo(radius, 0);
            context.lineTo(width - radius, 0);
            context.arcTo(width, 0, width, radius, radius);
            context.lineTo(width, height - arrowHeight - radius);
            context.arcTo(width, height - arrowHeight, width - radius, height - arrowHeight, radius);
            context.lineTo(width / 2 + arrowWidth / 2, height - arrowHeight);
            context.lineTo(width / 2, height);
            context.lineTo(width / 2 - arrowWidth / 2, height - arrowHeight);
            context.lineTo(radius, height - arrowHeight);
            context.arcTo(0, height - arrowHeight, 0, height - arrowHeight - radius, radius);
            context.lineTo(0, radius);
            context.arcTo(0, 0, radius, 0, radius);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();
        }

    })
})(jQuery)