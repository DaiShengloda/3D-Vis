var $AssetFilter = function(configDialog){
    $ConfigApp.call(this, configDialog);
};

mono.extend($AssetFilter,$ConfigApp,{

	getId : function(){
        return 'AssetFilter';
    },

    hide:function(){
		$('#assetFilter').hide();
    },

    show:function(){
		$('#assetFilter').show();
    },

    createFilterAsset:function(category){
        var self=this;
        var filterAsset=$('<span style="position:relative;margin:5px;display:inline-block;border:1px solid #ccc;padding:2px;text-align:center;">'+category+'</span>');
        filterAsset.on('click',function(event){
            event.stopPropagation();
             var close=$('<img src=' + pageConfig.url("/css/images/cancel.png") +' style="position:absolute;right:-5px;top:-5px;width:10px;height:10px;"/>')
            filterAsset.append(close);

            close.on('click',function(event){
                var index=self.oldFilterAssetList.indexOf(category);
                self.oldFilterAssetList.splice(index,1);
                filterAsset.remove();
            });
            // filterAsset.on('mouseleave',function(){
            //     close.remove();
            // });
            $(document).bind("click",function(){
                close.remove();
            })
        })
        return filterAsset;
    },


    // addFilterAsset:function(category){
    //     var filterAsset=this.createFilterAsset`(category);
        
    // },

    initConfigPanel:function(){
        var self=this;
        this.filterAssetList=main.systemConfig.filter_asset_list;
        
        var box=$('<div id="assetFilter"></div>');
        var tit=$('<div><h5 style="font-weight: bold">'+it.util.i18n("AssetFilter_Search")+':</h5></div>');
        var filterAssets=$('<div id="filterAssets"></div>');
        var filterAssetOperation=$('<div></div>');
        var category=$('<input type="text" style="width:200px;margin-right:10px;" id="filterAssetCategory"/>')
        var btn1=$('<input type="button" style="margin-right:10px;" value="'+it.util.i18n("AssetFilter_Add_Asset") +'"/>');
        // var btn2=$('<input type="button" style="margin-right:10px;" value="删除资产"/>');
        var tip=$('<div id="filterAssetsTip"></div>');
        filterAssetOperation.append(category);
        filterAssetOperation.append(btn1);
        // filterAssetOperation.append(btn2);

        box.append(tit);
        box.append(filterAssets);
        box.append(filterAssetOperation);

        box.append(tip);
        this.configDialog.append(box);
        this.setData();

        btn1.on('click',function(){
            var value=category.val();
            var filters=filterAssets.find('span');
            for(var i=0;i<filters.length;i++){
                if($(filters[i]).text()==value){
                    tip.html('<span style="color:red;">输入重复</span>');
                    return false;
                }
            }
            if (!value) {
                tip.html('<span style="color:red;">输入有误</span>');
                return false;
            }
            var newFilter=self.createFilterAsset(value);
            filterAssets.append(newFilter);
            tip.html('<span style="color:green;">添加成功</span>');
            self.oldFilterAssetList.push(value);
            $('#filterAssetCategory').val("");
            return true;
        });


       
        // btn2.on('click',function(){
        //     var value=category.val();
        //     var filters=filterAssets.find('span');
        //     for(var i=0;i<filters.length;i++){
        //         if($(filters[i]).text()==value){
        //             filters[i].parentNode.removeChild(filters[i]);
        //             tip.html('<span style="color:green;">删除成功</span>');
        //             self.oldFilterAssetList.splice(i,1);
        //             $('#filterAssetCategory').val("");
        //             return true;
        //         }
        //     }
        //     tip.html('<span style="color:red;">输入不存在</span>');
        //     return false;
        // })
    },

    setData:function(){
        this.oldFilterAssetList=[];
        for(var i=0;i<main.systemConfig.filter_asset_list.length;i++){
            this.oldFilterAssetList.push(main.systemConfig.filter_asset_list[i]);
        }

        $('#filterAssets').empty();

        for(var i=0;i<this.filterAssetList.length;i++){
            var filter=this.createFilterAsset(this.filterAssetList[i]);
            $('#filterAssets').append(filter);
        }

        $('#filterAssetCategory').val("");
        $('#filterAssetsTip').html("");

    },

    updateData: function(data) {
        it.util.adminApi('config','update',data,function(result){
            if (result.error) {
                alterUtil.error(result.error);
            }else{
                main.systemConfig.filter_asset_list=self.filterAssetList;
            }
        });
    },

    clickForSetDefaultValue: function() {
        var self = this;
        $('#filterAssets').empty();
        $('#filterAssetsTip').empty();
        this.oldFilterAssetList=[];
        this.filterAssetList=[];
        var data = {
            value:{
                filter_asset_list:jsonUtil.object2String(self.oldFilterAssetList)
            },
            options:{
                id:'system'
            }
        }
        this.updateData(data);
    },

    clickForConfirm: function() {
        var self=this;
        self.filterAssetList=self.oldFilterAssetList;
        var objData={
            value:{
                filter_asset_list:jsonUtil.object2String(self.filterAssetList)
            },
            options:{
                id:'system'
            }
        };
        this.updateData(objData);
    },

    clickForCancel: function() {

    },

    isConfigChanged:function(){
        var flag=this.arrayEqual(this.oldFilterAssetList,this.filterAssetList);
        if (!flag) {
            return true;
        }
    },

    arrayEqual:function(arr1,arr2){
        for(var i=0;i<arr1.length;i++){
            if (arr2.indexOf(arr1[i])<0) {
                return false;
            }
        }
        for(var i=0;i<arr2.length;i++){
            if (arr1.indexOf(arr2[i])<0) {
                return false;
            }
        }
        return true;
    }
})

it.AssetFilter = $AssetFilter;