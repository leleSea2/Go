angular.module("index",['common'])
.filter("active",function(){
	return function(i,j){
		console.log(i);
		console.log(j);
		if(i==j){
			return true;
		}else{
			return false
		}
	}
})
.factory('fac',function(){
	var f={
		drawLine:function(start,end,ctx,option){
			if(option){
				for(var i in option){
					ctx[i]=option[i];
				}
			}
			ctx.beginPath();
			ctx.moveTo(start.x,start.y);
			ctx.lineTo(end.x,end.y);
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
		getPoint:function(data,block){
			var k=[];
			var s=[];
			for(var i=0;i<19;i++){
				s=[];
				for(var j=0;j<19;j++){
						s[j]={
							x:j+1,
							y:i+1,
							pieces:null,
							css:{
								top:(i+1)*block-block/2+"px",
								left:(j+1)*block-block/2+"px",
								width:block+"px",
								height:block+"px"
							}
						}
						k[i]=s;
				}
			}
			s=[];
			angular.forEach(data,function(val){
				var s={
					x:f.transformInt(val.x)-64,
					y:val.y,
					pieces:val.pieces
				}
				k[val.y-1][f.transformInt(val.x)-65]=s;
			})
			return k;
		}
	};
	return f
})
.filter("color",function(){
	return function(f){
		if(f=='1'){
			return "blackPlaier";
		}else{
			return "whitePlaier"
		}
	}
})
.controller("indexCon",function($scope,$timeout,$filter,fac,commonFac,$location,$anchorScroll){
	$scope.boardOp={
		lineNum:19,//线条数
		block:25,//每格宽高
		margin:25//预留外边距
	}
	$scope.cache=[]//存储盘面
	$scope.activeNow=1;//当前棋子颜色（1：黑色，其他：白色）
	$scope.lastestPieces='';
	$scope.lastCoord=[];
	$scope.boardSize=$scope.boardOp.lineNum*$scope.boardOp.block+$scope.boardOp.margin;
	$scope.canvas=angular.element("#GoBody").find('canvas')[0];
	$scope.ctx=$scope.canvas.getContext('2d');
	$scope.ctx.strokeStyle='#333';
	$scope.ctx.fillStyle="#333";
	$scope.ctx.lineWidth=1;
	$timeout(function(){
		for(var i=0,j=$scope.boardOp.lineNum,k=65;i<$scope.boardOp.lineNum;i++,j--,k++){
			//横线
			fac.drawLine(
				{x:$scope.boardOp.margin,y:$scope.boardOp.block*i+$scope.boardOp.margin},
				{x:$scope.boardSize-$scope.boardOp.margin,y:$scope.boardOp.block*i+$scope.boardOp.margin},
				$scope.ctx
			)
			//竖线
			fac.drawLine(
				{x:$scope.boardOp.block*i+$scope.boardOp.margin,y:$scope.boardOp.margin},
				{x:$scope.boardOp.block*i+$scope.boardOp.margin,y:$scope.boardSize-$scope.boardOp.margin},
				$scope.ctx
			)
			//文字
			$scope.ctx.strokeText(String.fromCharCode(k),$scope.boardOp.block*i+$scope.boardOp.margin,$scope.boardOp.margin-5);
			$scope.ctx.strokeText(j,5,$scope.boardOp.block*i+$scope.boardOp.margin);
			if(i==3||i==9||i==15){
				$scope.ctx.beginPath();
				$scope.ctx.arc($scope.boardOp.block*3+$scope.boardOp.margin,$scope.boardOp.block*i+$scope.boardOp.margin,2,0,Math.PI*2);
				$scope.ctx.fill();
				$scope.ctx.beginPath();
				$scope.ctx.arc($scope.boardOp.block*9+$scope.boardOp.margin,$scope.boardOp.block*i+$scope.boardOp.margin,2,0,Math.PI*2);
				$scope.ctx.fill();
				$scope.ctx.beginPath();
				$scope.ctx.arc($scope.boardOp.block*15+$scope.boardOp.margin,$scope.boardOp.block*i+$scope.boardOp.margin,2,0,Math.PI*2);
				$scope.ctx.fill();
			}
		}
	},1);
	commonFac.getStaticData("data/content.json")
	.then(function(data){
		$scope.pieces=fac.getPoint(data,$scope.boardOp.block);
	})
	//更换棋子颜色
	$scope.changePlay=function(i,j){
		if($scope.pieces[i-1][j-1].pieces!=null){
			return;
		}
		if($scope.lastCoord.length){
			var li=$scope.lastCoord[$scope.lastCoord.length-1].i;
			var lj=$scope.lastCoord[$scope.lastCoord.length-1].j;
			$scope.pieces[li][lj].active=false;
		}
		$scope.lastCoord.push({i:i-1,j:j-1});
		$scope.lastestPieces=String(i)+String(j);
		$scope.cache.push(angular.copy($scope.pieces));
		$scope.pieces[i-1][j-1].pieces=$scope.activeNow;
		$scope.pieces[i-1][j-1].active=true;
		$scope.activeNow++
		$scope.activeNow=$scope.activeNow%2;
	}
//	$scope.$on('changePlay',function(e,j,i){
//		$scope.cache.push(angular.copy($scope.pieces));
//		$scope.pieces[i][j].pieces=$scope.activeNow;
//		$scope.activeNow++
//		$scope.activeNow=$scope.activeNow%2;
//	})
	//悔棋
	$scope.returnLast=function(){
		if($scope.cache.length){
			$scope.activeNow++
			$scope.activeNow=$scope.activeNow%2;
			$scope.pieces=angular.copy($scope.cache[$scope.cache.length-1]);
			$scope.cache.splice($scope.cache.length-1,1);
			var li=$scope.lastCoord[$scope.lastCoord.length-1].i;
			var lj=$scope.lastCoord[$scope.lastCoord.length-1].j;
			$scope.pieces[li][lj].active=false;
			$scope.lastCoord.splice($scope.lastCoord.length-1,1);
			if($scope.lastCoord.length){
				li=$scope.lastCoord[$scope.lastCoord.length-1].i;
				lj=$scope.lastCoord[$scope.lastCoord.length-1].j;
				$scope.pieces[li][lj].active=true;
			}
		}
	}
})
.directive("goPieces",function(fac,$filter){
	return {
		restrict:"E",
		templateUrl:"component/pieces.html",
		replace:true,
		scope:true,
		controller:function($scope){},
		link:function($scope,obj,attr){
//			$scope.boardOp={
//				lineNum:19,//线条数
//				block:25,//每格宽高
//				margin:25//预留外边距
//			}
			$scope.data={
				x:fac.transformInt(attr.x)-64,
				y:attr.y,
				pieces:attr.pieces
			}
			var boards=$scope.boardOp.lineNum*$scope.boardOp.block+$scope.boardOp.block;
			var size=$scope.boardOp.block;
			if($scope.data.pieces){
				$scope.class=$filter('color')($scope.data.pieces);
			}else{
				$scope.class="none";
			}
			$scope.css={
				top:(boards-$scope.data.y*size)-size/2+"px",
				left:$scope.data.x*size-size/2+"px",
				width:size+"px",
				height:size+"px",
			}
			$scope.piecesClick=function(x,y){
				$scope.class=$filter('color')($scope.activeNow);
				$scope.$emit("changePlay",fac.transformInt(x)-65,y-1)
			}
		}
	}
})
















