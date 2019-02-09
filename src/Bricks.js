
(function(ns){

var Bricks = ns.Bricks = Hilo.Class.create({
    Extends: Hilo.Container,
    constructor: function(properties){
        Bricks.superclass.constructor.call(this, properties);
    },
    width: 0,
    brokeBrick: 0,
    colors: ["#18582b", "#0c905d", "#00c78e", "#33dbff", "#3375ff", "#5733ff"],

    init: function(){
        this.removeAllChildren();
        this.brokeBrick = 0;
        let brickWidth = this.width / 9;
        // 初始化砖块
        let r = 0;
        for (let c = 0; c < 9; c++) {
            for (let r = 0; r < 6; r++) {
                let g1 = new Hilo.Graphics({width:brickWidth, height:50, x:c*brickWidth, y: r*50});
                g1.lineStyle(0.5, this.lineColor).beginFill(this.colors[r]).drawRect(0, 0, brickWidth-1, 49).endFill();
                this.addChild(g1);
            }
        }
    },
    checkCollision: function(ball){
        for(let i = 0, len = this.children.length; i < len; i++){
            try {
                if(this.children[i].hitTestObject(ball, true)){
                    ball.changeSpeedY();
                    this.destoryBrick(this.children[i]);
                    break;
                }
            } catch (err) {
                console.log(err);
            }
            
        }
        return false;
    },
    destoryBrick: function(child){
        this.brokeBrick++;
        this.removeChild(child);
    },
});

})(window.game);