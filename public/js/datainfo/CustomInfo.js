
 /**
  * 性能信息
  * 用一个Iframe,连接到一个URL
  */
 var $CustomInfo = function(sceneManager){
 	  $BaseServerTab.call(this,sceneManager);
    this.title = "";
    this.mainPanel = null;
    this.init();
 };

 mono.extend($CustomInfo,$BaseServerTab,{

 	init : function(){
 		this.mainPanel = $('<form class="form-horizontal" role="form" style="position:relative;height:500px;width:500px"></form>');
 	},

 	createIFrame : function(src){
 		src = src || "";
 	    return  '<iframe src="'+src+'" style="position: relative;height: 100%;width: 100%"></iframe>';
 	},

  setTitle :function(title){
     this.title = title;
  },

 	getTitle : function(){
	 	return this.title;
	},

    getContentClass : function(){
    	return '';
    },

    //  setData : function(data){
    //   this.mainPanel.empty();
    //   var category = this.sceneManager.dataManager.getCategoryForData(data);
    //   var src = ''; 
    //   if (category && category.getUserData('performanceUrl')) {
    //    src = category.getUserData('performanceUrl');
    //   }
    //   if (src) {
    //     var param = "";
    //     if (id) {
    //         param = "?id="+id;
    //     }
    //     var frame = this.createIFrame(src+param);
    //     this.mainPanel.append(frame);
    //   }
    //   // var src = 'http://www.dangdang.com/';  
    // },

    setURL : function(src,id){
    	this.mainPanel.empty();
    	if (src) {
        var param = "";
        if (id) {
            param = "?id="+id;
        }
    		var frame = this.createIFrame(src+param);
    		this.mainPanel.append(frame);
    	}
    },

    getContentPanel : function(){
    	var div = $('<div></div>');
    	var content = $('<div class="content"></div>');
    	content.append(this.mainPanel);
    	div.append(content);
    	return div;
    },

    afterShow : function(){
    	this.mainPanel.css('height',500);
    	this.mainPanel.css('margin-left',0);
    	this.mainPanel.css('margin-right',0);
    }

 });
