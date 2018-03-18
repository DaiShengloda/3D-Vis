// http://www.cnblogs.com/wuhuacong/archive/2015/08/26/4759564.html
var main = window.main = {};
var load = window.load = function() {

    it.util.setLanguage('zh');
    // $('body').layout({
    //     applyDefaultStyles: true,
    //     resizerTip: "可调整大小",
    //     spacing_open: 2,
    //     spacing_closed: 3,
    //     north__size: 40,
    //     north__closable: true,
    //     resizable: true,
    // });
    tabManager.init();
    var parentPanel = $('#treeDiv');
    parentPanel.css("width", "200px");
    //var treeView = new it.TreeView(parentPanel);
    //treeView.setData(getTreeNodes(), false);

    //treeView.clickNodeFunction = function (data) {
    //    console.log(arguments);
    //};
    //createAddCategoryTab();
    //createAddDataTab()
    // setTimeout(createAddDataTypeTab, 10);
    //
    //createDataListTab();
    //
    //createDataDetailTab();
    //
    //createAddDataInfoTab();
    //
    //createAddDataInfoContentTab();


    refreshModuleDefined(refreshTree);
    //refreshTree();
    

    // util.adminApi("rack_info","add",{
    //     // tableName : "rack_info",
    //     // description:"机柜"
    //     id : "机柜0102",
    //     "供应商":"华为"
    // },function(data){
    //     console.log("aaaa",data);
    // },function(error){
    //     console.log(error);
    // });

};

var moduleMap = {};
function refreshModuleDefined(callback) {

    util.adminApi('ModuleDefined', 'list', {}, function (data) {
        moduleMap = data;
        console.log(data);
        callback && callback();
    });


}

function refreshTree(callback) {

    util.adminApi('Menu', 'list', {}, function (data) {
        $('#mainMenu').tree({data: data, onDblClick: treeDblClickHandle});
        callback && callback();
    })
}

function treeDblClickHandle(data) {

    var modulePath = data.customPath || data.modulePath;
    if (modulePath) {
        //util.adminApi(modulePath,'list')
        var module = moduleMap[modulePath];
        //createModuleTab(module);
        //createModuleListTab(module);
        var options = {
            title: module.text || module.moduleName,
            module: module,
        };
        if (data.customPath) {
            var mm = moduleMap[data.modulePath];
            options.args = {module: mm};
            options.title = options.title + ' - ' + mm.text;
        }
        tabManager.addListTab(options);
        //$.messager.alert('', JSON.stringify(moduleMap[modulePath]));
    } else if(data.custom){
        var path = data.id.replace(".","/");
        var module = moduleMap[path];
        var page = new ListPage(module);
        page.createPage();
    }else {
        var path = data.id.replace(".","/");
        var module = moduleMap[path];
        var page = new ListPage(module);
        page.createPage();
        // $.messager.alert('', JSON.stringify(data));
        // createAddDataInfoTab();
        // createUpdateDataInfoTab();
        // createAddDataInfoContentTab();

    }
}

function addTab(title, content, closable) {
    $("#tab").tabs("add", {
        title: title,
        content: content,
        closable: closable,
    })
};

function createModuleTab(module) {
    var fields = {};
    Object.keys(module.attributes).forEach(function (attrName) {
        fields[attrName] = {text: attrName, type: "text", required: true};
    })
    return createAddTab(module.moduleName, fields, "./api/" + module.modulePath, false);
}

function createModuleListTab(module) {
    var id = new Date().getTime();
    id = "dg" + id;
    var div = $("<div><table id = " + id + "></table></div>");
    var columns = [];
    Object.keys(module.attributes).forEach(function (attrName) {
        columns.push({field: attrName, title: attrName, width: 100})
    })
    setTimeout(function () {
        $("#" + id).datagrid({
            title: module.moduleName,
            url: pageConfig.urlPrex+"/api/" + module.modulePath.replace('/', '.') + "/findAndCountForEasyUI",
            columns: [columns],
            onLoadSuccess: function () {
                console.log(arguments);
            },
            pagination: true,
            pageSize: 20,
        });
    }, 1);


    return $("#tab").tabs("add", {
        title: "List",
        content: div,
        closable: true,
    })
}

