const { Socket } = require("engine.io");
const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let playerMap = new Map();

//struct wo spieler informationen gespeichert werden können
class PlayerClass
{
    constructor()
    {
        this.playerName = "";
        this.positionX = 0.0;
        this.positionY = 0.0;
        this.wapeonPositionX = 0.0;
        this.wapeonPositionY = 0.0;
        this.characterName = "Bean";
        this.hearts = 5;
    }
}


app.use(express.static('public'));

io.on('connection', (socket) =>{
    console.log("User ist verbunden");

    socket.on('register-player', (data) =>{
        const newPlayer = new PlayerClass();
        newPlayer.playerName = data.playerName;
        newPlayer.positionX = data.positionX;
        newPlayer.positionY = data.positionY;
        newPlayer.wapeonPositionX = data.wapeonPositionX;
        newPlayer.wapeonPositionY = data.wapeonPositionY;
        newPlayer.characterName = data.characterName;
        newPlayer.hearts = data.hearts;

        playerMap.set(newPlayer.playerName, newPlayer);
        console.log("Neuer spieler: ", newPlayer.playerName);
        socket.broadcast.emit('newPlayer', newPlayer);

    });

});

//Hier wird der server gestartet
const PORT = 3000;
server.listen(PORT, () =>{
    console.log("Server gestartet");
});