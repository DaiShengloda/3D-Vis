if (!window.sdk) {
    sdk = {};
}
if (!window.it) {
    it = {};
}
if (!it.validator) {
    it.validator = {};
}

var validator = sdk.validator = it.validator;

validator.notEmpty = function(p){
	return {
		type: 'notEmpty',
		message: validator.message('The '+p+' is required')
	}
}

validator.remote = function(message, url, name, data){
	var remote = {
		type: 'remote',
		message: validator.message(message),
		url: url
	}
	if(name)remote.name = name;
	if(data)remote.data = data;
	return remote;
}

validator.callback = function(message, callback){
	return {
		type: 'callback',
		message: validator.message(message),
		callback: callback
	}
}

validator.message = function(message){
	return util.i18n(message);
}
