if (!window.sdk) {
    sdk = {};
}
if (!window.it) {
    it = {};
}
if (!it.tabPanel) {
    it.tabPanel = {};
}
var tabPanel = sdk.tabPanel = it.tabPanel;

tabPanel.init = function () {
    this.$panel = $('.contentPane').bootstrapTab({
        id: 'module'
    });
}
tabPanel.show = function (data) {
    var isContained = this.$panel.bootstrapTab('isContained', data.id);
    if (isContained) {
        this.$panel.bootstrapTab('show', data.id);
    } else {
        var self = this;
        var opt = {
            id: data.id,
            text: util.i18n(data.text || data.id),
            closeable: true,
            content: function (parent) {
                self.getContent(data, parent);
            }
        };
        this.$panel.bootstrapTab('add', opt);
    }
}

tabPanel.moduleTablePane = {
    'role': RoleDataTable,
    'user': UserDataTable,
    'panoramic': PanoramicDataTable,
    'camera_group': cameraGroupDataTable
}

tabPanel.getContent = function (data, parent) {
    // return data.text;
    var moduleMap = it.cache.moduleMap;
    var modulePath = data.customPath || data.modulePath;
    if (modulePath) {
        var module = moduleMap[modulePath];
        var options = {
            title: module.text || module.moduleName,
            module: module,
        };
        if (data.customPath) {
            var mm = moduleMap[data.modulePath];
            options.args = { module: mm };
            options.title = options.title + ' - ' + mm.text;
        }
        var dataTable;
        if (this.moduleTablePane[modulePath]) {
            var tablePanel = this.moduleTablePane[modulePath];
            dataTable = new tablePanel();
        } else {
            dataTable = new DataTable();
        }
        window.p = dataTable;
        return dataTable.init(options, parent);
    } else if (data.id == 'importRack') {
        var importRackPage = main.importRackPage = new ImportRackPage(data, parent);
        return importRackPage.init();
    } else if (data.id == 'importEquipment') {
        var importEquipmentPage = main.importEquipmentPage = new ImportEquipmentPage(data, parent);
        return importEquipmentPage.init();
    } else if (data.id == 'importLink') {
        var importLinkPage = main.importLinkPage = new ImportLinkPage(data, parent);
        return importLinkPage.init();
    } else if (data.id.startsWith('import') && data.custom) {
        var importExtFieldPage = main.importExtFieldPage = new ImportExtFieldPage(data, parent);
        return importExtFieldPage.init();
    } else if (data.id == 'importPDF') {
        var pdfInfo = new UploadPDFPage(data, parent);
        return pdfInfo.init();
    } else if (data.id == 'batchUpdateDataId') {
        var batchUpdateDataId = new BatchUpdateDataIdPanel(data, parent);
        return batchUpdateDataId.init();
    } else if (data.id == 'guide') {
        var guidePanel = new GuidePanel(parent);
        // return guidePanel.init();
    } else if (data.id == 'weixin') {
        var weixinPanel = new WeixinPanel(parent);
    } else if (data.id == 'earthSetting') {
        var earthSettingPanel = new EarthSettingPanel(parent, data.param);
        // return earthSettingPanel.init();
    } else if (data.id == 'parkSetting') {
        var parkSettingPanel = new ParkSettingPanel(parent, data.param);
    } else if (data.id == 'buildingSetting') {
        var buildingSettingPanel = new BuildingSettingPanel(parent, data.param);
    } else if (data.id == 'upload') {
        var resourceManager = new ResourceManager();
        resourceManager.init();
    } else if (data.id == 'floorSetting') {
        var floorSettingPanel = main.floorSettingPanel = new FloorSettingPanel(parent, data.param);
    } else if (data.id == 'rackSetting') {
        var sceneSettingPanel = main.sceneSettingPanel = new SceneSettingPanel(parent, data.param);
    } else if (data.id == 'config') {
        var sytemSettingPage = new SytemSettingPage(data, parent);
        sytemSettingPage.init();
    } else if (data.id == 'importPort') {
        var importPortPage = main.importPortPage = new ImportPortPage(data, parent);
        return importPortPage.init();
    } else if (data.id == 'importModels') {
        var importModels = main.importModels = new ImportModels(data, parent);
        return importModels.init();
    } else if (data.custom) {
        var path = data.id.replace(".", "/");
        var module = moduleMap[path];
        var page = new ListPage(module);
        return page.createPage();
    } else {
        var path = data.id.replace(".", "/");
        var module = moduleMap[path];
        var page = new ListPage(module);
        return page.createPage();
    }
}