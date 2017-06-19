function getByClass(classname,parent){
	var opar=parent?document.getElementById(parent):document,
	eles=[],
	elesnode=opar.getElementsByTagName("*");
	for (var i = 0; i < elesnode.length; i++) {
		if(elesnode[i].className==classname){
			eles.push(elesnode[i]);
		}
	}
		return eles;}
window.onload=drag;
function drag(){
	var otit=getByClass('login_logo_webqq','loginPanel')[0];
	otit.addEventListener('mousedown',fnDown);
	// otit.removeEventListener('mousedown',fnDown)
	// document.addEventListener('mouseup',function(e){
	// 			e.stopPropagation();
	// 			var loginPanel=document.getElementById('loginPanel');
	// 			var ll=e.clientX,lt=e.clientY;
	// 			loginPanel.style.left=ll;
	// 			loginPanel.style.top=lt;
	// 			console.log(ll,lt);
	// 			otit.removeEventListener('mousedown',fnDown);
	// })
	document.addEventListener("mouseup",function(){
		otit.removeEventListener('mousedown',fnDown)
	})

}
function fnDown(e){
	e.stopPropagation();
		var loginPanel=document.getElementById('loginPanel'),
				distX=e.clientX-loginPanel.offsetLeft,
				distY=e.clientY-loginPanel.offsetTop;
			// document.addEventListener('mousemove',function(e){
			// 	fn(e,distX,distY)});	
			document.addEventListener('mousemove',fn(e,distX,distY)
				);
			// document.removeEventListener('mousemove',fn(e,distX,distY)); 
			// document.addEventListener('mouseup',function(e){
			// 	console.log(e)
			// document.removeEventListener('mousemove',fn(e,distX,distY));
			// });
}
function fn(e,distX,distY){
				return function(e){
					var x=e.clientX-distX,
				loginPanel=document.getElementById('loginPanel'),
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
				// document.addEventListener('mouseup',function(e){
				// console.log(e)
				this.removeEventListener('mousemove',fn(e,distX,distY));
					// });
				};
				
			
		}
// function fn(e,distX,distY){
// 	var loginPanel=document.getElementById('loginPanel');
// 			var x=e.clientX-distX,
// 				y=e.clientY-distY,
// 				winH=window.innerHeight,
// 				winW=window.innerWidth,
// 				maxH=winH-loginPanel.offsetHeight,
// 				maxW=winW-loginPanel.offsetWidth;
	
// 				if(x<0){x=0}
// 					else if(x>maxW){x=maxW}
// 				if(y<0){y=0}
// 					else if(y>maxH){y=maxH}
// 			loginPanel.style.left=x+'px';
// 			loginPanel.style.top=y+'px';
// }




