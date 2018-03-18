var InspectionEditor = {};
InspectionEditor.createSaveDialogContent = function () {
    var formClass = 'form-horizontal';
    var form = $('<form class="' + formClass + '"></form>').appendTo($('body'));
    form.css('display', 'none');
    form.css('padding', '20px');
    var contentDiv = $('<div></div>').appendTo(form);
    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Floor_ID") + ':</label>').appendTo(contentDiv);
    var textParentId = util.createText().appendTo(contentDiv);
    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Path") + ':</label>').appendTo(contentDiv);
    var textPath = util.createTextArea().appendTo(contentDiv);
    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_ID") + ':</label>').appendTo(contentDiv);
    var textInspectionId = util.createText().appendTo(contentDiv);
    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Name") + ':</label>').appendTo(contentDiv);
    var textInspectionName = util.createText().appendTo(contentDiv);

    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Inspector") + ':</label>').appendTo(contentDiv);
    var textInspectionPoint = util.createTextArea().appendTo(contentDiv);

    form.textPath = textPath;
    form.textParentId = textParentId;
    form.textInspectionId = textInspectionId;
    form.textInspectionName = textInspectionName;
    form.textInspectionPoint = textInspectionPoint;

    return form;
}

InspectionEditor.createPointSettingDialogContent = function () {
    var formClass = 'form-horizontal';
    var form = $('<form class="' + formClass + '"></form>').appendTo($('body'));
    form.css('display', 'none');
    form.css('padding', '20px');
    var contentDiv = $('<div></div>').appendTo(form);

    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Related_room") + ':</label>').appendTo(contentDiv);
    var textInspectionArea = util.createSelect({}).appendTo(contentDiv);

    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Name") + ':</label>').appendTo(contentDiv);
    var textInspectionName = util.createText().appendTo(contentDiv);

    form.textInspectionArea = textInspectionArea;
    form.textInspectionName = textInspectionName;

    return form;
}

InspectionEditor.getPointsJson = function (points) {
    var json = [];
    points.forEach(function (point) {
        // json += point.x.toFixed(2) + ',' + point.z.toFixed(2);
        json.push(parseFloat(point.x.toFixed(2)), parseFloat(point.z.toFixed(2)));
    });
    return json;

};
InspectionEditor.findShapeNode = function (node) {
    if (!node || !node.getChildren) {
        return null;
    }
    var result = null;
    var children = node.getChildren();
    children.forEach(function (child) {
        if (child instanceof mono.ShapeNode) {
            result = child;
        }
        return false;
    });
    return result;
};

