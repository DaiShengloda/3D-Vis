(function ($) {
    $.widget("hud.LabelBillboard", {
        // default options
        options: {
            title: '标题',
            content: [{
                sum: 10,
                name: '但是',
                _visible: true
            }, {
                sum: 17,
                name: '但阿萨',
                _visible: true
            }, {
                sum: 40,
                name: '但的',
                _visible: true
            }, {
                sum: 54,
                name: '人是',
                _visible: false
            }, ],
        },

        _create: function () {
            var el = this.element;
            var labelBox = $('<div class="label-box"></div>').appendTo(el);
            var labelTable = this.labelTable = $('<table class="label-table"></table>').appendTo(labelBox);
            var arrow1 = $('<div>').addClass('label-arrow arrow1').appendTo(labelBox);
            var arrow2 = $('<div>').addClass('label-arrow arrow2').appendTo(labelBox);
            this.makeTitle({
                title: this.options.title,
            });
            for (var i = 0; i < this.options.content.length; i++) {
                this.makeLine({
                    content: this.options.content[i],
                });
            }
        },

        makeTitle: function (params) {
            var title = $('<th>').addClass('label-title').text(params.title);
            this.labelTable.append(title);
        },

        makeLine: function (params) {
            var line = $('<tr>').addClass('label-line');
            var name, sum;
            if (params.content['_visible']) {
                name = $('<td>').addClass('label-line-name').text(params.content['name'] + '：');
                sum = $('<td>').addClass('label-line-sum').text(params.content['sum']);
                line.append(name);
                line.append(sum);
                this.labelTable.append(line);
            }
        }

    })
})(jQuery)