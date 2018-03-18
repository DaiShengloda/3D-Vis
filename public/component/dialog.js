/**
 * extend jquery.ui.dialog
 * set dialog property zIndex max in page;
 */
(function ($) {
    $.widget("ui.dialog", $.ui.dialog, {
        options: {     
            closeText: "",   
        },
        _create: function () {
            if (this.options.blackStyle) {
                this.options.buttons.splice(0, 0, {}, {});
            }
            this.options.drag = function (event, ui) {
                if (ui.position.top < 0) {
                    ui.position.top = 0;
                    $(this).parent().css('top', ui.position.top);
                }
            }
            this._handlerWindowResize();
            return this._super();
        },
        open: function () {
            var $dialog = $(this.element[0]);

            var maxZ = 0;
            $('*').each(function () {

                var ele = $(this);
                if (ele.hasClass('datetimepicker')) {
                    return;
                }
                if (ele.hasClass('spinner') ||
                    ele.parent().hasClass('spinner') ||
                    ele.parent().parent().hasClass('spinner')) {
                    return;
                }
                var thisZ = ele.css('zIndex');
                thisZ = (thisZ === 'auto' ? (Number(maxZ) + 1) : thisZ);
                if (thisZ > maxZ) maxZ = thisZ;
            });
            if (this.option.modal) {
                $(".ui-widget-overlay").css("zIndex", (maxZ + 1));
            }
            $dialog.parent().css("zIndex", (maxZ + 2));
            if (this.options.blackStyle && !this._customStyleFlag) {
                this._customStyle($dialog.closest('.ui-dialog'));
                this._customStyleFlag = true;
            }
            return this._super();
        },
        close: function () {
            var $dialog = $(this.element[0]);
            var maxZ = 0;
            $('.ui-dialog').each(function () {
                var $dialogTemp = $(this);
                var $dialogTempContent = $dialogTemp.find('.ui-dialog-content')
                var isOpen = $dialogTempContent.dialog('isOpen');
                if (isOpen && $dialogTempContent[0] != $dialog[0]) {
                    var thisZ = $dialogTemp.css('zIndex');
                    thisZ = (thisZ === 'auto' ? (Number(maxZ) + 1) : thisZ);
                    if (thisZ > maxZ) maxZ = thisZ;
                }
            });
            $(".ui-widget-overlay").css("zIndex", (maxZ - 1));
            return this._super();
        },
        destroy: function () {
            var $dialog = $(this.element[0]);
            var maxZ = 0;
            $('.ui-dialog').each(function () {
                var $dialogTemp = $(this);
                var $dialogTempContent = $dialogTemp.find('.ui-dialog-content')
                var isOpen = $dialogTempContent.dialog('isOpen');
                if (isOpen && $dialogTempContent[0] != $dialog[0]) {
                    var thisZ = $dialogTemp.css('zIndex');
                    thisZ = (thisZ === 'auto' ? (Number(maxZ) + 1) : thisZ);
                    if (thisZ > maxZ) maxZ = thisZ;
                }
            });
            $(".ui-widget-overlay").css("zIndex", (maxZ - 1));
            return this._super();
        },
        _customStyle: function (dialog) {
            dialog.addClass('ui-dialog-blackStyle');
            /**
             * dialog--title
             */
            var titleBar = dialog.find('.ui-dialog-titlebar');
            var close = $('<span class="icon iconfont icon-close nav-icon" title="Close"></span>');
            titleBar.find('.ui-dialog-titlebar-close').prepend(close);

            /**
             * dialog--buttons
             */
            var buttons = dialog.find('.ui-dialog-buttonset button');
            buttons.each(function () {
                var b = $(this);
                var span = b.find('span');
                var text = span.text();
                if (text == '') {
                    b.hide();
                } else {
                    b.hover(function (e) {
                        b.css('background-position', '0px 5px');
                    }, function (e) {
                        b.css('background-position', '0px -32px');
                    });
                }
            });

        },
        _getnw: function () {
            var w = document.body.clientWidth, nw;
            var autoWidth = this.options.autoWidth;
            if (!autoWidth || !autoWidth.length) {
                return null;
            };
            if (w < 1440) {
                nw = autoWidth[0];
            } else if (w >= 1440 && w < 1920) {
                nw = autoWidth[1];
            } else if (w >= 1920) {
                nw = autoWidth[2];
            }
            return nw;
        },
        _handlerWindowResize: function () {
            var self = this;
            window.addEventListener('resize', function () {
                var nw = self._getnw();
                if (!nw) return;
                self.element.dialog('option', 'width', nw);
            });

            $(document).keyup(function (event) {
                switch (event.keyCode) {
                    case 27:
                        self.close();
                    case 96:
                        self.close();
                }
            });
        },
    });
})(jQuery);

