'use strict';

const fs = require('fs');
const express = require('express');
const https = require('https');
const brain = require('brain.js');
const { WebSocket, WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8888;

var app = express();
app.use(express.static("public"));

var server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
    console.log('connected');

	ws.on('open', function open() {
	   console.log('connected');
	   ws.send(Date.now());
	});

    ws.on('message', function incoming(message) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', function close() {
	   console.log('disconnected');
	});
});