function createInspectionPage() {

    var rootView = $('<div class = "panel panel-default"><div class="panel-heading"></div><div class="panel-body"></div></div>');
    var rootBody = rootView.find('.panel-body');

    var dataManager = new it.DataManager();
    var sceneManager = new it.SceneManager(dataManager);
    var rootId = null;
    var areaTypes = [];
    it.util.adminApi('datatype', 'find', {}, function (result) {
        var datatypes = result;
        if (datatypes) {
            datatypes.map(function (datatype) {
                if (datatype.categoryId == 'room') {
                    areaTypes.push(datatype.id);
                    datatype.modelParameters = datatype.modelParameters || {};
                    datatype.modelParameters.opacity = 0.4;
                }
                datatype.categoryId = datatype.category = ''; //清空category
            });
            dataManager.addDataTypeFromJson(datatypes);
        }
    }, null, 'application/json; charset=UTF-8');

    var topPanel = rootView.find('.panel-heading');

    var prop = {
        params: {
            valueField: 'id',
            url: it.util.wrapUrl('/data/getFloorData'),
            filter: function (result) {
                return result;
            }
        }
    };
    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Select_floor") + '</label>').appendTo(topPanel);
    var combobox = util.createSelect(prop);
    combobox.css('display', 'inline').css('width', '150px');
    combobox.on('change', function () {

    });
    combobox.appendTo(topPanel);

    var loadButton = $('<button type="button" class="btn btn-default">' + it.util.i18n("Admin_InspectionEditor_Load_floor") + '</button>').appendTo(topPanel);
    var label = $('<label>' + it.util.i18n("Admin_InspectionEditor_Edit_tip") + '</label>').appendTo(topPanel);
    label.css('color', 'red');
    var saveButton = $('<button type="button" class="btn btn-default">' + it.util.i18n("Admin_InspectionEditor_Save") + '</button>').appendTo(topPanel);
    saveButton.css('right', '20px').css('position', 'absolute');
    loadButton.click(function () {
        var id = combobox.val();
        rootId = id;
        loadFloor(id);
    });

    var form = InspectionEditor.createSaveDialogContent();

    var pointForm = InspectionEditor.createPointSettingDialogContent();
    saveButton.click(function () {
        if (!rootId || !network._points) {
            layer.open({
                title: it.util.i18n("Admin_InspectionEditor_Error"),
                content: it.util.i18n("Admin_InspectionEditor_No_data")
            });
            return;
        }
        form.textParentId.val(rootId);
        form.textPath.val(JSON.stringify(InspectionEditor.getPointsJson(network._points)));

        var points = spheres.map(function (sphere) {
            return {
                point: sphere.getPosition(),
                name: sphere.getClient('name') || '',
                inspectionAreaId: sphere.getClient('inspectionArea'),
            }
        });

        form.textInspectionPoint.val(it.util.o2s(points));

        layer.open({
            shade: 0,
            type: 1,
            title: it.util.i18n("Admin_InspectionEditor_Save_inspector_path"),
            skin: 'layui-layer-rim', //加上边框
            area: ['600px', '550px'], //宽高
            //offset: ['300px', '300px'],
            content: form,
            btn: [it.util.i18n("Admin_InspectionEditor_Save"), it.util.i18n("Admin_InspectionEditor_Cancel")],
            btn1: function (index, layero) {
                var id = form.textInspectionId.val();
                var parentId = form.textParentId.val();
                var path = form.textPath.val();
                var name = form.textInspectionName.val();
                var points = it.util.s2o(form.textInspectionPoint.val());
                var data = { id: id, parentId: parentId, path: path, name: name, points: points };

                if (!id || id.trim() == '') {
                    layer.open({
                        title: 'error',
                        content: it.util.i18n("Admin_InspectionEditor_Input_ID")
                    });
                    return false;
                }
                if (!name || name.trim() == '') {
                    layer.open({
                        title: 'error',
                        content: it.util.i18n("Admin_InspectionEditor_Input_Name")
                    });
                    return false;
                }
                it.util.adminApi('inspection_path', 'addPath', JSON.stringify(data), function () {
                    layer.open({
                        title: it.util.i18n("Admin_InspectionEditor_Success"),
                        content: it.util.i18n("Admin_InspectionEditor_Add_Success")
                    });
                    layer.close(index);
                });
            },
            btn2: function (index, layero) {
                layer.close(index)
            },
        });
    });

    function loadFloor(id) {
        var url = it.util.wrapUrl("/data/find");
        var data = { where: { $or: [{ id: id }, { parentId: id }] } };
        it.util.adminApi('data', 'find', JSON.stringify(data), function (result) {
            loadFloorData(result);
        }, null, 'application/json; charset=UTF-8');
    }

    make.Default.path = '../modellib/'

    function loadFloorData(datas) {
        if (!datas || !datas.length) {
            return;
        }
        var areaDatas = [];
        pointForm.textInspectionArea.empty();
        datas.map(function (data) {
            if (areaTypes.indexOf(data.dataTypeId) != -1) {
                areaDatas.push(data.id);
                var label = it.util.getLabel(data);
                pointForm.textInspectionArea.append('<option value="' + data.id + '">' + label + '</option>')
            }
        });
        if (areaDatas.length) {
            var url = it.util.wrapUrl("/data/find");
            var data = { where: { parentId: { $in: areaDatas } } };
            it.util.adminApi('data', 'find', JSON.stringify(data),
                function (result) {
                    datas = datas.concat(result);
                    dataManager.fromJson({ datas: datas });
                    sceneManager.loadScene();

                    var rootNode = sceneManager.getNodeByDataOrId(rootId);
                    if (rootNode) {
                        rootNode._originalPos = rootNode.p();
                        rootNode.p(0, 0, 0)
                        var shapeNode = InspectionEditor.findShapeNode(rootNode);
                        var pos = shapeNode.getWorldPosition(),
                            bb = shapeNode.getBoundingBox();
                        var y = pos.y + bb.max.y;
                        if (y > 0) {
                            plane = new mono.math.Plane(new mono.Vec3(0, 1, 0), y);
                        } else {
                            plane = new mono.math.Plane(new mono.Vec3(0, -1, 0), y);
                        }
                        pathNode.setY(y + 10)
                        loadInspection(rootNode);
                    }
                }, null,
                'application/json; charset=UTF-8'
            );
        } else {
            dataManager.fromJson({ datas: datas });
            sceneManager.loadScene();
            loadInspection();
        }


    }

    function loadInspection(rootNode) {
        var data = { where: { parentId: rootId } };
        it.util.adminApi('inspection_path', 'find', JSON.stringify(data),
            function (result) {
                if (result) {
                    result.forEach(function (v) {
                        if (v.path && v.path.length) {
                            var path = new mono.Path();
                            var length = v.path.length;
                            for (var i = 0; i < length; i += 2) {
                                if (i == 0) {
                                    path.moveTo(v.path[i], 0, v.path[i + 1]);
                                } else {
                                    path.lineTo(v.path[i], 0, v.path[i + 1]);
                                }
                            }
                            path = mono.PathNode.prototype.adjustPath(path, 10, 4);
                            var pathNode = new mono.PathNode({
                                radius: 10,
                                path: path
                            });
                            pathNode.setY(30);
                            pathNode.s({
                                'm.color': 'orange',
                                'm.texture.image': '../model_images/pipeline/flow.jpg',
                                'm.texture.repeat': new mono.Vec2(path.getLength() / 50, 1),
                            });
                            pathNode.setClient('pathNode', true);
                            pathNode.setClient('isOld', true);
                            network.getDataBox().add(pathNode);

                            if (rootNode) {
                                pathNode.setParent(rootNode);
                                pathNode.p(rootNode._originalPos.negate());
                                pathNode.setY(rootNode.getWorldPosition().y + 30);

                            }

                            it.util.adminApi('inspection_point', 'search', JSON.stringify({ parentId: v.id }), function (result) {
                                result.forEach(function (item) {
                                    var sphere = new mono.Sphere(60);
                                    sphere.s({
                                        'm.color': '#CC589C',
                                        'm.ambient': '#CC589C',
                                        'm.type': 'phong'
                                    })
                                    sphere.setPosition(item.point.x, item.point.y, item.point.z);
                                    sphere.setClient('sphere', true);
                                    sphere.setClient('isOld', true);
                                    sphere.setClient('id', item.id);
                                    network.getDataBox().add(sphere);
                                })
                            })
                        }
                    });
                }

            }, null, 'application/json; charset=UTF-8');
    };
    // var camera = new TGL.OrthoCamera(null,null,null,30000);
    var network = sceneManager.network3d;
    network.getPointOnPlane = network.getSpacePointOnPlane;
    sceneManager.resetCamera = function () { };
    sceneManager.viewManager3d.removeDefaultEventHandler();
    // network.setCamera(camera);
    var box = network.getDataBox();
    var camera = network.getCamera();
    camera.p(0., 1844, 0.1);
    camera.lookAt(0, 0, 0);

    var defaultInteraction = new TGL.DefaultInteraction(network);
    defaultInteraction.noRotate = true;
    defaultInteraction.panSpeed = 5;
    network.setInteractions([defaultInteraction]);
    $(network.getRootView()).appendTo(rootBody);


    var plane = new mono.math.Plane(new mono.Vec3(0, 1, 0), 5);
    // var plane2 = new mono.math.Plane(new mono.Vec3(0, 1, 0),10);

    var pathNode = new mono.PathNode({
        radius: 10,
    });
    pathNode.setY(30);
    pathNode.s({
        'm.color': 'cyan',
        'm.texture.image': '../model_images/pipeline/flow.jpg',
        'm.texture.repeat': new mono.Vec2(100, 1),
    });
    pathNode.setClient('pathNode', true);
    box.add(pathNode);

    var spheres = [];


    var lastSelectedSphere = null;

    var clearSphereSelected = function () {

        if (!lastSelectedSphere) {
            return;
        }
        lastSelectedSphere.s({
            'm.color': '#CC589C',
            'm.ambient': '#CC589C',
            'm.type': 'phong'
        });
        lastSelectedSphere = null;
    }

    function forceHorizontalVertical(point, lastPoint) {
        var offsetX = Math.abs(point.x - lastPoint.x),
            offsetZ = Math.abs(point.z - lastPoint.z);

        if (offsetX > offsetZ) {
            point.z = lastPoint.z;
        } else {
            point.x = lastPoint.x;
        }
        return point;
    };

    network.getRootView().addEventListener('mousemove', function (event) {
        if (network._editMode && network._points && network._points.length) {
            var point = network.getPointOnPlane(event, plane);
            var path = new mono.Path();
            var points = network._points.slice();
            if (event.shiftKey) {
                forceHorizontalVertical(point, points[points.length - 1]);
            }
            points.push(point);
            path.fromPoints(points);
            if (points.length > 3) {
                path = pathNode.adjustPath(path, 10, 4);
            }
            pathNode.setPath(path);
            pathNode.setStyle('m.texture.repeat', new mono.Vec2(path.getLength() / 50, 1));
        }
        if (network._moveNode && network._lastSphereOffset) {
            var point = network.getPointOnPlane(event, plane);
            network._moveNode.setPositionX(point.x - network._lastSphereOffset.dx);
            network._moveNode.setPositionZ(point.z - network._lastSphereOffset.dz);
        }
    });

    network.getRootView().addEventListener('click', function (event) {
        if (network._editMode) {
            var point = network.getPointOnPlane(event, plane);
            var originPoint = point.clone();
            if (originPoint.equals(network._lastOriginalPoint)) {
                return;
            }
            if (!network._path) {
                network._path = new mono.Path();
            }
            if (!network._points) {
                network._points = [];
            }
            var points = network._points;
            if (event.shiftKey) {
                forceHorizontalVertical(point, points[points.length - 1]);
            }
            points.push(point);
            var path = new mono.Path();
            path.fromPoints(points);
            if (points.length > 3) {
                path = pathNode.adjustPath(path, 10, 4);
            }
            pathNode.setPath(path);
            pathNode.setStyle('m.texture.repeat', new mono.Vec2(path.getLength() / 50, 1));
            network._lastOriginalPoint = originPoint;
            network._lastPoint = point;
        } else {
            //
            var element = network.getFirstElementByMouseEvent(event, false);
            if (element && element.element) {
                var node = element.element;
                if (node.getClient('pathNode') && !node.getClient('isOld')) {
                    var point = network.getPointOnPlane(event, plane);
                    var sphere = new mono.Sphere(60);
                    sphere.s({
                        'm.color': '#CC589C',
                        'm.ambient': '#CC589C',
                        'm.type': 'phong'
                    })
                    sphere.setPosition(point.x, 30, point.z);
                    sphere.setClient('sphere', true);
                    box.add(sphere);
                    spheres.push(sphere);
                }
            }
            //
        }
    });

    network.getRootView().addEventListener('mousedown', function (event) {
        network._moveNode = null;
        var element = network.getFirstElementByMouseEvent(event, false);
        if (element && element.element) {
            var node = element.element;
            if (node.getClient('sphere') && !node.getClient('isOld')) {
                network._moveNode = node;
                clearSphereSelected();
                node.s({
                    'm.color': '#34ED81',
                    'm.ambient': '#34ED81',
                    'm.type': 'phong',
                });
                var point = network.getPointOnPlane(event, plane);
                var p = node.getPosition();
                network._lastSphereOffset = { dx: point.x - p.x, dz: point.z - p.z };
            }
        }
    });

    network.getRootView().addEventListener('mouseup', function (event) {
        if (network._moveNode) {
            lastSelectedSphere = network._moveNode;
            network._moveNode = null;
        }
    });

    network.getRootView().addEventListener('dblclick', function (event) {

        var element = network.getFirstElementByMouseEvent(event, false);
        if (element && element.element) {
            var node = element.element;
            if (node.getClient('sphere') && !node.getClient('isOld')) {

                layer.open({
                    shade: 0,
                    type: 1,
                    title: it.util.i18n("Admin_InspectionEditor_Setting_inspector"),
                    skin: 'layui-layer-rim', //加上边框
                    area: ['600px', '350px'], //宽高
                    content: pointForm,
                    btn: [it.util.i18n("Admin_InspectionEditor_Save"), it.util.i18n("Admin_InspectionEditor_Cancel")],
                    btn1: function (index, layero) {
                        var inspectionArea = pointForm.textInspectionArea.val();
                        var name = pointForm.textInspectionName.val();
                        node.setClient('inspectionArea', inspectionArea);
                        node.setClient('name', name);
                    },
                    btn2: function (index, layero) {
                        layer.close(index)
                    },
                });
                return;
            }
        }

        var rootNode = sceneManager.getNodeByDataOrId(rootId);
        console.log(rootNode);
        pathNode.setY(rootNode.getWorldPosition().y + 20);
        network._editMode = !network._editMode;
        // delete network._path;
        // delete network._points;

        if (network._editMode) {
            var point = network.getPointOnPlane(event, plane);
            network._points = [point];
            network._path = new mono.Path();
        } else {

        }
    });

    network.getRootView().addEventListener('keydown', function (event) {

        if (event.keyCode == 46) {

            if (lastSelectedSphere && confirm(it.util.i18n("Admin_InspectionEditor_Confirm_delete") + '?')) {
                if (lastSelectedSphere.getClient('isOld')) {
                    var id = lastSelectedSphere.getClient('id');
                    it.util.adminApi('inspection_point', 'remove', JSON.stringify({ id: id }), function () {
                        box.remove(lastSelectedSphere);
                        lastSelectedSphere = null;
                    })
                } else {
                    box.remove(lastSelectedSphere);
                    lastSelectedSphere = null;
                }
            }
        }
    });

    network.adjustBounds(1000, 700);
    rootBody.css('height', 700);
    return rootView;
};

