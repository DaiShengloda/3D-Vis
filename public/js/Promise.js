var Promise = function() {
    this.doneList = [];
    this.failList = [];
    this.state = 'pending';
};

Promise.prototype = {
    constructor: 'Promise',
    resolve: function() {
        this.state = 'resolved';
        var list = this.doneList;
        for(var i = 0, len = list.length; i < len; i++) {
            list[0].call(this);
            list.shift();
        }
    },
    reject: function() {
        this.state = 'rejected';
        var list = this.failList;
        for(var i = 0, len = list.length; i < len; i++){
            list[0].call(this);
            list.shift();
        }
    },
    done: function(func) {
        if(typeof func === 'function') {
            this.doneList.push(func);
        }
        return this;
    },
    fail: function(func) {
        if(typeof func === 'function') {
            this.failList.push(func);
        }
        return this;
    },
    then: function(doneFn, failFn) {
        this.done(doneFn).fail(failFn);
        return this;
    },
    always: function(fn) {
        this.done(fn).fail(fn);
        return this;
    }
};

function when() {
    var p = new Promise();
    var success = true;
    var len = arguments.length;
    for(var i = 0; i < len; i++) {
        if(!(arguments[i] instanceof Promise)) {
            return false;
        }
        else {
            arguments[i].always(function() {
                if(this.state != 'resolved'){
                    success = false;
                }
                len--;
                if(len == 0) {
                    success ? p.resolve() : p.reject();
                }
            });
        }
    }
    return p;
}