function createAddDataTypeTab() {
    var fields = {};
    fields["id"] = {text: it.util.i18n("Admin_main_Type_ID"), type: "text", required: true};
    fields["categoryId"] = {
        text: it.util.i18n("Admin_main_Category_ID"), type: "combobox", required: true, options: {
            valueField: "id",
            textField: "description",
            url: pageConfig.urlPrex+"/api/data.Category/search"
        }
    };
    fields["stopAlarmPropagation"] = {text: it.util.i18n("Admin_main_Stop_propagation"), type: "checkbox"};
    fields["model"] = {text: it.util.i18n("Admin_main_Model"), type: "text", required: true, readonly: true};
    fields["modelParameters"] = {text: it.util.i18n("Admin_main_Model_param"), type: "text", required: true, readonly: true};
    fields["simpleModel"] = {text: it.util.i18n("Admin_main_Simple_model"), type: "text", required: false, readonly: true};
    fields["simpleModelParameters"] = {text: it.util.i18n("Admin_main_Simple_model_param"), type: "text", required: false, readonly: true};
    fields["lazyable"] = {text: it.util.i18n("Admin_main_lazy_load"), type: "checkbox"};
    fields["description"] = {text: it.util.i18n("Admin_main_Type_description"), type: "textarea", required: true};

    return createAddTab(it.util.i18n("Admin_main_Add_type"), fields, pageConfig.urlPrex+"/api/data.DataType/add", true);
}

function createAddDataInfoTab() {
    // var fields = {};
    // fields["category"] = {
    //     text: "分类编号", type: "combobox", required: true, options: {
    //         valueField: "id",
    //         textField: "description",
    //         url: "./api/category/search"
    //     }
    // };
    // fields["tableName"] = {text: "业务名称", type: "text", required: true};
    // fields["description"] = {text: "描述", type: "textarea", required: true};
    
    // return createAddTab("添加数据业务信息", fields, "./api/custom.Table/add", false);

    var page = new main.AddDataInfoPage();

    return page.createPage();
}

function createUpdateDataInfoTab(){
    var page = new main.UpdateDataInfoPage('rack_info');
    page.createPage();
};

function createAddDataInfoContentTab() {
    var fields = {};

    fields["modulePath"] = {
        text: it.util.i18n("Admin_main_Category_ID"), type: "combobox", required: true, options: {
            valueField: "moduleName",
            textField: "modulePath",
            url: pageConfig.urlPrex+"/api/table.Table/search"
        }
}


//    "fieldPrimaryKey": null,
//    "fieldType": "string",
//    "fieldName": null,
//    "fieldAllowNull": null,
//    "fieldTypeJson": null,
//    "fieldDefaultValue": null,
//    "fieldUnique": null,
//    "fieldAutoIncrement": null,
//    "fieldComment": null,
    fields["fieldPrimaryKey"] = {text: it.util.i18n("Admin_main_Primary_key_or_not"), type: "text", required: false};
    fields["fieldType"] = {text: it.util.i18n("Admin_main_Data_type"), type: "text", required: false};
    fields["attributeName"] = {text: it.util.i18n("Admin_main_Property_name"), type: "text", required: false};
    fields["fieldName"] = {text: it.util.i18n("Admin_main_Field_name"), type: "text", required: false};
    fields["fieldAllowNull"] = {text: it.util.i18n("Admin_main_Null_or_not"), type: "text", required: false};
    fields["fieldTypeJson"] = {text: it.util.i18n("Admin_main_JSON_or_not"), type: "text", required: false};
    fields["fieldDefaultValue"] = {text: it.util.i18n("Admin_main_Default"), type: "text", required: false};
    fields["fieldUnique"] = {text: it.util.i18n("Admin_main_Unique_or_not"), type: "text", required: false};
    fields["fieldAutoIncrement"] = {text: it.util.i18n("Admin_main_Auto_increase_or_not"), type: "text", required: false};
    fields["fieldComment"] = {text: it.util.i18n("Admin_main_content"), type: "text", required: false};
    return createAddTab(it.util.i18n("Admin_main_Add_business_info_field"), fields, pageConfig.urlPrex+"/api/column/add", false);
}

