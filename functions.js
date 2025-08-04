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

export function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}