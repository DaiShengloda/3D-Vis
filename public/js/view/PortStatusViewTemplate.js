var PortStatusViewTemplate = function(){
	this.portsStatus = {};
	this.init();
	this.nodes = [];
	this.statusMap = {
		0:'green',
		1:'red',
		2:'orange',
	};
}

mono.extend(PortStatusViewTemplate,Object,{
	init: function(){
	},
	setNodes: function(nodes){
		this.nodes = nodes;
	},
	getView: function(){
		return this.portsStatus;	
	},
	update: function(data){
		this.portsStatus =  data;
		this.setData(data);
	},
	/*
    *   data like 
    *  {"1_1": 1, "1_2": 2} key："1_2": 1表示背面， 2表示端口号 value是状态
    *  如果没有传正背面，格式格式为: {"1": 1, "2": 2} key 表示端口号 value是状态
    */
	setData: function(data){
		data = data.portInfo || data;
		var portsStatus = data;
		for(var p in portsStatus){
            var ps = p.split("_");
            if(ps.length == 1){
                this.updateNodes(0 ,ps[0], portsStatus[p]);
            }else if(ps.length == 2 ){
                this.updateNodes(ps[0], ps[1] , portsStatus[p]);
            }
        }
	},
	updateNodes: function(side, portId, status){
		var self = this;
		this.nodes.forEach(function(node){
			if(node && node.getClient && node.getClient('portId') == portId 
				&& node.getClient('side') == side){
				node.setClient('status',status);
				var color = self.statusMap[status];
				node.s({
					'm.ambient': color,
					'm.color': color,
				});
			}
		});
	}
});
it.viewTemplate.PortStatusViewTemplate = PortStatusViewTemplate;