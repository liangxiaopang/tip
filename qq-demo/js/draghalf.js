function getByClass(classname,parent){
	var opar=parent?document.getElementById(parent):document,
	eles=[],
	elesnode=opar.getElementsByTagName("*");
	// console.log(elesnode);
	for (var i = 0; i < elesnode.length; i++) {
		if(elesnode[i].className==classname){
			eles.push(elesnode[i]);
		}
	}
		return eles;
}
window.onload=drag;
function drag(){
	var otit=getByClass('login_logo_webqq','loginPanel')[0];
	otit.addEventListener('mousedown',fnDown);
	// otit.onmousedown=fnDown;
	// document.addEventListener("mouseup",function(){
	// 	document.removeEventListener('mousedown',fnDown)
	// })

}
function fnDown(e){

		var loginPanel=document.getElementById('loginPanel'),
			distX=e.clientX-loginPanel.offsetLeft,
			distY=e.clientY-loginPanel.offsetTop;
			document.onmousemove=function(e){
				fnmove(e,distX,distY);
			}
		
		// document.addEventListener('mousemove',function(e){
		//     fnmove(e,distX,distY);
		// });
			document.onmouseup=function(){
				document.onmousemove=null;
				document.onmouseup=null;
			}
		

}
function fnmove(e,distX,distY){
	var loginPanel=document.getElementById('loginPanel');
			var x=e.clientX-distX,
				y=e.clientY-distY,
				winH=window.innerHeight,
				winW=window.innerWidth,
				maxH=winH-loginPanel.offsetHeight,
				maxW=winW-loginPanel.offsetWidth;
				if(x<0){x=0}
					else if(x>maxW){x=maxW}
				if(y<0){y=0}
					else if(y>maxH){y=maxH}
			loginPanel.style.left=x+'px';
			loginPanel.style.top=y+'px';

}