function createDataDetailTab(data) {
    var fields = {};
    fields["id"] = {text: it.util.i18n("Admin_main_Type_ID"), type: "text", required: false};
    fields["model"] = {text: it.util.i18n("Admin_main_Model"), type: "text", required: false, readonly: true};
    fields["modelParameters"] = {text: it.util.i18n("Admin_main_Model_param"), type: "text", required: false, readonly: true};
    fields["description"] = {text: it.util.i18n("Admin_main_Type_description"), type: "textarea", required: false};
    return this.createDetailTab(it.util.i18n("Admin_main_Data_type")+"rack_type_02 ", fields, pageConfig.urlPrex+"/api/data.DataType/get", {id: "rack_type_02"}, false);
}

function createUpdateTab() {

}

// onLoadSuccess	data	当数据载入成功时触发。
function createDataListTab() {
    var id = new Date().getTime();
    id = "dg" + id;
    var div = $("<div><table id = " + id + "></table></div>");
    setTimeout(function () {
        $("#" + id).datagrid({
            title: it.util.i18n("Admin_main_Application_system_list"),
            url: pageConfig.urlPrex+"/api/data.Data/findAndCountForEasyUI",
            columns: [[
                {
                    field: 'id', title: it.util.i18n("Admin_main_ID"),
                    // width:100,
                },
                {
                    field: 'description', title: it.util.i18n("Admin_main_Description"), width: 500,
                },
            ]],
            onLoadSuccess: function () {
                console.log(arguments);
            },
            pagination: true,
        });
    }, 1);


    return $("#tab").tabs("add", {
        title: "List",
        content: div,
        closable: true,
    })
}


function createAddDataTab() {
    var fields = {};
    fields["id"] = {text: it.util.i18n("Admin_main_ID"), type: "text", required: true};
    fields["dataTypeId"] = {
        text: it.util.i18n("Admin_main_Type_ID"), type: "combobox", required: true, options: {
            valueField: "id",
            textField: "description",
            url: pageConfig.urlPrex+"/api/data.DataType/search"
        }
    };
    fields["parentId"] = {
        text: it.util.i18n("Admin_main_Parent_ID"), type: "combobox", options: {
            valueField: "id",
            textField: "description",
            groupField: "dataTypeId",
            url: pageConfig.urlPrex+"/api/data.Data/search"
        }
    }
    return createAddTab(it.util.i18n("Admin_main_Add_data"), fields, pageConfig.urlPrex+"/api/data.Data/add");
}

function createAddCategoryTab() {
    var fields = {};
    fields["id"] = {text: it.util.i18n("Admin_main_Type_ID"), type: "text", required: true};

    fields["stopAlarmPropagation"] = {text: it.util.i18n("Admin_main_Stop_propagation"), type: "checkbox"};
    fields["description"] = {text: it.util.i18n("Admin_main_Categoty_description"), type: "textarea", required: true};

    return createAddTab(it.util.i18n("Admin_main_Add_category"), fields, pageConfig.urlPrex+"/api/data.Category/add");
}

function createField(type, name, required, readonly, parent, options) {
    var field = null;
    if (readonly) {
        var div = $('<div></div>').appendTo(parent);
        parent = div;
    }
    var dataOpt='required:'+required;
    if (type === "text") {
        field = $('<input class="easyui-validatebox textbox" type="text"  data-options="'+dataOpt+'" style="height:26px"/>').appendTo(parent);
    } else if (type === "textarea") {
        field = $('<textarea class="easyui-validatebox textbox"  data-options="'+dataOpt+'" style="height:50px;"></textarea>').appendTo(parent);
    } else if (type === 'checkbox') {
        field = $('<input type="checkbox" ></input>').appendTo(parent);
    } else if (type === 'combobox') {
        options = options || {};
        dataOpt += ',panelHeight:200';
        field = $('<input type="select" class="easyui-combobox" data-options="'+dataOpt+'">').appendTo(parent);
        if(options.url){
            $.ajax({
                url: options.url,
                success: function (value) {
                    var data = value.value;
                    if (data) {
                        data = data.rows;
                        var loadData = [];
                        if(options.all){
                            loadData.push({id:'', text:'-- all --'});
                        }
                        for (var i = 0; i < data.length; i++) {
                            data[i].description = data[i].description || data[i].id;
                            var row = data[i];
                            loadData.push({id:row.id, text:row.id});
                        }
                        field.combobox({
                            valueField: 'id', 
                            textField: 'text',
                            data:loadData
                        });
                        if(options.value!==undefined)field.combobox('setValue', options.value);
                    }
                },
            })
        } else {
            field.combobox(options);
            if(options.value!==undefined)field.combobox('setValue', options.value);
        }
    } else if (type === 'combotree') {
        options = options || {};
        field = $('<input type="select" class="easyui-combotree" data-options="'+dataOpt+'">').appendTo(parent);
        field.combotree(options);
    }
    field.attr('id', name);
    field.attr('name', name);
    if (readonly) {
        field.attr("readonly", true);
    }
    return field;
};

