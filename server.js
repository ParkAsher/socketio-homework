const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const { initGame, gameLoop, UpdateMovement } = require('./game.js');

app.get('/', (req, res) => {
    res.render('index.ejs');
});

const state = {};
const clientRooms = {};

io.on('connection', (client) => {
    // 클라이언트에서 새로운 게임 생성
    client.on('newGame', () => {
        /*
            1. 새로운 게임 생성하면, 방 id 생성
            2. 방 id를 clientRooms 에 저장
        */
        const roomName = makeid(5); // 게임 코드
        clientRooms[client.id] = roomName; // 어떤 게임 코드에 누가 들어와있는지
        client.number = 1; // 게임 생성한 사람은 1번
        client.emit('gameCode', roomName); // 게임코드 클라이언트에 출력
        client.emit('init', client.id); // 클라이언트 번호 넘겨서 플레이어에 저장

        client.join(roomName); // socket.io room 접속 내장기능
        console.log(io.sockets.adapter.rooms);

        //console.log(clientRooms);
    });

    // 클라이언트에서 게임 조인
    client.on('joinGame', (code) => {
        const roomName = code;
        // 게임 코드가 유효하지 않다면?
        if (!Object.values(clientRooms).includes(roomName)) {
            client.emit('unknownCode');
            return;
        }

        // 게임시작
        clientRooms[client.id] = roomName;
        client.number = 2;
        client.emit('gameCode', roomName);
        client.emit('init', client.id);

        client.join(roomName); // socket.io room 접속 내장기능
        console.log(io.sockets.adapter.rooms);

        const initState = initGame();
        state[roomName] = initState;
        io.sockets.in(roomName).emit('gameState', JSON.stringify(initState));

        startGameInterval(roomName);
        // console.log(clientRooms);
    });

    // Keydown
    client.on('keydown', (keyCode) => {
        console.log(keyCode);
        handleKeydown(keyCode, client);
    });
});

// client.on KeyDown handleKeydown
function handleKeydown(keyCode, client) {
    const roomName = clientRooms[client.id];

    UpdateMovement(state[roomName], client.number, keyCode);
}

// 게임에 Join이 되었을 룸을 시작 할 수 있게 제작
function startGameInterval(roomName) {
    const intervalID = setInterval(() => {
        // 승리자가 나오면 게임 종료
        gameLoop(state[roomName]);

        // if (!winner) {
        //     io.sockets.in(roomName).emit('gameState', JSON.stringify(state[roomName]));
        // } else {
        //     io.sockets.in(roomName).emit('gameOver', JSON.stringify(winner));
        // }
        io.sockets.in(roomName).emit('gameState', JSON.stringify(state[roomName]));
    }, 1000 / 30);
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

server.listen(3000, function () {
    console.log('3000 포트 대기중');
});
