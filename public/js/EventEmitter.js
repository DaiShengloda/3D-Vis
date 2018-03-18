
 var EventEmitter = function () {
     this.listeners = {};
 };
 EventEmitter.prototype.on = function (evt, handler, context) {
     var handlers = this.listeners[evt];
     if (handlers === undefined) {
         handlers = [];
         this.listeners[evt] = handlers;
     }
     var item = {
         handler: handler,
         context: context
     };
     handlers.push(item);
     return item;
 };
 EventEmitter.prototype.off = function (evt, handler, context) {
     var handlers = this.listeners[evt];
     if (handlers !== undefined) {
         var size = handlers.length;
         for (var i = 0; i < size; i++) {
             var item = handlers[i];
             if (item.handler === handler && item.context === context) {
                 handlers.splice(i, 1);
                 return;
             }
         }
     }
 };
 EventEmitter.prototype.emit = function (type, event) {
     var hanlders = this.listeners[type];
     if (hanlders !== undefined) {
         var size = hanlders.length;
         for (var i = 0; i < size; i++) {
             var ef = hanlders[i];
             var handler = ef.handler;
             var context = ef.context;
             handler.apply(context, [event]);
         }
     }
 };