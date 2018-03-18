!function( $ ) {

 "use strict";
  
  var buttonClass = "glyphicon",pickClass = "glyphicon-hand-up",removeClass = "glyphicon-remove-sign";

  var Picker = function (element,options) {
    this.options = $.extend({},$.fn.bootstrapPicker.defaults,options);
    this.$source = $(element);
    this.$container = this.setup();
    this.$element = this.$container.find('input[type=text]');
    this.$buttonPick = this.$container.find('.' + pickClass);
    this.$buttonRemove = this.$container.find('.' + removeClass);
    this.transferAttributes();
    this.listen();
  };

  Picker.prototype = {

    constructor: Picker,
    setup: function () {
      var picker = $('<div class="picker-container"> <input type="hidden" /> <div class="input-group"> <input type="text" autocomplete="off" readonly = "true" class = "form-control"/> <span class="input-group-addon input-sm"><span class="active glyphicon '+pickClass+'" /> <span class="glyphicon '+removeClass+'" /> </span> </div> </div>');
      picker.appendTo(this.$source);
      return picker;
    }, 
    transferAttributes: function() {
      this.options.placeholder = this.$source.attr('data-placeholder') || this.options.placeholder
      this.$element.attr('placeholder', this.options.placeholder)
      this.$source.removeAttr('name')  // Remove from source otherwise form will pass parameter twice.
      this.$element.attr('required', this.$source.attr('required'))
      this.$element.attr('rel', this.$source.attr('rel'))
      this.$element.attr('title', this.$source.attr('title'))
      this.$element.attr('class', this.$source.attr('class'))
      this.$element.attr('tabindex', this.$source.attr('tabindex'))
      this.$source.removeAttr('tabindex')
      if (this.$source.attr('disabled')!==undefined)
        this.disable();
    },
    setValue : function(value){
       this.$element.val(value);
    },
    getValue : function(){
       return this.$element.val();
    },

  // , refresh: function () {
  //   this.source = this.parse();
  //   this.options.items = this.source.length;
  // }

    listen: function () {
      var buttons = this.$container.find('.glyphicon');
      buttons.on('mouseenter',function (event) {
          var $this = $(event.currentTarget)
          $this.css('color','rgba(0,0,0,0.4)');
      }).on('mouseleave',function(event){
         var $this = $(event.currentTarget)
         $this.css('color','#555');
      }).on('mousedown',function(event){
         var $this = $(event.currentTarget)
         $this.css('color','rgba(0,0,0,0.6)');
      }).on('mouseup',function(event){
         var $this = $(event.currentTarget)
         $this.css('color','rgba(0,0,0,0.4)');
      });
      var self = this;
      this.$buttonPick.on('click',$.proxy(this.click, this));

      this.$buttonRemove.on('click',function(event){
          self.$element.val("");
      });
    }, 
    eventSupported: function(eventName) {
      var isSupported = eventName in this.$element;
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;');
        isSupported = typeof this.$element[eventName] === 'function';
      }
      return isSupported;
    }, 
    click: function (e) {
      e.stopPropagation();
      e.preventDefault();
      if($.isFunction(this.options.onClick)){
         this.options.onClick();
      }
    }
  };


  $.fn.bootstrapPicker = function ( option ) {
      return this.each(function(){
         var $this = $(this),
             data = $this.data('bootstrapPicker'),
             options = typeof option == 'object' && option;

          if(!data){
             $this.data('bootstrapPicker',(data = new Picker(this,options)))
          }
      });   
  };

  $.fn.bootstrapPicker.defaults = {

  };

  $.fn.bootstrapPicker.Constructor = Picker;

}( window.jQuery );
