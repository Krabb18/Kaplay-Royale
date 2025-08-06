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
export{PlayerClass}

class BulletClass
{
  constructor()
  {
    this.spawnX = 0.0;
    this.spawnY = 0.0;
    this.playerName = "";
    this.velX = 0.0;
    this.velY = 0.0;
    this.angle = 0.0;
  }
}
export{BulletClass}

export function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}