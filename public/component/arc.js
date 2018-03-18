(function ($) {
    $.widget("hud.arc", {
        // default options
        options: {
            radius: 170, //圆弧半径，内圈尺寸
            arc: 45,//圆弧长度弧度
            rotate: 0,//旋转弧度
            width: 3,//圆弧宽度
            color: 'rgb(0,142,148)', //圆弧颜色
        },

        _create: function () {
            var self = this;
            var el = this.element;
            var arcBox = this.arcBox = $('<div class="arc-box"></div>').appendTo(el);
            var arcClipBox = this.arcClipBox = $('<div class="arc-clip-box"></div>').appendTo(arcBox);
            var arcBar = this.arcBar = $('<div class="arc-bar"></div>').appendTo(arcClipBox);

            this._radius(this.options.radius);
            this._arc(this.options.arc);
            this._rotate(this.options.rotate);
        },
        _setOption: function (key, value) {
            this._super(key, value);
            if (key == 'rotate') {
                this._rotate();
            } else if (key == 'radius') {
                this._radius();
            } else if (key == 'arc') {
                this._arc();
            }
        },
        _rotate: function () {
            var angle = this.options.rotate;
            this.arcBox.css('transform', 'rotate(' + angle + 'deg)');
        },
        _arc: function () {
            var angle = this.options.arc;
            this.arcBar.css('transform', 'rotate(' + (-135 + angle) + 'deg)');
        },
        _radius: function (radius) {
            var r = this.options.radius;
            var w = r * 2;
            this.arcBar.css('width', w);
            this.arcBar.css('height', w);
            this.arcClipBox.css('width', r / 2);
            this.arcClipBox.css('height', r);
            this.arcClipBox.css('left', -r);
            this.arcClipBox.css('top', -r);
        },
        _destroy: function () {
            this.arcBox.remove();
        }

    })
})(jQuery)


