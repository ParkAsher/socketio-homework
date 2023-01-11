const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.set('view', __dirname + '/views');

const { initGame, gameLoop, UpdateMovement } = require('./game.js');

app.get('/', (req, res) => {
    res.render('index');
});

const state = {};
const clientRooms = {};

io.on('connection', (client) => {
    // 작성
});

// client.on KeyDown handleKeydown
function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];

    UpdateMovement(state[roomName], client.number, keyCode);
}

// 게임에 Join이 되었을 룸을 시작 할 수 있게 제작
function startGameInterval(roomName) {
    const intervalID = setInterval(() => {
        //const Winner = gameLoop(state[roomName])
    }, 1000 / 30);
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
}

server.listen(3000, function () {
    console.log('3000 포트 대기중');
});
