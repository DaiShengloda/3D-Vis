
/**
 *
 * IT架构时实数据管理器
 *
 */
var $ITVRealtimeManager = function(itvManager){
	this.itvManager = itvManager;
	this.itvDataManager = this.itvManager.itvDataManager;
	this.init();
};

mono.extend($ITVRealtimeManager,Object,{

	init : function(){
		var self = this;
		this.socket = ServerUtil.createSocket();
		socket.on('data', function(data){
            if(!data || !Object.keys(data).length)return;
            data = self.handleAllRadixPoint(data);
            $.each(data, function(bid, props) {
                if(!props || !Object.keys(props).length)return;
                self.handleITVData(bid, props);
            });
        });
	},

    /**
     *
     * 处理推送过来的数据
     * 
     */
	handleITVData : function(bid,props){
		var configItem = this.itvDataManager._configItemMap[bid];
        if(configItem){
            // configItem.setData(props);
            this.updateITVConfigItem(configItem,props);
        }
	},

    /**
     * 更新单个配置项上的相关属性
     */
	updateITVConfigItem : function(configItem,props){
		if (!configItem || !props) {
			return ;
		}
		
	},

	monitorITVConfigItem : function(configItems){
		var subscriberData = {'001':[],'t02':['temp'],'h01':[]};
        this.socket.emit('monitorData', {type:'dynamic',data:subscriberData});
	},

	 handleAllRadixPoint: function(data) {
        var self = this;
        $.each(data, function(id, props) {
            delete props['_all'];
            for(key in props) {
                props[key] = self.handleSingleRadixPoint(props[key], 1);      
            }
        })
        return data;
    },

    handleSingleRadixPoint: function(value, num) {
        var self = this;
        var exg = new RegExp(/^\d*\.\d+/);
        if(typeof value == 'number') {
            value =  value.toFixed(num);
        }else if(typeof value == 'string'){
            var matchValue = value.match(exg);
            if(matchValue) {
                matchValue = matchValue[0];
                matchValue = parseFloat(matchValue).toFixed(num);
                value = value.replace(exg, matchValue);
            }
        }else if(it.util.is(value, 'Object')) {   //某个字段的值是一个对象
            for(key in value) {
                value[key] = self.handleSingleRadixPoint(value[key], 1);
            }
        }

        return value;
    }


});

it.ITVRealtimeManager = $ITVRealtimeManager;