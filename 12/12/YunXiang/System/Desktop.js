
var Control=null;
var AnchorStyle=null;
var Window = null;
var Controls=null;

var Config = { };

function init(completeCallback,errorCallback)
{
	System.LoadModules(
		function()
		{
			Controls = System.GetModule("Controls.js");

			Window = System.GetModule("Window.js").Window;

			Control = System.GetModule("Controls.js").Control;
			AnchorStyle = System.GetModule("Controls.js").AnchorStyle;

			DocumentPanel = new DocumentPanelCtor();
			Module.Desktop = new DesktopCtor();
			Module.Taskbar = new TaskbarCtor();

			completeCallback();
		},
		errorCallback,
		["Controls.js", "Window.js"]
	);
}

function dispose(competeCallback,errorCallback)
{
	try
	{
		competeCallback();
	}
	catch(ex)
	{
		errorCallback(ex);
	}
}

function TransferCharForJavascript(s)
{
	newStr=s.replace(
		/[\x26\x27\x3C\x3E\x0D\x0A]/g,
		function(c)
		{
			ascii=c.charCodeAt(0);
			return '\\u00'+(ascii<16?'0'+ascii.toString(16):ascii.toString(16));
		}
	);
	return newStr;
}

function DocumentPanelCtor()
{
    var This=this;
    var config={
        Parent:null,
        Left:0,
        Top:0,
        Width:document.documentElement.clientWidth,
        Height:document.documentElement.clientHeight,
        Css:"",
        IsAbstract: true
    }
    
    Control.call(This,config);
    
    var Base={
        GetType:This.GetType,
        is:This.is
    }
    
    This.is=function(type){return type==this.GetType()?true:Base.is(type);}
    This.GetType = function() { return "DocumentPanel"; }

    window.onresize = function()
    {
    	var width = (document.documentElement.clientWidth > 600) ? document.documentElement.clientWidth : 800;
    	var height = (document.documentElement.clientHeight > 450) ? document.documentElement.clientHeight : 600;
    	This.Resize(width, height);
    }

    document.documentElement.onscroll = function(evt)
    {
		This.Move(document.documentElement.scrollLeft,document.documentElement.scrollTop);
    }
    
    document.body.appendChild(This.GetDom());
}

function DesktopCtor()
{
    var This=this;

    var config={
        Parent:DocumentPanel,
        Left:0,
        Top:0,
        Width:DocumentPanel.GetWidth(),
        Height:DocumentPanel.GetHeight(),
        Css:"desktop",
        AnchorStyle:AnchorStyle.All,
        IsAbstract: true
    }
    
    Control.call(This,config);
    var Base={
        GetType:This.GetType,
        is:This.is
    }
    
    This.is=function(type){return type==this.GetType()?true:Base.is(type);}
    This.GetType = function() { return "Desktop"; }
    
    This.GetDom().style.position = "fixed";

    var m_MoveDiv = document.createElement("DIV");
    m_MoveDiv.style.position = "absolute";
    m_MoveDiv.style.display = 'none';
    m_MoveDiv.style.zIndex = '100000';
    m_MoveDiv.style.left = '0px';
    m_MoveDiv.style.top = '0px';
    m_MoveDiv.className = 'moveBackground';
    m_MoveDiv.setAttribute("unselectable", "on");
	
	This.GetDom().appendChild(m_MoveDiv);
   
    This.GetDom().onscroll=function()
    {
		var dom=This.GetDom();
		if(dom.scrollLeft>0 || dom.scrollTop >0)
		{
			dom.scrollLeft=0;
			dom.scrollTop=0;
		}
    }
    
    var m_Items = {};
	
	This.EnterMove=function(cursor)
	{
		m_MoveDiv.style.width=This.GetWidth()+'px';
		m_MoveDiv.style.height=This.GetHeight()+'px';
		m_MoveDiv.style.display='block';
		System.DisableSelect(m_MoveDiv, true);
		m_MoveDiv.style.cursor = (cursor == undefined ? "default" : cursor);
	}
	
	This.LeaveMove=function()
	{
		m_MoveDiv.style.display='none';
	}
    
    This.AddWindow=function(wnd)
    {
		This.AddControl(wnd);
    }
    
    This.RemoveWindow=function(wnd)
    {
		This.RemoveControl(wnd);
    }
}

function TaskbarItem(dialog, title)
{
	var This = this;

	this.title = function(newTitle)
	{
	}

	this.SetText = function(text)
	{
	}

	this.Shine = function(highlight)
	{
	}
}

function TaskbarCtor()
{      
    var This=this;

    var items = {};
	
	this.AddTask=function(dialog,title)
	{
		var item = new TaskbarItem();
		items[System.GenerateUniqueId()] = item;
		return item;
	}
	
	this.RemoveTask=function(item)
	{
		for(var k in items)
		{
			if(items[k]==item)
			{
				delete items[k];
				break;
			}
		}
	}
}
	
var MoveVar=null;

function body_onmousemove(evt)
{
	if(MoveVar!=null)
	{
		if(evt==undefined) evt=event;
		MoveVar.Object.scrollLeft=MoveVar.PreScrollLeft-(evt.clientX-MoveVar.PreClientX);
	}
}

function body_onmouseup(evt)
{
	MoveVar=null;
}

if(document.attachEvent)
{
	document.attachEvent(
		"onmousemove",
		function(evt)
		{
			if(evt==null) evt=window.event;
			body_onmousemove(evt);
		}
	);
	document.attachEvent(
		"onmouseup",
		function(evt)
		{
			if(evt==null) evt=window.event;
			body_onmouseup(evt);
		}
	);
}
else if(document.addEventListener)
{
	document.addEventListener(
		"mousemove",
		function(evt)
		{
			if(evt==null) evt=window.event;
			return body_onmousemove(evt);
		},
		false
	)
	document.addEventListener(
		"mouseup",
		function(evt)
		{
			if(evt==null) evt=window.event;
			return body_onmouseup(evt);
		},
		false
	)
}