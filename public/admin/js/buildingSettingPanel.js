function BuildingSettingPanel(parent, building){
	this.init(parent, building);
}

mono.extend(BuildingSettingPanel, Object, {
	init: function(parent, building){
	    // var $view = $('<div></div>').appendTo(parent);
	    this.settingBuilding(parent, building);
	},
	settingBuilding: function(parent, building){
	    var form = this.getFloorForm(building).appendTo(parent);
	    // form.appendTo(parent);
	   //  var modal = util.modal('设置大楼信息', form, true, true, function () {
	   //    	var bv = $(form).data('bootstrapValidator');
	   //      bv.validate();
	   //      if (!bv.isValid())return true;

	   //    	var params = util.getFormData(form);
	   //    	var floorHeight = params.floorHeight;

	   //    	var floors = [];
	   //    	for(j=0; j<params.floors; j++){
				// var floor = {};
				// floor.id = "flr" +(new Date()).valueOf() +j;
				// floor.description = (j+1) + '楼';
				// floor.parentId = building.id;
				// var dp = JSON.parse(building.position);
				// floor.position = JSON.stringify({
				//             x: dp.x,
				//             y: floorHeight*j,
				//         	z: dp.z
				//         });
				// floors.push(floor);
	   //      }
	   //      Serverutil.adminApi('data','batchAddOrUpdate',floors,function(data){
		  //   	it.util.msg('资产保存成功');
		  //   });
	   //  });
	},
	getFloorForm: function(building) {
		var props = [],util = it.util;
		props.push({label: it.util.i18n("ClientAlarmManager_highest_level"),id: 'building',value: building.id, readonly: true});
		props.push({label: it.util.i18n("Admin_buildingSettingPanel_Stairs"),id: 'floors',value: ''});
		props.push({label: it.util.i18n("Admin_buildingSettingPanel_Height"),id: 'floorHeight',value: '600'});
		var form = util.createForm(props, true, function () {
	      	var bv = $(form).data('bootstrapValidator');
	        bv.validate();
	        if (!bv.isValid())return true;

	      	var params = util.getFormData(form);
	      	var floorHeight = params.floorHeight;

	      	var floors = [];
	      	for(j=0; j<params.floors; j++){
				var floor = {};
				floor.id = "flr" +(new Date()).valueOf() +j;
				floor.description = (j+1) + it.util.i18n("Admin_buildingSettingPanel_Floor");
				floor.parentId = building.id;
				var dp = JSON.parse(building.position) || {x:0,y:0,z:0};
				floor.position = JSON.stringify({
				            x: dp.x,
				            y: floorHeight*j,
				        	z: dp.z
				        });
				floors.push(floor);
	        }
	        it.util.adminApi('data','batchAddOrUpdate',floors,function(data){
		    	it.util.msg(it.util.i18n("Admin_buildingSettingPanel_Save_success"));
		    });
	    }, {left:2, right:8});
		var opt = {
			id: {
				trigger: 'floors',
				validators: [it.validator.notEmpty('floors')]
			},
			name: {
				trigger: 'floorHeight',
				validators: [it.validator.notEmpty('floorHeight')]
			}
		};
		util.initValidator(form, opt);
		return form
	},
});