function uploadAssetPDF(opt) {
    var table = opt.table;
    var tabId = opt.id || 'add' + 'asset_doc';

    var form = $('<div class = "form-horizontal bv-form"><div class="panel-heading"></div><div class="panel-body"></div></div>');
    // var rootBody = rootView.find('.panel-body');
    form.appendTo($('body'));

    // var formClass = 'form-horizontal';
    // var form = $('<form class="' + formClass + '"></form>').appendTo($('body'));


    var idDiv = $(createDiv());
    var label = $('<label class = "col-sm-2 control-label">' + it.util.i18n("AssetOnApp_Input_ID") + ':</label>').appendTo(idDiv);
    var content = $('<div class = "col-sm-8"></div>').appendTo(idDiv);
    var textInspectionId = $('<input id="dataId" type="text"/>').appendTo(content);
    idDiv.appendTo(form);

    var fileDiv = $(createDiv());
    var content = $('<div class = "col-sm-offset-2 col-sm-8"></div>').appendTo(fileDiv);
    var inputFile = $('<label for="up-pdf-input">' + it.util.i18n("Admin_UploadPDFPage_Select_file") + '</label><input id="up-pdf-input" type="file" class="file"/>').appendTo(content);
    inputFile.css('display', 'inline');
    fileDiv.appendTo(form);

    var buttonDiv = $(createDiv())
    var content = $('<div class = "col-sm-offset-2 col-sm-8"></div>').appendTo(buttonDiv);
    var button = $('<button class="btn btn-default">' + it.util.i18n("Admin_UploadPDFPage_Upload") + '</button>').appendTo(content);
    // var button = $('<button class="submit btn btn-default">' + it.util.i18n("Admin_UploadPDFPage_Upload") + '</button>').appendTo(content);
    buttonDiv.appendTo(form);
    button.click(function (e) {
        e.stopPropagation();
        var id = $("#dataId").val();
        if (id) {
            submit(id);
            tabPanel.$panel.bootstrapTab('remove', tabId);
            if (table) {
                // table.row.add().draw();
            };
            // inputFile.val();
        } else {
            alert("请输入资产编号");
        }
    });

    return form;
}

