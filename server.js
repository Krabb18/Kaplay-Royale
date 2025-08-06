const { Socket } = require("engine.io");
const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let playerMap = new Map();
let wallParts = [];
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
        this.wapeonAngle = 0.0;
        this.characterName = "Bean";
        this.hearts = 5;
        this.socketID = null;
    }
}

class WallClass
{
    constructor()
    {
        this.positionX = 0.0;
        this.positionY = 0.0;
    }
}

app.use(express.static('public'));

io.on('connection', (socket) =>{
    console.log("User ist verbunden");

        for(let i = 0; i<randomIntFromInterval(0, 500); i++)
        {
            const xPos = randomIntFromInterval(1, 5000);
            const yPos = randomIntFromInterval(1, 5000);
            let wallInst = new WallClass();
            wallInst.positionX = xPos;
            wallInst.positionY = yPos;
            wallParts.push(wallInst);
            
        }

    socket.on('register-player', (data) =>{
        const newPlayer = new PlayerClass();
        newPlayer.playerName = data.playerName;
        newPlayer.positionX = data.positionX;
        newPlayer.positionY = data.positionY;
        newPlayer.wapeonPositionX = data.wapeonPositionX;
        newPlayer.wapeonPositionY = data.wapeonPositionY;
        newPlayer.characterName = data.characterName;
        newPlayer.hearts = data.hearts;
        newPlayer.socketID = socket.id;

        playerMap.set(newPlayer.playerName, newPlayer);
        console.log("Neuer spieler: ", newPlayer.playerName);
        socket.broadcast.emit('newPlayer', newPlayer);

    });

    socket.on('getAllPlayers', () =>{
        for (const [key, obj] of playerMap.entries()) {
        socket.emit('newPlayer', obj);
        }

        for(const wall of wallParts)
        {
            socket.emit("wall", wall);
        }
    });

    socket.on('state_emit', (clientName) =>{
        for (const [key, obj] of playerMap.entries()) {
        if(key != clientName)
        {
            socket.emit('state_update', obj);
        }
        }
    });

    socket.on("moveUpdate", (player)=>{
        if(playerMap.has(player.playerName))
        {
            playerMap.get(player.playerName).positionX = player.positionX;
            playerMap.get(player.playerName).positionY = player.positionY;
            playerMap.get(player.playerName).wapeonPositionX = player.wapeonPositionX;
            playerMap.get(player.playerName).wapeonPositionY = player.wapeonPositionY;
            playerMap.get(player.playerName).wapeonAngle = player.wapeonAngle;
        }
        
    });

    //Handle bullets
    socket.on("register-bullets", (bullet) =>{

        socket.broadcast.emit('addBullet', bullet);

    });

    socket.on("gameOver", (playerName) =>{
        playerMap.delete(playerName);
        socket.broadcast.emit("gameOver", playerName);
    });

    socket.on("disconnect", () => {
        console.log("Spieler getrennt:", socket.id);
        // z.B. Spieler aus dem Spiel entfernen
        for(const [key, obj] of playerMap)
        {
            if(obj.socketID == socket.id)
            {
                
            }
        }
    });

});

//Hier wird der server gestartet
const PORT = 3000;
server.listen(PORT, () =>{
    console.log("Server gestartet");
});