/**
 * select2 searchBox
 */
(function ($) {
    var alarmListDialog = $('#alarmListDialog');
    var select2_option = {
        templateResult: formatState,
        templateSelection: formatState,
        minimumResultsForSearch: -1,
        dropdownAutoWidth: true,
        dropdownCssClass: 'bigdrop',
        //theme: 'bootstrap',  //主题
    };
    var classNames = ['alarm_level', 'asset_type_id', 'alarm_type_id', 'alarmStatus'];
    var w = document.body.clientWidth,
        nw, nh;
    if (w < 1440) {
        // nw = 880 / 1246;
        nw = w / 1246 * 0.8 * 0.75;
    } else if (w >= 1440 && w < 1919) {
        // nw = 880 / 1246;
        nw = w / 1246 * 0.8 * 0.95;
    } else if (w >= 1919) {
        nw = 1;
        //174 200 100 115 110 174 48
    }
    for (var i = 0; i < classNames.length; i++) {
        var select = alarmListDialog.find('.' + classNames[i]);
        select2_option.dropdownParent = $('#modal_' + classNames[i]);
        if (classNames[i] == 'alarm_level') {
            select2_option.width = 115 * nw + 'px';
        } else if (classNames[i] == 'asset_type_id') {
            select2_option.width = 155 * nw + 'px';
        } else if (classNames[i] == 'alarm_type_id') {
            select2_option.width = 115 * nw + 'px';
        } else if (classNames[i] == 'alarmStatus') {
            select2_option.width = 115 * nw + 'px';
        };
        select.select2(select2_option);
    }

    // $('#alarmListDialog').find('.mytd input').css({
    //     'width': 155 * nw + 'px',
    // })


    function formatState(state) {
        var text = state.text;
        if (text.indexOf('123') != '-1') {
            var strs = text.split('123');
            var name = strs[0],
                color = strs[1];
            var $span = $("<span style = 'width:7px;height:13px;display:inline-block;margin:0px 5px 0px 0px'></span>");
            $span.css({
                'background-color': color,
            });
        } else {
            var name = text,
                color = null;
        }
        var $state = $("<span>" + name + "</span>");
        $state.css({
            'font-size': '14px',
        });
        if ($span !== undefined) {
            $state.prepend($span);
        }
        return $state;

    };
})(jQuery);





$.effects.define("move&scale", function (options, done) {
    // Create element
    var el = $(this),
        mode = options.mode,
        percent = parseInt(options.percent, 10) ||
            (parseInt(options.percent, 10) === 0 ? 0 : (mode !== "effect" ? 0 : 100)),

        newOptions = $.extend(true, {
            from: $.effects.scaledDimensions(el),
            to: $.effects.scaledDimensions(el, percent, options.direction || "both"),
            origin: options.origin || ["middle", "center"]
        }, options);

    var start = $(options.start);
    newOptions.startPoint = { top: start.offset().top + start.width() / 2, left: start.offset().left + start.height() / 2 };
    newOptions.endPoint = el.offset();

    // Fade option to support puff
    if (options.fade) {
        newOptions.from.opacity = 1;
        newOptions.to.opacity = 0;
    }

    $.effects.effect.dialogAni.call(this, newOptions, done);
});

