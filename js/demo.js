/*
 棋子状态status：
 	0:初始状态
	1：当前位置已落子
	2：
	3：打开policy
	4：点目去掉的死子
	5：打开following steps
 * */
angular.module("demo",['common','config'])
.service("ser",function(commonFac,$timeout,$interval){
	this.ser=function(scope){
		this.scope=scope;
		that=this;
		this.createBoard=function(){
			that.scope.pieces=[];
			for(var i=0;i<that.scope.lN*that.scope.lN;i++){
				that.scope.pieces[i]={
					x:i%that.scope.lN,
            		y:parseInt(i/that.scope.lN),
            		ret:parseInt(i/that.scope.lN)*0.15,
            		rel:(i%that.scope.lN)*0.15,
            		pieces:null,
            		status:0,
            		step:null,
            		css:{
            			top:that.scope.boardAttr.margin+that.scope.boardAttr.block*parseInt(i/that.scope.lN)-that.scope.boardAttr.block/2,
            			left:that.scope.boardAttr.margin+that.scope.boardAttr.block*(i%that.scope.lN)-that.scope.boardAttr.block/2,
            			width:that.scope.boardAttr.block,
            			height:that.scope.boardAttr.block,
            			opacity:0
            		}
				}
			}
			that.scope.piecesCopy=angular.copy(that.scope.pieces);
		}
		this.getPn=function(data){
			return commonFac.getData("http://abacus.zhiheng3.cn/get_pn","POST",{sgf:data});
		}
		this.getCoord=function(x,y){
		    zoomW = parseInt($("#board").outerWidth());
		    zoomH = parseInt($("#board").outerHeight());
		    x = x * that.scope.boardAttr.boardSize / zoomW;
		    y = y * that.scope.boardAttr.boardSize / zoomH;
		    var cx = parseInt((x - that.scope.boardAttr.margin) / that.scope.boardAttr.block + 0.5)
		    var cy = parseInt((y - that.scope.boardAttr.margin) / that.scope.boardAttr.block + 0.5)
		    return {
		        x: cx,
		        y: cy
		    }
		};
		this.setPoint=function(x,y,c){
			that.scope.pieces[that.getPoint(x,y)].pieces=c;
		};
		this.getPoint=function(x,y){
			return y*that.scope.lN+x;
		};
		this.errorHan=function(txt,type){
//			console.log(txt);
			if(txt){
				that.scope.loadingTxt=txt;
			}
			$("#loading").modal("show");
			if(type==1){
				$timeout(function(){
					that.scope.loadingTxt=null;
					$("#loading").modal("hide");
				},2000)
			}
		};
		this.loadingWait=function(){
			$("#loading").modal("show");
			that.scope.loadWait=0;
			that.scope.interval=$interval(function(){
				that.scope.loadWait=that.scope.loadWait%4;
				that.scope.loadWait++;
			},250)
		}
		this.loadClose=function(txt){
			that.scope.loadWait=null;
			if(txt){
				that.scope.$apply(function(){
					that.scope.loadingTxt=txt;
				})
				$timeout(function(){
					$("#loading").modal("hide");
					that.scope.$apply(function(){
						that.scope.loadingTxt=null;
					})
				},2000)
			}else{
				$("#loading").modal("hide");
				that.scope.loadingTxt=null;
			}
			$interval.cancel(that.scope.interval);
//			that.scope.$on('$destroy',function(){  
//		       $interval.cancel(that.scope.interval);  
//		   })
		};
		this.drawPieces=function(x,y,color){
			var cx=that.scope.boardAttr.margin+that.scope.boardAttr.block*x
			var cy=that.scope.boardAttr.margin+that.scope.boardAttr.block*y
			var cx2=cx-that.scope.boardAttr.block/6;
			var cy2=cy-that.scope.boardAttr.block/6;
			if(color==1){
				var bc="#666",ec="#333";
			}else{
				var bc="#fff",ec="#aaa";
			}
			var lGrd = that.scope.ctx.createRadialGradient(cx2,cy2,1,cx2,cy2,that.scope.boardAttr.block/2);  
			lGrd.addColorStop(0,bc);  
			lGrd.addColorStop(1,ec);
			that.scope.ctx.fillStyle =lGrd;
			that.scope.ctx.shadowOffsetX = 3; // 阴影Y轴偏移
			that.scope.ctx.shadowOffsetY = 3; // 阴影X轴偏移
			that.scope.ctx.shadowBlur = 3; // 模糊尺寸
			that.scope.ctx.shadowColor = '#444'; // 颜色
			that.scope.ctx.beginPath(); 
			that.scope.ctx.arc(cx, cy, that.scope.boardAttr.block/2, 0, 2 * Math.PI, false); 
			that.scope.ctx.fill();
			that.scope.ctx2.clearRect(0,0,that.scope.boardAttr.boardSize,that.scope.boardAttr.boardSize);
			that.scope.ctx2.fillStyle = 'red';
			that.scope.ctx2.beginPath();
			that.scope.ctx2.arc(cx, cy, that.scope.boardAttr.block/2*0.4, 0, 2 * Math.PI, false);
			that.scope.ctx2.fill();
		}
	}
})
.factory('fac',function(commonFac){
	var f={
		drawLine:function(start,end,ctx,option){
			if(option){
				for(var i in option){
					ctx[i]=option[i];
				}
			}
			ctx.beginPath();
			ctx.moveTo(start.x,start.y+0.5);
			ctx.lineTo(end.x,end.y+0.5);
			ctx.stroke();
			ctx.closePath();
			
		},
		transformInt:function(s){
			if(s){
				return angular.uppercase(s).charCodeAt();
			}else{
				return 0;
			}
		},
		transformStr:function(s){
			return String.fromCharCode(s)
		},
		getPn:function(data){
			return commonFac.getData("http://abacus.zhiheng3.cn/get_pn","POST",{sgf:data});
		}
	};
	return f
})
.controller("demoCon",["$scope","$timeout","$interval","fac","ser","commonFac","configSer",function($scope,$timeout,$interval,fac,ser,commonFac,configSer){
	var config=new configSer.ser();
	var IPadd=config.getIp();
	$scope.canvasRsize=$("#board").outerWidth();
	$scope.deleWidth=1920;
	$scope.screenWidth=document.body.clientWidth;
	$scope.screenHeight=document.body.clientHeight;
	$scope.repair=2.5/(1200-768);
	if($scope.screenWidth<=1200&&$scope.screenWidth>768){
		$scope.mdCon=1;
	}else{
		$scope.mdCon=0;
	}
//	console.log($scope.screenWidth);
	$scope.screenBP=768;
	var canvas=document.getElementById("board");
	$scope.txt="(;CA[utf8]SZ[19]AP[abacus]";
	$scope.colorBlack=1;//黑子颜色编号
	$scope.colorWhite=2;//白子颜色编号
	$scope.computer=null;//控制黑子的角色，默认：用户
	$scope.lN=19;//棋盘规格19*19
	$scope.postData=[];//待发送的数据，棋盘数据
	$scope.cache=[]//存储盘面
	$scope.positionNow=0;
	$scope.lastCoord=[];
	$scope.loading=false//等待响应
	$scope.setBoard=false
	$scope.setBoardStep=false;
	$scope.switchCon=false;
	$scope.applyCon=false;
	$scope.analyze={};
	$scope.time={
		c1:{
			num:0,
			show:"0:0"
		},
		c2:{
			num:0,
			show:"0:0"
		},
	}
	$scope.menu={
		active:false,
		css:{
			display:"none"
		}
	}//菜单，默认关闭
	$scope.gameInfo={
		death1:0,
		death2:0,
		color1:0,
		color2:0,
		publicNum:0,
		area1:0,
		area2:0
	};
	//用户选子
	$scope.userSe={
		b:false,
		w:false,
		selfGame:false
	}
	//贴目
	$scope.handi={
		oldNum:7.5,
		num:7.5,
		active:false
	}
	//右侧按钮CSS
	$scope.resultCss={
		optionCss:null,
		contentCss:{
			transform:"rotate3d(0,1,0,90deg)"
		}
	}
	//显示步数
	$scope.showStep=false;
	$scope.rectifyOpen=false;
	$scope.ctx=document.getElementById("board").getContext("2d");//画布对象
	$scope.ctx2=document.getElementById("board2").getContext("2d");//画布对象2
	$scope.boardAttr={//棋盘参数：棋盘大小，边距尺寸，格子大小
		margin:50,
		block:40
	}
	$scope.boardAttr.boardSize=$scope.boardAttr.margin*2+$scope.boardAttr.block*18;
	$scope.per=($scope.canvasRsize/$scope.boardAttr.boardSize).toFixed(2);
	$scope.activeNow=1;//当前棋子颜色（1：黑色，其他：白色）
	var ser=new ser.ser($scope);
	ser.createBoard();
	//显示PN
    $scope.showPn=function(e,val){
    	if(val){
    		$scope.closeOther('policy');
			var postData=$scope.getPostData();
    		fac.getPn(postData).then(function(data){
				if(data){
					var f=Number(data[0]);
					var dataObj=[];
					for(var i in data){
						if((data[i]*100)>=1&&$scope.pieces[i].status!=1){
							$scope.pieces[i].show=true;
							$scope.pieces[i].policy={
								show:true,
								num:String((data[i]*100).toFixed(2)),
								bcg:Math.sqrt(data[i])
							}
							$scope.pieces[i].status=3;
//							if(data[i]<0.5){
//								var r=((180/50*(data[i]*100))-135).toFixed(2);
//								$scope.pieces[i].policy.Rcss=r;
//								$scope.pieces[i].policy.Lcss=-135;
//							}else{
//								var r=((180/50*(data[i]*100-50))-135).toFixed(2);
//								$scope.pieces[i].policy.Rcss=45;
//								$scope.pieces[i].policy.Lcss=r;
//							}
						}
					}
				}
			})
    	}else{
    		if(!$scope.applyCon){
    			$scope.$apply(function(){
	    			$scope.policyClose();
	    		})
    		}else{
    			$scope.policyClose();
    		}
    	}
    }
    $scope.progressHover=function(x,y,e){
    	if($scope.pieces[$scope.coor2to1(x,y)].policy){
    		if($(e.target).attr("class")=="progressBar"){
	    		var obj=e.target
	    	}else{
	    		var obj=$(e.target).parents(".progressBar");
	    	}
	    	$(obj).tooltip('show');
//  		$scope.pieces[$scope.coor2to1(x,y)].policy.active=true;
    	}
    }
    $scope.progressLeave=function(x,y){
    	if($scope.pieces[$scope.coor2to1(x,y)].policy){
    		$scope.pieces[$scope.coor2to1(x,y)].policy.active=false;
    	}
    }
    //显示步数
    $scope.stepDis=function(e,val){
    	if(val){
    		$scope.closeOther('step',true);
    		if(!$scope.applyCon){
    			$scope.$apply(function(){
	    			$scope.showStep=true;
	    		})
    		}else{
    			$scope.showStep=true;
    		}
    	}else{
    		if(!$scope.applyCon){
    			$scope.$apply(function(){
	    			 $scope.stepClose();
	    		})
    		}else{
    			 $scope.stepClose();
    		}
    	}
    }
    $scope.stepClose=function(){
    	$scope.showStep=false;
    }
    $scope.closeGraph=function(){
    	$scope.switchCon=true;
    	if(flag){
    		$('input[name="policy"]').bootstrapSwitch("state",state);
    	}else{
    		$(obj).bootstrapSwitch("state",state);
    	}
    }
    $scope.Territory=function(e,val){
    	if(val){
    		$scope.closeOther('Territory');
//  		var postData=$scope.getPostData();
    		commonFac.getStaticData("http://"+IPadd+"/go/data/territory.json")
    		.then(function(data){
    			if(data){
    				angular.forEach(data,function(v,k){
    					var c=255-(v*100*2.55).toFixed(0);
    					var o=v.toFixed(2);
    					$scope.pieces[k].css.opacity=1;
    					$scope.pieces[k].territory={
    						css:{
    							background:"rgb("+c+","+c+","+c+")"
    						},
    						val:(v*100).toFixed(2)
    					};
    				})
    			}
    		})
    	}else{
			if(!$scope.applyCon){
    			$scope.$apply(function(){
	    			$scope.TerritoryClose();
	    		})
    		}else{
    			$scope.TerritoryClose();
    		}
    	}
    }
    $scope.TerritoryClose=function(){
    	angular.forEach($scope.pieces,function(v,k){
			$scope.pieces[k].territory=null;
		})
    }
    //territory hover
    $scope.territoryHover=function(x,y,e){
    	var i=$scope.coor2to1(x,y);
    	if($scope.pieces[i].territory){
    		if($(e.target).attr("class")=="Territory"){
	    		var obj=e.target
	    	}else{
	    		var obj=$(e.target).parents(".Territory");
	    	}
	    	$(obj).tooltip('show');
//  		if($scope.pieces[i].territory.val>=50){
//  			$scope.pieces[i].territory.active=2;
//  		}else{
//  			$scope.pieces[i].territory.active=1;
//  		}
			
		}
    }
    $scope.territoryLeave=function(x,y){
    	var i=$scope.coor2to1(x,y);
    	if($scope.pieces[i].territory){
			$scope.pieces[i].territory.active=null;
		}
    }
    //关闭其他图表显示
    $scope.closeOther=function(name,flag){
    	if(!flag){
    		$('input[data-radio="graph"]').each(function(){
	    		var n=$(this).attr("name");
	    		if(n!=name){
	    			$(this).bootstrapSwitch("state",false);
	    		}
	    	})
    	}else{
    		$('input[data-toggle="switch"]').each(function(){
	    		var n=$(this).attr("name");
	    		if(n!=name){
	    			$(this).bootstrapSwitch("state",false);
	    		}
	    	})
    	}
    }
    //显示后五步
    $scope.nextSteps=function(e,val){
    	if(val){
    		$scope.closeOther('nextSteps',true);
    		commonFac.getStaticData("http://"+IPadd+"/go/data/steps.json")
    		.then(function(data){
    			if(data){
    				var c=$scope.activeNow;
    				for(var i in data){
    					if($scope.pieces[data[i]].status!=1){
    						$scope.pieces[data[i]].nextSteps={
    							k:Number(i)+1,
    							c:c
    						}
    						c=c%2+1;
    					}
    				}
    			}
    		})
    	}else{
    		if(!$scope.applyCon){
    			$scope.$apply(function(){
	    			$scope.nextStepsClose();
	    		})
    		}else{
    			$scope.nextStepsClose();
    		}
    	}
    }
    $scope.nextStepsClose=function(){
    	angular.forEach($scope.pieces,function(v,k){
			v.nextSteps=null;
		})
    }
	//初始化开关
	$('input[data-toggle="switch"]').bootstrapSwitch({
        onText: "on",
        offText: "off",
        onColor: "success",
        offColor: "danger",
        size: "mini",
        onSwitchChange:function(e,val){
        	var name=$(e.target).attr("name");
        	$scope.handleSwitch(name,e,val)
        }
    }); 
   $scope.handleSwitch=function(name,e,val){
   		switch(name){
    		case "policy":
        		$scope.showPn(e,val);
    			break;
    		case "step":
    			$scope.stepDis(e,val);
    			break;
    		case "Territory":
    			$scope.Territory(e,val);
    			break;
    		case "nextSteps":
    			$scope.nextSteps(e,val);
    	}
   }
    //关闭图表显示
    $scope.policyClose=function(){
		angular.forEach($scope.pieces,function(v,k){
    		if(v.status!=1){
    			v.css.opacity=0;
    			v.status=0;
    		}
			v.policy=null
    	})
    	
    }
	$timeout(function(){
		for(var i=0;i<$scope.lN;i++){
			//横线
			fac.drawLine(
				{x:$scope.boardAttr.margin,y:$scope.boardAttr.block*i+$scope.boardAttr.margin},
				{x:$scope.boardAttr.boardSize-$scope.boardAttr.margin,y:$scope.boardAttr.block*i+$scope.boardAttr.margin},
				$scope.ctx,
				{strokeStyle:"#7B5B31",lineWidth:1}
			)
			//竖线
			fac.drawLine(
				{x:$scope.boardAttr.block*i+$scope.boardAttr.margin,y:$scope.boardAttr.margin},
				{x:$scope.boardAttr.block*i+$scope.boardAttr.margin,y:$scope.boardAttr.boardSize-$scope.boardAttr.margin},
				$scope.ctx,
				{strokeStyle:"#7B5B31",lineWidth:1}
			)
			//坐标
			$scope.ctx.font="Calibri"
			if(i>=8){
				var k=i+66
			}else{
				var k=i+65
			}
			$scope.ctx.font="18px Arial";
			$scope.ctx.fillText(String.fromCharCode(k),$scope.boardAttr.block*i+$scope.boardAttr.margin-7,30);
			$scope.ctx.fillText($scope.lN-i,6,$scope.boardAttr.block*i+$scope.boardAttr.margin+7);
			if(i==3||i==9||i==15){
				$scope.ctx.fillStyle="#553311";
				$scope.ctx.beginPath();
				$scope.ctx.arc($scope.boardAttr.block*3+$scope.boardAttr.margin,$scope.boardAttr.block*i+$scope.boardAttr.margin,5,0,Math.PI*2);
				$scope.ctx.fill();
				$scope.ctx.beginPath();
				$scope.ctx.arc($scope.boardAttr.block*9+$scope.boardAttr.margin,$scope.boardAttr.block*i+$scope.boardAttr.margin,5,0,Math.PI*2);
				$scope.ctx.fill();
				$scope.ctx.beginPath();
				$scope.ctx.arc($scope.boardAttr.block*15+$scope.boardAttr.margin,$scope.boardAttr.block*i+$scope.boardAttr.margin,5,0,Math.PI*2);
				$scope.ctx.fill();
			}
		}
		$scope.boardHeight=$("#boardBody").outerHeight();
	},1)
	$scope.setTime=function(c){
		var tc=c%2+1;
		$interval.cancel($scope.time["c"+tc].inter);
		$scope.time["c"+c].inter=$interval(function(){
			$scope.time["c"+c].num++;
			$scope.time["c"+c].show=$scope.timehan($scope.time["c"+c].num);
		},1000)
	}
	$scope.timehan=function(s){
		var sc=0,m=0;
		sc=s%60;
		m=parseInt(s/60);
		return m+":"+sc;
	}
	$scope.stopTime=function(){
		$interval.cancel($scope.time.c1.inter);
		$interval.cancel($scope.time.c2.inter);
	}
	that.scope.$on('$destroy',function(){  
       $interval.cancel($scope.time.c1.inter); 
       $interval.cancel($scope.time.c2.inter); 
       $interval.cancel($scope.interval);  
   	})
	$scope.Play=function(x,y,i){
		if($scope.loading||$scope.userSe.selfGame){
			return;
		}
		if($scope.rectifyOpen){
			$scope.rectify(x,y);
			return;
		}
//		$scope.closeGraph('',false,true);
		$scope.applyCon=true;
		$scope.closeOther('step',true);
		$scope.applyCon=false;
		if(x==null){
			$scope.passStep();
		}else{
			$scope.boardHandle(x,y,i);
		}
		$scope.getNewData();
	}
	//pass
	$scope.passStep=function(){
		if($scope.lastCoord.length&&!$scope.setBoardStep){
			if($scope.cache.length-1>$scope.positionNow){
				$scope.lastCoord.splice($scope.positionNow+1,$scope.lastCoord.length-($scope.positionNow+1));
			}
			if($scope.lastCoord[$scope.lastCoord.length-1]){
				var lastX=$scope.lastCoord[$scope.lastCoord.length-1].x.charCodeAt()-97;
				var lastY=$scope.lastCoord[$scope.lastCoord.length-1].y.charCodeAt()-97;
				$scope.pieces[$scope.lN*lastY+lastX].active=false;
			}else if($scope.lastCoord.length-2>=0&&$scope.lastCoord[$scope.lastCoord.length-2]){
				var lastX=$scope.lastCoord[$scope.lastCoord.length-2].x.charCodeAt()-97;
				var lastY=$scope.lastCoord[$scope.lastCoord.length-2].y.charCodeAt()-97;
				$scope.pieces[$scope.lN*lastY+lastX].active=false;
			}
		}
		if(!$scope.setBoardStep){
			$scope.lastCoord.push(null);
//			$scope.pieces[i].active=true;
			if($scope.cache.length-1>$scope.positionNow){
				$scope.cache.splice($scope.positionNow+1,$scope.cache.length-($scope.positionNow+1));
				$scope.cache[$scope.positionNow+1]=angular.copy($scope.pieces);
			}else{
				$scope.cache.push(angular.copy($scope.pieces));
			}
		}
		
		if(!$scope.setBoard){
			$scope.activeNow=$scope.activeNow%2;
			$scope.activeNow++;
			$scope.setTime($scope.activeNow);
		}
		$scope.positionNow=($scope.cache.length-1)<0?0:$scope.cache.length-1;
	}
	$scope.getNewData=function(){
		if(($scope.computer==$scope.activeNow||$scope.userSe.selfGame)&&!$scope.setBoard){
			$scope.loading=true;
			$scope.applyCon=true;
			$scope.closeOther('step',true);
			$scope.applyCon=false;
			var postData=$scope.getPostData();
			fac.getPn(postData).then(function(data){
				if(data){
					var dataObj=[];
					for(var i in data){
						dataObj.push({
							key:i,
							val:data[i]
						})
					}
					dataObj.sort(function(a,b){
						return b.val-a.val;
					});
					$scope.computerHandle(dataObj,0);
					$scope.loading=false;
				}
			})
		}
	}
	$scope.getPostData=function(){
		var postData=$scope.txt+";";
		angular.forEach($scope.pieces,function(v,k){
			var color=null
			var coord={
					x:String.fromCharCode(v.x+97),
					y:String.fromCharCode(v.y+97)
				}
			if(v.pieces){
				var color=v.pieces==1?'B':'W';
				postData=postData+color+'['+coord.x+coord.y+"];"
			}
		})
		postData=postData.substring(0,postData.length-1)+")";
		return postData;
	}
	//如果computer给出了一个死棋则选择第二概率
	$scope.computerHandle=function(dataObj,i){
		if(!i){
			i=0
		}
		if(($scope.computer==$scope.activeNow||$scope.userSe.selfGame)&&!$scope.setBoard){
			if(!$scope.boardHandle(dataObj[i].key%$scope.lN,parseInt(dataObj[i].key/$scope.lN),dataObj[i].key)){
				$scope.computerHandle(dataObj,i+1);
			}
		}
		$scope.getNewData();
	}
	 var delta = [
		    [0, 1],
		    [0, -1],
		    [-1, 0],
		    [1, 0]
		];
	$scope.boardHandle=function(x,y,i){
		if($scope.pieces[i].pieces&&$scope.pieces[i].status==1){
			return false;
		}
		var take = 0;
		ser.setPoint(x,y,$scope.activeNow);
        for (var j in delta) {
            var nx = x + delta[j][0];
            var ny = y + delta[j][1];
            if (!$scope.isInBoard(nx, ny)) {
                continue;
            }
            if ($scope.getCross(nx, ny)!=$scope.pieces[i].pieces&&$scope.isDeath(nx, ny)) {
                take += $scope.removeDeath(nx, ny);
            }
        }
		if (take == 0 && $scope.isDeath(x, y)) {
            ser.setPoint(x,y,null);
            return false;
        }
		if(take>0&&$scope.cache.length){
			var tem1=$scope.getBoard($scope.pieces);
			tem1[$scope.coor2to1(x,y)]=1;
			tem1=tem1.join("");
			var tem2=$scope.getBoard($scope.cache[$scope.positionNow-1]).join("");
			if(tem1==tem2){
				$scope.pieces=angular.copy($scope.cache[$scope.positionNow]);
				return false;
			}
		}
		if(take>0){
			var c=($scope.activeNow%2)+1;
			$scope.gameInfo['death'+c]+=take;
		}
		$scope.pieces[i].status=1;
//		ser.drawPieces(x,y,$scope.activeNow);
		$scope.pieces[i].css.opacity=1;
		var color=$scope.activeNow==1?'B':'W';
		var coord={
			x:String.fromCharCode(x+97),
			y:String.fromCharCode(y+97),
			take:{
				color:($scope.activeNow%2)+1,
				num:take
			}
			
		}
		$scope.pieces[i].pieces=$scope.activeNow;
		$scope.gameInfo['color'+$scope.activeNow]++;
		if($scope.lastCoord.length&&!$scope.setBoardStep){
			if($scope.cache.length-1>$scope.positionNow){
				$scope.lastCoord.splice($scope.positionNow+1,$scope.lastCoord.length-($scope.positionNow+1));
			}
			if($scope.lastCoord[$scope.lastCoord.length-1]){
				var lastX=$scope.lastCoord[$scope.lastCoord.length-1].x.charCodeAt()-97;
				var lastY=$scope.lastCoord[$scope.lastCoord.length-1].y.charCodeAt()-97;
				$scope.pieces[$scope.lN*lastY+lastX].active=false;
			}else if($scope.lastCoord.length-2>=0&&$scope.lastCoord[$scope.lastCoord.length-2]){
				var lastX=$scope.lastCoord[$scope.lastCoord.length-2].x.charCodeAt()-97;
				var lastY=$scope.lastCoord[$scope.lastCoord.length-2].y.charCodeAt()-97;
				$scope.pieces[$scope.lN*lastY+lastX].active=false;
			}
		}
		if(!$scope.setBoardStep){
			$scope.lastCoord.push(coord);
			$scope.pieces[i].active=true;
			$scope.pieces[$scope.coor2to1(x,y)].step=($scope.cache.length-1)<0?1:$scope.cache.length+1;
			if($scope.cache.length-1>$scope.positionNow){
				$scope.cache.splice($scope.positionNow+1,$scope.cache.length-($scope.positionNow+1));
				$scope.cache[$scope.positionNow+1]=angular.copy($scope.pieces);
			}else{
				$scope.cache.push(angular.copy($scope.pieces));
			}
		}
		if(!$scope.setBoard){
			$scope.activeNow=$scope.activeNow%2;
			$scope.activeNow++;
			$scope.setTime($scope.activeNow);
		}
		$scope.positionNow=($scope.cache.length-1)<0?0:$scope.cache.length-1;
		return true;
	}
	//获取盘面情况
	$scope.getBoard=function(obj){
		var tem=new Array($scope.lN*$scope.lN);
		angular.forEach(obj,function(v,k){
			if(v.status==1){
				tem[k]=1;
			}else{
				tem[k]=0;
			}
		})
		return tem;
	}
	//判断是否在棋盘内
	$scope.isInBoard = function(x, y) {
        if (x < 0 || x >= $scope.lN || y < 0 || y >= $scope.lN) {
            return false;
        } else {
            return true;
        }
    }
	//获取坐标对应棋子颜色
	$scope.getCross = function(x, y) {
        return $scope.pieces[y * $scope.lN + x].pieces;
    }
	//分解x,y坐标
	$scope.coor1to2 = function(n) {
        return {
            x: n % $scope.lN,
            y: parseInt(n / $scope.lN)
        };
    }
	//转换坐标为index
	 $scope.coor2to1 = function(x, y) {
        return y * $scope.lN + x;
    }
	//判断是否是死棋
	 $scope.isDeath=function(x, y) {
        var color = $scope.getCross(x, y);
        if (!color) {
            return false;
        }
        var Q = new Array();
        var S = new Array($scope.lN * $scope.lN);
        var tmp = y * $scope.lN + x;
        Q.push(tmp);
        S[tmp] = true;
        while (Q.length > 0) {
            var coor = $scope.coor1to2(Q.shift());
            for (var i in delta) {
                var nx = coor.x + delta[i][0];
                var ny = coor.y + delta[i][1];
                if (!$scope.isInBoard(nx, ny)) {
                    continue;
                }
                if (!$scope.getCross(nx, ny)) {
                    return false;
                }
                if ($scope.getCross(nx, ny) == color) {
                    var tmp = $scope.coor2to1(nx, ny);
                    if (S[tmp] == undefined) {
                        S[tmp] = true;
                        Q.push(tmp);
                    }
                }
            }
        }
        return true;
    }
	//提子
	$scope.removeDeath = function(x, y) {
        var color = $scope.getCross(x, y);
        if (!color) {
            return false;
        }
        var count = 0;
        var Q = new Array();
        ser.setPoint(x, y,null);
        $scope.gameInfo["color"+color]--;
        $scope.pieces[$scope.coor2to1(x,y)].status=0;
        Q.push($scope.coor2to1(x, y));
        while (Q.length > 0) {
            count++;
            var coor = $scope.coor1to2(Q.shift());
            for (var i in delta) {
                var nx = coor.x + delta[i][0];
                var ny = coor.y + delta[i][1];
                if (!$scope.isInBoard(nx, ny)) {
                    continue;
                }
                if ($scope.getCross(nx, ny) == color) {
                	$scope.gameInfo['color'+color]--;
                    ser.setPoint(nx, ny, null);
                    $scope.pieces[$scope.coor2to1(nx,ny)].status=0;
//                   $scope.pieces[$scope.coor2to1(nx,ny)].step=null;
                    Q.push($scope.coor2to1(nx, ny));
                }
            }
        }
        return count;
    }
	//判断一个空点的归属
	$scope.belong=function(x,y){
		var Q = new Array();
        var S = new Array($scope.lN * $scope.lN);
        var tmp = y * $scope.lN + x;
        var beColoe=null;
		Q.push(tmp);
        S[tmp] = true;
        while (Q.length > 0) {
            var coor = $scope.coor1to2(Q.shift());
            for (var i in delta) {
                var nx = coor.x + delta[i][0];
                var ny = coor.y + delta[i][1];
                if (!$scope.isInBoard(nx, ny)) {
                    continue;
                }
                if($scope.getCross(nx,ny)&&$scope.pieces[$scope.coor2to1(nx,ny)].status!=4){
                	if(beColoe==null){
                		beColoe=$scope.getCross(nx, ny);
                	}else if(beColoe!=$scope.getCross(nx, ny)){
                		return false;
                	}
                }else{
                	var tmp = $scope.coor2to1(nx,ny);
                	if (S[tmp] == undefined) {
                        S[tmp] = true;
                        Q.push(tmp);
                    }
                }
            }
        }
        return beColoe;
	}
	//获取所有空点的归属
	$scope.getBlong=function(){
		$scope.gameInfo.publicNum=0;
		$scope.gameInfo.area1=0;
		$scope.gameInfo.area2=0;
		angular.forEach($scope.pieces,function(v,k){
			if(v.status==0||v.status==4){
				var coor=$scope.coor1to2(k);
				var c=$scope.belong(coor.x,coor.y);
				if(!c){
					$scope.gameInfo.publicNum++;
				}else{
					$scope.gameInfo['area'+c]++;
				}
			}
		});
	}
	//点目
	$scope.rectify=function(x,y){
		if($scope.pieces[$scope.coor2to1(x,y)].status!=1&&$scope.pieces[$scope.coor2to1(x,y)].status!=4){
			return false;
		}
		var Q = new Array();
        var S = new Array($scope.lN * $scope.lN);
        var tmp = y * $scope.lN + x;
        var color=$scope.getCross(x,y);
        var tarColor=(color%2)+1;
        var count=0;
		Q.push(tmp);
        S[tmp] = true;
        if($scope.pieces[$scope.coor2to1(x,y)].status==4){
        	count--;
        	$scope.pieces[$scope.coor2to1(x,y)].active=null;
        	$scope.pieces[$scope.coor2to1(x,y)].status=1;
        }else{
        	count++;
        	$scope.pieces[$scope.coor2to1(x,y)].active=1;
            $scope.pieces[$scope.coor2to1(x,y)].status=4;
        }
        while (Q.length > 0) {
            var coor = $scope.coor1to2(Q.shift());
            for (var i in delta) {
                var nx = coor.x + delta[i][0];
                var ny = coor.y + delta[i][1];
                if (!$scope.isInBoard(nx, ny)) {
                    continue;
                }
                if($scope.getCross(nx, ny)&&$scope.getCross(nx,ny)==color&&!S[$scope.coor2to1(nx,ny)]){
                	if($scope.pieces[$scope.coor2to1(nx, ny)].status==4){
                		count--;
                		$scope.pieces[$scope.coor2to1(nx, ny)].active=null;
                		$scope.pieces[$scope.coor2to1(nx, ny)].status=1;
                	}else{
                		count++;
                		$scope.pieces[$scope.coor2to1(nx, ny)].active=1;
                		$scope.pieces[$scope.coor2to1(nx, ny)].status=4;
                	}
                }
                if(tarColor!=$scope.getCross(nx,ny)){
                	var tmp = $scope.coor2to1(nx,ny);
                	if (S[tmp] == undefined) {
                        S[tmp] = true;
                        Q.push(tmp);
                    }
                }
            }
        }
        if($scope.pieces[$scope.coor2to1(x,y)].status==4){
        	if($scope.lastCoord[$scope.lastCoord.length-1]){
        		var lastX=$scope.lastCoord[$scope.lastCoord.length-1].x.charCodeAt()-97;
				var lastY=$scope.lastCoord[$scope.lastCoord.length-1].y.charCodeAt()-97;
				$scope.pieces[$scope.lN*lastY+lastX].active=true;
        	}
        }
    	$scope.gameInfo['color'+color]-=count;
    	$scope.gameInfo['death'+color]+=count;
    	$scope.getBlong();
    	$scope.getResult();
	}
	$scope.piecesDeath=function(x,y){
		 ser.setPoint(x,y,null);
		 $scope.pieces[$scope.coor2to1(x, y)].status=2;
	}
	//计算游戏结果
	$scope.getResult=function(){
		var toW=$scope.gameInfo.color2+$scope.gameInfo.area2+$scope.gameInfo.publicNum/2-180.5;
		var toB=$scope.gameInfo.color1+$scope.gameInfo.area1+$scope.gameInfo.publicNum/2-180.5;
		var toWj=$scope.gameInfo.area2+$scope.gameInfo.death1+6.5;
		var toBj=$scope.gameInfo.area1+$scope.gameInfo.death2;
		$scope.gameInfo.result={
			Chinese:{
				wWin:toW,
				bWin:toB
			},
			Japanese:{
				wWin:toWj-toBj,
				bWin:toBj-toWj
			}
		}
	}
	//重置棋盘
	$scope.reset=function(){
		$scope.gameInfo={
			death1:0,
			death2:0,
			color1:0,
			color2:0,
			publicNum:0,
			area1:0,
			area2:0
		};
		$scope.stopTime()
		$scope.time={
			c1:{
				num:0,
				show:"0:0"
			},
			c2:{
				num:0,
				show:"0:0"
			},
		}
		$scope.activeNow=1;
		$scope.setBoard=false;
		$scope.setBoardStep=false;
		$scope.positionNow=0;
		$scope.postData=[];
		$scope.cache=[]
		$scope.lastCoord=[];
		$scope.pieces=angular.copy($scope.piecesCopy);
	}
	//打开棋子颜色选择
	$scope.newGame=function(){
		$scope.change=false;
		$("#colorSelect").modal("show");
	}
	//改变颜色
	$scope.changeGame=function(){
		$scope.change=true;
		$("#colorSelect").modal("show");
	}
	//选中一种颜色
	$scope.select=function(){
		$scope.userSe.selfGame=false;
		$scope.applyCon=true;
		$scope.closeOther('step',true);
		$scope.applyCon=false;
		if((!$scope.userSe.b&&!$scope.userSe.w)||($scope.userSe.b&&$scope.userSe.w)){
			$scope.computer=null;
		}else{
			$scope.computer=$scope.userSe.b?2:1;
		}
		if(!$scope.change){
			$scope.reset();
			$scope.setTime($scope.activeNow);
		}
		$scope.getNewData();
		$("#colorSelect").modal("hide");
	}
	//观看电脑自对弈
	$scope.selfGame=function(){
		$scope.userSe.selfGame=true;
		$scope.applyCon=true;
		$scope.closeOther('step',true);
		$scope.applyCon=false;
		$scope.userSe.b=false;
		$scope.userSe.w=false;
		$scope.computer=null;
		if(!$scope.change){
			$scope.reset();
		}
		$("#colorSelect").modal("hide");
		$scope.getNewData();
	}
	$scope.piecesMouseOver=function(x,y){
		var i=$scope.coor2to1(x,y);
		if($scope.isDeath(x,y)||$scope.pieces[i].status!=0||$scope.rectifyOpen||$scope.pieces[i].territory){
//			$scope.pieces[i].css.opacity=0;
			return;
		}
		$scope.pieces[i].pieces=$scope.activeNow;
		$scope.pieces[i].css.opacity='0.5';
	}
	$scope.piecesMouseLeave=function(x,y){
		var i=$scope.coor2to1(x,y);
		if($scope.pieces[i].status!=0||$scope.pieces[i].territory){
//			$scope.pieces[i].css.opacity=0;
			return;
		}
		$scope.pieces[i].pieces=null
		if($scope.pieces[i].status!=3){
			$scope.pieces[i].css.opacity=0;
		}
	}
	//load一个sgf文件
	$scope.loadSgf=function(obj){
		ser.loadingWait();
		var files=obj.files[0];
		var dis=files.name.substring(files.name.lastIndexOf('.')+1,files.name.length);
		if(new RegExp(dis,'i').test('sgf')){
			var fo=new FileReader();
			fo.onload=function(){
				if(fo.result){
					$scope.reset();
					var d=fo.result.replace(/\s/g,"");
					var realData=$scope.getSgfData(d);
//					console.log(fo.result);
					$scope.$apply(function(){
						$scope.sgfHandler(realData);
					})
					ser.loadClose();
				}
				
			}
			fo.readAsText(files,'utf-8');
		}else{
			ser.loadClose('文件格式错误');
		}
	}
	$scope.sgfHandler=function(data){
		$scope.reset();
		$scope.setBoard=true;
		angular.forEach(data,function(v,k){
			if(v[0]=='A'){
				$scope.setBoardStep=true;
				var tem=v.split("A");
				tem.splice(0,1);
				for(var j in tem){
					$scope.activeNow=tem[j][0]=='B'?1:2;
					tem[j]=tem[j].substring(tem[j].indexOf("["),tem[j].length);
					for(var i=1;i<tem[j].length;i=i+4){
						var x=tem[j][i].charCodeAt()-97;
						var y=tem[j][i+1].charCodeAt()-97;
						$scope.Play(x,y,$scope.coor2to1(x,y));
						$scope.pieces[$scope.coor2to1(x,y)].step=($scope.cache.length-1)<0?1:$scope.cache.length+1;
					}
				}
				$scope.lastCoord.push(null);
				$scope.cache.push(angular.copy($scope.pieces));
				$scope.positionNow=($scope.cache.length-1)<0?0:$scope.cache.length-1;
			}else{
				$scope.setBoardStep=false;
				$scope.activeNow=v[0]=='B'?1:2;
				if(v[2].charCodeAt()<97||v[2].charCodeAt()>122){
					$scope.Play(null);
				}else{
					var x=v[2].charCodeAt()-97;
					var y=v[3].charCodeAt()-97;
					$scope.Play(x,y,$scope.coor2to1(x,y));
				}
			}
		});
		$scope.activeNow=$scope.activeNow%2;
		$scope.activeNow++;
		$scope.setBoard=false;
		$scope.setBoardStep=false;
	}
	$scope.getSgfData=function(data){
//		var dataCh=data.split(";");
		var dataCh=data.split("(;");
		dataCh.splice(0,1);
		dataCh=$scope.removeBranch(dataCh);
		if(dataCh[dataCh.length-1][dataCh[dataCh.length-1].length-1]==")"){
			dataCh[dataCh.length-1]=dataCh[dataCh.length-1].substring(0,dataCh[dataCh.length-1].length-1);
		}
		var realData=[];
		var firstData=$scope.haveInitSgf(dataCh[0]);
		if(firstData){
			realData.push(firstData);
		}
		dataCh.splice(0,1);
		realData=realData.concat(dataCh);
		return realData;
	}
	$scope.removeBranch=function(data){
		if(data.length==1){
			return data[0].split(";");
		}else{
			var re=[];
			re=re.concat(data[0].split(";"));
			data.splice(0,1);
			for(var i in data){
				if(data[i][data[i].length-1]!=")"){
					re=re.concat(data[i].split(";"));
				}else{
					var s=data[i].substring(0,data[i].length-1);
					re=re.concat(s.split(";"));
					break;
				}
			}
			return re;
		}
	}
	$scope.haveInitSgf=function(data){
		var realdata=null
		var firstP=null
		if(data.indexOf("AB")!=-1||data.indexOf("AW")!=-1){
			if(data.indexOf("AB")!=-1&&data.lastIndexOf("AB")!=data.indexOf("AB")){
				firstP=data.substring(data.lastIndexOf("AB")+2,data.lastIndexOf("AB")+6);
				realData=data.substring(data.indexOf("AB"),data.indexOf("AP"));
			}else if(data.indexOf("AW")!=-1&&data.lastIndexOf("AW")!=data.indexOf("AW")){
				firstP=data.substring(data.lastIndexOf("AW")+2,data.lastIndexOf("AW")+6);
				realData=data.substring(data.indexOf("AW"),data.indexOf("AP"));
			}
			realData=realData.substring(0,2)+firstP+realData.substring(2,realData.length);
			return realData;
		}else{
			return false;
		}
	}
	//棋盘控制（上一步，下一步等）
	$scope.boardCon=function(num){
		if(angular.isNumber(num)){
			if(num<0){
				$scope.positionNow=0;
			}else if(num>=$scope.cache.length){
				num=$scope.cache.length-1;
			}else{
				$scope.positionNow=num;
			}
			$scope.pieces=angular.copy($scope.cache[$scope.positionNow]);
			$scope.deathRepair($scope.positionNow);
			if($scope.lastCoord[$scope.positionNow]){
				var lastX=$scope.lastCoord[$scope.positionNow].x.charCodeAt()-97;
				var lastY=$scope.lastCoord[$scope.positionNow].y.charCodeAt()-97;
				$scope.activeNow=$scope.pieces[$scope.lN*lastY+lastX].pieces==1?2:1;
			}
		}
	}
	$scope.deathRepair=function(num){
		var c1=0,c2=0;
		for(var i=0;i<=num;i++){
			if($scope.lastCoord[i]){
				if($scope.lastCoord[i].take.color==1){
					c1+=$scope.lastCoord[i].take.num;
				}else{
					c2+=$scope.lastCoord[i].take.num;
				}
			}
		}
		$scope.gameInfo['death1']=c1;
		$scope.gameInfo['death2']=c2;
	}
	//悔棋
	$scope.undo=function(){
		if(!$scope.loading){
			var lastX=$scope.lastCoord[$scope.positionNow-2].x.charCodeAt()-97;
			var lastY=$scope.lastCoord[$scope.positionNow-2].y.charCodeAt()-97;
			if($scope.activeNow!=$scope.pieces[$scope.lN*lastY+lastX].pieces){
				$scope.boardCon($scope.positionNow-2);
			}
		}
	}
	$scope.menuCon=function(){
		if(!$scope.menu.active){
			$scope.openMenu();
		}else{
			$scope.closeMenu();
		}
	}
	//打开扩展菜单
	$scope.openMenu=function(){
		
		$scope.lab1Css={
			transform:"rotate(45deg) translateY(-2px)"
		}
		$scope.lab2Css={
			transform:"rotate(-45deg) translateY(2px)"
		}
		$scope.menu.css={
			display:"block"
		}
		$timeout(function(){
			$scope.menu.active=true;
		},50)
	}
	//关闭菜单
	$scope.closeMenu=function(){
		$scope.lab1Css={
			transform:"rotate(0deg) translateY(0px)"
		}
		$scope.lab2Css={
			transform:"rotate(0deg) translateY(0px)"
		}
		$scope.menu.active=false;
		$timeout(function(){
			$scope.menu.css={
				display:"none"
			}
		},50)
	}
	//打开点目
	$scope.countResult=function(){
//		$scope.closeGraph('',false,true);
		$scope.applyCon=true;
		$scope.closeOther('step',true);
		$scope.applyCon=false;
		$scope.closeMenu();
		$scope.resultCss.optionCss={
			transform:"rotate3d(0,1,0,90deg)"
		}
		$timeout(function(){
			$scope.resultCss.contentCss=null
			$scope.phoneCss={
				height:$(".phone .gameInfo").outerHeight()
			}
		},300)
		$scope.rectifyOpen=true;
		$scope.getBlong();
    	$scope.getResult();
	}
	//关闭点目
	$scope.returnMain=function(){
		$scope.resultCss.contentCss={
			transform:"rotate3d(0,1,0,90deg)"
		}
		$timeout(function(){
			$scope.resultCss.optionCss=null;
			$scope.phoneCss=null;
		},300)
		angular.forEach($scope.pieces,function(v,k){
			if(v.status==4){
				v.status=1
				v.active=null;
				$scope.gameInfo['color'+v.pieces]++;
    			$scope.gameInfo['death'+v.pieces]--;
			}
		});
		if($scope.lastCoord[$scope.lastCoord.length-1]){
    		var lastX=$scope.lastCoord[$scope.lastCoord.length-1].x.charCodeAt()-97;
			var lastY=$scope.lastCoord[$scope.lastCoord.length-1].y.charCodeAt()-97;
			$scope.pieces[$scope.lN*lastY+lastX].active=true;
    	}
		$scope.getBlong();
    	$scope.getResult();
		$scope.rectifyOpen=false;
	}
	//修改贴目
	$scope.modifyHandi=function(){
		$scope.handi.active=true;
		$timeout(function(){
			document.getElementById("handiInput").focus();
		},1);
		document.addEventListener("keydown",$scope.escAndEnter)
	}
	//修改贴目生效
	$scope.handiEffect=function(flag){
		if(flag){
			if($scope.handi.num){
				$scope.handi.oldNum=$scope.handi.num;
			}else{
				if($scope.handi.num!=0){
					$scope.handi.num=$scope.handi.oldNum;
					ser.errorHan("请输入有效的数字（正数或负数）",1)
				}else{
					$scope.handi.oldNum=$scope.handi.num;
				}
			}
		}else{
			$scope.handi.num=$scope.handi.oldNum;
		}
		$scope.handi.active=false;
		document.removeEventListener("keydown",$scope.escAndEnter);
	}
	$scope.escAndEnter=function(e){
		switch(e.keyCode){
			case 13:
				$scope.$apply(function(){
					$scope.handiEffect(true);
				})
				break;
			case 27:
				$scope.$apply(function(){
					$scope.handiEffect(false);
				})
				break;
		}
	}
	$scope.move=function(e){
		$scope.forecast.move=true;
		var e = event || window.event;
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        var x = e.pageX || e.clientX + scrollX;
        var y = e.pageY || e.clientY + scrollY;
//      console.log(x+","+y);
        $scope.forecast.coor={
        	x:x,
        	y:y
        }
        document.addEventListener('mouseup',$scope.moveOver);
	}
	
	$scope.moveOver=function(){
		$scope.forecast.move=false;
		 $scope.forecast.coor=null;
		 document.removeEventListener("mouseup",$scope.moveOver);
	}
	//移动元素
	document.addEventListener("mousemove",function(){
		if($scope.forecast.move){
			if($scope.forecast.coor){
				$scope.$apply(function(){
					var e = event || window.event;
			        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			        var x =(e.pageX || e.clientX + scrollX)- $scope.forecast.coor.x;
			        var y =(e.pageY || e.clientY + scrollY)- $scope.forecast.coor.y;
			        $scope.forecast.coor={
			        	x:(e.pageX || e.clientX + scrollX),
			        	y:(e.pageY || e.clientY + scrollY)
			        }
			        $scope.forecast.css.top+=y;
			        $scope.forecast.css.left+=x;
				})
			}
		}
	})
	//打开分析面板
	$scope.openAnalyze=function(){
		$scope.closeMenu();
		$scope.getAnalyze();
		$scope.forecast.active=true;
	}
	//更新分析数据
	$scope.getAnalyze=function(){
		var postData=$scope.getPostData();
		fac.getPn(postData).then(function(data){
			if(data){
				var dataObj=[];
				for(var i in data){
					var co=$scope.coor1to2(i);
					if(co.x>7){
						co.x+=1;
					}
					co.y=$scope.lN-co.y
					co.x=String.fromCharCode(co.x+65);
					dataObj.push({
						coor:co,
						val:data[i]
					})
				}
				dataObj.sort(function(a,b){
					return b.val-a.val;
				});
				dataObj.splice(12,dataObj.length-12);
				$scope.analyze.policy=dataObj;
				$scope.getForcast();
			}
		})
	}
	$scope.getForcast=function(){
		var postData=$scope.getPostData();
		postData=postData.substring(0,postData.length-1);
		var color=$scope.activeNow==1?"B":"W";
		for(var i=0;i<$scope.analyze.policy.length;i++){
			var x=angular.lowercase($scope.analyze.policy[i].coor.x);
			var y=String.fromCharCode($scope.lN-$scope.analyze.policy[i].coor.y+97);
			var d=postData+";"+color+"["+x+y+"])";
			$scope.getFive(d,i,function(data,s){
				if(data){
					$scope.analyze.policy[s].pv=data.join(",");
				}
//				console.log($scope.analyze.policy);
			})
		}
	}
	//获取未来5手棋
	$scope.getFive=function(postData,s,callfun){
		var flag=0;
		var d=[];
		var c=$scope.activeNow;
		get(postData,callfun);
		function get(postData,callfun){
			fac.getPn(postData).then(function(data){
				if(data){
					var dataObj=[];
					for(var i in data){
						var co=$scope.coor1to2(i);
						if(co.x>7){
							co.x+=1;
						}
						co.y=$scope.lN-co.y
						co.x=String.fromCharCode(co.x+65);
						dataObj.push({
							coor:co,
							val:data[i]
						})
					}
					dataObj.sort(function(a,b){
						return b.val-a.val;
					});
					d.push(dataObj[0].coor.x+dataObj[0].coor.y);
					flag++;
					if(flag>=5){
						callfun(d,s);
					}else{
						var rc=c==1?"B":"W";
						c=c%2+1
						var p=postData.substring(0,postData.length-1);
						var x=angular.lowercase(dataObj[0].coor.x);
						var y=String.fromCharCode($scope.lN-dataObj[0].coor.y+97);
						var p=p+";"+rc+"["+x+y+"])";
						get(p,callfun);
					}
				}
			})
		}
		
	}
	//对局研究
	$scope.situationSea=function(){
		var t=$("#boardBody").offset().top;
		var l=$("#boardBody").offset().left;
		$("#boardBody").css({
			transform:"translate(-"+l+"px,-"+t+"px)",
			padding:"20px"
		})
	}
	window.onresize=function(){
		$scope.$apply(function(){
			$scope.canvasRsize=$("#board").outerWidth();
			$scope.per=($scope.canvasRsize/$scope.boardAttr.boardSize).toFixed(2);
			$scope.boardHeight=$("#boardBody").outerHeight();
			$scope.screenWidth=window.screen.width;
			if($scope.screenWidth<=1200&&$scope.screenWidth>768){
				$scope.mdCon=1;
			}else{
				$scope.mdCon=0;
			}
		})
	}
	document.addEventListener("mousedown",function(e){
		if($(e.target).attr("data-mark")!="navMark"&&!$(e.target).parents(".navMark").length){
			$scope.closeMenu();
		}
	})
	$("[data-toggle='tooltip']").tooltip();
	$("body").removeClass("onloadHide");
	$scope.bodyWidth=document.body.clientWidth;
	$scope.bodyHeight=document.body.clientHeight;
	$scope.forecast={
		active:false,
		move:false,
		coor:null,
		css:{
			top:50,
			left:0
		}
	}
}])