function createDiv() {
    var div = document.createElement("div");
    div.className = "form-group has-feedback";
    return div;
}

function submit(id, callback) {
    var size = pageConfig.assetDocSizeLimit || 1048576 * 5;
    var fileObj = $('#up-pdf-input')[0].files[0];
    if (!fileObj) {
        // console.log('请选择演示文档！');
        util.showMessage(it.util.i18n("Admin_UploadPDFPage_Select_ppt"));
        return;
    } else if ((fileObj.type).indexOf("pdf") == -1) {
        util.showMessage(it.util.i18n("Admin_UploadPDFPage_Select_pdfType"));
        return;
    } else if (fileObj.size > size) {
        util.showMessage(it.util.i18n("Admin_UploadPDFPage_Select_tooLarge"));
        return;
    }
    var form = new FormData();
    form.append('upload', fileObj);
    form.append('name', fileObj.name);
    form.append('id', id);
    upLoad(form);
}

function upLoad(formData, callback) {
    $.ajax({
        url: "/uploadassetdoc",
        type: "post",
        contentType: 'multipart/form-data; charset=UTF-8', //当上传文档时则要这个type，否则服务器不知道怎样读取
        data: formData,
        processData: false, // 告诉jQuery不要去处理发送的数据
        contentType: false, // 告诉jQuery不要去设置Content-Type请求头，此时header的contentType就会有个：boundary=...
        beforeSend: function () {
            console.log(it.util.i18n("Admin_UploadPDFPage_In_progress"));
        },
        success: function (data) {
            console.log(data);
            if (data.error) {
                console.log(it.util.i18n("Admin_UploadPDFPage_Upload_fail"));
            } else {
                console.log(it.util.i18n("Admin_UploadPDFPage_Upload_success"));
            }
            callback && callback();
        },
        error: function (e) {
            alert(it.util.i18n("Admin_UploadPDFPage_Error"));
        }
    });
}