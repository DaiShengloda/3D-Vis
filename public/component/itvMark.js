(function($){
	var pluginName = 'itvMark',
		defaults = {};
	// 在我们插件容器内，创造一个公共变量来构建一个私有方法
	var countUpArray2 = [];
	var mark = function(parent, opt) {
		$('<img src="'+opt.icon+'" />').appendTo(parent);
		var $rd = $('<div></div>').appendTo(parent);
		var $divBox = $('<div></div>').appendTo($rd);
		var $span = $('<span class="statis-value" style="display:inline-block;">'+opt.value+'</span>').appendTo($divBox);
		$('<span class="statis-label">'+opt.unit+'</span>').appendTo($divBox);

		var valueWidth = $span.width();
		$span.width(valueWidth);

		if (Number(opt.value)) {
			var target = $rd.find('.statis-value')[0];
			var options = {
				useEasing: true,
				useGrouping: false,
				separator: ',',
				decimal: '.',
			};
			
			var v = parseInt(opt.value);
			var c = new CountUp(target, 0, v, 0, 1.5, options);
			if (!c.error) {
				// c.start();
			} else {
				console.error(c.error);
			}
			countUpArray2.push(c);
		}

		$('<div><span class="statis-label">'+opt.label+'</span></div>').appendTo($rd);
		
	}
	// 通过字面量创造一个对象，存储我们需要的共有方法
	var methods = {
		// 在字面量对象中定义每个单独的方法
		init: function(options) {
			// 为了更好的灵活性，对来自主函数，并进入每个方法中的选择器其中的每个单独的元素都执行代码
			return this.each(function() {
				// 为每个独立的元素创建一个jQuery对象
				var $this = $(this);
				var settings = $this.data(pluginName);
				if(typeof(settings) == 'undefined'){
					var settings = $.extend({}, defaults, options);
					$this.data(pluginName,settings);
				} else {
					settings = $.extend({}, settings, options);
					$this.data(pluginName, settings);
				}
				mark($this, settings)
			});
		},
		destroy: function() {
			return this.each(function() {
				var $this = $(this);
				$this.removeData(pluginName);
			});
		},
		start: function () {
			countUpArray2.forEach(function (c) {
				c.start();
			})
		},
		reset: function () {
			countUpArray2.forEach(function (c) {
				c.reset();
			})
		},
	}

	$.fn[pluginName] = function(){
		var args = arguments;
		var method = args[0];
		// 检验方法是否存在
		if(methods[method]){
			// 如果方法存在，存储起来以便使用
			// 注意：我这样做是为了等下更方便地使用each（）
			method = methods[method];

			// 我们的方法是作为参数传入的，把它从参数列表中删除，因为调用方法时并不需要它
			args = Array.prototype.slice.call(args, 1);
		} else if(typeof(method) == 'object' || !method){
			// 如果方法不存在，检验对象是否为一个对象（JSON对象）或者method方法没有被传入
			
			// 如果我们传入的是一个对象参数，或者根本没有参数，init方法会被调用
			method = methods.init;

		} else {
			// 如果方法不存在或者参数没传入，则报出错误。需要调用的方法没有被正确调用
			$.error( 'Method ' +  method + ' does not exist on jQuery.'+pluginName );
			return this;
		}
		return method.apply(this,args);
	}
})(jQuery)