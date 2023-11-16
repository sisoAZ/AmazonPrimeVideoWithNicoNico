
var videoId = "";
var videoInfo = { };
var videoData;

function GetVideoInfo(){
    videoId = $("#video_id").val();
    videoInfo["isUserVideo"] = !!videoId.match("^sm")

    GetVideoInfoFromVideoPage(videoId);

    var intervals = [
        setInterval(() => {
            //if((videoInfo["isUserVideo"] || videoInfo["threadkey"]) &&
            //    videoInfo["waybackkey"]){
            if (videoInfo["threads"]) {
                clearInterval(intervals[0]);
                GetComment();
            }
        }, 10)
    ];
}

function GetVideoInfoWithURL(url){
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var res = xhr.responseText.split("&");
        
            res.forEach((s) => {
                var nameValue = s.split("=");
                var name = nameValue[0];
                var value = nameValue[1];
        
                videoInfo[name] = decodeURIComponent(value);
            });
        }
    }

    xhr.send();
}

function GetComment(time){
    var isNew = !!!time;
    time = isNew ? parseInt(new Date().getTime() / 1000) : time;
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://nv-comment.nicovideo.jp/v1/threads", true);
    xhr.setRequestHeader("x-client-os-type", "others");
    xhr.setRequestHeader("x-frontend-id", "6");
    xhr.setRequestHeader("x-frontend-version", "0");
    
    var postJson = videoData.comment.nvComment;
    //remove key "server" from postJson
    delete postJson.server;
    //added key "additionals" to postJson
    postJson.additionals = {};

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            comments = [];
            var commentData = JSON.parse(xhr.responseText);
            console.log(commentData);
            commentData.data.threads[2].comments.forEach((content) => {
                if (content.commands.indexOf("ca") != -1) {
                    return;
                }
                var comment = {
                    "vpos": content.vposMs,
                    "text": content.body,
                    "mail": content.commands ? content.commands : null
                }
                comments.push(JSON.stringify(comment));
            });

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log(tabs);
                chrome.tabs.sendMessage(tabs[0].id, {
                    "type": isNew ? "new" : "add",
                    "comments": comments,
                }, null);
                console.log(isNew);
                console.log("send comments");
            });
        }
    }

    xhr.send(JSON.stringify(postJson));
}

function GetComment2(time){
    var isNew = !!!time;
    time = isNew ? parseInt(new Date().getTime() / 1000) : time;

    var postJson = MakePostJSON(videoInfo["threads"], time);

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "http://nmsg.nicovideo.jp/api.json/", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText)
            console.log(xhr.status)
            var res = JSON.parse(xhr.responseText);
            var comments = [];
            var minDate = null;

            res.forEach((content) => {
                if(content.chat){
                    var chat = content.chat;

                    if(chat.deleted){
                        return;
                    }

                    var comment = {
                        "vpos": chat.vpos,
                        "text": chat.content,
                        "mail": chat.mail ? chat.mail : null
                    }
                    var date = chat.date;

                    comments.push(JSON.stringify(comment));
                    minDate = (minDate == null || date < minDate) ? date : minDate;
                }
            });

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    "type": isNew ? "new" : "add",
                    "comments": comments,
                }, null);
                console.log("send comments");
            });
        }
    }

    xhr.send(postJson);
}

function GetVideoInfoFromVideoPage(videoId){
    var url = "https://www.nicovideo.jp/watch/" + videoId;
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4){
            console.log(videoInfo)
            var parser = new DOMParser();
            var dom = parser.parseFromString(xhr.responseText, "text/html");
            var watchData = dom.getElementById("js-initial-watch-data");
            var apiDataString = watchData.getAttribute("data-api-data");
            var apiData = JSON.parse(apiDataString);
            videoData = apiData;
            console.log("API DATA")
            console.log(apiData)

            // 分単位の動画時間（秒は切り上げ）
            videoInfo["video_duration"] = Math.ceil(apiData.video.duration / 60);
            videoInfo["user_id"] = apiData.viewer.id;
            //videoInfo["user_id"] = "56896211";
            videoInfo["thread_id"] = apiData.comment.threads.filter((th)=>{
                return th.isActive && th.isDefaultPostTarget;
            })[0].id;
            videoInfo["threadkey"] = apiData.comment.nvComment.threadKey;
            videoInfo["waybackkey"] = apiData.comment.nvComment.waybackkey;
            console.log(videoInfo)
            videoInfo["threads"] = apiData.comment.threads;
        }
    }
    xhr.send();
}

function MakePostJSON(threads, when){
    var res = [MakePingObject("rs:0")];
    var i = 0;

    threads.forEach((thread) => {
        if(!thread.isActive){
            return;
        }

        res.push(MakePingObject("ps:" + i));
        res.push(MakeThreadObject(thread, when));
        res.push(MakePingObject("pf:" + i));
        i++;
        if(thread.isLeafRequired){
            res.push(MakePingObject("ps:" + i));
            res.push(MaekThreadLeavesObject(thread, when));
            res.push(MakePingObject("pf:" + i));
            i++;
        }
    });

    res.push(MakePingObject("rf:0"));

    return JSON.stringify(res);
}

function MakePingObject(content){
    return {
        "ping": {
            "content": content
        }
    };
}

function MakeThreadObject(thread, when){
    var res = {
        "thread": {
            "thread": thread.id,
            "version": "20090904",
            "language": 0,
            "user_id": videoInfo["user_id"],
            "when": when,
            "with_global": 1,
            "scores": 1,
            "nicoru": 3,
            "force_184": "1",
            "fork": thread.fork,
            "waybackkey": videoInfo["waybackkey"]
        }
    };

    if(thread.isDefaultPostTarget){
        res.thread.threadkey = videoInfo["threadkey"];
    }

    return res;
}

function MaekThreadLeavesObject(thread, when){
    var res  = {
        "thread_leaves": {
            "thread": thread.id,
            "language": 0,
            "user_id": videoInfo["user_id"],
            "when": when,
            "content": "0-" + videoInfo["video_duration"] + ":100,1000,nicoru:100",
            "scores": 1,
            "nicoru": 3,
            "force_184": "1",
            "waybackkey": videoInfo["waybackkey"]
        }
    };

    if(thread.isDefaultPostTarget){
        res.thread_leaves.threadkey = videoInfo["threadkey"];
    }

    return res;
}

$("#ok_button").click(GetVideoInfo);
