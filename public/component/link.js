(function ($) {
    var index = 0;
    $.widget("hub.link", {
        options: {
            links: [
                [], // 单条link
            ]
        },
        _create: function () {

            var self = this,
                links = this.options.links;
            for (var i = 0; i < links.length; i++) {
                this._createLink(links[i], this.element);
            }
            var showOne = false;
            this._on(this.element, {
                'dblclick .link': function (event) {
                    showOne = !showOne;
                    var $target = $(event.currentTarget);
                    showOne ? $target.css('margin', 0) : $target.css('margin', '');
                    $target.siblings().each(function (index, el) {
                        el = $(el);
                        showOne ? el.hide() : el.show();
                    });
                    if (showOne) {
                        $target.parent().dialog("option", "position", { my: "center bottom-" + $('.NavBarMgr').height(), at: "center bottom", of: window });
                        self._trigger("chooseOneLink", event, {
                            linkId: $target.attr('link-id'),
                        })
                    } else {
                        $target.parent().dialog("option", "position", { my: "center center", at: "center center", of: window });
                        self._trigger("showAllLinks", event)
                    }

                    var $content = $target.closest('.ui-dialog-content');
                    if ($content) {
                        showOne ? $content.css('padding', 0) : $content.css('padding', '');
                        var $title = $content.prev('.ui-dialog-titlebar');
                        showOne ? $title.hide() : $title.show();
                        $title.closest('.ui-dialog').css('height', '');
                        $content.next('.ui-dialog-buttonpane').hide();
                    }
                },
                'mouseenter .link': function (event) {
                    $(event.currentTarget).addClass('link-over');
                },
                'mouseleave .link': function (event) {
                    $(event.currentTarget).removeClass('link-over');
                },
                'click .link-node': function (event) {
                    var id = $(event.currentTarget).data('id');
                    self._trigger("click", event, {
                        id: id,
                        type: 'asset'
                    })
                },
                'mouseenter .link-node': function (event) {
                    $(event.currentTarget).addClass('link-node-over');
                },
                'mouseleave .link-node': function (event) {
                    $(event.currentTarget).removeClass('link-node-over');
                },
                'click .link-separater': function (event) {
                    var id = $(event.currentTarget).data('id');
                    self._trigger("click", event, {
                        id: id,
                        type: 'link'
                    })
                },
                'mouseenter .link-separater': function (event) {
                    $(event.currentTarget).addClass('link-separater-over');
                },
                'mouseleave .link-separater': function (event) {
                    $(event.currentTarget).removeClass('link-separater-over');
                },
            });
        },
        // 创建单行的link
        _createLink: function (link, parent) {
            var $link = $('<div>').appendTo(parent).addClass('link');
            // this._createNode(link[0], $link);
            // for (var i = 1; i < link.length; i++) {
            // 	this._createSeparater($link);
            // 	this._createNode(link[i], $link);
            // }

            var node;
            if (link) {
                for (var i = 0; i < link.length; i++) {
                    node = link[i];
                    if (node.lineId) {
                        this._createSeparater(node, $link);
                        $link.attr('link-id', node.lineId);
                    } else {
                        this._createNode(node, $link);
                    }
                }
            }
        },
        // 创建分割线
        _createSeparater: function (node, parent) {
            $('<div>').addClass('link-separater').appendTo(parent).data('id', node.lineId);
        },
        // 创建节点
        _createNode: function (node, parent) {
            var $node = $('<div>').addClass('link-node').appendTo(parent).data('id', node.id);
            node.type = node.type || 'server';
            if (node.type) {
                var icon = this._getIcon(node.type);
                $('<i>').addClass('iconfont').addClass(icon).appendTo($node);
                $('<span>').text(node.type).appendTo($node);
            } else {
                // $node.addClass('link-without-type')
            }
            if (node.id) {
                $('<span>').text(node.id).appendTo($node);
            }
        },
        _getIcon: function (type) {
            var suffix;
            switch (type) {
                case "server":
                    suffix = 't-server';
                    break;
                case "rack":
                    suffix = 'rack';
                    break;
                case "router":
                    suffix = 't-router';
                    break;
                case "interchanger":
                    suffix = 't-switch';
                    break;
                default:
                    suffix = 't-server';
            }
            return 'icon-' + suffix;
        },
        _destroy: function () {
            this.element.empty();
        }
    });

    $.widget("hub.searchLink", $.hub.link, {
        options: {
            links: [],
        },
        _create: function () {

        },

        makeLinkBox: function () {

            var self = this,
                links = this.options.links;
            this.element.empty();
            this._createLink(links, this.element);

            this._on(this.element, {
                'mouseenter .link': function (event) {
                    $(event.currentTarget).addClass('link-over');
                },
                'mouseleave .link': function (event) {
                    $(event.currentTarget).removeClass('link-over');
                },
                'click .link-node': function (event) {
                    var id = $(event.currentTarget).data('id');
                    self._trigger("click", event, {
                        id: id,
                        type: 'asset'
                    })
                },
                'mouseenter .link-node': function (event) {
                    $(event.currentTarget).addClass('link-node-over');
                },
                'mouseleave .link-node': function (event) {
                    $(event.currentTarget).removeClass('link-node-over');
                },
                'click .link-separater': function (event) {
                    var id = $(event.currentTarget).data('id');
                    self._trigger("click", event, {
                        id: id,
                        type: 'link'
                    })
                },
                'mouseenter .link-separater': function (event) {
                    $(event.currentTarget).addClass('link-separater-over');
                },
                'mouseleave .link-separater': function (event) {
                    $(event.currentTarget).removeClass('link-separater-over');
                },
            });
        },
    });

})(jQuery)