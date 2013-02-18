function MaxwellClient(serviceUrl){
	this.serviceUrl = serviceUrl;
}

MaxwellClient.prototype.post = function(){
	alert("Posting to " + serviceUrl);
};