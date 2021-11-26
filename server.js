const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

var fs = require('fs');
const { getUnpackedSettings } = require('http2');

var users = {};

io.on('connection', (socket) => {

    console.log('a user connected ' + socket.handshake.query.nick);

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('usersChange', users);

        socket.broadcast.emit('user disconnect', { name: socket.handshake.query.nick, id: socket.id })
        console.log('user has disconnected')
    });

    users[socket.id] = {
        name: socket.handshake.query.nick,
        id: socket.id
    }

    io.emit('usersChange', users);

    socket.broadcast.emit('new user', { name: socket.handshake.query.nick, id: socket.id });

    socket.on('chat message', (msg) => {

        fs.appendFile('./messages/history.txt', `${Date()}: ${socket.handshake.query.nick}: ${msg} \n`, (erro) => {
            if (erro) {
                console.log(`ocorreu um erro ${erro}`);
            } else {
                console.log('mensagem gravada');
            }
        });
        console.log('message: ' + msg);
        io.emit('chat message', { 'msg': msg, 'nick': socket.handshake.query.nick });
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('servidor ativo na porta 3000');
});