function createDetailTab(title, fields, dataUrl, data, withEditor) {
    var id = new Date().getTime();
    var form = $("<form method = 'post' id = '" + id + "'></form>");
    var table = $("<table></table>").appendTo(form);
    var map = {};
    for (var p in fields) {
        var v = fields[p];
        var tr = $("<tr></tr>").appendTo(table);
        var td = $("<td></td>").appendTo(tr);
        td.css("margin", "5px");
        var label = $("<label for = '" + p + "'> " + v.text + ": </label>").appendTo(td);
        var td = $("<td></td>").appendTo(tr);
        td.css("padding", "5px");
        var field = createField(v.type, p, v.required, true, td, v.options);
        $(field).attr("disabled", true);
        map[p] = field;
    }


    var tr = $("<tr></tr>").appendTo(table);
    var td = $("<td></td>").appendTo(tr);
    var td = $("<td></td>").appendTo(tr);
    var divButton = $("<div></div>").appendTo(td);
    // var buttonOK = $('<a href="#" class="easyui-linkbutton" iconCls="icon-save">保存</a>').appendTo(divButton);

    form.css("padding", "10px");
    divButton.css("padding", "10px").css("float", "right");

    $.ajax({
        url: dataUrl,
        contentType: "json",
        data: data,
        success: function (value) {
            $(form).form("load", value.value);
        },
    });

    if (withEditor) {
        var divEditor = $("<div></div>").appendTo(form);
        var buttonImport = $('<a href="#" class="easyui-linkbutton" iconCls="icon-ok">'+it.util.i18n("Admin_main_Setting_model_param")+'</a>').appendTo(divEditor);
        var buttonImportSimple = $('<a href="#" class="easyui-linkbutton" iconCls="icon-ok">'+it.util.i18n("Admin_main_Setting_simple_model_param")+'</a>').appendTo(divEditor);
        divEditor.css("height", "600px");
        divEditor.css("width", "900px");
        var edit3d = window.edit3d = new mono.edit.Edit3D();

        divEditor.append($(edit3d.getView()));
        edit3d.accordionPane.initView(categoryJson.categories);
        setTimeout(function () {
            edit3d.layoutGUI();
        }, 100);
        buttonImport.click(function () {
            map["model"].val(JSON.parse(edit3d.getJsonObject()).type);
            map["modelParameters"].val(edit3d.getJsonObject());
        });
        buttonImportSimple.click(function () {
            map["simpleModel"].val(JSON.parse(edit3d.getJsonObject()).type);
            map["simpleModelParameters"].val(edit3d.getJsonObject());
        });
    }


    return $("#tab").tabs("add", {
        title: title,
        content: form,
        closable: true,
    })
};

