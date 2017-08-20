if(!TESTING)
{
    System.Link("StyleSheet", System.GetUrl("Themes/Default/WebIM.css"), "text/css");
}

var Controls = null;
var Window = null, Control = null, RichEditor = null;

function init(completeCallback, errorCallback)
{
    function LoadModulesComplete()
    {
        Controls = System.GetModule("Controls.js");
        CommonDialog = System.GetModule("CommonDialog.js");

        Window = System.GetModule("Window.js").Window;
        Control = System.GetModule("Controls.js").Control;
        
        RichEditor = System.GetModule("RichEditor.js").RichEditor;

        _init(completeCallback, errorCallback);
    }

    System.LoadModules(
        LoadModulesComplete,
        errorCallback,
        ["Window.js", "Controls.js", "RichEditor.js"]
    );
}

function _init(completeCallback, errorCallback)
{
    try
    {
        //初始化代码，初始化完成后必须调用completeCallback;
        completeCallback();
    }
    catch (ex)
    {
        errorCallback(new Exception(ex.mame, ex.message));
    }
}



function dispose(completeCallback, errorCallback)
{
    _dispose(completeCallback, errorCallback);
}

function _dispose(completeCallback, errorCallback)
{
    try
    {
        //卸载代码，卸载完成后必须调用completeCallback;
        completeCallback();
    }
    catch (ex)
    {
        errorCallback(new Exception(ex.mame, ex.message));
    }
}

//共享全局变量和函数，在此定义的变量和函数将由该应用程序的所有实例共享

var MessageFormat=
"<div class='message'>" + 
    "<div class='messageTitle'>" + 
        "<span class='sender'>{0}</span>" + 
        "<span class='time'>{1}</span>" + 
    "</div>" + 
    "<div class='messageContent'>{2}</div>" + 
"</div><br/>";

//格式化数字
function FormatNumber(num, length)
{
    var s = num.toString();
    var zero = "";
    for (var i = 0; i < length - s.length; i++) zero += "0";
    return zero + s;
}

//时间转字符串
function DateToString(date)
{
    return String.format("{0}-{1}-{2} {3}:{4}:{5}", FormatNumber(date.getFullYear(), 4), FormatNumber(date.getMonth() + 1, 2), FormatNumber(date.getDate(), 2), FormatNumber(date.getHours(), 2), FormatNumber(date.getMinutes(), 2), FormatNumber(date.getSeconds(), 2));
}

function Application()
{
    var CurrentApplication = this;
    var m_MainForm = null;
    
    //应用程序全局对象;
        

    this.Start = function(baseUrl)
    {
        //应用程序入口;
        var user = arguments[1];
        var peer = arguments[2];
        
        function StartChat(user, peer)
        {
            var form = new ChatForm(user, peer);
            form.MoveEx("center", 0, 0);
            form.Show();
        }
        
        function GetUser_OnClose()
        {
            if (guform.GetResult() == false) return;
        
            user = guform.GetUser();
            peer = guform.GetPeer();
        
            StartChat(user, peer);
        
        }
        
        if (user == undefined || peer == undefined)
        {
            var guform = new GetUserForm();
            guform.OnClosed.Attach(GetUser_OnClose);
            guform.MoveEx("center", 0, -100);
            guform.Show();
        }
        else
        {
            StartChat(user, peer);
        }
    }

    this.Terminate = function(completeCallback, errorCallback)
    {
        try
        {
            //应用程序终止，退出系统时用系统调用;
            completeCallback();
        }
        catch (ex)
        {
            errorCallback(new Exception(ex.mame, ex.message));
        }
    }
    function MainForm()
    {
        var This = this;
        var OwnerForm = this;
        
        var config = {"Left":0,"Top":0,"Width":400,"Height":300,"AnchorStyle":Controls.AnchorStyle.Left | Controls.AnchorStyle.Top,"Parent":null,"Css":"window","BorderWidth":6,"HasMinButton":true,"HasMaxButton":true,"Resizable":true,"Title":{"InnerHTML":"主窗口"}};
        
    
        Window.call(This, config);
    
        var Base = {
            GetType: This.GetType,
            is: This.is
        };
    
        This.GetType = function() { return "MainForm"; }
        This.is = function(type) { return type == This.GetType() ? true : Base.is(type); }
    
    
        var m_Task = null;
        if(config.HasMinButton)
        {
            m_Task=Taskbar.AddTask(This,IsNull(config.Title.InnerHTML,""));
            This.OnClosed.Attach(
                function()
                {
                    Taskbar.RemoveTask(m_Task);
                }
            );
        }
        
    }

}



