/**
 * 左侧搜索框
 * @constructor
 */
it.SearchPanel = function (){
    this.searchPane = $('#itv-search-panel');
    this.children = [];
};

mono.extend(it.SearchPanel,Object,{

    add : function(child){
        if(child && $(child)){
            var ch = $(child);
            this.searchPane.append(ch);
            this.children.push(ch);
            child.show();
        }
    },

    remove : function(child){
        if(child){
            child = $(child);
        }
        if(child){
//            child.remove();
            child.hide();
        }
    },

    clear : function(){
//        this.searchPane.empty(); // 不可以这么干，因为右侧还包括了展开合并的button
        if(this.children){
            for(var i = 0 ; i < this.children.length ; i++){
                var child = this.children[i];
                if(child){
//                    child.remove();
                    child.hide();
                }
            }
        }
        this.children = [];
    },

    /**
     * 显示，如果存在child时，就先清空，然后再显示
     * @param child
     */
    show : function(child){
        if(child){
            this.clear();
            this.add(child);
        }
        this.searchPane.show();
    },

    hide : function(){
        this.searchPane.hide();
    },

});