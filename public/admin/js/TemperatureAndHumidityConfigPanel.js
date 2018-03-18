//是改进的it.AlarmConfigDialog
//温湿度config的类
var $TemperatureAndHumidityConfigPanel = function(configDialog) {
    $ConfigApp.call(this, configDialog);
    this.map = {};
    this.errorMessage = '';
};

mono.extend($TemperatureAndHumidityConfigPanel, $ConfigApp, {

    createOption: function(id, value, prex) {
        prex = prex || '';
        var select = $('<select disabled="disabled" id = "' + id + '"></select>');
        var option = $('<option value="' + prex + '_blue">' + it.util.i18n("TemperatureAndHumidityConfigPanel_blue") + '</option>');
        select.append(option);
        option = $('<option value="' + prex + '_green">' + it.util.i18n("TemperatureAndHumidityConfigPanel_green") + '</option>');
        select.append(option);
        option = $('<option value="' + prex + '_yellow">' + it.util.i18n("TemperatureAndHumidityConfigPanel_yellow") + '</option>');
        select.append(option);
        option = $('<option value="' + prex + '_red">' + it.util.i18n("TemperatureAndHumidityConfigPanel_red") + '</option>');
        select.append(option);
        return select;
    },

    createRow: function(id, unit, prex) {
        var self = this;
        var area = $('<div id = "' + id + '" style="margin-bottom:2px"></div>');
        var fromToHtml = '<span>' + it.util.i18n("TemperatureAndHumidityConfigPanel_from") + '</span>';
        var inputMin = $(' <input id = "' + id + '_min" placeholder="'+it.util.i18n("TemperatureAndHumidityConfigPanel_Fill_Float")+'" class="lowValue input-min"style="width: 100px;height: 22px;color: #ffab00;border-width: 1px;background: #fff;border: 1px solid #DCDCDC;" value="">');
      
            self.map[id + "_min"] = $(inputMin);
            
        
        fromToHtml += '<span>' + unit + ' ' + it.util.i18n("TemperatureAndHumidityConfigPanel_to") + '</span>'
        fromToHtml += '<span></span>'
        var inputMax = $(' <input id = "' + id + '_max" placeholder="'+it.util.i18n("TemperatureAndHumidityConfigPanel_Fill_Float")+'" class="highValue input-min" style="width: 100px;height: 22px;color: #ffab00;border-width: 1px;background: #fff;border: 1px solid #DCDCDC;" value="">');
           
            self.map[id + "_max"] = $(inputMax);

        fromToHtml += '<span>' + unit + ':</span>';
        var from_to = $(fromToHtml);
        from_to.eq(0).append(inputMin);
        from_to.eq(2).append(inputMax);
        area.append(from_to);
        var select = this.createOption(id + '_option', null, prex);
        var selectSpan = $('<span></span>');
        selectSpan.append(select);
        area.append(selectSpan);
        return area;
    },

    volidate:function(){
        // var self = this;
        // var values = self.map;
        // var result = [];
        // for(var id in values){
        //     if(id.indexOf("temp-config-diglog") != -1 && $.trim(values[id].val()) != ''){//只拿温度值
        //         if(id.indexOf("max") != -1){
        //             result.push(parseFloat(values[id].val()));
        //         } 
        //     }
        // }
        // var section = [];
        // var next = 1;
        // for(var index in result){
        //     if(result[index] > result[next]){
        //         section.push(result[index]);
        //     }
        //     next++ ;
        // }
        // if(section.length > 0 ){
        //     layer.alert(section+it.util.i18n("TemperatureAndHumidityConfigPanel_has_overlapping"));
        //     return false;
        // }
        return true;
    },

    createInput:function(id,title,width){
        var self=this;
        var area=$('<span id="more_config_'+id+'" style="display:inline-block;margin-bottom:2px;margin-right:5%;">'+title+'</span>');
        var input=$('<input type="text" class="input-min" style="width: '+(width?width:100)+'px;height: 22px;color: #ffab00;border-width: 1px;background: #fff;border: 1px solid #DCDCDC;">');
        area.append(input);
        input.on("blur",function(){
            self.map[id+"_more_config"]=$(this);
        });
        return area;
    },

    createCheckBox : function(id,name,checked){
        var item = $('<label id="more_config_'+id+'" class="checkbox-class itv-checkbox-line" style="display:inline-block;width:35%;">' +
            '<div class="itv-checker"><span class="'+(checked==true?'checked':'check')+'" ></span>' +
            '</div>'+ name +'</label>');
        var input = $('<input type="checkbox" class="checkbox_default"' + checked + '>');
        item.children().children().append(input);
        input.change(function(eve){
            var checkbox = $(eve.currentTarget);
            var iconSpan = checkbox.parent();//$('.checker>span');
            if(checkbox.is(':checked')){
                iconSpan.attr('class','checked');
            }else{
                iconSpan.attr('class','check');
            }
        });
        return item;
    },

    createMoreBtn:function(type){
        var self=this;
        var area=($('<div id="more_btn_'+type+'"><input type="button" value="'+ it.util.i18n("TemperatureAndHumidityConfigPanel_More_Config")+'" style="margin-bottom:2px;padding:2px;"></div>'));
        area.click(function(){
            if ($('#more_config_'+type).is(':visible')) {
                $('#more_config_'+type).hide();
                $('#more_btn_'+type).find('input').val(it.util.i18n("TemperatureAndHumidityConfigPanel_More_Config"));
            }else{
                $('#more_config_'+type).show();
                $('#more_btn_'+type).find('input').val(it.util.i18n("TemperatureAndHumidityConfigPanel_Hide_More_Config"));
                // self.setMoreConfigData(type);
            }
        });
        return area;
    },

    createImg:function(src){
        var img=$('<img draggable="false" src="'+src+'">');
        img.css({
            "width":"24%",
            "height":"100%",
            "padding":"2%"
        });
        return img;
    },

    createImgClass:function(src1,src2,src3,src4,width,height,cls){
        var picsty=$('<div class="picsty '+(cls?cls:"")+'"></div>');

        var img=this.createImg(src1);
        picsty.append(img);

        img=this.createImg(src2);
        picsty.append(img);

        img=this.createImg(src3);
        picsty.append(img);

        img=this.createImg(src4);
        picsty.append(img);

        picsty.css({
            "width":width,
            "height":height,
            "border":"1px solid #ccc",
            "display":"inline-block"
        });
        return picsty;
    },

    createPicChoose:function(type){
        var curimgclass=this.createImgClass("","","","","300px","100px","cur_pic");

        var btn=$("<button id='choose_pic'>"+it.util.i18n("TemperatureAndHumidityConfigPanel_Choose_Picture") +"</button>");
        var pic_choose=$('<div class="pic_choose_'+type+'"></div>');
        pic_choose.append(curimgclass);
        pic_choose.append(btn);

        var mask=$('<div class="choosepicbox_mask_'+type+'" ></div>');
        mask.css({
            "display": "none",
            "width": "100%",
            "height": "100%",
            "background-color": "rgba(0,0,0,.5)",
            "position": "fixed",
            "top": 0,
            "left": 0,
            "z-index":999
        });

        var picbox=$("<div class='pic_choose_box'></div>");
        picbox.css({
            "width": "527px",
            "height": "600px",
            "overflow-y": "auto",
            "margin": "0 auto",
            "font-size": 0,
            "line-height": 0,
            "margin-top":"30px",
            "background-color":"#fff",
            "padding-left":"30px"
        });
        var h5=$("<h5>"+ it.util.i18n("TemperatureAndHumidityConfigPanel_Choose_Temalarm_bg")+"</h5>");
        h5.css({
            "font-size":"16px",
            "line-height":"50px",
            // "position" :"absolute",
            // "margin-top":"-22px"
        });
        picbox.append(h5);
        mask.append(picbox);
        $('body').append(mask);

         var picsty=this.createImgClass(pageConfig.url("/images/tem_blue.png"),pageConfig.url("/images/tem_green.png"),pageConfig.url("/images/tem_yellow.png"),pageConfig.url("/images/tem_red.png"),"80%","20%");
        picbox.append(picsty);
        picsty=this.createImgClass(pageConfig.url("/images/hum_blue.png"),pageConfig.url("/images/hum_green.png"),pageConfig.url("/images/hum_yellow.png"),pageConfig.url("/images/hum_red.png"),"80%","20%");
        picbox.append(picsty);


        var btn2=$('<div><button id="confirm">'+ it.util.i18n("AlertUtil_Sure")+'</button><button id="cancel">'+it.util.i18n("AlertUtil_Cancel") +'</button></div>');
        btn2.css({
            "position": "absolute",
            "left":"50%",
            "top":"590px"
        });
        btn2.find('button').css({
            "margin-right":"10px",
            "height":"30px",
            "width":"50px"
        });
        picbox.append(btn2);

        btn.on("click",function(){
            mask.show();
        })

        $(".choosepicbox_mask_"+type+" .picsty").on("click",function(){
            $(".choosepicbox_mask_"+type+" .picsty").css("border","1px solid #ccc");
            $(this).css("border","1px solid red");
            $(".choosepicbox_mask_"+type+" .picsty").removeClass("active");
            $(this).addClass("active");
        });
        $(".choosepicbox_mask_"+type+" #cancel").on("click",function(){
            $(".choosepicbox_mask_"+type).hide();
        });
        $(".choosepicbox_mask_"+type+" #confirm").on("click",function(){
            $(".choosepicbox_mask_"+type).hide();
            var set_imgs=$(".pic_choose_"+type+" .cur_pic").find("img");
            var act_imgs=$(".choosepicbox_mask_"+type+" .active").find("img");
            for(var i=0;i<set_imgs.length;i++){
                $(set_imgs[i]).attr("src",$(act_imgs[i]).attr("src"));
            }
        });
        return pic_choose;
    },

    createMoreConfigArea:function(type){
        var self=this;
        var area=$('<div id="more_config_'+type+'" style="display:none;"></div>');

        var area1=$('<div><b style="margin-right:5px;margin-bottom:2px;font-size:12px;display:block;">'+it.util.i18n("TemperatureAndHumidityConfigPanel_Font_Config")+':</b></div>');
        var area2=$('<div><b style="margin-right:5px;margin-bottom:2px;font-size:12px;display:block;">'+it.util.i18n("TemperatureAndHumidityConfigPanel_Picture_Config")+':</b></div>');
        var area3=$('<div><b style="margin-right:5px;margin-bottom:2px;font-size:12px;display:block;">'+it.util.i18n("TemperatureAndHumidityConfigPanel_Billboard_Config")+':</b></div>');
        var area4=$('<div><b style="margin-right:5px;margin-bottom:2px;font-size:12px;display:block;">'+it.util.i18n("TemperatureAndHumidityConfigPanel_Choose_Picture")+':</b></div>');

        var item=this.createInput('color',it.util.i18n("TemperatureAndHumidityConfigPanel_Font_Color")+"&nbsp;&nbsp;&nbsp;&nbsp;");
        area1.append(item);
        item=this.createInput('size',it.util.i18n("TemperatureAndHumidityConfigPanel_Font_Size")+"&nbsp;&nbsp;&nbsp;&nbsp;");
        area1.append(item);
        item=this.createInput('family',it.util.i18n("TemperatureAndHumidityConfigPanel_Font_Family")+"&nbsp;&nbsp;&nbsp;&nbsp;");
        area1.append(item);
        item=this.createInput('lineWidth',it.util.i18n("TemperatureAndHumidityConfigPanel_Font_Linewidth")+'&nbsp;&nbsp;&nbsp;&nbsp;');
        area1.append(item);
        item=this.createCheckBox('unit',it.util.i18n("TemperatureAndHumidityConfigPanel_Isshow_Unix"),true);
        area1.append(item);
        item=this.createCheckBox('stroke',it.util.i18n("TemperatureAndHumidityConfigPanel_Is_Stroke"),false);
        area1.append(item);
        area.append(area1);

        item=this.createInput('canvasX',it.util.i18n("TemperatureAndHumidityConfigPanel_Picture_Width")+"&nbsp;&nbsp;&nbsp;&nbsp;");
        area2.append(item);
        item=this.createInput('canvasY',it.util.i18n("TemperatureAndHumidityConfigPanel_Picture_Height")+"&nbsp;&nbsp;&nbsp;&nbsp;");
        area2.append(item);
        item=this.createInput('fontStartX',it.util.i18n("TemperatureAndHumidityConfigPanel_Font_StartX")+"&nbsp;&nbsp;");
        area2.append(item);
        item=this.createInput('fontStartY',it.util.i18n("TemperatureAndHumidityConfigPanel_Font_StartY")+"&nbsp;&nbsp;");
        area2.append(item);
        area.append(area2);

        item=this.createInput('billboard',it.util.i18n("TemperatureAndHumidityConfigPanel_Scale_X")+"&nbsp;&nbsp;");
        area3.append(item);
        item=this.createInput('billboard',it.util.i18n("TemperatureAndHumidityConfigPanel_Scale_Y")+"&nbsp;&nbsp;");
        area3.append(item);

        area.append(area3);

        item=this.createPicChoose(type);
        area4.append(item);
        area.append(area4);

        return area;
    },

    initTemperatureBox: function() {
        var box = $('<div class="temperatureBox" id="temperatureBox"><div>');
        var header = $('<div><h5 style="font-weight: bold">' + it.util.i18n("TemperatureAndHumidityConfigPanel_temp_bubble") + ':</h5></div>');
        box.append(header);
        var area = this.createRow('temp-config-diglog-01', '℃', 'tem');
        box.append(area);
        area = this.createRow('temp-config-diglog-02', '℃', 'tem');
        box.append(area);
        area = this.createRow('temp-config-diglog-03', '℃', 'tem');
        box.append(area);
        area = this.createRow('temp-config-diglog-04', '℃', 'tem');
        box.append(area);

        area=this.createMoreConfigArea('temp');
        box.append(area);

        area=this.createMoreBtn('temp')
        box.append(area);

        this.configDialog.append(box);
        // $("#temp-config-diglog-01_min").attr("disabled","disabled");
        // $("#temp-config-diglog-01_min").css({"background-color":"#F7F7F7",
        //                                     // "font-size":"0px",
        //                                     // "vertical-align":"middle"
        //                                 });
        // $("#temp-config-diglog-04_max").attr("disabled","disabled");
        // $("#temp-config-diglog-04_max").css({"background-color":"#F7F7F7",
        //                                     // "font-size":"0px",
        //                                     // "vertical-align":"middle"
        //                                 });

        var tempRows = $("input[id^='temp-config-diglog']");
        // tempRows.change(function(){
        //     if(this.id.slice(-3)=='max'){
        //         $('#temp-config-diglog-0'+(parseInt(this.id.slice(-5,-4))+1)+'_min').val($(this).val());
        //     }else{
        //         $('#temp-config-diglog-0'+(parseInt(this.id.slice(-5,-4))-1)+'_max').val($(this).val());
        //     }       
        // });

    },

    initHumidityBox: function() {
        var box = $('<div class="humidityBox" id="humidityBox"></div>');
        this.configDialog.append(box);
        var header = $('<div><h5 style="font-weight: bold">' + it.util.i18n("TemperatureAndHumidityConfigPanel_humidity_bubble") + ':</h5></div>');
        box.append(header);
        var area = this.createRow('hum-config-diglog-01', '%', 'hum');
        box.append(area);
        area = this.createRow('hum-config-diglog-02', '%', 'hum');
        box.append(area);
        area = this.createRow('hum-config-diglog-03', '%', 'hum');
        box.append(area);
        area = this.createRow('hum-config-diglog-04', '%', 'hum');
        box.append(area);
        
        area=this.createMoreConfigArea('hum');
        box.append(area);

        area=this.createMoreBtn('hum');
        box.append(area);

        $("#hum-config-diglog-01_min").attr("disabled","disabled");
        $("#hum-config-diglog-01_min").css({"background-color":"#F7F7F7",
                                            // "font-size":"0px",
                                            // "vertical-align":"middle"
                                        });
        $("#hum-config-diglog-04_max").attr("disabled","disabled");
        $("#hum-config-diglog-04_max").css({"background-color":"#F7F7F7",
                                            // "font-size":"0px",
                                            // "vertical-align":"middle"
                                        });

        var humRows = $("input[id^='hum-config-diglog']");
        // humRows.change(function(){
        //     if(this.id.slice(-3)=='max'){
        //         $('#hum-config-diglog-0'+(parseInt(this.id.slice(-5,-4))+1)+'_min').val($(this).val());
        //     }else{
        //         $('#hum-config-diglog-0'+(parseInt(this.id.slice(-5,-4))-1)+'_max').val($(this).val());
        //     }       
        // });

    },

     initConfigPanel: function() {
        var self = this;
        this.moreConfigItems=["font_color","font_size","font_family","font_linewidth","writeunit","stroke","canvasX","canvasY","startX","startY","billboardX","billboardY","bluesrc","greensrc","yellowsrc","redsrc"];
        this.initTemperatureBox();
        this.initHumidityBox();
        this.setData();
        this.oldTempArr = [];
        this.oldHumArr = [];
        for(var i in this.tempMap){
            this.tempMap[i].forEach(function(temp){
                self.oldTempArr.push(Number(temp));
            });
        }
        for(var i in this.humMap){
            this.humMap[i].forEach(function(hum){
                self.oldHumArr.push(Number(hum));
            });
        }

        $('input[id^="temp-config-diglog"]').on('change',function(e){
            var sf = self;
            var curInp = $(this);
            sf.inputChangeEvent(curInp,'temp');
        });

        $('input[id^="hum-config-diglog"]').on('change',function(e){
            var sf = self;
            var curInp = $(this);
            sf.inputChangeEvent(curInp,'hum');
        });    
    },
    inputChangeEvent: function(curInp,field){
        var tempAndHumApp = this;
        var inpVal = curInp.val();
        var inpIdExec =  /(\d)(\d+)_([A-Za-z]+$)/.exec(curInp.attr('id'));
        var inpOrderId = parseInt(inpIdExec[1]);
        var inpId = parseInt(inpIdExec[2]);
        var inpStat = inpIdExec[3];
        var tempArrIndex,oldTempVal;
        if(!isNaN(inpVal) && (inpVal%1 == 0) && inpVal>0){
            //不允许前面的inut数值比后面的大的情况
            if(inpIdExec && inpIdExec[2]){                  
                //超出值要返回原值
                if(inpStat == 'min'){
                    var subInpId = inpId - 1; 
                    tempArrIndex = inpId*2 -2;
                    oldTempVal = tempAndHumApp.oldTempArr[tempArrIndex];
                    var subInp;
                    var subInpVals = [];
                    var lessFlag = false;
                    subInp = $('input[id="'+field+'-config-diglog-'+inpOrderId+subInpId+'_min"]');
                    while(subInp.length){
                        if(inpId > subInpId +1){
                            subInp = $('input[id="'+field+'-config-diglog-'+inpOrderId+subInpId+'_max"]');
                        }
                        subInpVals.push(parseInt(subInp.val()));
                        subInpId--;     
                    }
                    for(var i=0;i<subInpVals.length;i++){
                        if(inpVal <= subInpVals[i]){
                            layer.open({
                                content: it.util.i18n('SytemSettingPage_errorMessage_tempAndHum_compare_less')
                            });
                            curInp.val(oldTempVal);
                            lessFlag = true;
                            break;
                        }
                    }
                    if(!lessFlag){ //正常情况,即当前值小于后面的所有项
                        tempAndHumApp.oldTempArr[tempArrIndex] = inpVal;
                        //当前栏的最大值要和下一栏的最小值跟着变
                        if(inpId > 0){
                            var prevInpId = inpId-1;
                            tempAndHumApp.oldTempArr[tempArrIndex-1] = inpVal;
                            $('input[id="'+field+'-config-diglog-'+inpOrderId+prevInpId+'_max"]').val(inpVal);
                        }
                    }
                }else{//max
                    var addInpId = inpId + 1;
                    tempArrIndex = inpId*2 -1;
                    oldTempVal = tempAndHumApp.oldTempArr[tempArrIndex];
                    var addInp;
                    var addInpVals = [];
                    var aboveFlag = false;
                    addInp = $('input[id="'+field+'-config-diglog-'+inpOrderId+addInpId+'_max"]');
                    while(addInp.length){
                        if(addInpId > inpId +1){
                            addInp = $('input[id="'+field+'-config-diglog-'+inpOrderId+addInpId+'_min"]');
                        }
                        addInpVals.push(parseInt(addInp.val()));
                        addInpId++;     
                    }
                    for(var i=0;i<addInpVals.length;i++){
                        if(inpVal >= addInpVals[i]){
                            layer.open({
                                content: it.util.i18n('SytemSettingPage_errorMessage_tempAndHum_compare_much')
                            });
                            curInp.val(oldTempVal);
                            aboveFlag = true;
                            break;
                        }
                    }
                    if(!aboveFlag){ //正常情况,即当前值小于后面的所有项
                        tempAndHumApp.oldTempArr[tempArrIndex] = inpVal;
                        //当前栏的最大值要和下一栏的最小值跟着变
                        if(inpId < 4){
                            var nextInpId = inpId+1;
                            tempAndHumApp.oldTempArr[tempArrIndex+1] = inpVal;
                            $('input[id="'+field+'-config-diglog-'+inpOrderId+nextInpId+'_min"]').val(inpVal);
                        }
                    }            
                }
            }           
        }else{
            layer.open({
                content: it.util.i18n('SytemSettingPage_errorMessage_tempAndHum_int')
            });
            if(inpStat == 'min'){
                tempArrIndex = inpId*2 -2;

            }else{
                tempArrIndex = inpId*2 -1;
            }
            oldTempVal = tempAndHumApp.oldTempArr[tempArrIndex];
            curInp.val(oldTempVal);
        }
    }
    ,
    getRowValue: function(div) {
        if (!div) {
            return null;
        }
        var children = $(div).children('span');
        var minValue = $(children[0]).children('input').val();
        var maxValue = $(children[2]).children('input').val();
        var color = $(children[4]).children('select').val();
        if (!isNaN(minValue) || !isNaN(maxValue)) {
            var obj = {};
            obj[color] = [minValue, maxValue];
            return obj;
        }
        return null;
    },

    getFormData: function() {
        var tempColorMap = {},
            humColorMap = {},
            tempMoreConfig={},
            humMoreConfig={};
        var tempRows = $("div[id^='temp-config-diglog']");
        var tempMoreConfigArea=$("#more_config_temp");
        if (tempRows && tempRows.length > 0) {
            for (var i = 0; i < tempRows.length; i++) {
                var rowValue = this.getRowValue(tempRows[i]);
                if (rowValue) {
                    for (var color in rowValue) {
                        tempColorMap[color] = rowValue[color];
                    }
                }
            }
        }
        for(var p in this.moreConfigItems){
            if (this.moreConfigItems[p].substr(-3)=="src") {
                var tempcurimg= $("#more_config_temp .cur_pic").find("img");
                switch (this.moreConfigItems[p].substr(0,3)) {
                    case "blu":
                        tempMoreConfig[this.moreConfigItems[p]]=$(tempcurimg[0]).attr("src");
                        break;
                    case "gre":
                        tempMoreConfig[this.moreConfigItems[p]]=$(tempcurimg[1]).attr("src");
                        break;
                    case "yel":
                        tempMoreConfig[this.moreConfigItems[p]]=$(tempcurimg[2]).attr("src");
                    break;
                    case "red":
                        tempMoreConfig[this.moreConfigItems[p]]=$(tempcurimg[3]).attr("src");
                    break;
                }
            }else{
                var curinput=tempMoreConfigArea.find("input").eq(parseInt(p));
                if (curinput.attr("type")=="checkbox") {
                    tempMoreConfig[this.moreConfigItems[p]]=curinput.is(":checked")?true:false;
                }else {
                    tempMoreConfig[this.moreConfigItems[p]]=curinput.val();   
                }
            }
        }

        var humRows = $("div[id^='hum-config-diglog']");
        var humMoreConfigArea=$("#more_config_hum");
        if (humRows && humRows.length > 0) {
            for (var i = 0; i < humRows.length; i++) {
                var rowValue = this.getRowValue(humRows[i]);
                if (rowValue) {
                    for (var color in rowValue) {
                        humColorMap[color] = rowValue[color];
                    }
                }
            }
        }
        for(var p in this.moreConfigItems){
            if (this.moreConfigItems[p].substr(-3)=="src") {
                var humcurimg= $("#more_config_hum .cur_pic").find("img");
                switch (this.moreConfigItems[p].substr(0,3)) {
                    case "blu":
                        humMoreConfig[this.moreConfigItems[p]]=$(humcurimg[0]).attr("src");
                        break;
                    case "gre":
                        humMoreConfig[this.moreConfigItems[p]]=$(humcurimg[1]).attr("src");
                        break;
                    case "yel":
                        humMoreConfig[this.moreConfigItems[p]]=$(humcurimg[2]).attr("src");
                    break;
                    case "red":
                        humMoreConfig[this.moreConfigItems[p]]=$(humcurimg[3]).attr("src");
                    break;
                }
            }else{
                var curinput=humMoreConfigArea.find("input").eq(parseInt(p));
                if (curinput.attr("type")=="checkbox") {
                    humMoreConfig[this.moreConfigItems[p]]=curinput.is(":checked")?true:false;
                }else {
                    humMoreConfig[this.moreConfigItems[p]]=curinput.val();   
                }
            }
        }
       
        return { tempBasic: tempColorMap ,tempMore:tempMoreConfig, humBasic: humColorMap ,humMore:humMoreConfig };
    },


    setRowValue: function(div, color, minValue, maxValue) {
        if (!div) {
            return null;
        }
        var children = $(div).children('span');
        $(children[0]).children('input').val(minValue);
        $(children[2]).children('input').val(maxValue);
        $(children[4]).children('select').val(color);
    },

    setFormData: function(divIdLike, dataMap) {
        if (divIdLike) {
            var tempRows = $("div[id^='" + divIdLike + "']");
            dataMap = dataMap || {};
            if (tempRows && tempRows.length > 0) {
                var i = 0;
                for (var color in dataMap) {
                    var vals = dataMap[color];
                    if (vals && vals.length <= 2) {
                        if (i > tempRows.length) {
                            console.log('more color data,please check');
                            return;
                        }
                        this.setRowValue(tempRows[i], color, vals[0], vals[1]);
                        i++;
                    }
                }
                for (; i < tempRows.length; i++) {
                    this.setRowValue(tempRows[i], color, '', '');
                }
            }
        }
    },

    setMoreConfigData:function(type,datamap){
        var dataMap=datamap||main.systemConfig[type+"_more_config"];
        var moreConfigArea=$("#more_config_"+type);
        for(var p in this.moreConfigItems){
            var curinput=moreConfigArea.find("input").eq(parseInt(p));
            if (curinput.attr("type")=="checkbox") {
                (dataMap[this.moreConfigItems[p]]==true)?curinput.prop("checked", true):curinput.prop("checked", false);
            }else {
                curinput.val(dataMap[this.moreConfigItems[p]]);   
            }
        }
        var typecurimg= $("#more_config_"+type+" .cur_pic").find("img");
        $(typecurimg[0]).attr("src",dataMap["bluesrc"]);
        $(typecurimg[1]).attr("src",dataMap["greensrc"]);
        $(typecurimg[2]).attr("src",dataMap["yellowsrc"]);
        $(typecurimg[3]).attr("src",dataMap["redsrc"]);
    },

    initConfigDialogValue: function(tempMap, humMap,tempMore,humMore) {
        this.tempMap = tempMap;
        this.humMap = humMap;
        this.tempMore=tempMore;
        this.humMore=humMore;

        this.setFormData('temp-config-diglog', tempMap);
        this.setFormData('hum-config-diglog', humMap);

        this.setMoreConfigData('temp');
        this.setMoreConfigData('hum');
    },

    setData: function() {
        if (main.systemConfig) {
            // this.configDialog.dialog('open');
            // this.alarmConfigDirty = false;
            this.initConfigDialogValue(main.systemConfig.temp_alarm_config, main.systemConfig.hum_alarm_config,main.systemConfig.temp_more_config,main.systemConfig.hum_more_config);
        } else {
            console.log('check loadData!!!');
            this.initConfigDialogValue(null);
        }
    },


    isConfirm: function() {
        var self = this;
        for (var k in self.map) {
            if (k.substr(0,5)=="color") {
                // if (!(self.map[k].val().substr(0,1)=="#" && ( (self.map[k].val().length==4) || (self.map[k].val().length==7) ))) {
                //     return false;
                // }
                continue;
            }else if (k.substr(0,6)=="family") {
                continue;
            }else{
                if(isNaN(+self.map[k].val())) {
                    return false;
                }
            }
        }

        var values = self.map;
        var tempHum;
        // 湿度检测
        for (var id in values) {
            if (id.indexOf("hum-config-diglog") != -1 && $.trim(values[id].val()) != '') {//只拿湿度值
                tempHum = parseFloat(values[id].val());
                if (tempHum > 100) {
                    this.errorMessage = '湿度气泡样式请输入0-100的浮点数';
                    return false;
                }
            }
        }

        if(!this.checkOrder("temp-config-diglog",'TemperatureAndHumidityConfigPanel_Temp_has_overlapping')) return false;
        if(!this.checkOrder("hum-config-diglog",'TemperatureAndHumidityConfigPanel_Hum_has_overlapping')) return false;
        return true;
    },

    

   
    isConfigChanged: function() {
        var formData = this.getFormData();
        var tempMap = formData.tempBasic,
            humMap = formData.humBasic,
            tempMore=formData.tempMore,
            humMore=formData.humMore;
        if (this.isSame(tempMap, this.tempMap) && this.isSame(humMap, this.humMap) && this.isSame(tempMore, this.tempMore) && this.isSame(humMore, this.humMore)) {
            return false;
        }
        return true;
    },

    isSame: function(a, b) {
        if (a === b) {
            return true;
        }
        if (a == null && b != null) {
            return false;
        } else if (a != null && b == null) {
            return false;
        }
        if ((typeof a) !== (typeof b)) {
            return false;
        }
        var t = typeof a;
        if (t == 'string' || t == 'number') {
            return a == b;
        }
        for (var p in a) {
            if (!this.isSame(a[p], b[p])) {
                return false;
            }
        }
        for (var p in b) {
            if (!this.isSame(a[p], b[p])) {
                return false;
            }
        }
        return true;
    },

    getId: function() {
        return 'TempAndHumConfigApp';
    },
    
    updateData: function(data) {
        it.util.adminApi('config', 'update', data, function(result) {
            if (result.error) {
                console.error(result.error);
            }
        });
    },

    clickForSetDefaultValue: function() {
        var formData = this.getFormData();
        var defaultTemp=["#000000",40,"microsoft yahei",4,true,false,204,430,75,220,104,230,pageConfig.url("/images/tem_blue.png"),pageConfig.url("/images/tem_green.png"),pageConfig.url("/images/tem_yellow.png"),pageConfig.url("/images/tem_red.png")];
        var defaultHum=["#000000",50,"microsoft yahei",5,true,false,318,442,100,300,150,200,pageConfig.url("/images/hum_blue.png"),pageConfig.url("/images/hum_green.png"),pageConfig.url("/images/hum_yellow.png"),pageConfig.url("/images/hum_red.png")];
        var temp_alarm_config={"tem_blue":["0","20"],"tem_green":["20","25"],"tem_yellow":["25","30"],"tem_red":["30","100"]};
        var hum_alarm_config={"hum_blue":["0","20"],"hum_green":["20","30"],"hum_yellow":["30","40"],"hum_red":["40","100"]};

        for(var p in this.moreConfigItems){
            formData.tempMore[this.moreConfigItems[p]]=defaultTemp[p];
            formData.humMore[this.moreConfigItems[p]]=defaultHum[p];
        }
        this.setFormData('temp-config-diglog', temp_alarm_config);
        this.setFormData('hum-config-diglog', hum_alarm_config);
        this.setMoreConfigData('temp',formData.tempMore);
        this.setMoreConfigData('hum',formData.humMore);

       $('.checkbox_default').each(function(){
            var iconSpan = $(this).parent();
            if($(this).is(':checked')){
                iconSpan.attr('class','checked');
            }else{
                iconSpan.attr('class','check');
            }
       });
       var objData = {
            value: {
                temp_alarm_config: jsonUtil.object2String(temp_alarm_config),
                hum_alarm_config: jsonUtil.object2String(hum_alarm_config),
                temp_more_config:jsonUtil.object2String(formData.tempMore),
                hum_more_config:jsonUtil.object2String(formData.humMore)
            },
            options: {
                id: 'system',
            }
        };
       this.updateData(objData);
    },

    clickForConfirm: function() {

         var flag = this.volidate();
         if(flag === false ) return ;

        var self = this;
        var formData = this.getFormData();
        
        // var temperatureValues = $(".temperatureSlider").slider('values');
        // var humidityValues = $(".humiditySlider").slider('values');
        // return { tempBasic: tempColorMap ,tempMore:tempMoreConfig, humBasic: humColorMap ,humMore:humMoreConfig };
        var objData = {
            value: {
                temp_alarm_config: jsonUtil.object2String(formData.tempBasic),
                hum_alarm_config: jsonUtil.object2String(formData.humBasic),
                temp_more_config:jsonUtil.object2String(formData.tempMore),
                hum_more_config:jsonUtil.object2String(formData.humMore)
            },
            options: {
                id: 'system',
            }
        };
       this.updateData(objData);
    },

    clickForCancel: function() {

    },

    hide:function(){
        $('#temperatureBox').hide();
        $('#humidityBox').hide();
    },

    show:function(){
        $('#temperatureBox').show();
        $('#humidityBox').show();
    }

});

it.TemperatureAndHumidityConfigPanel = $TemperatureAndHumidityConfigPanel;