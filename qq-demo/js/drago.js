function getByClass(classname, parent) {
    var opar = parent ? document.getElementById(parent) : document,
        eles = [],
        elesnode = opar.getElementsByTagName("*");
    for (var i = 0; i < elesnode.length; i++) {
        if (elesnode[i].className == classname) {
            eles.push(elesnode[i]);
        }
    }
    return eles;
}
window.onload = drag;

function drag() {
    window.otit = getByClass('login_logo_webqq', 'loginPanel')[0];
    otit.addEventListener('mousedown',fnDown);
    var s=6;
    // console.log(this);
    // console.log(_this);
}
function fnDown(e) {
    var loginPanel = document.getElementById('loginPanel');
    this.distX = e.clientX - loginPanel.offsetLeft;
    this.distY = e.clientY - loginPanel.offsetTop;
    var _this = this;
    this.fnO = function (e) {
        fn.call(_this, e)
        // console.log(this);
        // console.log(_this);
    };
    this.fnT = function () {
        up.call(_this)
        // console.log(this);
        // console.log(_this);
    };
    // console.log(this);//this是otit.这一对很好理解,因为fnDown函数是被otit调用,所以this指向
    // console.log(_this);//_this也是otit.调用者.在这个函数提里面_this=this.而且_this被锁定
    document.addEventListener('mousemove', otit.fnO);
    document.addEventListener('mouseup', otit.fnT)
}
function fn(e) {

    var x = e.clientX - this.distX,
        loginPanel = document.getElementById('loginPanel'),
        y = e.clientY - this.distY,
        winH = window.innerHeight,
        winW = window.innerWidth,
        maxH = winH - loginPanel.offsetHeight,
        maxW = winW - loginPanel.offsetWidth;

    if (x < 0) {
        x = 0
    }
    else if (x > maxW) {
        x = maxW
    }
    if (y < 0) {
        y = 0
    }
    else if (y > maxH) {
        y = maxH
    }
    loginPanel.style.left = x + 'px';
    loginPanel.style.top = y + 'px';
        // console.log(this);
        // console.log(_this);


}

function up() {
    document.removeEventListener('mousemove', otit.fnO);
    document.removeEventListener('mouseup', otit.fnT);
    console.log(this);
    // console.log(_this);
}