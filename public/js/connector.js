console.log("Siêu bet thủ đang hoạt động...");

var wsUri = "wss://brain369.herokuapp.com";
var output;

window.addEventListener("load", init, false);
var websocket;

function init() {
    initWebSocket();
}

function initWebSocket() {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) {
        console.log('Kết nối với siêu não');
    };
    websocket.onclose = function(evt) {
        console.log("Ngắt kết nối với siêu não");
        location.reload();
    };
    websocket.onmessage = function(evt) {
        if (isJsonString(evt.data)) {
            var json = JSON.parse(evt.data);
            if (!json.isClient) {
                execute(json);
            }
        }
    };
    websocket.onerror = function(evt) { 
        console.log(evt.data);
        websocket.close();
    };
}
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function execute(json) {
    console.log(json);
    if (json.command === "INVENTORY") {
        json.isClient = true;
        getInventory(json);
    }
    if (json.command === "GAME") {
        json.isClient = true;
        getGames(json);
    }
    if (json.command === "GAME HISTORY") {
        json.isClient = true;
        getGamesHistory(json);
    }
    if (json.command === "HISTORY") {
        json.isClient = true;
        getHistorys(json);
    }
}
function getGames(json) {
    var path = "/api/match/list.do?status=run&game=all&rows=10&page=1&lang=en";
    getData("GET", path, {}, function(a, b, c) {
        json.data = a;
        websocket.send(JSON.stringify(json));
    });
}
function getGamesHistory(json) {
    var path = "/api/match/list.do?status=end&game=all&rows=10&page=1&lang=en";
    getData("GET", path, {}, function(a, b, c) {
        json.data = a;
        websocket.send(JSON.stringify(json));
    });
}
function getHistorys(json) {
    var path = "/api/match/list_user_press_history.do?page=1&rows=10&matchid=&lang=en";
    getData("GET", path, {}, function(a, b, c) {
        json.data = a;
        websocket.send(JSON.stringify(json));
    });
}
function getInventory(json) {
    var path = "/api/user/bag/570/list.do?appid=570&page=1&rows=200&lang=en";
    getData("POST", path, {}, function(a, b, b) {
        json.data = a;
        websocket.send(JSON.stringify(json));
    });
}

function confirmGoldIngot() {
    var fd = new FormData();    
    fd.append( 'appid', '570');
    fd.append( 'ids', '14229991');
    fd.append( 'lang', 'en');
    var path = "user/goldingot/item2ingot.do";
    
    postFormData(path, fd, function(data){
        console.log(data);
        fd = new FormData();    
        fd.append( 'id', data.datas.id);
        fd.append( 'lang', 'en');
        path = "user/goldingot/confirm.do";
        postFormData(path, fd, function(data2){
            console.log(data2);
        });
    });
}
function getValueCanExchange() {

}
function getItemFrozen() {

}
function getTotalItem() {

}
function getHistory() {

}
function getImcomingGame() {

}
function getBettingGame() {

}

function postFormData(path, formData, callback){
    $.ajax({
        url:  window.location.origin + path,
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
            callback(data);
        }
    });
}
function getData(method, path, json, callback) {
    $.ajax({
        url: window.location.origin + path,
        type: method,
        contentType: 'application/json',
        data: (method === "GET") ? '' : JSON.stringify(json),
        success: function(data, textStatus, request) {
            callback(data, textStatus, request);
        }
    });
}   