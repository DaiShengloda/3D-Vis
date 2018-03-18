(function ($) {
    $.widget('hud.listPane', {
        options: {

        },
        createUl: function (inputPane, arr, width) {
            this.$listUl = $('<ul class="list-pane-ul"></ul>').appendTo(inputPane);
            this.createLi(arr, width);
        },
        createLi: function (arr, width, animationIdArr) {
            var self = this;
            this.lis = [];
            var length = arr.length;
            arr.forEach(function (v, i) {
                var li = $('<li class="list-pane-li" style="width:' + width + 'px;height:52px;line-height:52px;"><span class="iconfont icon-play-circle"></span>' + v + '</li>').appendTo(self.$listUl);
                if (animationIdArr) {
                    li.attr('animationId', animationIdArr[i]);
                    li.on('click', function () {
                        var $this = $(this);
                        self._trigger("play", event, $this);
                    });
                }
                self.lis.push(li);
                if (i % 2 == 0) {
                    li.addClass('list-pane-li-even');
                } else {
                    li.addClass('list-pane-li-odd');
                }
            });
        },
        removeLis: function () {
            this.$listUl.empty();
        }
    });


    $.widget('hud.pdfPane', $.hud.listPane, {
        options: {

        },
        _create: function () {
            var self = this;
            var el = this.element;
            el.attr('ispdf', true);
            // this.pdfManager = new it.PDFManager(main.sceneManager);
            // 这里为什么要新建pdf实例，在toolbarMgr初始化的时候已经建立了一个
            this.pdfManager = main.panelMgr.instanceMap.ToolbarMgr.toolbarMap.pdf.pdfManager;
            el.attr('isOpenPdfView', '');
            this.noPdf = it.util.i18n("PDFManager_No_PDF");
            this._loadPDFData(function () {
                if (self.pathArr[0] == self.noPdf) {
                    self.createNoPdf(self.noPdf);
                    return;
                }
                self.createUl(self.options.inputPane, self.pathArr, self.options.width);
                self.lis.forEach(function (ele) {
                    ele.on('click', function (e) {
                        var $this = $(this);
                        var url = '/';
                        var path = $this.text();
                        if (!path) {
                            return;
                        } else if (path == 'localFile') {
                            // self.inputFile.click();
                            // self.inputFile.trigger('click');
                        } else {
                            url += path;
                            // pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.open(url);
                            self.pdfManager.pdfViewerApplication.open(url);
                        }
                        self.openViewer();
                        el.attr('isOpenPdfView', self.pdfManager.isOpenPdfView);

                        var $pdfBox = $('#itv-pdf-view');
                        var width = $pdfBox.width();
                        $('.infoPanel').css('right', width);
                        main.panelMgr.instanceMap.ToolbarMgr.$box.css('right', width);
                        main.panelMgr.instanceMap.NavBarMgr.$box.css({
                            'left': '20%',
                        })
                        $('.animate-controller').css({
                            'margin-left': '24%'
                        });
                        var attr1 = $('.warningInfoDetail').css('display'),
                            attr2 = $('.assetInfo-content').css('display'),
                            width1 = 0;

                        if (attr1 == 'none' && attr2 !='none') {
                            width1 = $('.assetInfo-content').width() + width;
                        }else if(attr1 == 'none' && attr2 == 'none') {
                            width1 = width;
                        }else if(attr1 != 'none'){
                            width1 = $('.warningInfoDetail').width() + width;
                        }
    
                        $('.floor-box').css({
                            'right': width1+10
                        });    

                        self._trigger("close", event);
                    });
                });
            });
        },
        _loadPDFData: function (callback) {
            var self = this;
            this.pathArr = [];
            ServerUtil.api('pdf_info', 'search', {}, function (pdfInfos) {
                if (pdfInfos && pdfInfos.length > 0) {
                    for (var i = 0; i < pdfInfos.length; i++) {
                        var pdfInfo = pdfInfos[i];
                        self.pathArr.push(pdfInfo.path);
                    }
                }
                if (self.pathArr.length == 0) {
                    self.pathArr.push(self.noPdf);
                }
                callback && callback();
            });
        },
        openViewer: function () {
            this.pdfManager.openViewer();
        },
        closeViewer: function () {
            this.pdfManager.closeViewer();
        },
        createNoPdf: function (text) {
            var el = this.element;
            this.$noPdf = $('<div class="no-pdf"></div>').appendTo(el);
            this.$noPdf.text(text);
        }
    });


})(jQuery)