
(function(ns){
    var Ball = ns.Ball = Hilo.Class.create({
        Extends: Hilo.Graphics,
        constructor: function(properties){
            Ball.superclass.constructor.call(this, properties);
            this.lineStyle(2, "#000").beginFill("#000").drawCircle(0, 0, 20).endFill();
            //设置球的中心点位置
        },
        startX: 0, 
        startY: 0,
        groundX: 0,
        groundY: 200,
        speedX: 0, //横向加速地
        speedY: 10, //重力加速度
        isDead: true, //游戏是否已结束
        start: function() {
            this.x = this.startX;
            this.y = this.startY;
            this.speedX = 0;
            this.speedY = 6;
            this.isDead = false;
        },
        // 碰撞
        collision: function(paddle){
            if(this.isDead) return;
            let x = this.x + this.speedX;
            let y = this.y + this.speedY;
            // 球与挡板碰撞
            if (this.hitTestObject(paddle)) {
                this.changeSpeedY(paddle);
                return;
            }
            if (x <= 0 || x >= this.groundX - 20) {
                this.speedX = -this.speedX;
            } 
            if (y > this.groundY || y < 0) {
                // 球落地
                this.isDead = true;
                this.y = this.groundY;
                this.x += this.speedX;
                return;
            }
            this.x = x; 
            this.y = y;
        },
        changeSpeedY: function(paddle) {
            if (paddle) {
                let deltaX = this.x - (paddle.x + paddle.width / 2);
                this.speedX = deltaX * 0.15 + 1;
            }
            this.speedY = -this.speedY;
            this.y += this.speedY;
            this.x += this.speedX;
        },
  });
  
  })(window.game);