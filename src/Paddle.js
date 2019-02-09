
(function(ns){

    var Paddle = ns.Paddle = Hilo.Class.create({
        Extends: Hilo.Graphics,
        constructor: function(properties){
            console.log(properties);
            Paddle.superclass.constructor.call(this, properties);
            this.lineStyle(1, "#000").beginFill("#000").drawRect(0, 0, this.width, this.height).endFill();
        },
        startX: 0,
        startY: 0,
        groundX: 0,
        image: null,
        ready:function() {
            this.x = this.x;
            this.y = this.y;
        },
        dragStart: function() {
            Hilo.util.copy(this, Hilo.drag);
            this.startDrag();
        },
  });
  
  })(window.game);