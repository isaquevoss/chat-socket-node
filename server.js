const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {     

    console.log('a user connected ' + socket.handshake.query.nick);

    socket.on('disconnect', () => {
        socket.broadcast.emit('user disconnect', socket.id)
        console.log('user has disconnected')
    });
    
    socket.broadcast.emit('new user', socket.handshake.query.nick);
    
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);        
        io.emit('chat message', {'msg': msg, 'nick': socket.handshake.query.nick});
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('servidor ativo na porta 3000');
});
