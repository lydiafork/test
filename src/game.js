(function() {

    window.onload = function() {
        game.init();
    }
    var game = window.game = {
        width: 0,
        height: 0,

        asset: null,
        stage: null,
        ticker: null,
        state: null,
        score: 0,

        bg: null,
        ground: null,
        bricks: null, // 砖块
        ball: null, // 球
        paddle: null, //挡板
        gameReadyScene: null,
        gameOverScene: null,

        init: function() {
            this.asset = new game.Asset();
            this.asset.on('complete', function(e) {
                this.asset.off('complete');
                this.initStage();
            }.bind(this));
            this.asset.load();
        },

        initStage: function() {
            this.width = Math.min(innerWidth, 450) * 2;
            this.height = Math.min(innerHeight, 750) * 2;
            this.scale = 0.5;
            //舞台画布
            var renderType = location.search.indexOf('dom') != -1 ? 'dom' : 'canvas';
            //舞台
            this.stage = new Hilo.Stage({
                renderType: renderType,
                width: this.width,
                height: this.height,
                scaleX: this.scale,
                scaleY: this.scale
            });
            document.body.appendChild(this.stage.canvas);

            //启动计时器
            this.ticker = new Hilo.Ticker(60);
            this.ticker.addTick(Hilo.Tween);
            this.ticker.addTick(this.stage);
            this.ticker.start(true);

            //绑定交互事件
            this.stage.enableDOMEvent([Hilo.event.POINTER_START, Hilo.event.POINTER_MOVE, Hilo.event.POINTER_END]);
            this.stage.on(Hilo.event.POINTER_START, this.onUserInput.bind(this));

            //Space键控制
            if (document.addEventListener) {
                document.addEventListener('keydown', function(e) {
                    if (e.keyCode === 32) this.onUserInput(e);
                }.bind(this));
            } else {
                document.attachEvent('onkeydown', function(e) {
                    if (e.keyCode === 32) this.onUserInput(e);
                }.bind(this));
            }
            //舞台更新
            this.stage.onUpdate = this.onUpdate.bind(this);
            //初始化
            this.initBackground();
            this.initScenes();
            this.initBall(); // 初始化球
            this.initBricks(); // 初始化砖块
            this.initPaddle(); // 初始化挡板
            this.initCurrentScore();
            //准备游戏
            this.gameReady();
        },
        initBackground: function() {
            //背景
            var bgWidth = this.width * this.scale;
            var bgHeight = this.height * this.scale;

            var bgImg = this.asset.bg;
            this.bg = new Hilo.Bitmap({
                id: 'bg',
                image: bgImg,
                scaleX: this.width / bgImg.width,
                scaleY: this.height / bgImg.height
            }).addTo(this.stage);
        },
        initCurrentScore: function() {
            //当前分数
            this.currentScore = new Hilo.BitmapText({
                id: 'score',
                glyphs: this.asset.numberGlyphs,
                textAlign: 'center'
            }).addTo(this.stage);
            //设置当前分数的位置
            this.currentScore.x = this.width - this.currentScore.width >> 1;
            this.currentScore.y = 180;
        },
        initBricks: function() {
            this.bricks = new game.Bricks({
                id: 'bricks',
                width: this.width,
            }).addTo(this.stage);
        },
        initBall: function() {
            this.ball = new game.Ball({
                id: 'ball',
                startX: this.width >> 1,
                startY: ( this.height >> 1 ) + 100,
                groundX: this.width,
                groundY: this.height,
            }).addTo(this.stage);
        },
        initPaddle: function() {
            this.paddle = new Hilo.Graphics({width:200, height:50, x:(this.width >> 1) - 100, y:this.height - 20});
            this.paddle.lineStyle(1, "#000").beginFill("#000").drawRect(0, 0, 200, 50).endFill().addTo(this.stage);
            Hilo.util.copy(this.paddle, Hilo.drag);
        },
        initScenes: function() {
            //准备场景
            this.gameReadyScene = new game.ReadyScene({
                id: 'readyScene',
                width: this.width,
                height: this.height,
                image: this.asset.ready
            }).addTo(this.stage);

            //结束场景
            this.gameOverScene = new game.OverScene({
                id: 'overScene',
                width: this.width,
                height: this.height,
                image: this.asset.over,
                numberGlyphs: this.asset.numberGlyphs,
                visible: false
            }).addTo(this.stage);

            //绑定开始按钮事件
            this.gameOverScene.getChildById('start').on(Hilo.event.POINTER_START, function(e) {
                e.stopImmediatePropagation && e.stopImmediatePropagation();
                this.gameReady();
            }.bind(this));
        },
        onUserInput: function(e) {
            if (this.state !== 'over' && !this.gameOverScene.contains(e.eventTarget)) {
                //启动游戏场景
                if (this.state !== 'playing') this.gameStart();
                // 控制球开始动
                this.ball.start();
            }
        },
        onUpdate: function(delta) {
            if (this.state === 'ready') {
                return;
            }
            if (this.ball.isDead) {
                this.gameOver();
            } else {
                this.ball.collision(this.paddle);
                this.bricks.checkCollision(this.ball);
                this.currentScore.setText(this.calcScore());
            }
        },
        gameReady: function() {
            this.gameOverScene.hide();
            this.state = 'ready';
            this.score = 0;
            this.currentScore.visible = true;
            this.currentScore.setText(this.score);
            this.gameReadyScene.visible = true;
            this.bricks.init();
            // 允许点击事件
            this.stage.on(Hilo.event.POINTER_START, this.onUserInput.bind(this));
        },
        gameStart: function() {
            this.state = 'playing';
            this.gameReadyScene.visible = false;
            // 挡板允许滑动
            this.paddle.startDrag([0, this.height - 20, this.width - 200, 0]);
            // 废除点击事件
            this.stage.off(Hilo.event.POINTER_START);
        },
        gameOver: function() {
            if (this.state !== 'over') {
                //设置当前状态为结束over
                this.state = 'over';
                // 停止挡板的拖曳状态
                this.paddle.stopDrag();
                //隐藏屏幕中间显示的分数
                this.currentScore.visible = false;
                //显示结束场景
                this.gameOverScene.show(this.calcScore(), this.saveBestScore());
            }
        },
        calcScore: function() {
            return this.score = this.bricks.brokeBrick;
        },
        saveBestScore: function() {
            var score = this.score,
                best = 0;
            if (Hilo.browser.supportStorage) {
                best = parseInt(localStorage.getItem('marbles-best-score')) || 0;
            }
            if (score > best) {
                best = score;
                localStorage.setItem('marbles-best-score', score);
            }
            return best;
        }
    };

})();