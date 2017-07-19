angular.module('common',[])
.factory('commonFac',function($http){
	var f={
		dataPath:'',
		getData:function(url,sendType,data){
			var f=new FormData();
			if(!data){
				var data=null
			}else{
				for(var i in data){
					f.append(i,data[i]);
				}
			}
			return $http({
				method:sendType,
				url:url,
				headers:{
	            	'content-type':undefined
	            },
	            transformRequest: function(){
					return f
				},
			}).then(function(res){
				if(res&&res.data){
					return res.data;
				}else{
					return false;
				}
			},function(){
				return false;
			})
		},
		getStaticData:function(name){
			return $http({
						mothed:"GET",
						url:this.dataPath+name
					}).then(function(res){
						if(res.data){
							return res.data;
						}
					},function(){
						return false;
					})
		},
		test:function(){
			console.log("this commonFac is available");
		}
	}
	return f;
})
