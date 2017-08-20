if(!TESTING)
{
    System.Link("StyleSheet", "Themes/Default/webim_bk.css", "text/css");
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
var User, Peer;

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
        var guform = new GetUserForm();
        
        function GetUser_OnClose()
        {
            if (guform.GetResult() == false) return;
        
            User = guform.GetUser();
            Peer = guform.GetPeer();
        
            var form = new Window({
                Left: 0,
                Top: 0,
                Width: 800,
                Height: 600,
                Parent: null,
                Css: "window",
                BorderWidth: 6,
                HasMinButton: true,
                HasMaxButton: true,
                Title: {
                    InnerHTML: "调试"
                }
            });
        
            m_MainForm = new MainWnd({
                Left: 0,
                Top: 0,
                Width: form.GetClientWidth(),
                Height: form.GetClientHeight(),
                Parent: form,
                AnchorStyle: Controls.AnchorStyle.All,
                Css: "mainwnd"
            });
        
            form.OnClosed.Attach(
            function()
            {
                CurrentApplication.Dispose();
            });
        
            form.MoveEx("center", 0, 0);
            form.Show();
        }
        
        guform.OnClosed.Attach(GetUser_OnClose);
        guform.MoveEx("center", 0, -100);
        guform.Show();
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
    

    
    function MainWnd(config)
    {
        var This = this;
        var OwnerForm = this;
        
config.Css = "MainWnd";
        
        var width = config.Width, height = config.Height;
        config.Width=484;
        config.Height=476;
    
        Control.call(This, config);
    
        var Base = {
            GetType: This.GetType,
            is: This.is
        };
    
        This.GetType = function() { return "MainWnd"; }
        This.is = function(type) { return type == This.GetType() ? true : Base.is(type); }
        
        var tab1 = new Controls.SimpleTabControl({"Left":0,"Top":0,"Width":484,"Height":476,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Right|Controls.AnchorStyle.Top|Controls.AnchorStyle.Bottom,"Parent":This,"Text":"","Css":"simple_tab","Tabs":[{"Text":"聊天","Width":80,"ID":"ID000020","IsSelected":true}],"BorderWidth":1});
        
        
        
        tab1.OnSelectedTab.Attach(
            function(index,preIndex)
            {
                
            }
        )

        
        var m_MsgPanel_Config={"Left":5,"Top":5,"Width":472,"Height":231,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Right|Controls.AnchorStyle.Top|Controls.AnchorStyle.Bottom,"Parent":tab1.GetPanel(0),"Text":"","Css":"control"};
        
                
        
        var m_MsgPanel = new MsgPanel(m_MsgPanel_Config);
        
        

        
        var m_BtnOK = new Controls.Button({"Left":410,"Top":415,"Width":67,"Height":26,"AnchorStyle":Controls.AnchorStyle.Right|Controls.AnchorStyle.Bottom,"Parent":tab1.GetPanel(0),"Text":"发送","Css":"button_default"});
        
        
        
        m_BtnOK.OnClick.Attach(
            function(btn)
            {
                var data = {
                    Sender: User,
                    Receiver: Peer,
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

        
        var m_MsgEditor_Config={"Left":5,"Top":243,"Width":472,"Height":166,"AnchorStyle":Controls.AnchorStyle.Left|Controls.AnchorStyle.Right|Controls.AnchorStyle.Bottom,"Parent":tab1.GetPanel(0),"Text":"","Css":"control"};
        
                m_MsgEditor_Config.BorderWidth = 1;
                m_MsgEditor_Config.Css = "richEditor";
        
        var m_MsgEditor = new MsgEditor(m_MsgEditor_Config);
        
        
    
        This.Resize(width,height);
    
        Controls.CreateHorizSplit(m_MsgPanel, m_MsgEditor, false);
        
        var m_From = new Date(0);
        var m_ErrorCount = 0;
        
        function Receive()
        {
            var data = {
                Receiver: User,
                Sender: Peer,
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
        msgDiv.scrollIntoView();
        msgDiv = null;
    }
    
    This.Link("StyleSheet", "Themes/Default/EditorCss.css", "text/css");

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
}




function MsgEditor(config)
{
    var This = this;
    var OwnerForm = this;
    

    
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