function createAddTab(title, fields, submitUrl, withEditor) {
    var id = new Date().getTime();
    var form = $("<form method = 'post' id = '" + id + "'></form>");
    var table = $("<table></table>").appendTo(form);
    var map = {};
    for (var p in fields) {
        var v = fields[p];
        var tr = $("<tr></tr>").appendTo(table);
        var td = $("<td></td>").appendTo(tr);
        td.css("margin", "5px");
        var label = $("<label for = '" + p + "'> " + v.text + ": </label>").appendTo(td);
        var td = $("<td></td>").appendTo(tr);
        td.css("padding", "5px");
        var field = createField(v.type, p, v.required, v.readonly, td, v.options);
        map[p] = field;
    }

    var tr = $("<tr></tr>").appendTo(table);
    var td = $("<td></td>").appendTo(tr);
    var td = $("<td></td>").appendTo(tr);
    var divButton = $("<div></div>").appendTo(td);
    var buttonOK = $('<a href="#" class="easyui-linkbutton" iconCls="icon-save">'+it.util.i18n("Admin_main_Save")+'</a>').appendTo(divButton);

    form.css("padding", "10px");
    divButton.css("padding", "10px").css("float", "right");

    buttonOK.click(function () {
        var valid = $('#' + id + '').form('validate');
        if (!valid) {
            return;
        }
        var data = {};

        for (var p in map) {
            data[p] = map[p].val();
        }
        console.log(data);
        $.ajax({
            url: submitUrl,
            data: data,
            dataType: "json",
            success: function (data) {
                console.log(data);
                refreshTree();
            },
            error: function (error) {
                alert(error);
            },
        });
    });
    if (withEditor) {
        var divEditor = $("<div></div>").appendTo(form);
        var buttonImport = $('<a href="#" class="easyui-linkbutton" iconCls="icon-ok">'+it.util.i18n("Admin_main_Setting_model_param")+'</a>').appendTo(divEditor);
        var buttonImportSimple = $('<a href="#" class="easyui-linkbutton" iconCls="icon-ok">'+it.util.i18n("Admin_main_Setting_simple_model_param")+'</a>').appendTo(divEditor);
        divEditor.css("height", "600px");
        divEditor.css("width", "900px");
        var edit3d = window.edit3d = new mono.edit.Edit3D();

        divEditor.append($(edit3d.getView()));
        edit3d.accordionPane.initView(categoryJson.categories);
        setTimeout(function () {
            edit3d.layoutGUI();
        }, 100);
        buttonImport.click(function () {
            map["model"].val(JSON.parse(edit3d.getJsonObject()).type);
            map["modelParameters"].val(edit3d.getJsonObject());
        });
        buttonImportSimple.click(function () {
            map["simpleModel"].val(JSON.parse(edit3d.getJsonObject()).type);
            map["simpleModelParameters"].val(edit3d.getJsonObject());
        });
    }


    return $("#tab").tabs("add", {
        title: title,
        content: form,
        closable: true,
    })
};

function getTreeNodes() {
    var arr = [];
    arr.push(getTreeNode("category", it.util.i18n("Admin_main_Category_manage"), it.util.i18n("Admin_main_Category")));
    arr.push(getTreeNode("datatype", it.util.i18n("Admin_main_Asset_model_manage"), it.util.i18n("Admin_main_Type")));
    arr.push(getTreeNode("data", it.util.i18n("Admin_main_Asset_manage"), it.util.i18n("Admin_main_Asset")));
    arr.push(getTreeNode("scene", it.util.i18n("Admin_main_Scene_manage"), it.util.i18n("Admin_main_Scene")));
    var count = Math.round(Math.random() * 10) + 1;
    for (var i = 0; i < count; i++) {
        arr.push({
            id: "aa" + i,
            text: "AA_" + i,
            isLeaf: true,
        });
    }
    return arr;
}


function getTreeNode(id, text, name) {
    var node = {
        id: id,
        text: text,
        children: [
            {
                id: "search_" + id,
                text: it.util.i18n("Admin_main_Search") + name,
                isLeaf: true,
            }
            , {
                id: "add_" + id,
                text: it.util.i18n("Admin_main_Add") + name,
                isLeaf: true,
            }
            , {
                id: 'detail_' + id,
                text: it.util.i18n("Admin_main_Detail") + name,
                isLeaf: true,
            }
            , {
                id: 'update_' + id,
                text: it.util.i18n("Admin_main_Update") + name,
                isLeaf: true,
            }
            , {
                id: 'delete_' + id,
                text: it.util.i18n("Admin_main_Delete") + name,
                isLeaf: true,
            }


        ]
    };
    return node;
}