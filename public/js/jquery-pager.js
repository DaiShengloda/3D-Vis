/**
 * 分页组件 依赖jqueyr, bootstrap
 * 扩展jquery 增加pager方法
 * 参数说明
 * totalCount - 总的记录数
 * currPage - 当前页
 * pageSize - 每页记录数（一般不需要传入， 默认20）
 * totalPage - 总页数（不需要传入， 会根据totalCount和pageSize计算出总页数 ）
 * callback - 回调函数， 点击分页上的按钮时会被调用，并传入页码具体值，首页=1 前一页=当前页-1 后一页=当前页-1 末页=最后一页
 *
 * 1.初始化分页，传入一个参数，参数类型为function或object
 *      $('.pagerBox').pager({totalCount:95, currPage:2, pageSize:20, totalPage:5, callback(pageIndex){}});
 * 2.设置分页参数，传入两个参数， 第一个参数必须是字符串
 * A. 第一个参数是字符串options， 后面出入一个包含部分或所有参数的对象
 *      $('.pagerBox').pager('options', {totalCount:95, currPage:2, pageSize:20, totalPage:5, callback(pageIndex){}});
 * B. 第一个参数是字符串，并且是参数名，第一个参数具体的参数值
 *      $('.pagerBox').pager('totalCount', 96);
 * 3.获取分页参数，传入一个参数，第一个参数必须是字符串
 * A. 第一个参数是字符串options, 返回所有参数
 *      $('.pagerBox').pager('options');
 * B. 第一个参数是字符串，并且是参数名， 返回改参数值
 *      $('.pagerBox').pager('totalCount');
 */
