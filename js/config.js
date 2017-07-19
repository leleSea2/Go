angular.module('config',[])
.service('configSer',function(){
	this.ser=function(){
		var that=this;
		this.Ip='192.168.1.110'
		this.getIp=function(){
			return that.Ip;
		}
	}
})
.controller('ipConfig',['$scope',function($scope){
	$scope.Ip='192.168.1.110';
}])