$.effects.define("dialogAni", function (options, done) {
    // Create element
    var baseline, factor, temp,
        element = $(this),

        // Copy for children
        cProps = ["fontSize"],
        vProps = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"],
        hProps = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"],

        // Set options
        mode = options.mode,
        restore = mode !== "effect",
        scale = options.scale || "both",
        origin = options.origin || ["middle", "center"],
        position = element.css("position"),
        pos = element.position(),
        original = $.effects.scaledDimensions(element),
        from = options.from || original,
        to = options.to || $.effects.scaledDimensions(element, 0),
        start = options.startPoint,
        end = options.endPoint;

    $.effects.createPlaceholder(element);

    if (mode === "show") {
        temp = from;
        from = to;
        to = temp;
    }
    if (mode === "hide") {
        temp = start;
        start = end;
        end = temp;
    }

    // Set scaling factor
    factor = {
        from: {
            y: from.height / original.height,
            x: from.width / original.width
        },
        to: {
            y: to.height / original.height,
            x: to.width / original.width
        }
    };

    // Scale the css box
    if (scale === "box" || scale === "both") {

        // Vertical props scaling
        if (factor.from.y !== factor.to.y) {
            from = $.effects.setTransition(element, vProps, factor.from.y, from);
            to = $.effects.setTransition(element, vProps, factor.to.y, to);
        }

        // Horizontal props scaling
        if (factor.from.x !== factor.to.x) {
            from = $.effects.setTransition(element, hProps, factor.from.x, from);
            to = $.effects.setTransition(element, hProps, factor.to.x, to);
        }
    }

    // Scale the content
    if (scale === "content" || scale === "both") {

        // Vertical props scaling
        if (factor.from.y !== factor.to.y) {
            from = $.effects.setTransition(element, cProps, factor.from.y, from);
            to = $.effects.setTransition(element, cProps, factor.to.y, to);
        }
    }

    // Adjust the position properties based on the provided origin points
    if (origin) {
        baseline = $.effects.getBaseline(origin, original);
        from.top = (original.outerHeight - from.outerHeight) * baseline.y + pos.top;
        from.left = (original.outerWidth - from.outerWidth) * baseline.x + pos.left;
        to.top = (original.outerHeight - to.outerHeight) * baseline.y + pos.top;
        to.left = (original.outerWidth - to.outerWidth) * baseline.x + pos.left;
    }

    if (start && end) {
        from.top = start.top;
        from.left = start.left;
        to.top = end.top;
        to.left = end.left;
    }
    element.css(from);

    // Animate the children if desired
    if (scale === "content" || scale === "both") {

        vProps = vProps.concat(["marginTop", "marginBottom"]).concat(cProps);
        hProps = hProps.concat(["marginLeft", "marginRight"]);

        // Only animate children with width attributes specified
        // TODO: is this right? should we include anything with css width specified as well
        element.find("*[width]").each(function () {
            var child = $(this),
                childOriginal = $.effects.scaledDimensions(child),
                childFrom = {
                    height: childOriginal.height * factor.from.y,
                    width: childOriginal.width * factor.from.x,
                    outerHeight: childOriginal.outerHeight * factor.from.y,
                    outerWidth: childOriginal.outerWidth * factor.from.x
                },
                childTo = {
                    height: childOriginal.height * factor.to.y,
                    width: childOriginal.width * factor.to.x,
                    outerHeight: childOriginal.height * factor.to.y,
                    outerWidth: childOriginal.width * factor.to.x
                };

            // Vertical props scaling
            if (factor.from.y !== factor.to.y) {
                childFrom = $.effects.setTransition(child, vProps, factor.from.y, childFrom);
                childTo = $.effects.setTransition(child, vProps, factor.to.y, childTo);
            }

            // Horizontal props scaling
            if (factor.from.x !== factor.to.x) {
                childFrom = $.effects.setTransition(child, hProps, factor.from.x, childFrom);
                childTo = $.effects.setTransition(child, hProps, factor.to.x, childTo);
            }

            if (restore) {
                $.effects.saveStyle(child);
            }

            // Animate children
            child.css(childFrom);
            child.animate(childTo, options.duration, options.easing, function () {

                // Restore children
                if (restore) {
                    $.effects.restoreStyle(child);
                }
            });
        });
    }

    // Animate
    element.animate(to, {
        queue: false,
        duration: options.duration,
        easing: options.easing,
        complete: function () {

            var offset = element.offset();

            if (to.opacity === 0) {
                element.css("opacity", from.opacity);
            }

            if (!restore) {
                element
                    .css("position", position === "static" ? "relative" : position)
                    .offset(offset);

                // Need to save style here so that automatic style restoration
                // doesn't restore to the original styles from before the animation.
                $.effects.saveStyle(element);
            }

            done();
        }
    });

});