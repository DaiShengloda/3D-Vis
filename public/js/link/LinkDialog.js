
/**
 * 连线和链路的展示框
 */
var $LinkDialog = function(sceneManager,linkApp){
	this.sceneManager = sceneManager;
	this.linkApp = linkApp;
	this.mainPane = $('<div id = "itv_link_dialog" class = "itv_link_dialog it-shadow"></div>');
	this.linkContent = $('<div id="itv_link_content" class="itv_link_content"></div>');
	this.linkIcon = $('<ul class="vertical-step-round"><ul>');
	this.selectPanel = $('<div id="itv_link_select_panel"></div>');
	// this.itemsAndSelectPanel = $('<div id = "itv_link_items_select_panel"></div>');
	this.defaultEventHandler = this.sceneManager.viewManager3d.defaultEventHandler;
	this.gcsManager = this.sceneManager.gcsManager;
	this.dataManager = this.sceneManager.dataManager;
	this.init();
};

mono.extend($LinkDialog,Object,{

	init : function(){
		var title = $('<div></div>');
		var self = this;
		this.mainPane.append(title);
		// this.itemsAndSelectPanel.append(this.linkContent);
		this.mainPane.append(this.linkIcon);
		this.mainPane.append(this.linkContent);
        this.btnclose = $('<div class="close" style="position:abslute;right:3px;top:3px"></div>');
        // var topPane = $('<div class="it-property-title"></div>');
        // topPane.append(btnclose);
        this.mainPane.append(this.btnclose);
		this.gcsManager.afterShowNetLinks = function(objects){
			self.linkIcon.empty();
			self.linkContent.empty();
			if (objects && objects.length > 0) {
				self.show(objects);
			}
		}
		this.gcsManager.afterShowLink = function(link){ // 当看一条连线时
			self.linkContent.empty();
			self.linkIcon.empty();
			self.show(link);
		}
		this.gcsManager.afterClearAllLinkFunction = function(){
			var svm = main.navBarManager.appManager.appMaps["IT_SEARCH"].app.virtualManager;
			svm.clearAll();
			self.close();
		}
	},

    /**
     * 根据link的data或link的起点和终点获取3D对象
     */
	getNodeByDataOrLinkData : function(data){
		if(!data){
			return null;
		}
		var node = null;
		if (data instanceof it.Link) {
			node = this.sceneManager.getLinkNodeById(data);
		}else{
			node = this.sceneManager.getNodeByDataOrId(data);
		}
		return node;
	},

    /**
     * 点击链路上的某个结点，包括连线
     */
	clickItem : function(data){
		var node = this.getNodeByDataOrLinkData(data);
		this.defaultEventHandler.lookAt(node);
	},
    
    /**
     *
     * 鼠标划过
     *
     * 需要完善的细节：当mouse下一个时，如果当前的还在执行的话，应该停掉
     */
	mouseoverItem : function(data){
		var node = this.getNodeByDataOrLinkData(data);
		if (!node) {
			return ;
		}
		// var category = this.dataManager.getCategoryForData(data);
		if (node._clientMap) {
			var simpleNode = node.getClient('simpleNode');
			var complexNode = node.getClient('complexNode');
			if (simpleNode && simpleNode.getParent() == node) {
				node = simpleNode;
			}else if(complexNode && complexNode.getParent && complexNode.getParent() == node){
				node = complexNode;
			}
		}
		if (this._mouseoverAnimate) {
			this._mouseoverAnimate.stop();
		}
		var oldColor = node.getStyle('m.color');
		var oldTransparent = node.getStyle('m.transparent');
		var oldOpacity = node.getStyle('m.opacity');
		node.setStyle('m.color','#B03060');
		this._mouseoverAnimate = new mono.Animate({
            from: 0,
            to: 1,
            dur: 500,
            repeat: Number.POSITIVE_INFINITY,
            onUpdate: function(value) {
                node.setStyle('m.transparent', true);
                node.setStyle('m.opacity', 0.3 + value * 0.7);
            },
            onStop: function() {
                node.setStyle('m.transparent', oldTransparent);
                node.setStyle('m.color',oldColor);
                node.setStyle('m.opacity',oldOpacity);
            }
        });
		this._mouseoverAnimate.play();
	},
    
    createItem : function(data,isStart,isEnd){
    	if (!data) {
    		return ;
    	}
    	var name = data.getName() || '文件服务器';
    	var label = data.getId() || 'SKL-JBK-23@135-F301M';
    	var itemDiv = $('<div class="itv_link_dialog_item"></div>');
    	var lineIcon = $('<div></div>');//$('<div class="itv_link_icon"></div>');
    	// var innerIcon = $('<HR class="itv_link_icon" align=center width=1 color=red size=100>');// $('<div class="itv_link_icon"></div>');
    	var contentDiv = $('<div class = "itv_link_item_content"></div>');
    	itemDiv.append(lineIcon);
    	// itemDiv.append(innerIcon);
    	itemDiv.append(contentDiv);
    	var nameDiv = $('<div><span>' + name + '</span></div>');
    	var idDiv = $('<div class="itv_link_label"><span>' + label + '</span></div>');
    	if (data instanceof it.Link) {
    		idDiv = $('<div class="itv_link_label">配线<span style="color: #00dddd;">' + label + '</span></div>');
    	}else{
    		contentDiv.append(nameDiv);
    	}
    	contentDiv.append(idDiv);
    	var self = this;
    	itemDiv.click(function(){
    		self.clickItem(data);
    	});
    	itemDiv.mousemove(function(){
    		self.mouseoverItem(data);
    	});
    	this.linkContent.append(itemDiv);

    	//创建icon
    	var icon = $('<li><a></a></li>');

    	this.linkIcon.append(icon);
    },

    createSelection : function(objects){
    	if (!objects || objects.length < 1) {
    		this.linkIcon.css('top',0);
    		return ;
    	}
    	var self = this;
    	var label = $('<div style="float:left; margin:5px 10px;"><span>链路：</span></div>');
    	this.selectPanel.append(label);
    	var select = $('<select style="float:left;margin:5px auto;"></select>');
    	this.selectPanel.append(select);
    	for(var i = 0 ; i < objects.length ; i++){
    		var links = objects[i];
    		var startLink = links[links.length-1];
    		if (startLink) {
    			var option = $('<option value = ' + i + '>' + startLink.getFromId() + '</option>');
    			select.append(option);
    		}
    	}
    	this.mainPane.append(this.selectPanel);
    	select.change(function(e){
    		// e.target.value
    		var value = select.val();
    		var links = objects[value];
    		if (links) {
    			self.linkContent.empty();
    			self.linkIcon.empty();
    			self.createOneLinks(links);
    			self.gcsManager.stopAllAnimates();
    			self.gcsManager.clearAllAnimateBillboard();
    			self.gcsManager.playAnimateByLinks(links);
    			self.gcsManager.lookAtLinks(links);
    		};
    	});
    	this.linkIcon.css('top',30);
    },

    close : function(){
    	// this.gcsManager.clearAllLink(true);
    	this.linkContent.empty();
    	this.linkIcon.empty();
    	this.mainPane.remove();
    },

    /**
     * 显示一整条链路，只是一条
     */
	createOneLinks: function(links) {
		if (!links || links.length < 1) {
			return;
		}
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (i == 0) {
				var toData = this.sceneManager.dataManager.getDataById(link.getToId());
				this.createItem(toData, true);
			}
			this.createItem(link);
			var fromData = this.sceneManager.dataManager.getDataById(link.getFromId());
			this.createItem(fromData, false, (i == (links.length - 1)));
		}
	},

    /**
     * 显示一整条链路，注意：是从to往前推的
     */
	show: function(objects) {
		var self = this;
		this.selectPanel.empty();
		this.selectPanel.remove();
		this.linkContent.remove(); // 为了布局，好将select放到items上方
		this.linkIcon.remove();
		this.linkIcon.css('top',0);
		$('#itv-main').append(this.mainPane);
		if (!objects) {
			return;
		}
		if (this.linkApp && !this.linkApp.isInit) {
			this.linkApp.init();
		}
		if (this.linkApp) {
			this.linkApp.show();
		}
		if (!(objects instanceof Array)) {
			this.mainPane.append(this.linkContent);
			this.mainPane.append(this.linkIcon);
			var link = objects;
			var toData = this.sceneManager.dataManager.getDataById(link.getToId());
			this.createItem(toData, true);
			this.createItem(link);
			var fromData = this.sceneManager.dataManager.getDataById(link.getFromId());
			this.createItem(fromData, false, true);
		} else if (objects.length > 0) {
			// 创建下拉框
			this.createSelection(objects);
			var links = objects[0]; //默认的显示第0个
			this.mainPane.append(this.linkContent);
			this.mainPane.append(this.linkIcon);
			this.createOneLinks(links);
			// for (var i = 0; i < links.length; i++) {
			// 	var link = links[i];
			// 	if (i == 0) {
			// 		var toData = this.sceneManager.dataManager.getDataById(link.getToId());
			// 		this.createItem(toData, true);
			// 	}
			// 	this.createItem(link);
			// 	var fromData = this.sceneManager.dataManager.getDataById(link.getFromId());
			// 	this.createItem(fromData, false, (i == (links.length - 1)));
			// }
		}
		this.btnclose.click(function() {
			self.close();
		});
		this.linkContent.mouseout(function(e) { //鼠标都移出了该区域，就不用再动画了
			if (self._mouseoverAnimate) {
				self._mouseoverAnimate.stop();
			}
		});
	},

});

it.LinkDialog = $LinkDialog;

