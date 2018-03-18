(function($){
    $.widget("hud.rackClickRotate",{
        options: {
            nodeInfo: null,
            btnOptions: [
                {
                    type: 'rotateRack',
                    title: '',
                    icon:'rotateRackBtn.svg',
                    click: function(scop,node){
                        scop.sceneManager.viewManager3d.defaultEventHandler.rotateElement(node);
                    }
                }
            ],
            // baseOptions:{
            //     originLeft: 126,
            //     originTop: 126,
            //     originRadius: 100,
            //     boxWidth: 300,
            //     boxHeight: 300,
            //     boxSpace: 50
            // },
            close: false,
            scop: null
        },
        _create: function(){
            var self = this;
            var btnBox = this.createBtnBox();
            btnBox.appendTo(this.element);
        },
        createBtnBox: function(){
            var btnBox = $('<div></div>').addClass('rotateRackBox');
            var self = this;
            var btnOptions = this.options.btnOptions;
            this.posX = [];
            this.posY = [];
            this.originLeft = '';
            this.originTop = '';
            this.boxWidth = '';
            this.boxHeight = '';
            if(btnOptions){
                switch(btnOptions.length){
                    case 1:
                        this.boxWidth = 50;
                        this.boxHeight = 50;
                        this.originLeft = 50/2 - 24;
                        this.originTop = 50/2 - 24;
                        this.posX.push(50/2 - 24);
                        this.posY.push(50/2 - 24);
                        this.createBtn(btnOptions[0]).appendTo(btnBox);
                        break;
                    case 2:
                        this.boxWidth = 100;
                        this.boxHeight = 50;
                        this.lineWidth = 26;
                        this.originLeft = 100/2 -24;
                        this.originTop = 50/2 - 24;
                        this.posX = [-24,50 + 26];
                        this.posY = [50/2-24,50/2-24];
                        this.createBtnLine().appendTo(btnBox);
                        btnOptions.forEach(function(param){
                            self.createBtn(param).appendTo(btnBox);
                        });
                        break;
                    default:
                        this.createBtnCircle().appendTo(btnBox);
                        this.options.btnOptions.forEach(function(param,index,array){
                            var radian = 2*Math.PI/array.length*index;
                            //这一步动态生成容器的宽高，以及btn的R，方便后面的定位
                            self.createBtn(param).appendTo(btnBox);
                            self.posX.push(Math.sin(radian)*self.originRadius + self.originLeft);
                            self.posY.push(-Math.cos(radian)*self.originRadius + self.originTop);
                        });
                }
            }
            btnBox.css({
                'width': this.boxWidth,
                'height': this.boxHeight
            });            
            return btnBox;
        },
        createBtnLine: function(){
            var lineDiv = $('<div></div>').addClass('rotateRackLine');
            lineDiv.css({
                'width': 2*(50 - 24) + 'px',
                'left': 24 + 'px',
                'top': 50/2 - 1 + 'px'
            });
            return lineDiv;
        },
        createBtnCircle: function(){
            //画圆，该圆的半径随btn数量变化
            //当btn围起来的弧长大于圆周长时，扩大圆半径
            //该圆半径基本的设为3r，如果总弧长超过圆周，则取总弧长外加一个小弧长为新圆圆周
            var r = 24,
                R = 3*r,
                sin,rad,len,s,l,L,boxSpace;
            len = this.options.btnOptions.length;
            sin = r/Math.sqrt(Math.pow(R,2)+Math.pow(r,2));
            rad = Math.asin(sin);
            s = 2*rad*R;
            l = len*s;
            L = 2*Math.PI*R;
            boxSpace = 50;
            //这里不应该刚刚好，否则会出现多个圆紧挨着的情况
            if((l + 5*s) > L){
                R = (l + 5*s)/(Math.PI*2);
            }
            this.originRadius = R;
            this.boxWidth = 2*R;
            this.boxHeight = 2*R;
            this.originLeft = R - 24;
            this.originTop = R - 24;
            var bgDiv = $('<div></div>').addClass('rotateRackCircle');
            bgDiv.css({
                'width': 2*R+'px',
                'height': 2*R+'px',
                'left': 0,
                'top': 0
            })
            return bgDiv;
        },
        createBtn: function(option){
            var btn = $('<img></img>').addClass('rackClickMenuBtn'),
            btnIcon = option.icon,
            btnType = option.type,
            btnTitle = option.title,
            btnItem = option.item,
            btnFun = option.click,
            self = this;
            btn.css({
                'left': this.originLeft,
                'top': this.originTop
            });
            if(btnIcon){
                btn.attr('src',pageConfig.url("/images/"+btnIcon));
            }
            if(btnType && btnType == 'rotateRack'){
                btnTitle = `旋转180度`;
            }
            btn.attr('title',btnTitle);
            btn.click(function(e){
                var scop = self.options.scop;
                if(btnFun && scop){
                    if(btnType && btnType == 'rotateRack'){
                        if(self.options.nodeInfo && self.options.nodeInfo.node){
                            btnFun(scop,self.options.nodeInfo.node);
                        }
                    }else{
                        btnFun();
                    }
                }
                self.hide();
            });
            return btn;
        },
        _setOption: function(key,value){
            var self = this;
            this._super(key,value);
            if(key == 'nodeInfo'){
                if(value.animating){
                    this.refresh();
                    this.showWithAnimate();
                }else{
                    this.refresh();
                    this.showWithNoAnimate();
                }
            }
            if(key == 'close' && value){
                this.hide();
            }
        },
        showWithNoAnimate: function(){
            var self = this;
            $(this.element).css('display', 'block');
            $('.rackClickMenuBtn').each(function(index,btn){
                $(btn).css({
                    "left": self.posX[index]+'px',
                    "top": self.posY[index]+'px'
                });
            });
        },
        showWithAnimate: function(){
            var self = this;
            $(this.element).fadeIn(500);
            $('.rackClickMenuBtn').each(function(index,btn){
                $(btn).animate({
                    "left": self.posX[index]+'px',
                    "top": self.posY[index]+'px'
                },300,'linear');
            });
        },
        hide: function(){
            var self = this;
            $(this.element).fadeOut(200);
            $('.rackClickMenuBtn').each(function(index,btn){
                $(btn).animate({
                    "left": self.originLeft+'px',
                    "top": self.originTop+'px'
                },500,'linear');
            });
        },
        refresh: function(){
            var self = this;
            $(this.element).children().eq(0).css({
                "position": "relative",
                "left": this.options.nodeInfo.pos[0] - this.boxWidth/2 + 'px',
                "top": this.options.nodeInfo.pos[1] - this.boxHeight/2 -24 + 'px'
            });
        }
    })
})(jQuery)