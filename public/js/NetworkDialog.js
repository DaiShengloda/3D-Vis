
/**
 *
 * 用来展示2D Network中的内容的dialog，如：2D的设备面板、网络连接、等，甚至是2D的Demo
 *
 * @constructor
 */

it.NetworkDialog = function(){
    this.mainPane = $('<div class="itv-network-dialog it-shadow"></div>')
//    this.background = $('<div class="background"></div>');
//    this.mainPane.append(this.background);
    this.contentPane = $('<div class="content"></div>');
    this.network = new twaver.vector.Network();
    this.box = this.network.getElementBox();
    this.init();
};

mono.extend(it.NetworkDialog,Object,{

    init : function(){
        this.mainPane.append(this.contentPane);
        var closeDiv = $('<div class="close" style="z-index: 4"></div>');
        this.contentPane.append(closeDiv);
        this.contentPane[0].appendChild(this.network.getView());
        var self = this;
        closeDiv.click(function (e){
            self.mainPane.hide();
        });
        var node = new twaver.Node();
        node.setName('Node-001');
        node.setLocation(100,100);
        this.box.add(node);
    },

    show:function(){
        if(this.mainPane.parent() && this.mainPane.parent().length > 0){
            this.mainPane.show();
        }else{
            $('body').append(this.mainPane);
            this.network.adjustBounds({x:0,y:0,width:document.documentElement.clientWidth,height:document.documentElement.clientHeight});
        }
    },


});