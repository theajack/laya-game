(function () {
    'use strict';

    const ballTextures = {};
    let bgTexture = null;
    function getBgTexture() {
        return bgTexture;
    }
    let groundTexture = null;
    function getGroundTexture() {
        return groundTexture;
    }
    let _onTextureReady = null;
    let _number = 0;
    const _max = 2;
    function onTextureReady(fn) {
        _onTextureReady = fn;
    }
    function textureReady() {
        _number++;
        if (_number >= _max) {
            if (_onTextureReady) {
                _onTextureReady();
            }
        }
    }
    function initTexture() {
        for (let i = 0; i < 10; i++) {
            ((index) => {
                Laya.Texture2D.load(`test/ball/b${index - 1}.png`, Laya.Handler.create(this, (texture) => {
                    ballTextures[Math.pow(2, index)] = texture;
                }));
            })(i + 1);
        }
        Laya.Texture2D.load(`test/wall.jpg`, Laya.Handler.create(this, (texture) => {
            bgTexture = texture;
            textureReady();
        }));
        Laya.Texture2D.load(`test/ground.jpg`, Laya.Handler.create(this, (texture) => {
            groundTexture = texture;
            textureReady();
        }));
    }
    function getTextureByValue(value) {
        return ballTextures[value] || ballTextures[1024];
    }
    function countSizeByValue(value) {
        return getIndexByValue(value) * 12 + 30;
    }
    function getIndexByValue(value) {
        return Math.log2(value) - 1;
    }
    function getOrderByValue(value) {
        return getIndexByValue(value) - 9;
    }
    const rigidAttrs = [
        {
            f: 0.1,
            r: 0.3,
            g: 1,
            d: 15,
        },
        {
            f: 0.2,
            r: 0.5,
            g: 0.7,
            d: 5,
        },
        {
            f: 0.4,
            r: 0.6,
            g: 0.8,
            d: 7,
        },
        {
            f: 0.4,
            r: 0.35,
            g: 0.9,
            d: 12,
        },
        {
            f: 0.1,
            r: 0.3,
            g: 1,
            d: 15,
        },
        {
            f: 0.3,
            r: 0.5,
            g: 0.8,
            d: 9,
        },
        {
            f: 0.1,
            r: 0.3,
            g: 1,
            d: 14,
        },
        {
            f: 0.2,
            r: 0.4,
            g: 0.8,
            d: 10,
        },
        {
            f: 0.2,
            r: 0.4,
            g: 0.8,
            d: 10,
        },
        {
            f: 0.2,
            r: 0.5,
            g: 0.8,
            d: 11,
        }
    ];
    function getRigidAttrByValue(value) {
        const index = Math.log2(value) - 1;
        return rigidAttrs[index] || rigidAttrs[rigidAttrs.length - 1];
    }

    function setDocumentTitle(text) {
        if (window.document) {
            window.document.title = text;
        }
    }
    setDocumentTitle('游戏资源加载中...');
    class GameControl extends Laya.Script {
        constructor() {
            super();
            this.nextValue = 2;
            this.score = 0;
            this._groundHeight = 40;
            this.width = 375;
            this.height = 667;
            this.didTipShow = true;
            this.wined = false;
            GameControl.instance = this;
            initTexture();
        }
        onEnable() {
            this._gameBox = this.owner.getChildByName('gameBox');
            this._initSize();
            onTextureReady(() => {
                setDocumentTitle('合成一个大篮球~');
                this.owner.getChildByName('tip').changeText('合成一个大篮球');
                this._drawNextBall();
            });
        }
        _initSize() {
            this.width = Laya.stage.width;
            this.height = Laya.stage.height;
            this.owner.getChildByName('ground').y = this.height - this._groundHeight;
            this.owner.getChildByName('wallLeft').getComponent(Laya.BoxCollider).height = this.height;
            this.owner.getChildByName('wallRight').getComponent(Laya.BoxCollider).height = this.height;
        }
        _drawNextBall() {
            const size = countSizeByValue(this.nextValue);
            const starPos = 20;
            const start = starPos - (size - starPos) / 2;
            const graphics = this.owner.graphics;
            graphics.clear();
            graphics.drawTexture(getBgTexture(), 0, 0, this.width, this.height);
            graphics.drawTexture(getGroundTexture(), 0, this.height - this._groundHeight, this.width, this._groundHeight);
            graphics.drawTexture(getTextureByValue(this.nextValue), start, start, size, size);
        }
        onStageClick(e) {
            if (this.height !== Laya.stage.height) {
                this._initSize();
            }
            e.stopPropagation();
            const x = Laya.stage.mouseX;
            const y = 50;
            this._creatNewBall(this.nextValue, x, y);
            this.nextValue = this._randomValue();
            this._drawNextBall();
            if (this.didTipShow) {
                this.owner.getChildByName('tip').visible = false;
                this.owner.getChildByName('tip2').visible = false;
            }
        }
        geneNewBall(value, x, y, velocity) {
            this.score += value;
            this.owner.getChildByName('scoreText').changeText(this.score + '');
            this._creatNewBall(value, x, y, velocity);
            this._checkWin(value);
        }
        _random(a, b) {
            return (a + Math.round(Math.random() * (b - a)));
        }
        _randomValue() {
            return Math.pow(2, this._random(1, 3));
        }
        _creatNewBall(value = 2, x, y, velocity) {
            const flyer = Laya.Pool.getItemByCreateFun('ball', this.ball.create, this.ball);
            const box = flyer.getComponent(Laya.CircleCollider);
            if (value !== 2) {
                const ball = flyer.getComponent(Laya.Script);
                ball.setValue(value);
                const size = ball.getSize();
                const radius = size / 2;
                flyer.width = size;
                flyer.height = size;
                flyer.pos(x - radius, y - radius);
                flyer.texture = getTextureByValue(value);
                box.radius = size / 2;
            }
            else {
                const radius = 30 / 2;
                flyer.pos(x - radius, y - radius);
            }
            this._gameBox.addChild(flyer);
            const rig = flyer.getComponent(Laya.RigidBody);
            if (velocity) {
                rig.setVelocity(velocity);
            }
            const attr = getRigidAttrByValue(value);
            box.density = attr.d;
            box.friction = attr.f;
            box.restitution = attr.r;
            rig.gravityScale = attr.g;
        }
        _checkWin(value) {
            if (this.wined) {
                return;
            }
            if (value === 1024) {
                this.wined = true;
                this.didTipShow = true;
                const tip = this.owner.getChildByName('tip');
                const tip2 = this.owner.getChildByName('tip2');
                tip.visible = true;
                tip.changeText('恭喜您合成了大篮球');
                tip2.visible = true;
                tip2.changeText('继续游戏可以合成更大的篮球哦');
            }
        }
    }

    class Ball extends Laya.Script {
        constructor() {
            super();
            this.value = 2;
            this.size = 30;
            this._removed = false;
        }
        onEnable() {
        }
        onTriggerEnter(other, self, contact) {
            if (this._removed) {
                return;
            }
            const otherObject = other.owner.getComponent(Laya.Script);
            if (otherObject && otherObject._removed) {
                return;
            }
            const thisOwner = this.owner.getComponent(Laya.RigidBody);
            if (other.label === 'ball') {
                const ball = other.owner.getComponent(Laya.Script);
                if (ball.value === this.value) {
                    const otherOwner = other.owner.getComponent(Laya.RigidBody);
                    const velocity = {
                        x: thisOwner.linearVelocity.x + otherOwner.linearVelocity.x,
                        y: thisOwner.linearVelocity.y + otherOwner.linearVelocity.y,
                    };
                    const pos = contact.getHitInfo().points[0];
                    this.owner.removeSelf();
                    other.owner.removeSelf();
                    GameControl.instance.geneNewBall(ball.value * 2, pos.x, pos.y, velocity);
                    Laya.SoundManager.playSound('sound/destroy.wav');
                }
            }
            const v = thisOwner.linearVelocity;
            const value = Math.pow(v.x, 2) + Math.pow(v.y, 2);
            const start = 3;
            const end = 50;
            if (value > start) {
                const channel = Laya.SoundManager.playSound('sound/hit.wav');
                if (channel) {
                    let volume = 1;
                    if (value < end) {
                        volume = (value - start) / (end - start);
                    }
                    channel.volume = volume;
                }
            }
        }
        onDisable() {
            this._removed = true;
        }
        setValue(value) {
            this.value = value;
            this.size = countSizeByValue(this.value);
            const text = this.owner.getChildByName('value');
            text.width = this.size;
            text.height = this.size;
            if (this.value > 1024) {
                text.changeText(getOrderByValue(this.value) + '');
            }
        }
        getSize() {
            return this.size;
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("control/gameControl.ts", GameControl);
            reg("object/ball.ts", Ball);
        }
    }
    GameConfig.width = 375;
    GameConfig.height = 667;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "main.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window['Laya3D'])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya['WebGL']);
            Laya['Physics'] && Laya['Physics'].enable();
            Laya['DebugPanel'] && Laya['DebugPanel'].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString('debug') == 'true')
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya['PhysicsDebugDraw'])
                Laya['PhysicsDebugDraw'].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable('version.json', Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable('fileconfig.json', Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
