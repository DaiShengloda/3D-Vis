var $VirtualDevicePanelInfo = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.generalPanle = $('<div class="vdBaseInfoTab bt-scroll"></div>');
    this.columnInfos = null;
    this.init();

};

mono.extend($VirtualDevicePanelInfo, $BaseVirtualDeviceTab, {

    init: function() {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="vdBaseInfoTab"></div');
        }
    },

    getTitle: function() {
        // return it.util.i18n("GeneralInfo_General_info"); //monitor_Synchronize
        return {
            0: it.util.i18n("GeneralInfo_General_info"),
            1: 'vdBaseInfo'
        }
    },

    getContentClass: function() {
        return 'virtualBaseInfo';
    },

    getContentPanel: function() {
        return this.generalPanle;
    },

    setData: function(data) {
        this.generalPanle.empty();
        if (!data) {
            return;
        }
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        var categoryId = category.getId();
        if (!category) {
            return;
        }
        var table = $('<table>').addClass('VirtualDevice-Table').appendTo(this.generalPanle);
        var self = this;
        ServerUtil.api('data','findCustomColumnsByCategoryId',{'categoryId': 'virtualDevice'},function(extendField){
            extendField.forEach(function (val) {
                var key = val.column_display_name?val.column_display_name:val.column_name;
                var row = self.addItem(key, data._userDataMap[val.column_name]);
                table.append(row);
            });
        });
 
    },

    addItem: function (key, val, lbId) {
		if (!key) return null;
		var row = $('<tr class="form-group-no-margin"> </tr>');
		var label_Name = $('<td class=" labelName">' + it.util.i18n(key) + ':</td>');
		row.append(label_Name);
		var valText = val;
		var label_Value = $('<td ' + (lbId ? 'id = ' + lbId : '') + '  class="labelValue ">' + valText + '</td>');
		row.append(label_Value);
		return row;
	},
});

it.VirtualDevicePanelInfo = $VirtualDevicePanelInfo;