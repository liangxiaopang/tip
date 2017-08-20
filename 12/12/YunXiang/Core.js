
var Version = "1.0.1.0";
var LoginPage = null;
var System = null;
var Desktop = null;
var Taskbar = null;
var OutputPanel = null;
//数组转对象的自执行方法,此时params变成了窗口链接的后面部分组成的对象
var Params = (function()
{
	var pairs = window.location.search.substr(1, window.location.search.length - 1).split("&");
	var params = {};
	for (var i in pairs)
	{
		var vs = pairs[i].split("=");
		params[vs[0]] = vs[1];
	}
	return params;
})();

function Break()
{
}

function Delegate()
{
	var all = [];

	var This = this;

	This.Call = function()
	{
		var ret = null;
		for (var index in all)
		{
			ret = all[index].apply(This, arguments);
		}
		return ret;
	}

	This.Attach = function(func)
	{
		all.push(func);
	}

	This.Detach = function(func)
	{
		var index = 0;
		for (index in all)
		{
			if (all[index] == func) break;
		}
		if (index < all.length)
		{
			delete all[index];
			all.splice(index, 1);
		}
	}
}

function IsNull(val, alt)
{
	return (val == undefined || val == null) ? alt : val;
}

function Exception(name, msg)
{
	this.Name = name;
	this.Message = msg;

	this.toString = function()
	{
		return name + ":" + msg;
	}
}