$(function () {
    $.fn.extend({
        pager: function () {

            var length = arguments.length;
            var type0 = typeof arguments[0];
            var pager;
            if (length == 1 && (type0 == 'function' || type0 == 'object')) {
                var options
                if (type0 == 'function') {
                    options = { callback: arguments[0] };
                } else if (type0 == 'object') {
                    options = arguments[0];
                }
                options = $.extend({
                    totalCount: 0,
                    currPage: 1,
                    pageSize: 20,
                    totalPage: 1,
                    callback: function (pageIndex) {
                        console.log('pageIndex=' + pageIndex)
                    }
                }, options);
                var pagerStr = '' +
                    '<div class="pagerContent">' +
                    //'<input type="hidden" class="totalCount" value="0">' +
                    //'<input type="hidden" class="totalPage" value="1">' +
                    //'<input type="hidden" class="currPage" value="1">' +
                    //'<input type="hidden" class="pageSize" value="20">' +
                    '<div class="fr">' +
                    '    <nav>' +
                    '        <ul class="pagination pagination-sm" style="margin: 0px">' +
                    '            <li class="begin disabled">' +
                    '                <a href="#" aria-label="Begin" title="' + it.util.i18n("jqueryPager_First_page") + '">' +
                    '                    <span aria-hidden="true" class="icon iconfont icon-angle-left" style="font-size:14px"></span>' +
                    '                </a>' +
                    '            </li>' +
                    '            <li class="previous disabled">' +
                    '                <a href="#" aria-label="Previous" title="' + it.util.i18n("jqueryPager_Previous_page") + '">' +
                    '                    <span aria-hidden="true" class="icon iconfont icon-angle-double-left" style="font-size:14px"></span>' +
                    '                </a>' +
                    '            </li>' +
                    '            <!--<li><a href="#">…</a></li>-->' +
                    '            <!--<li><a href="#">1</a></li>-->' +
                    '            <!--<li class="active"><a href="#">2</a></li>-->' +
                    '            <!--<li><a href="#">3</a></li>-->' +
                    '            <!--<li><a href="#">4</a></li>-->' +
                    '            <!--<li><a href="#">5</a></li>-->' +
                    '            <!--<li><a href="#">…</a></li>-->' +
                    '            <li class="next disabled">' +
                    '                <a href="#" aria-label="Next" title="' + it.util.i18n("jqueryPager_Next_page") + '">' +
                    '                    <span aria-hidden="true" class="icon iconfont icon-angle-double-right" style="font-size:14px"></span>' +
                    '                </a>' +
                    '            </li>' +
                    '            <li class="end disabled">' +
                    '                <a href="#" aria-label="End" title="' + it.util.i18n("jqueryPager_Last_page") + '">' +
                    '                    <span aria-hidden="true" class="icon iconfont icon-angle-right" style="font-size:14px"></span>' +
                    '                </a>' +
                    '            </li>' +
                    '        </ul>' +
                    '    </nav>' +
                    '</div>' +
                    '<div class="fr fs14 pagerMessage" style="padding: 5px 20px 1px 5px">' +
                    '   ' + it.util.i18n("jqueryPager_Total") + '<span class="totalCount">0</span>' + it.util.i18n("jqueryPager_Suffix_and_prefix") + '<span class="currPage">1</span>/<span class="totalPage">1</span>' + it.util.i18n("jqueryPager_Page") +
                    '</div>' +
                    '</div>';
                pager = $(pagerStr);
                pager[0].options = options;
                var begin = pager.find('.begin');
                var previous = pager.find('.previous');
                var end = pager.find('.end');
                var next = pager.find('.next');
                begin.off('click').on('click', function () {
                    if ($(this).hasClass('disabled')) {
                        return;
                    }
                    var callback = options.callback;
                    callback && callback.call(this, 1);
                });
                previous.off('click').on('click', function () {
                    if ($(this).hasClass('disabled')) {
                        return;
                    }
                    var currPage = options.currPage;
                    var callback = options.callback;
                    callback && callback.call(this, parseInt(currPage) - 1);
                });
                end.off('click').on('click', function () {
                    if ($(this).hasClass('disabled')) {
                        return;
                    }
                    var totalPage = options.totalPage;
                    var callback = options.callback;
                    callback && callback.call(this, parseInt(totalPage));
                });
                next.off('click').on('click', function () {
                    if ($(this).hasClass('disabled')) {
                        return;
                    }
                    var currPage = options.currPage;
                    var callback = options.callback;
                    callback && callback.call(this, parseInt(currPage) + 1);
                });
                $(this).append(pager);
            } else if (length == 1 && type0 == 'string' && arguments[0] == 'options') {

                pager = $(this).find('.pagerContent');
                return $.extend({}, pager[0].options);
            } else if (length == 1 && type0 == 'string') {

                pager = $(this).find('.pagerContent');
                return pager[0].options[arguments[0]];
            } else if (length == 2 && typeof arguments[0] == 'string' && arguments[0] == 'options' && typeof arguments[1] == 'object') {

                pager = $(this).find('.pagerContent');
                var options = $.extend(pager[0].options, arguments[1]);
                setValue(pager, options);
                return options;
            } else if (length == 2 && typeof arguments[0] == 'string') {

                pager = $(this).find('.pagerContent');
                var opt = {};
                opt[arguments[0]] = arguments[1];
                var options = $.extend(pager[0].options, opt);
                setValue(pager, options);
                return options;
            }

            function setValue(pager, options) {

                var totalCount = Math.max(options.totalCount, 0);
                var currPage = Math.max(options.currPage, 1);
                var pageSize = Math.min(options.pageSize, 20);
                var totalPage = 1;
                if (totalCount == 0) {
                    currPage = 1;
                } else {
                    totalPage = Math.ceil(totalCount / pageSize);
                    currPage = Math.min(totalPage, currPage);
                }
                $.extend(options, {
                    totalCount: totalCount,
                    currPage: currPage,
                    pageSize: pageSize,
                    totalPage: totalPage
                });
                //pager.find('.totalCount').val(totalCount);
                //pager.find('.totalPage').val(totalPage);
                //pager.find('.currPage').val(currPage);
                //pager.find('.pageSize').val(pageSize);
                pager.find('.pagerMessage .totalCount').text(totalCount);
                pager.find('.pagerMessage .currPage').text(currPage);
                pager.find('.pagerMessage .totalPage').text(totalPage);
                var begin = pager.find('.begin');
                var previous = pager.find('.previous');
                var end = pager.find('.end');
                var next = pager.find('.next');
                if (currPage == 1) {
                    begin.addClass('disabled');
                    previous.addClass('disabled');
                } else {
                    begin.removeClass('disabled');
                    previous.removeClass('disabled');
                }
                if (currPage == totalPage) {
                    end.addClass('disabled');
                    next.addClass('disabled');
                } else {
                    end.removeClass('disabled');
                    next.removeClass('disabled');
                }
            }
        }
    })
});