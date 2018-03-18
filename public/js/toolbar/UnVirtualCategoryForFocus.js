var $UnVirtualCategoryForFocus = function(configDialog){
    $ConfigApp.call(this,configDialog);
};

mono.extend($UnVirtualCategoryForFocus,$ConfigApp,{

    getId : function(){
        return 'UnVirtualCategoryForFocus';
    },

    hide:function(){
        $('#unVirtualCategoryForFocus').hide();
    },

    show:function(){
        $('#unVirtualCategoryForFocus').show();
    },

    createUnVirtualCategory:function(category){
        var self = this ;
        var unVirtualCategory=$('<span style="position:relative;margin:2px;display:inline-block;border:1px solid #ccc;padding:2px;text-align:center;">'+category+'</span>');

        unVirtualCategory.on('click',function(event){
            event.stopPropagation();
            var close=$('<img src=' + pageConfig.url("/css/images/cancel.png") +' style="position:absolute;right:-5px;top:-5px;width:10px;height:10px;"/>')
            unVirtualCategory.append(close);

            close.on('click',function(event){
                var index=self.oldUnVirtualCategoryList.indexOf(category);
                self.oldUnVirtualCategoryList.splice(index,1);
                unVirtualCategory.remove();
            });
            // filterAsset.on('mouseleave',function(){
            //     close.remove();
            // });
            $(document).bind("click",function(){
                close.remove();
            });
        })

        return unVirtualCategory;
    },


    // addFilterAsset:function(category){
    //     var filterAsset=this.createFilterAsset(category);
        
    // },

    initConfigPanel:function(){
        var self=this;
        this.unVirtualCategoryList=main.systemConfig.un_virtual_category;
        
        var box=$('<div id="unVirtualCategoryForFocus"></div>');
        var tit=$('<div><h5 style="font-weight: bold">'+it.util.i18n("UnVirtual_For_Focus")+':</h5></div>');
        var unVirtualCategorys=$('<div id="unVirtualCategorys"></div>');
        var unVirtualCategoryOperation=$('<div></div>');
        var category=$('<input type="text" style="width:200px;margin-right:10px;" id="unVirtualCategoryInput"/>')
        var btn1=$('<input type="button" style="margin-right:10px;" value="'+it.util.i18n("AssetFilter_Add_Asset")+'"/>');
        // var btn2=$('<input type="button" style="margin-right:10px;" value="删除资产"/>');
        var tip=$('<div id="unVirtualCategorysTip"></div>');
        unVirtualCategoryOperation.append(category);
        unVirtualCategoryOperation.append(btn1);
        // unVirtualCategoryOperation.append(btn2);

        box.append(tit);
        box.append(unVirtualCategorys);
        box.append(unVirtualCategoryOperation);

        box.append(tip);
        this.configDialog.append(box);

        btn1.on('click',function(){
            var value=category.val();
            var filters=unVirtualCategorys.find('span');
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
            var newFilter=self.createUnVirtualCategory(value);
            unVirtualCategorys.append(newFilter);
            tip.html('<span style="color:green;">添加成功</span>');
            self.oldUnVirtualCategoryList.push(value);
            $('#unVirtualCategoryInput').val("");
            return true;
        });

        // btn2.on('click',function(){
        //     var value=category.val();
        //     var filters=unVirtualCategorys.find('span');
        //     for(var i=0;i<filters.length;i++){
        //         if($(filters[i]).text()==value){
        //             filters[i].parentNode.removeChild(filters[i]);
        //             tip.html('<span style="color:green;">删除成功</span>');
        //             self.oldUnVirtualCategoryList.splice(i,1);
        //             $('#unVirtualCategoryInput').val("");
        //             return true;
        //         }
        //     }
        //     tip.html('<span style="color:red;">输入不存在</span>');
        //     return false;
        // })
    },

    setData:function(){
        this.oldUnVirtualCategoryList=[];
        for(var i=0;i<main.systemConfig.un_virtual_category.length;i++){
            this.oldUnVirtualCategoryList.push(main.systemConfig.un_virtual_category[i]);
        }

         $('#unVirtualCategorys').empty();

         for(var i=0;i<this.unVirtualCategoryList.length;i++){
            var filter=this.createUnVirtualCategory(this.unVirtualCategoryList[i]);
            $('#unVirtualCategorys').append(filter);
        }

         $('#unVirtualCategoryInput').val("");
         $('#unVirtualCategorysTip').html("");
    },

    clickForSetDefaultValue: function() {
        $('#unVirtualCategorys').empty();
        // this.filterAssetList=[];
        this.oldUnVirtualCategoryList=[];
    },

    clickForConfirm: function() {
        var self=this;
        self.unVirtualCategoryList=self.oldUnVirtualCategoryList;
        var objData={
            value:{
                un_virtual_category:jsonUtil.object2String(self.unVirtualCategoryList)
            },
            options:{
                id:'system'
            }
        };
        ServerUtil.api('config','update',objData,function(data){
            if (data.error) {
                alterUtil.error(data.error);
            }else{
                main.systemConfig.un_virtual_category=self.unVirtualCategoryList;
            }
        });

    },

    clickForCancel: function() {

    },

    isConfigChanged:function(){
        var flag=this.arrayEqual(this.oldUnVirtualCategoryList,this.unVirtualCategoryList);
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

it.UnVirtualCategoryForFocus = $UnVirtualCategoryForFocus;