String.format = function(fmt)
{
	var params = arguments;
	var pattern = /{{|{[1-9][0-9]*}|\x7B0\x7D/g;
	return fmt.replace(
		pattern,
		function(p)
		{
			if (p == "{{") return "{";
			return params[parseInt(p.substr(1, p.length - 2), 10) + 1]
		}
	);
}

function System_Ctor()
{
	this.OnLoad = new Delegate();
	this.OnUnload = new Delegate();

	var ua = navigator.userAgent.toLowerCase();

	var m_Browser = "";
	if ((/msie ([\d.]+)/).test(ua)) m_Browser = "IE";
	else if ((/firefox\/([\d.]+)/).test(ua)) m_Browser = "Firefox";
	else if ((/chrome\/([\d.]+)/).test(ua)) m_Browser = "Chrome";

	var This = this;

	var BaseUrl = "";
	var m_Count = 0;

	var m_Modules = {};
	var m_ModulesArray = [];

	var m_Applications = [];

	var m_Language = "zh-CHS";

	var m_ModuleCtorFormat =
	"\r\n" +
	"var Module=this;\r\n" +
	"var TESTING={3};\r\n" +
	"Module.DirectoryName='{0}';\r\n" +
	"Module.FileName='{1}';\r\n" +
	"Module.GetResourceUrl=function(relativePath)\r\n" +
	"{\r\n" +
	"	return System.GetUrl(Module.DirectoryName+'/'+relativePath);\r\n" +
	"};\r\n" +
	"\r\n" +
	"{2}\r\n" +
	"Module.Initialize=(typeof(init)=='undefined'?null:init);\r\n" +
	"Module.Dispose=(typeof(dispose)=='undefined'?null:dispose);\r\n" +
	"Module.Application=(typeof(Application)=='undefined'?null:Application);\r\n";

	var m_ParseBaseDate = new Date(1970, 0, 1, 0, 0, 0);

	var ParseContructors = {
		Date: function(value)
		{
			var val = new Date();
			val.setTime(value + m_ParseBaseDate.getTime());
			return val;
		},
		Exception: function(value)
		{
			return new Exception(value.Name, value.Message);
		}
	};

	function ParseJson(str, contructors)
	{
		try
		{
			var val = JSON.parse(
				str,
				function(key, value)
				{
					if (value != null && typeof value == "object" && value.__DataType != undefined)
					{
						if (ParseContructors[value.__DataType] != undefined)
						{
							return ParseContructors[value.__DataType](value.__Value);
						}
						else if (contructors != undefined && contructors[value.__DataType] != undefined)
						{
							return contructors[value.__DataType](value.__Value);
						}
						else
						{
							return value;
						}
					}
					else
					{
						return value;
					}
				}
			);
		}
		catch (ex)
		{
			throw ex;
		}
		return val;
	}

	function RenderJson(val)
	{
		if (val == null)
		{
			return null
		}
		else if (val.constructor == Array)
		{
			var builder = [];
			builder.push("[");
			for (var index in val)
			{
				if (index > 0) builder.push(",");
				builder.push(System.RenderJson(val[index]));
			}
			builder.push("]");
			return builder.join("");
		}
		else if (val.constructor == Object)
		{
			var builder = [];
			builder.push("{");
			var index = 0;
			for (var key in val)
			{
				if (index > 0) builder.push(",");
				builder.push(String.format("\"{0}\":{1}", key, System.RenderJson(val[key])));
				index++;
			}
			builder.push("}");
			return builder.join("");
		}
		else if (val.constructor == Boolean)
		{
			return val.toString();
		}
		else if (val.constructor == Number)
		{
			return val.toString();
		}
		else if (val.constructor == String)
		{
			return String.format('"{0}"', System.TransferCharForJavascript(val));
		}
		else if (val.constructor == Date)
		{
			return String.format('{"__DataType":"Date","__Value":{0}}', val.getTime() - m_ParseBaseDate.getTime());
		}
		else if (val.RenderJson != undefined)
		{
			return val.RenderJson();
		}
	}

	function CreateHttpRequest()
	{
		var request = null;
		if (window.XMLHttpRequest)
		{
			request = new XMLHttpRequest();
		}
		else if (window.ActiveXObject)
		{
			request = new ActiveXObject("Microsoft.XMLHttp");
		}
		return request;
	}

	function FormatNumber(num, length)
	{
		var s = num.toString();
		var zero = "";
		for (var i = 0; i < length - s.length; i++) zero += "0";
		return zero + s;
	}

	function GenerateUniqueId()
	{
		m_Count++;
		return 'ID' + FormatNumber(m_Count, 6);
	}

	function RequestText(callback, errorCallback, xmlUrl)
	{
		var request = CreateHttpRequest();
		if (request)
		{
			var url = xmlUrl;
			request.open("GET", url, true);
			request.onreadystatechange = function()
			{
				if (request.readyState == 4)
				{
					try
					{
						switch (request.status)
						{
							case 200:
								callback(request.responseText);
								break;
							default:
								if (errorCallback) errorCallback(new Exception("Server Error", request.statusText));
						}
					}
					catch (ex)
					{
						errorCallback(new Exception(ex.name, ex.message));
					}
					finally
					{
						request = null;
					}
				}
			}
			request.send(null);
		}
	}

	function Post(callback, errorCallback, url, data, contentType)
	{
		var request = CreateHttpRequest();
		if (request)
		{
			var dataStr = '';
			if (data.constructor == Object)
			{
				for (var k in data)
				{
					if (dataStr != "") dataStr += "&";
					dataStr += (k + "=" + escape(data[k]));
				}
			}
			else
			{
				dataStr = data.toString();
			}
			request.open("POST", url, true);
			request.setRequestHeader('Content-Type', IsNull(contentType, 'application/x-www-form-urlencoded'))
			request.setRequestHeader("Cache-Control", "no-cache")
			request.onreadystatechange = function()
			{
				if (request.readyState == 4)
				{
					try
					{
						switch (request.status)
						{
							case 200:
								callback(request.responseXML, request.responseText);
								break;
							default:
								if (errorCallback) errorCallback(new Exception("Server Error", request.statusText));
						}
					}
					finally
					{
						request = null;
					}
				}
			}
			request.send(dataStr);
		}
		return request;
	}

	function StyleTag(e)
	{
		this.SetCss = function(css)
		{
			if (System.GetBrowser() == "IE")
			{
				e.cssText = css;
			}
			else
			{
				e.textContent = css;
			}
		}
	}

	function CreateStyle(css)
	{
		var e = null;
		if (System.GetBrowser() == "IE")
		{
			e = document.createStyleSheet();
			e.cssText = css;
		}
		else
		{
			e = document.createElement("style");
			e.type = "text/css"
			e.textContent = css;
			var hs = document.getElementsByTagName("head");
			if (hs.length > 0) hs[0].appendChild(e);
		}
		return new StyleTag(e);
	}

	function GetUrl(path)
	{
		return encodeURI(BaseUrl + "/" + path);
	}

	function LoadModules(completeCallback, errorCallback, paths, index)
	{
		if (index == undefined) index = 0;
		var path = "System/" + paths[index];
		var moduleId = path.toUpperCase();
		var module = null;
		
		if (m_Modules[moduleId] == null)
		{
			RequestText(request_complete, error_callback, GetUrl(path));
		}
		else
		{
			load_complete();
		}
		
		function error_callback(ex)
		{
			OutputPanel.Write("error", String.format("Load \"{0}\"", path), ex.Message);
			errorCallback(ex);
		}

		function request_complete(text)
		{
			var module_ctor = new Function(
				String.format(m_ModuleCtorFormat, System.Path.GetDirectoryName(path), path, text, false)
			);
			
			module = new module_ctor();
			
			if (module.Initialize != null)
			{
				module.Initialize(init_complete, error_callback);
			}
			else
			{
				init_complete();
			}
		}
		
		function init_complete()
		{
			if (m_Modules[moduleId] == null)
			{
				m_Modules[moduleId] = module;
				m_ModulesArray.push(module);
			}
			OutputPanel.Write("success", String.format("Load \"{0}\"", path));
			load_complete();
		}

		function load_complete()
		{
			if (index == paths.length - 1)
			{
				completeCallback();
			}
			else
			{
				LoadModules(completeCallback, errorCallback, paths, index + 1);
			}
		}
	}

	function GetModule(path)
	{
		var moduleId = "SYSTEM/" + path.toUpperCase();
		return m_Modules[moduleId];
	}

	var m_TestCss = {};

	function Test(file, code, css)
	{
		var base = System.Path.GetDirectoryName(file);

		if (css != undefined)
		{
			if (m_TestCss[file.toUpperCase()] != undefined)
			{
				m_TestCss[file.toUpperCase()].SetCss(css);
			}
			else
			{
				m_TestCss[file.toUpperCase()] = CreateStyle(css);
			}
		}

		var args = []

		args.push(base);
		for (var index = 3; index < arguments.length; index++)
		{
			args.push(arguments[index])
		}

		var task = Taskbar.AddTask(null, "正在加载...");
		task.Shine(false);

		var module_ctor = new Function(
			String.format(m_ModuleCtorFormat, base, file, code, true)
		);

		var module = new module_ctor();

		if (module.Initialize != null)
		{
			module.Initialize(complete, error);
		}
		else
		{
			complete();
		}
		
		function complete()
		{
			Taskbar.RemoveTask(task);
			if (module.Application != null)
			{
				var instance = new Application(module.Application, file, module);
				try
				{
					instance.Start.apply(instance, args);
				}
				catch (ex)
				{
					alert(ex);
				}
			}
		}

		function error(msg)
		{
			Taskbar.RemoveTask(task);
			alert(msg);
		}
	}

	function Exec(callback, errorCallback, path)
	{
		var args = []
		var split = path.lastIndexOf("/");
		if (split == -1) split = 0;
		args.push(path.substring(0, split));
		for (var index = 3; index < arguments.length; index++)
		{
			args.push(arguments[index])
		}

		var task = null;
		if (GetModule(path) == null)
		{
			task = Taskbar.AddTask(null, "正在加载...");
			task.Shine(false);
		}

		try
		{
			LoadModules(complete, error, [path])
		}
		catch (ex)
		{
			if (task != null) Taskbar.RemoveTask(task);
			errorCallback(ex);
		}

		function complete()
		{
			if (task != null) Taskbar.RemoveTask(task);

			if (callback != null) callback();
			var app = GetModule(path);
			if (app.Application != null)
			{
				var instance = new Application(app.Application, path);
				try
				{
					instance.Start.apply(instance, args);
				}
				catch (ex)
				{
					alert(ex);
				}
			}
		}

		function error(msg)
		{
			if (task != null) Taskbar.RemoveTask(task);
			errorCallback(msg);
		}
        console.log(2)
	}

	function Application(base_ctor, fileName, disposeModlue)
	{
		base_ctor.call(this);

		var id = m_Applications.length;
		m_Applications.push(this);

		this.Dispose = function()
		{
			m_Applications[id] = null;
			if (disposeModlue != undefined) disposeModlue.Dispose(function() { }, alert);
		}

		this.GetResourceUrl = function(relativePath)
		{
			return Module.GetResourceUrl(relativePath);
		}
	}

	function Invoke(completeCallback, errorCallback, objs, asynMethod, continueIfError, completeOneCallback)
	{
		function callOne(index)
		{
			var obj = objs[index];
			if (obj[asynMethod] != null)
			{
				try
				{
					obj[asynMethod].call(obj, complete, function(ex) { error(ex, obj); });
				}
				catch (ex)
				{
					error(ex, obj);
				}
			}
			else
			{
				complete();
			}
			function complete()
			{
				if (completeOneCallback != undefined) completeOneCallback(obj);
				if (index == objs.length - 1) completeCallback(); else callOne(index + 1);
			}
			function error(msg, o)
			{
				errorCallback(msg, o);
				if (!continueIfError || index == objs.length - 1) completeCallback(); else callOne(index + 1);
			}
		}
		if (objs.length > 0) callOne(0); else completeCallback();
	}

	function Call(completeCallback, errorCallback, funcs, caller, continueIfError, completeOneCallback)
	{
		function callOne(index)
		{
			var func = funcs[index];
			if (func != null)
			{
				try
				{
					func.call(caller, complete, error);
				}
				catch (ex)
				{
					error(ex);
				}
			}
			else
				complete();
			function complete()
			{
				if (completeOneCallback != undefined) completeOneCallback(obj);
				if (index == funcs.length - 1) completeCallback(); else callOne(index + 1);
			}
			function error(msg)
			{
				errorCallback(msg);
				if (!continueIfError || index == funcs.length - 1) completeCallback(); else callOne(index + 1);
			}
		}
		if (objs.length > 0) callOne(0); else completeCallback();
	}

	function GetLanguage()
	{
		return m_Language;
	}

	function GetBrowser()
	{
		return m_Browser;
	}

	function Dispose(completeCallback, errorCallback)
	{
		function fail(ex, m)
		{
			OutputPanel.Write("error", String.format("Dispose \"{0}\"", m.FileName), ex.Message);
			errorCallback(ex);
		}

		var as = [];
		for (var i in m_Applications)
		{
			if (m_Applications[i] != null) as.push(m_Applications[i]);
		}
		as.reverse();
		Invoke(completeDisposeApps, fail, as, "Terminate", true);

		function completeDisposeApps()
		{
			m_ModulesArray.reverse();
			Invoke(completeCallback, fail, m_ModulesArray, "Dispose", true, completeOneCallback);
			function completeOneCallback(m)
			{
				OutputPanel.Write("success", String.format("Dispose \"{0}\"", m.FileName));
			}
		}
	}

	var m_Initizlize = false;

	function Initialize(config, callback)
	{
		if (m_Initizlize)
		{
			if (callback != undefined) callback();
			return;
		}
		//创建输出Panel
		/*OutputPanel = (function()
		{
			var obj = {};

			var m_Output = document.createElement("DIV");
			m_Output.className = "loading_output";
			document.body.appendChild(m_Output);

			var m_ErrMsgFormt =
			"<table style='width:100%;'>" +
				"<tr><td class='text'>{0}</td><td class='fail'>[FAIL]</div></td></tr>" +
				"<tr><td class='fail_msg' colspan='2'>{1}</td></tr>" +
			"</table>";

			var m_SuccessMsgFormat=
			"<table cellspacing='0' style='width:100%;'>" +
				"<tr><td class='text'>{0}</td><td class='success'>[ OK ]</td></tr>" +
			"</table>"

			obj.Show = function()
			{
				m_Output.style.display = 'block';
			}

			obj.Hide = function()
			{
				m_Output.style.display = 'none';
			}

			obj.Write = function(type, msg, errmsg)
			{
				var text = (type == "success" ? String.format(m_SuccessMsgFormat, msg) : String.format(m_ErrMsgFormt, msg, errmsg));

				var msgDiv = document.createElement("DIV");
				msgDiv.innerHTML = text;
				msgDiv.className = 'message';
				m_Output.appendChild(msgDiv);
				msgDiv = null;
			}

			obj.Clear = function()
			{
				m_Output.innerHTML = "";
			}

			return obj;
		})();*/
		
		OutputPanel = (function()
		{
			var obj = {};

			obj.Show = function()
			{
			}

			obj.Hide = function()
			{
			}

			obj.Write = function(type, msg, errmsg)
			{
			}

			obj.Clear = function()
			{
			}

			return obj;
		})();

		//IE6中允许背景图片缓存
		if (m_Browser == "IE")
		{
			try
			{
				document.execCommand("BackgroundImageCache", false, true);
			}
			catch (ex)
			{
			}
		}

		//禁用右键(INPUT和TEXTAREA除外)
		if (DEBUG)
		{
			document.oncontextmenu = function(evt)
			{
				if (evt == undefined) evt = event;

				var target = null;
				if (evt.target != undefined) target = evt.target;

				else if (evt.srcElement != undefined) target = evt.srcElement;
				if (target.tagName != undefined && (target.tagName.toUpperCase() == 'INPUT' || target.tagName.toUpperCase() == 'TEXTAREA'))
				{
					return true;
				}
				else
				{
					return false;
				}
			}

			//禁用所有div的选取
			document.onselectstart = function(evt)
			{
				if (evt == undefined) evt = event;
				var target = null;
				if (evt.target != undefined) target = evt.target;
				else if (evt.srcElement != undefined) target = evt.srcElement;
				if (target.tagName != undefined && target.tagName.toUpperCase() != 'DIV')
				{
					return true;
				}
				else
				{
					return false;
				}
			}
		}
		if (config.Language != undefined) m_Language = config.Language;

		BaseUrl = System.Path.GetDirectoryName(window.location.href) + (BaseDirectory == "" ? "" : "/" + BaseDirectory);

		LoadModules(
			function()
			{
				Desktop = System.GetModule(DesktopModlue).Desktop;
				Taskbar = System.GetModule(DesktopModlue).Taskbar;

				OutputPanel.Hide();

				This.OnLoad.Call();

				if (DEBUG)
				{
					if (Solution != null)
					{
						//调试时启动工程Solution
						System.Exec(function() { }, alert, "Developer.js", Solution);
					}
					else
					{
						//调试时启动开发工具
						System.Exec(function() { }, alert, "Developer.js");
					}
				}

				if (!DEBUG)
				{
					if (Start != null)
					{
						System.Exec(function() { }, alert, Start);
					}
				}
				
				m_Initizlize = true;
				
				if(callback != undefined)
				{
					callback();
				}
			},
			alert,
			["Controls.js", "Window.js", DesktopModlue]
		);
	}

	function Shutdown()
	{
		System.OnUnload.Call();
		OutputPanel.Clear();
		OutputPanel.Show();
		Desktop.SetVisible(false);
		Taskbar.SetVisible(false);
		System.Dispose(Dispose_Complete, alert);
	}

	function Dispose_Complete()
	{
		window.onbeforeunload = null;
		if (LoginPage != null) window.location = LoginPage;
	}

	this.Initialize = Initialize;

	this.Shutdown = Shutdown;

	this.GetBrowser = GetBrowser;

	this.RequestText = RequestText;
	this.Post = Post;

	this.GenerateUniqueId = GenerateUniqueId;
	this.GetLanguage = GetLanguage;
	this.GetUrl = GetUrl;

	this.Exec = Exec;
	this.Test = Test;

	this.LoadModules = LoadModules;
	this.GetModule = GetModule;
	this.Dispose = Dispose;

	this.Invoke = Invoke;
	this.Call = Call;

	this.ParseJson = ParseJson;
	this.RenderJson = RenderJson;
}

System = new System_Ctor();

System.Object = function()
{
	this.GetType = function()
	{
		return "System.Object";
	}

	this.is = function(typeName)
	{
		return typeName == this.GetType();
	}
}

System.Clone = function(val)
{
	if (val == null)
	{
		return null
	}
	else if (val.constructor == Array)
	{
		var a = new Array()
		for (i in val)
		{
			a[i] = System.Clone(val[i])
		}
		return a
	}
	else if (val.constructor == Object)
	{
		var a = new Object()
		for (c in val)
		{
			a[c] = System.Clone(val[c])
		}
		return a
	}
	else if (val.constructor == Number)
	{
		return val
	}
	else if (val.constructor == String)
	{
		return val
	}
	else if (val.constructor == Date)
	{
		return val
	}
	else
	{
		return val;
	}
}

System.TransferCharForXML = function(str)
{
	var res = str.replace(
		/&|\x3E|\x3C|\x5E|\x22|\x27|[\x00-\x1F]|\t/g,
		function(s)
		{
			var ascii = s.charCodeAt(0)
			return "&#" + ascii.toString(10) + ";";
		}
	)
	return res;
}

System.TransferCharForJavascript = function(s)
{
	var newStr = s.replace(
		/[\x26\x27\x3C\x3E\x0D\x0A\x22\x2C\x5C\x00]/g,
		function(c)
		{
			ascii = c.charCodeAt(0)
			return '\\u00' + (ascii < 16 ? '0' + ascii.toString(16) : ascii.toString(16))
		}
	);
	return newStr;
}

System.DisableSelect = function(elem, disableChildren)
{
	if (disableChildren == undefined) disableChildren = false;

	if (System.GetBrowser() == "IE")
	{
		if (elem.setAttribute != undefined) elem.setAttribute("unselectable", "on");

		if (disableChildren)
		{
			for (var i = 0; i < elem.childNodes.length; i++)
			{
				System.DisableSelect(elem.childNodes[i], true);
			}
		}
	}
}

System.GetButton = function(evt)
{
	if ((evt.which != undefined && evt.which == 1) || evt.button == 1)
		return "Left";
	else if ((evt.which != undefined && evt.which == 3) || evt.button == 2)
		return "Right"
	else
		return "";
}

System.DetachChildNodes = function(node)
{
	var nodes = [];
	if (!System.IsTextNode(node))
	{
		for (var i = 0; i < node.childNodes.length; i++)
		{
			nodes.push(node.childNodes[i]);
		}

		for (var i = 0; i < nodes.length; i++)
		{
			node.removeChild(nodes[i]);
		}

	}
	return nodes;
}

System.IsTextNode = function(node)
{
	return node.innerHTML == undefined;
}

function _ClearHtml(builder, node)
{
	for (var i = 0; i < node.childNodes.length; i++)
	{
		var n = node.childNodes[i];
		if (System.IsTextNode(n))
		{
			if (n.textContent) builder.push(n.textContent);
			else if (n.nodeValue) builder.push(n.nodeValue);
		}
		else
		{
			_ClearHtml(builder, n);
		}
	}
}

System.ClearHtml = function(node)
{
	var builder = [];
	_ClearHtml(builder, node);
	return builder.join("");
}

System.AttachEvent = function(elem, evtName, handler)
{
	if (elem.attachEvent)
	{
		elem.attachEvent("on" + evtName, handler);
	}
	else if (elem.addEventListener)
	{
		elem.addEventListener(evtName, handler, false);
	}
}

System.DetachEvent = function(elem, evtName, handler)
{

	if (elem.detachEvent)
	{
		elem.detachEvent("on" + evtName, handler);
	}
	else if (elem.addEventListener)
	{
		elem.removeEventListener(evtName, handler, false);
	}
}

System.GetClientCoord = function(obj)
{
	if (obj.getBoundingClientRect != undefined)
	{
		var bodyRect = document.body.getBoundingClientRect();
		var rect = obj.getBoundingClientRect();
		return { X: rect.left - bodyRect.left, Y: rect.top - bodyRect.top };
	}
	else
	{
		if (System.GetBrowser() == "IE")
		{
			var offsetParent = obj.offsetParent;
			if (offsetParent == null)
			{
				return { X: obj.offsetLeft, Y: obj.offsetTop };
			}
			else
			{
				var offset = System.GetClientCoord(offsetParent);
				return { X: obj.offsetLeft + offset.X, Y: obj.offsetTop + offset.Y };
			}
		}
		else
		{
			var offsetParent = obj.offsetParent;
			if (offsetParent == null)
			{
				return { X: obj.offsetLeft, Y: obj.offsetTop };
			}
			else
			{
				var offset = System.GetClientCoord(offsetParent);
				var coord = { X: offsetParent.clientLeft + obj.offsetLeft + offset.X, Y: offsetParent.clientTop + obj.offsetTop + offset.Y };
				return coord;
			}
		}
	}
}

System.PreventDefault = function(evt)
{
	if (evt.preventDefault != undefined)
	{
		evt.preventDefault();
	}
	else
	{
		evt.returnValue = false;
	}
}

System.CancelBubble = function(evt)
{
	if (evt && evt.stopPropagation) evt.stopPropagation();
	else evt.cancelBubble = true;
}

System.GetTarget = function(evt)
{
	if (evt.target != undefined) return evt.target;
	if (evt.srcElement != undefined) return evt.srcElement;
	return null;
}

System.Path = {};

System.Path.GetRelativePath = function(parent, sub)
{
	if (parent.length > sub.length) return null;

	parentPath = parent.toUpperCase();
	subPath = sub.toUpperCase();

	if (parentPath == subPath) return "";
	var index = subPath.indexOf(parentPath);
	if (index == 0 && subPath.charAt(parentPath.length) == '/')
	{
		return sub.substr(parentPath.length + 1, subPath.length - parentPath.length);
	}
	else
	{
		return null;
	}

}

System.Path.GetFileName = function(fullName)
{
	var index = fullName.lastIndexOf("/")
	var name = (index == -1 ? fullName : fullName.substring(index + 1, fullName.length));
	return name;
}

System.Path.GetFileExtension = function(fullName)
{
	var index = fullName.lastIndexOf(".")
	var ext = (index == -1 ? "" : fullName.substring(index, fullName.length));
	return ext;
}

System.Path.GetDirectoryName = function(fullName)
{
	var index = fullName.lastIndexOf("/")
	switch (index)
	{
	case -1:
		return null;
	case 0:
		return "/";
	default:
		return fullName.substring(0, index);
	}
}

System.Path.GetFileNameNoExtention = function(fullName)
{
	var index = fullName.lastIndexOf("/")
	var name = (index == -1 ? fullName : fullName.substring(index + 1, fullName.length));
	index = name.lastIndexOf(".");
	return index == -1 ? name : name.substring(0, index);
}

System.Path.Join = function()
{
	var path = "";
	for (var i = 0; i < arguments.length; i++)
	{
		if (arguments[i] != undefined && arguments[i] != null && arguments[i] != "")
		{
			if (arguments[i].charAt(arguments[i].length - 1) != '/') path += '/';
			path += arguments[i];
		}
	}
	return path;
}

System.Link = function(rel, href, type)
{
	var e = document.createElement("link");
	e.rel = rel
	e.type = type
	e.href = href;
	var hs = document.getElementsByTagName("head");
	if (hs.length > 0) hs[0].appendChild(e);
	return e;
}

System.StartChat = function(user, peer)
{
	System.Initialize(
		{},
		function()
		{
            console.log(1)
			System.Exec(function(){}, function(){}, "WebIM.js", user, peer);

		}
	);
}