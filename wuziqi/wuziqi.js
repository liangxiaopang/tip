var canvas=document.getElementById('chess');
var chessboard=[];
for (var i = 0; i < 15; i++) {
	chessboard[i]=[];
	for (var j = 0; j< 15; j++) {
	chessboard[i][j]=0;
	// 这里是0,不是[];
	};
}

var me=false;
if(canvas.getContext){
	var ctx=canvas.getContext('2d');
	// 先定义颜色,再填充 否则不生效
	ctx.strokeRect(15,15,420,420);
	var drawchessboard=function(){
		for (var i = 0; i < 14; i++) {
		ctx.strokeStyle='#333';
		ctx.moveTo(15,45+30*i);
		ctx.lineTo(435,45+30*i);
		ctx.moveTo(45+30*i,15);
		ctx.lineTo(45+30*i,435);
		ctx.stroke();
	}
	}
	var onestep=function(i,j,me){
		ctx.beginPath();
		ctx.arc(15+i*30+2,15+j*30-2,13,0,2*Math.PI);
		var gradient=ctx.createRadialGradient(15+i*30+2,15+j*30-2,13,15+i*30+2,15+j*30-2,0);
		if(me){
			gradient.addColorStop(0,'#0a0a0a');
			gradient.addColorStop(1,'#636766');
		}else{
			gradient.addColorStop(0,'#d1d1d1');
			gradient.addColorStop(1,'#f9f9f9');
		}
		ctx.fillStyle=gradient;
		// 这里没有引号;
		ctx.fill();
	}
	drawchessboard();
	canvas.onclick=function(e){
		var x=e.offsetX;
		var y=e.offsetY;
		var i=Math.floor(x/30);
		var j=Math.floor(y/30);
		if(chessboard[i][j]===0){
		onestep(i,j,me);	
		if(me){chessboard[i][j]=1}
		else{chessboard[i][j]=2}
		me=!me;
		}
		
	};


}