function ChatPanel(config)
{
    var This = this;
    var OwnerForm = this;
    
config.Css = "MainWnd";
    
    var width = config.Width, height = config.Height;
    config.Width=490;
    config.Height=493;

    Control.call(This, config);

    var Base = {
        GetType: This.GetType,
        is: This.is
    };

    This.GetType = function() { return "ChatPanel"; }
    This.is = function(type) { return type == This.GetType() ? true : Base.is(type); }
    
    var m_MsgPanel_Config={"Left":0,"Top":0,"Width":490,"Height":268,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Right|Controls.AnchorStyle.Top|Controls.AnchorStyle.Bottom,"Parent":This,"Text":"","Css":"control"};
    
            
    
    var m_MsgPanel = new MsgPanel(m_MsgPanel_Config);
    
    

    
    var m_MsgEditor_Config={"Left":0,"Top":273,"Width":490,"Height":187,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Right|Controls.AnchorStyle.Bottom,"Parent":This,"Text":"","Css":"control"};
    
            m_MsgEditor_Config.BorderWidth = 1;
            m_MsgEditor_Config.Css = "richEditor";
    
    var m_MsgEditor = new MsgEditor(m_MsgEditor_Config);
    
    

    
    var m_BtnSend = new Controls.Button({"Left":408,"Top":466,"Width":81,"Height":26,"AnchorStyle":Controls.AnchorStyle.Right|Controls.AnchorStyle.Bottom,"Parent":This,"Text":"发送","Css":"button_default"});
    
    
    
    m_BtnSend.OnClick.Attach(
        function(btn)
        {
            var data = {
                Sender: m_User,
                Receiver: m_Peer,
                Content: m_MsgEditor.GetValue()
            };
            
            m_MsgPanel.AddMessage(data);
            m_MsgEditor.SetValue("");
            
            function Send_Error(ex)
            {
                alert(ex);
            }
            
            function Send_Callback(xml, text)
            {
                var message = System.ParseJson(text);
            }
            
            System.Post(Send_Callback, Send_Error, "send.aspx", System.RenderJson(data));
        }
    )
    
    This.Resize(width,height);

    Controls.CreateHorizSplit(m_MsgPanel, m_MsgEditor, false);
    
    var m_User = config.User;
    var m_Peer = config.Peer;
    
    var m_From = new Date(0);
    var m_ErrorCount = 0;
    
    function Receive()
    {
        var data = {
            Receiver: m_User,
            Sender: m_Peer,
            From: m_From
        };
    
        function Receive_Error(ex)
        {
            alert(ex);
            m_ErrorCount++;
            if (m_ErrorCount < 5)
            {
                setTimeout(Receive, 1000);
            }
        }
    
        function Receive_Callback(xml, text)
        {
            m_ErrorCount = 0;
            var ret = System.ParseJson(text);
            for (var i in ret.Messages)
            {
                m_MsgPanel.AddMessage(ret.Messages[i]);
            }
            if (ret.Messages.length > 0)
            {
                m_From = ret.Messages[ret.Messages.length - 1].CreatedTime;
            }
            setTimeout(Receive, 50);
        }
    
        System.Post(Receive_Callback, Receive_Error, "recevie.aspx", System.RenderJson(data));
    }
    
    Receive();

}




function MsgPanel(config)
{
    var This = this;
    var OwnerForm = this;
    
config.BorderWidth = 1;
config.Css = "MsgPanel";
    
    var width = config.Width, height = config.Height;
    config.Width=200;
    config.Height=200;

    Controls.Frame.call(This, config);

    var Base = {
        GetType: This.GetType,
        is: This.is
    };

    This.GetType = function() { return "MsgPanel"; }
    This.is = function(type) { return type == This.GetType() ? true : Base.is(type); }
    
    This.Resize(width,height);

    This.AddMessage = function(msg)
    {
        var msgDiv = This.GetDocument().createElement("DIV");
        msgDiv.className = "message";
        msgDiv.innerHTML = String.format(MessageFormat, msg.Sender, DateToString(msg.CreatedTime == undefined ? new Date() : msg.CreatedTime), msg.Content);
        This.GetDocument().body.appendChild(msgDiv);
        //msgDiv.scrollIntoView();
        This.GetDocument().body.scrollTop = This.GetDocument().body.scrollHeight;
        msgDiv = null;
    }
    
    This.Link("StyleSheet", (BaseDirectory == "" ? "": BaseDirectory + "/") + "Themes/Default/EditorCss.css", "text/css");

}

