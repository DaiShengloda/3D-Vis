/**
* @constructor {EventManager} 前段定义事件消息的类
* @param  {type} sceneManager {description}
* @return {type} {description}
*/
var EventManagerMenu = function (sceneManager) {
	it.ToolBarButton.call(this);
	this.sceneManager = sceneManager;
	this.hasEvent = false;
	this.init();
};

mono.extend(EventManagerMenu, it.ToolBarButton, {

	init: function () {
		var socket = ServerUtil.createSocket();
		var self = this;

		socket.on('event', function (data) { //增加
			self.handler(data);
		});
		this.button.on('click', function () {

			self.show();
		})
	},
	search: function () {
		var self = this;
		var params = { where: {} };
		var eventClassId = self.$eventTypeId.val();
		if (eventClassId) {
			params.where.eventClassId = eventClassId;
		}
		params.where.description = { 'like': '%' + self.$description.val() + '%' };
		var minDate = self.$begDate.val();
		if (!it.util.isEmptyStr(minDate)) {
			params.where.time = { '$gte': minDate }
		}
		var maxDate = self.$endDate.val();
		if (!it.util.isEmptyStr(maxDate)) {
			if (params.where.time) {
				params.where.time['$lte'] = maxDate
			} else {
				params.where.time = { '$lte': maxDate }
			}
		}
		self.refreshTable(params);
	},
	show: function () {
		var self = this;
		var $box = this.$box = $('<div class="event-box"></div>').appendTo($('body'));
		var $toolbar = this.$toolbar = $('<div class="toolbar"></div>').appendTo($box);
		$('<label for="event_type_id">{}</label>'.format(it.util.i18n("event-manager-type"))).appendTo($toolbar);
		var $eventTypeId = this.$eventTypeId = $('<select id="event_type_id" name="eventClassId"></select>').appendTo($toolbar);
		$('<label for="event_desc">{}</label>'.format(it.util.i18n("event-manager-desc"))).appendTo($toolbar);
		var $description = this.$description = $('<input id="event_desc" name="description">').appendTo($toolbar);
		$('<label>{}</label>'.format(it.util.i18n("event-manager-time"))).appendTo($toolbar);
		var $begDate = this.$begDate = $('<input name="begDate" placeholder="{}">'.format(it.util.i18n("event-manager-beg"))).appendTo($toolbar);
		$('<span> - </span>').appendTo($toolbar);
		var $endDate = this.$endDate = $('<input name="endDate" placeholder="{}">'.format(it.util.i18n("event-manager-end"))).appendTo($toolbar);


		var $submit = this.$submit = $('<button class="submit">{}</button>'.format(it.util.i18n("event-manager-submit"))).appendTo($toolbar);
		$submit.on('click', function () {
			self.search();
		})

		var $reset = this.$reset = $('<button class="reset">{}</button>'.format(it.util.i18n("event-manager-reset"))).appendTo($toolbar);
		$reset.on('click', function () {
			$eventTypeId.val('');
			$description.val('');
			$begDate.val('');
			$endDate.val('');
		})

		var $content = this.$content = $('<div class="content"></div>').appendTo($box);
		var $table = this.$table = $('<table></table>').appendTo($content);
		var $thead = $('<thead></thead>').appendTo($table);
		$('<td class="eventClassId">{}</td>'.format(it.util.i18n("event-manager-end"))).appendTo($thead);
		$('<td class="time">{}</td>'.format(it.util.i18n("event-manager-time"))).appendTo($thead);
		$('<td class="description">{}</td>'.format(it.util.i18n("event-manager-desc"))).appendTo($thead);
		var $tbbody = this.$tbody = $('<tbody></tbody>').appendTo($table);

		var $pageSizeBox = $('<div class="pageSizeBox"></div>').appendTo($box);
		var $countBox = this.$countBox = $('<span class="countBox">{} : </span>'.format(it.util.i18n("event-manager-count"))).appendTo($pageSizeBox);
		var $count = this.$count = $('<span class="count">123</span>').appendTo($countBox);
		var $pageBox = this.$pageBox = $('<span class="pageBox"></span>').appendTo($pageSizeBox);
		this.refreshEventClass();

		this.index = layer.open({
			type: 1,
			title: it.util.i18n("event-manager-title"),
			skin: 'layui-layer-rim', //加上边框
			area: ['840px', '450px'], //宽高
			content: self.$box,
		});

		//TODO 必须在弹框后才能调用,否则控件不显示.
		$begDate.datetimepicker({
			language: 'zh-CN',
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			todayBtn: true,
			todayHighlight: true,
			forceParse: true,
			weekStart: 1,
			startView: 2,//月视图,显示天
			minView: 0,
			startDate: '2016-01-01 00:00:00',
			endDate: '2099-12-31 23:59:59',
		}).on('changeDate', function (ev) {
			//console.log(ev);
			$endDate.datetimepicker('setStartDate', ev.date);
		})

		$endDate.datetimepicker({
			language: 'zh-CN',
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			todayBtn: true,
			todayHighlight: true,
			forceParse: true,
			weekStart: 1,
			startView: 2,//月视图,显示天
			minView: 0,
			startDate: '2016-01-01 00:00:00',
			endDate: '2099-12-31 23:59:59',
		}).on('changeDate', function (ev) {
			//console.log(ev);
			$begDate.datetimepicker('setEndDate', ev.date);
		})
		this.search();
		this.hasEvent = false;
	},

	hide: function () {
		layer.close(this.index);
	},
	refreshTable: function (params, callback) {

		var self = this;
		params.pageSize = params.pageSize || 10;
		params.pageIndex = params.pageIndex || 1;
		params.offset = (params.pageIndex - 1) * params.pageSize;
		params.limit = params.pageSize;
		params.order = [['time', 'desc']];

		it.util.api('event_instance', 'searchAndCount', params, function (result) {
			self.$tbody.empty();
			result.rows.forEach(function (row, index) {
				var $tr = $('<tr></tr>').appendTo(self.$tbody);
				$('<td class="eventClassId"></td>').appendTo($tr).text(row.eventClassId);
				$('<td class="time"></td>').appendTo($tr).text(row.time);
				$('<td class="description"></td>').appendTo($tr).html(row.description);
				if (index % 2 == 1) {
					$tr.css('background-color', '#fbfbfb')
				} else {
					//tr.css('background-color', '#fcfcfc')
				}
			})
			self.$count.text(result.count)
			var pages = Math.ceil(result.count / params.pageSize);
			laypage({
				cont: self.$pageBox, //容器。值支持id名、原生dom对象，jquery对象。【如该容器为】：<div id="page1"></div>
				skip: true, //是否开启跳页
				pages: pages, //通过后台拿到的总页数
				curr: params.pageIndex, //当前页
				jump: function (obj, first) { //触发分页后的回调
					//console.log(obj, first);
					if (obj.curr != params.pageIndex) {
						params.pageIndex = obj.curr;
						self.refreshTable(params);
					}
				}
			});
			callback && callback();
		})
	},
	refreshEventClass: function () {
		var self = this;
		it.util.api('event_class', 'search', {}, function (r) {
			self.$eventTypeId.empty();
			$('<option value=""> - '+it.util.i18n('event_List_Select_All')+'- </option>').appendTo(self.$eventTypeId);
			r.forEach(function (item) {
				var id = item.id;
				var desc = item.description || item.id;
				$('<option value="' + id + '">' + desc + '</option>').appendTo(self.$eventTypeId);
			})
		})
	},
	/**
	* @function {handler} 接收到事件的处理函数, 根据显示方式, 判断是否要进行下一步处理
	* @param  {type} event {description}
	* @return {type} {description}
	*/
	handler: function (event) {

		console.log('event', event);
		if (this.hasEvent) {
			return;
		}
		var self = this;
		this.hasEvent = true;
		var btn = $(this.button); ////styles,speed,easing,callback
		ani();

		function ani() {
			btn.animate({ opacity: 0.3 }, 800, function () {
				btn.animate({ opacity: 1 }, 600, function () {
					if(self.hasEvent){
						ani();
					}
				})
			})
		}
	},


	getClass: function () {
		return 'event-manager-menu';
	},

	getTooltip: function () {
		return it.util.i18n("event-manager-menu-tip");
	},
});