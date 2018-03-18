(function($){
	var pluginName = 'itvRackTotal',
		defaults = {};
	// 在我们插件容器内，创造一个公共变量来构建一个私有方法
	var countUpArray3 = [];
	var plugin = function(parent, opt) {   
		var arr = [];
		var $left = $('<div></div').appendTo(parent);
		$('<img src="'+opt.icon+'"/>').appendTo(parent);
		var $right = $('<div></div').appendTo(parent);
		$.each(opt.left, function(index, el) {
			var v;
			if (Number(el.value)) {
				var $span = $('<span class="statis-value" style="display:inline-block;">'+el.value+'</span>').appendTo($left);
				$('<span class="statis-label">'+el.label+'</span>').appendTo($left);
				v = el.value;
				var valueWidth = $span.width();
				$span.width(valueWidth);
			} else {
				var frontStr = parseInt(el.value);
				var lastStr = el.value.split(frontStr)[1];
				var $span = $('<span class="statis-value" style="display:inline-block;">'+frontStr+'</span>').appendTo($left);
				$('<i class="statis-value-str" style="display:inline-block;">'+lastStr+'</i>').appendTo($left);
				$('<span class="statis-label">'+el.label+'</span>').appendTo($left);
				v = frontStr;
				var valueWidth = $span.width();
				$span.width(valueWidth);
			}

			var target = $left.find('.statis-value')[index];
			var countUpObj = {
				target: target,
				v: v
			}
			arr.push(countUpObj);

		});
		$.each(opt.right, function(index, el) {
			// $('<span class="statis-value">'+el.value[0]+'<span class="statis-percent">'+el.value[1]+'</span></span>').appendTo($right);
			var frontStr = "(";
			var lastStr = "%)";
			var middleStr = el.value[1].split(frontStr)[1].split(lastStr)[0];
			var $spanValue = $('<span class="statis-value" style="display:inline-block;">'+el.value[0]+'</span>').appendTo($right);
			var valueWid = $spanValue.width();
			$spanValue.width(valueWid);

			$('<i class="static-percent-str" style="display:inline-block;margin-left:10px;">'+frontStr+'</i>').appendTo($right);
			var $spanPercent = $('<span class="statis-percent" style="display:inline-block">'+middleStr+'</span>').appendTo($right);
			$('<i class="static-percent-str" style="display:inline-block">'+lastStr+'</i>').appendTo($right);	
			var percentWidth = $spanPercent.width();
			$spanPercent.width(percentWidth);
			
			$('<span class="statis-label">'+el.label+'</span>').appendTo($right);
			var target = $right.find('.statis-value')[index];
			var countUpObj = {
				target: target,
				v: el.value[0]
			}
			arr.push(countUpObj);
			target = $right.find('.statis-percent')[index];
			countUpObj = {
				target: target,
				v: middleStr
			}
			arr.push(countUpObj);
		});
		
		arr.forEach(function (el) {
			var target = el.target;
			var options = {
				useEasing: true,
				useGrouping: false,
				separator: ',',
				decimal: '.',
			};
			var v = parseInt(el.v);
			var c = new CountUp(target, 0, v, 0, 1.5, options);
			if (!c.error) {
				// c.start();
			} else {
				console.error(c.error);
			}
			countUpArray3.push(c);
		});
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
				plugin($this, settings)
			});
		},
		destroy: function() {
			return this.each(function() {
				var $this = $(this);
				$this.removeData(pluginName);
			});
		},
		start: function () {
			countUpArray3.forEach(function (c) {
				c.start();
			})
		},
		reset: function () {
			countUpArray3.forEach(function (c) {
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
		} else if(typeof(method) == 'object' || !mehtod){
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