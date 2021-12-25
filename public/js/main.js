var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $interval) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
    $scope.invertory = {};
    $scope.games = {};
    $scope.gamesHistory = {};
    $scope.history = {};

    var ctx = document.getElementById('myChart').getContext('2d');
    var typePressChartx = document.getElementById('typePressChart').getContext('2d');
    var typePressChartObj = {
      type: 'doughnut',
      data: {
        labels:[],datasets:[{label:'Dataset 1',
        data:[],backgroundColor:dynamicColorArray(3)}]},
      options: {
        responsive:true,plugins:{legend: {position: 'top',},
        title:{display: false,text: 'Chart.js Pie Chart'}}}};
    var typePressChart = new Chart(typePressChartx, typePressChartObj);

    var winrateChartx = document.getElementById('winrateChart').getContext('2d');
    var winrateChartObj = {
      type: 'doughnut',
      data: {
        labels:['Win','Lose'],datasets:[{label:'Dataset 1',
        data:[3,6],backgroundColor:
        ['rgb(0,128,0)', 'rgb(28,28,28)']
    }]},
      options: {
        responsive:true,plugins:{legend: {position: 'top',},
        title:{display: false,text: 'Chart.js Pie Chart'}}}};
    var winrateChart = new Chart(winrateChartx, winrateChartObj);
    var chartObj = {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Value',
                    borderColor: 'rgb(0, 128, 0)',
                    backgroundColor: 'rgb(0, 128, 0, 0.5)',
                    fill: true,
                    data: []
                }
            ] 
        },
        options: {
            plugins: {
              title: {
                display: false,
                text: 'Chart Title',
              }
            }
        }
    };
    var chart = new Chart(ctx, chartObj);
    var wsUri = "wss://brain369.herokuapp.com";
    var output;
    var websocket;

    initWebSocket();

    function initWebSocket() {
        websocket = new WebSocket(wsUri);
        websocket.onopen = function(evt) {
            $scope.message = 'Kết nối với siêu não';
            $scope.sendCommand('HISTORY', {});
            $scope.sendCommand('GAME', {});
            $scope.sendCommand('GAME HISTORY', {});
            $scope.sendCommand('INVENTORY', {});
            $scope.$apply();
        };
        websocket.onclose = function(evt) {
        	location.reload();
        };
        websocket.onmessage = function(evt) {
            if (isJsonString(evt.data)) {
                var json = JSON.parse(evt.data);
                if (json.isClient) {
                    $scope.message = json;
                    if (json.command === "INVENTORY") {
                        $scope.invertory = json.data.datas;
                    }
                    if (json.command === "GAME") {
                        $scope.games = json.data.datas;
                    }
                    if (json.command === "GAME HISTORY") {
                        $scope.gamesHistory = json.data.datas;
                    }
                    if (json.command === "HISTORY") {
                        $scope.applyHistory(json);
                    }
                    $scope.$apply();
                }
            }
        };
        websocket.onerror = function(evt) { 
        	console.log(evt.data);
        	websocket.close();
        };
    }

    $scope.sendCommand = function(command, data) {
        var obj = {isClient:false,command:command,data:data};
        websocket.send(JSON.stringify(obj));
    }
    $scope.totalValue = 0;
    $scope.applyInventory = function(json) {
        $scope.invertory = json.data.datas;
        var total = $scope.invertory.user != null ? $scope.invertory.user.goldingot : 0;
        for (const i of $scope.invertory.list.length) {
            total += i.value;
        }
        $scope.totalValue = total;
    } 
    $scope.applyHistory = function(json) {
        $scope.history = json.data.datas;
        chartObj.data.labels = [];
        chartObj.data.datasets[0].data = [];
        typePressChartObj.data.labels = [];
        typePressChartObj.data.datasets[0].data = [];
        var array = $scope.history.list;
        var type = {};
        var win = 0;
        var lose = 0;
        var currentValue = $scope.invertory.values !== null ? $scope.invertory.values : 0;
        chartObj.data.labels.push(timeConverter(array[0].time/1000));
        chartObj.data.datasets[0].data.push(currentValue);
        for (var i = 0; i < array.length; i++) {
            if (type.hasOwnProperty(array[i].categoryicon)){
                type[array[i].categoryicon] += 1;
            }else{
                type[array[i].categoryicon] = 1;
            }
            if (array[i].value > 0) {
                win ++;
            }else{
                lose ++;
            }
            if ( i > 0 ) {
                chartObj.data.labels.push(timeConverter(array[i].time/1000));
                currentValue -= array[i-1].value;
                chartObj.data.datasets[0].data.push(currentValue);
            }
        }
        chartObj.data.labels.reverse();
        chartObj.data.datasets[0].data.reverse();
        for (const property in type) {
            typePressChartObj.data.labels.push(property);
            typePressChartObj.data.datasets[0].data.push(type[property]);
        }
        winrateChartObj.data.datasets[0].data = [win, lose];
        winrateChart.update();
        typePressChart.update();
        chart.update();
        // chart = new Chart(ctx, chartObj);
    }
    $scope.send = function() {
        var obj = {
            isClient: false,
            command: $scope.command,
            data: {}
        };
        websocket.send(JSON.stringify(obj));
    }
    var increaseCounter = function () {
        $scope.sendCommand('GAME', {});
    }
    var increaseCounter100 = function () {
        $scope.sendCommand('GAME HISTORY', {});
        $scope.sendCommand('HISTORY', {});
    }
    $interval(increaseCounter, 20000);
    $interval(increaseCounter100, 100000);
});

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + '/' + month;
  return time;
}
var dynamicColorArray = function(size) {
    var i = 0;
    var array = [];
    while (i < size) {
        array.push(dynamicColors());
        i++;
    }
    return array;
}
var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
};