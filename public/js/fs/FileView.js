/**
 * 文件浏览器
 * 浏览图片， pdf
 */
var FileView = function () {

};

mono.extend(FileView, Object, {

    init: function () {

        this.initView();
        this.initEvent();
        return this;
    },
    initView: function () {

        var self = this;
        var $box = this.$box = $('<div class="fv-box"></div>').appendTo($('body')).hide();
        var $leftBoxP = this.$leftBoxP = $('<div></div>').appendTo($box);
        var $leftBox = this.$leftBox = $('<div class="left-box" style="top:40px;"></div>').appendTo($leftBoxP);
        var $rightBox = this.$rightBox = $('<div class="right-box"></div>').appendTo($box);
        var $priview = this.$priview = $('<div class="priview-box"></div>').appendTo($rightBox);
        var $ul = this.$ul = $('<ul></ul>').appendTo($leftBox);
        var $searchBox=this.$searchBox=$('<div style="position:absolute;top:10px;left:10px;width:130px;height:30px;"></div>').appendTo($leftBoxP);
        var $searchTxt=this.$searchTxt=$('<input type="text" style="width:80px;margin-right:10px;">').appendTo($searchBox);
        var $searchBtn=this.$searchBtn=$('<input style="width:40px" type="button" value='+it.util.i18n("Search")+'>').appendTo($searchBox);
        var network = this.network = new twaver.vector.Network();
        var node = this.imageNode = new twaver.Node();
        network.getElementBox().add(node);
        network.setMaxZoom(15);
        network.setMinZoom(0.2);
        $priview.on('resize', function () {
            if (self.renderType == 'image') {
                network.adjustBounds({ x: 0, y: 0, width: $priview.width(), height: $priview.height() });
            }
        })

        this.pdfViewer = new $PdfViewer();
        pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.configure = function (PDFJS) {
            PDFJS.imageResourcesPath = pageConfig.url('/libs/pdf/images/');
            PDFJS.workerSrc = pageConfig.url('/libs/pdf/pdf.worker.js');
            PDFJS.cMapUrl = pageConfig.url('/libs/pdf/cmaps/');
            PDFJS.cMapPacked = true;
        }

    },
    initEvent: function () {
        var self = this;

        this.$ul.on('click', 'li', function () {
            var li = $(this);
            var file = li.attr('title');
            self.renderFile(file);
        });

        this.$searchBtn.on('click',function(){
            var txt=self.$searchTxt.val();
            var items=self.$ul.find('.item-label');
            for(var i=0;i<items.length;i++){
                if($(items[i]).text().indexOf(txt)<0){
                    $(items[i]).parent().hide();
                }else{
                    $(items[i]).parent().show();
                }
            }
        });

    },


    show: function (files, title) {

        var self = this;
        this.$ul.empty();
        files.forEach(function (item) {
            var li = $('<li></li>').appendTo(self.$ul);
            self.renderItem(item, li);
        });
        if (files.length > 0) {
            setTimeout(function() {
                $('.item-box').eq(0).click();
            }, 1000);
        }
        this.index = layer.open({
            type: 1,
            closeBtn: 1,
            title: title,
            shadeClose: false,
            // skin: 'layui-layer-rim', //加上边框,加上边框后，里面的尺寸会计算错误， 应该是 layer.js 的 bug
            area: ['800px', '500px'], //宽高
            content: this.$box,
            maxmin: true,
            resize: true,
        });
    },


    getFileInfo: function (file) {

        var r = {
            name: file,
            type: 'image',
            file: file,
        }
        if (file.indexOf('/') >= 0) {
            var s = file.split('/');
            s = s[s.length - 1];
            if (s.indexOf('.') >= 0) {
                s = s.split('.');
                r.name = s[0];
                r.type = s[1];
            } else {
                r.name = s;
            }
        }
        return r;
    },

    renderItem: function (item, li) {

        var info = this.getFileInfo(item);
        li.attr('title', item);
        var box = $('<div class="item-box"></div>').appendTo(li);

        var imgBox = $('<div class="img-box"></div>').appendTo(box);
        var img = $('<img class="item-img"></img>').appendTo(imgBox);

        if (info.type.toLowerCase() == 'pdf') {
            img.attr('src', '../images/pdf.jpg');
        } else if (info.type.toLowerCase() == 'doc') {
            img.attr('src', '../images/doc.jpg');
        } else {
            img.attr('src', item);
        }
        var div = $('<div class="item-label"></div>').appendTo(box);
        div.text(info.name);
        div.attr('title', item);
    },

    /**
    * @function {renderFile} 根据不同的文件类型， 跳转到不同的分支里面
    * @param  {type} file {description}
    * @return {type} {description}
    */
    renderFile: function (file) {

        var info = this.getFileInfo(file);
        if (info.type.toLowerCase() == 'pdf') {
            this.renderPdf(file);
        } else {
            this.renderImage(file);
        }

    },

    renderImage: function (file) {
        var self = this;
        var network = this.network;
        var node = this.imageNode;
        if (this.renderType == 'image') {
            node.setImageUrl(file);
            setTimeout(function () {
                network.zoomOverview();
            }, 100)
        } else {
            this.renderType = 'image';
            var $priview = this.$priview;
            $priview.empty();
            $priview.append(this.network.getView());
            network.adjustBounds({ x: 0, y: 0, width: $priview.width(), height: $priview.height() });
            
            node.setImageUrl(file);
            
            setTimeout(function () {
                network.zoomOverview();
            }, 100)
        }
    },

    renderPdf: function (file) {
        if (this.renderType == 'pdf') {
            pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.open(file);
        } else {
            this.renderType = 'pdf';
            var $priview = this.$priview;
            $priview.empty();
            $priview.append(this.pdfViewer.getViewer());
            webViewerLoad();
            pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.open(file);
        }
    },
});

it.FileView = FileView;