function GetUserForm()
{
    var This = this;
    var OwnerForm = this;
    
    var config = {"Left":17,"Top":34,"Width":332,"Height":144,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Top,"Parent":null,"Css":"window","BorderWidth":6,"HasMinButton":false,"HasMaxButton":false,"Resizable":false,"Title":{"InnerHTML":"用户名"}};
    

    Window.call(This, config);

    var Base = {
        GetType: This.GetType,
        is: This.is
    };

    This.GetType = function() { return "GetUserForm"; }
    This.is = function(type) { return type == This.GetType() ? true : Base.is(type); }
    
    var label1 = new Controls.Label({"Left":9,"Top":19,"Width":78,"Height":14,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Top,"Parent":This,"Text":"你的用户名：","Css":"label"});
    
    

    
    var m_User = new Controls.TextBox({"Left":96,"Top":14,"Width":216,"Height":22,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Top,"Parent":This,"Text":"","Css":"textbox","BorderWidth":1});
    
    

    
    var label3 = new Controls.Label({"Left":10,"Top":52,"Width":82,"Height":14,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Top,"Parent":This,"Text":"对方用户名：","Css":"label"});
    
    

    
    var m_Peer = new Controls.TextBox({"Left":96,"Top":47,"Width":215,"Height":22,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Top,"Parent":This,"Text":"","Css":"textbox","BorderWidth":1});
    
    

    
    var button5 = new Controls.Button({"Left":214,"Top":79,"Width":96,"Height":26,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Top,"Parent":This,"Text":"开始会话","Css":"button_default"});
    
    
    
    button5.OnClick.Attach(
        function(btn)
        {
            if (m_User.GetText() == "")
            {
                alert("请输入您的用户名！");
                return;
            }
            if (m_Peer.GetText() == "")
            {
                alert("请输入对方用户名！");
                return;
            }
            m_Result = true;
            This.Close();
        }
    )
    

    var m_Task = null;
    if(config.HasMinButton)
    {
        m_Task=Taskbar.AddTask(This,IsNull(config.Title.InnerHTML,""));
        This.OnClosed.Attach(
            function()
            {
                Taskbar.RemoveTask(m_Task);
            }
        );
    }
    var m_Result = false;
    
    This.GetResult = function()
    {
        return m_Result;
    }
    
    This.GetUser = function()
    {
        return m_User.GetText();
    }
    
    This.GetPeer = function()
    {
        return m_Peer.GetText();
    }
    
    This.SetAcceptButton(button5);
}




function MsgEditor(config)
{
    var This = this;
    var OwnerForm = this;
    
config.StyleSheet = (BaseDirectory == "" ? "": BaseDirectory + "/") + "Themes/Default/EditorCss.css";
    
    var width = config.Width, height = config.Height;
    config.Width=200;
    config.Height=200;

    RichEditor.call(This, config);

    var Base = {
        GetType: This.GetType,
        is: This.is
    };

    This.GetType = function() { return "MsgEditor"; }
    This.is = function(type) { return type == This.GetType() ? true : Base.is(type); }
    
    This.Resize(width,height);

    

}

function ChatForm()
{
    var This = this;
    var OwnerForm = this;
    
    var config = {"Left":11,"Top":8,"Width":508,"Height":495,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Top,"Parent":null,"Css":"window","BorderWidth":6,"HasMinButton":true,"HasMaxButton":true,"Resizable":true,"Title":{"InnerHTML":"Form1"}};
    config.Title.InnerHTML = String.format("与 \"{0}\" 交谈中", arguments[1]);

    Window.call(This, config);

    var Base = {
        GetType: This.GetType,
        is: This.is
    };

    This.GetType = function() { return "ChatForm"; }
    This.is = function(type) { return type == This.GetType() ? true : Base.is(type); }
    
    var m_ChatPanel_Config={"Left":7,"Top":7,"Width":482,"Height":452,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Right|Controls.AnchorStyle.Top|Controls.AnchorStyle.Bottom,"Parent":This,"Text":"","Css":"control"};
    
            m_ChatPanel_Config.User = arguments[0];
            m_ChatPanel_Config.Peer = arguments[1];
    
    var m_ChatPanel = new ChatPanel(m_ChatPanel_Config);
    
    
    

    var m_Task = null;
    if(config.HasMinButton)
    {
        m_Task=Taskbar.AddTask(This,IsNull(config.Title.InnerHTML,""));
        This.OnClosed.Attach(
            function()
            {
                Taskbar.RemoveTask(m_Task);
            }
        );
    }
    
}

