
var $AlarmButton = function(){
	it.ToolBarButton.call(this);
	this.init();
}

mono.extend($AlarmButton,it.ToolBarButton,{

	init : function(){
		var self = this;
        this.button.click(function(){
         // main.navBarManager.appManager.showCurrentAlarm();
          // main.navBarManager.appManager.clientAlarmManager.showAlarmTable();
          // main.navBarManager.appManager.clientAlarmManager.hideAlarmTable();
          var alarmTable = main.navBarManager.appManager.clientAlarmManager.alarmTable;
          if (alarmTable && alarmTable.alarmMainPane.css('display') == 'block') {
          	   main.navBarManager.appManager.clientAlarmManager.hideAlarmTable();
          }else{
          	  main.navBarManager.appManager.clientAlarmManager.showAlarmTable();
          }
        });
	},

    getClass : function(){
        return 'toolbar-alarm-dialog-image';
    },

    getTooltip : function(){
        var alarmTable = main.navBarManager.appManager.clientAlarmManager.alarmTable;
        if (alarmTable && alarmTable.alarmMainPane.css('display') == 'block') {
      	    return it.util.i18n("AlarmButton_Alarm_list_hide");
        }else{
       	   return it.util.i18n("AlarmButton_Alarm_list_show");
        }
    },
		
});

it.AlarmButton = $AlarmButton;

