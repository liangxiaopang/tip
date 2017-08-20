
var DEBUG = false;
var DesktopModlue = "Desktop.js";
var Start = null;
var BaseDirectory = "YunXiang";

function window_onload()
{
	//System.Initialize({});
}

if (document.attachEvent)
{
	window.attachEvent("onload", window_onload);
}
else if (document.addEventListener)
{
	window.addEventListener("load", window_onload, false);
}