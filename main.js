import { randomIntFromInterval } from "./functions.js";
import { PlayerClass } from "./functions.js";

const socket = io();
let playerMap = new Map();

kaplay();

let playerAngle = 0.0;
let playerName = "Player" + randomIntFromInterval(0, 10000).toString();
let spriteNames = [];
let pickedCharacter = "";
let allBullets = [];

loadSprite("bean", "https://play.kaplayjs.com/sprites/bean.png");
spriteNames.push("bean");
loadSprite("ghosty", "https://play.kaplayjs.com/sprites/ghosty.png");
spriteNames.push("ghosty");
loadSprite("mark", "https://play.kaplayjs.com/sprites/mark.png");
spriteNames.push("mark");
loadSprite("bobo", "https://play.kaplayjs.com/sprites/bobo.png");
spriteNames.push("bobo");
loadSprite("lamp", "sprites/lamp.png")
spriteNames.push("lamp");
loadSprite("gigagantrum", "https://play.kaplayjs.com/sprites/gigagantrum.png")
spriteNames.push("gigagantrum");

loadSprite("steel", "https://play.kaplayjs.com/sprites/steel.png")

//wapoeon sprites
loadSprite("gun", "https://play.kaplayjs.com/sprites/gun.png");


scene("start", () =>{
    const btn = add([
        rect(700, 200),
        pos(center()),
        anchor("center"),
        color(WHITE),
        area(),         // macht das Rechteck klick- und hoverbar
        scale(1),       // für späteres Skalieren
        "button",       // optionales Tag
    ])

    add([
        text("KAPLAY ROYALE"),
        pos(center().x, center().y - 450),
        anchor("center"),
        scale(2),
        color(GREEN),
    ]);


    add([
        text("Start", { size: 24 }),
        pos(btn.pos),
        anchor("center"),
        color(BLACK),
    ]);

    btn.onHover(() =>{
        btn.scale  = vec2(1.1);
    });

    btn.onHoverEnd(() => {
        btn.scale = vec2(1); // zurück zur normalen Größe
    });

    btn.onClick(() =>{
        
        go("characterRoster");
    })

})



scene("characterRoster", ()=>{

    let counter = 0;
    for(const name of spriteNames)
    {
        const beanIcon = add([
                sprite(name),
                pos(center().x - 700 + (counter * 200), center().y),
                scale(2),
                area()
            ])

            const beanText = add([
            text(name, { size: 24 }),
            pos(center().x - 665 + (counter * 200), center().y - 100),
            ]);

            beanIcon.onHover(() =>{
                beanIcon.scale = vec2(2.1);
                beanText.scale = vec2(1.1);
            });

            beanIcon.onHoverEnd(() =>{
                beanIcon.scale = vec2(2);
                beanText.scale = vec2(1.0);
            });

            beanIcon.onClick(() =>{
                pickedCharacter = name;
                go("game");

            });

        counter++;
    }    

})



let dx;
let dy;
let angleInDeg;
scene("game", () => 
{
    setBackground(GREEN);
    const obj = add([
        // a component
        sprite(pickedCharacter),
        health(5),
        pos(500, 500),
        area(),
        body(),
    ]);

    const wapeon = add([
        sprite("gun"),
        pos(obj.pos.x + 50, obj.pos.y - 20)
    ])

    onKeyPress("space", () => {
        obj.move()
    });

    for(let i = 0; i<randomIntFromInterval(0, 500); i++)
    {
        const xPos = randomIntFromInterval(1, 5000);
        const yPos = randomIntFromInterval(1, 5000);
        const wall = add([
        // a component
        "wall",
        sprite("steel"),
        pos(xPos, yPos),
        scale(1.0),
        area(),
        body(),
        ]);
    }

    //sende dem server den spieler damit dieser ihn regrestrieren kann
    let myPlayer = new PlayerClass();
    myPlayer.playerName = playerName;
    myPlayer.characterName = pickedCharacter;
    myPlayer.positionX = obj.pos.x;
    myPlayer.positionY = obj.pos.y;
    myPlayer.wapeonPositionX = wapeon.pos.x;
    myPlayer.wapeonPositionY = wapeon.pos.y;
    myPlayer.hearts = 5;
    socket.emit('register-player', myPlayer);


    socket.on('newPlayer', (data) =>{
    //ich muss mich ja nciht selbst auf meiner eigenen seite regrestrieren
    if(data.playerName != playerName)
    {
        const joinedPlayer = add([
            sprite(data.characterName),
            health(data.hearts),
            pos(data.positionX, data.positionY),
            area(),
            body(),
        ]);

        const wapeon = add([
        sprite("gun"),
        pos(data.wapeonPositionX, data.wapeonPositionY)
        ]);

        console.log(data.playerName);
    }
    });

    onMousePress("left", () => { 
        const bullet = add([
        sprite("gun"),
        area(),
        "bullet",
        pos(wapeon.pos.x, wapeon.pos.y),
        {
            velX: dx,
            velY : dy,
            savedAngle : angleInDeg,
            lifeTime : 10.0,
        }
        ])

        bullet.onCollide("wall", (e) => {
            destroy(bullet);
        })

        allBullets.push(bullet);
    });

    onUpdate(() => {
        
        if (isKeyDown("w"))  obj.move(0, -220);
        if (isKeyDown("s")) obj.move(0, 220);
        if (isKeyDown("d"))  obj.move(220, 0);
        if (isKeyDown("a"))  obj.move(-220, 0);

        let i = 0;
        for(const bul of allBullets)
        {
            bul.pos.x += bul.velX * dt() * 10;
            bul.pos.y += bul.velY * dt() * 10;
            bul.lifeTime -= 1.0 * dt();
            if(bul.lifeTime < 0.0)
            {
                destroy(bul);
                allBullets.splice(i, 1);
                continue;
            }
            bul.angle = bul.savedAngle;
            i++;
        }

        //update qapoen
        const mousePosition = toWorld(mousePos());
        dx = mousePosition.x - obj.pos.x;
        dy = mousePosition.y - obj.pos.y;
        const angle = Math.atan2(dy, dx);
        const angleInDegrees = angle * (180 / Math.PI);
        angleInDeg = angleInDegrees;
        playerAngle = angleInDegrees;
        
        const x = obj.pos.x + Math.cos(angle) * 100;
        const y = obj.pos.y + Math.sin(angle) * 100
        wapeon.pos.x = x;
        wapeon.pos.y = y;
        wapeon.angle = angleInDegrees;

        const camTarget = obj.pos;
        const lerpSpeed = 5;
        setCamPos(lerp(camPos(), camTarget, dt() * lerpSpeed));
        console.log("Was geht ab");
    });


})



go("start");