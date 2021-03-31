
import Ball from '../object/ball';
import {countSizeByValue, getBgTexture, getGroundTexture, getRigidAttrByValue, getTextureByValue, initTexture, onTextureReady} from './texture';
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */

function setDocumentTitle (text: string) {
    if (window.document) {
        window.document.title = text;
    }
}

setDocumentTitle('游戏资源加载中...');

export default class GameControl extends Laya.Script {
    /** @prop {name:ball,tips:"球",type:Prefab}*/
    ball: Laya.Prefab;
    static instance: GameControl;
    private _gameBox: Laya.Sprite;
    private nextValue: number = 2;
    private score: number = 0;
    private _groundHeight = 40;
    private width: number = 375;
    private height: number = 667;
    private didTipShow: boolean = true;
    private wined: boolean = false;
    constructor () {
        super();
        GameControl.instance = this;
        
        initTexture();
    }

    onEnable (): void {
        this._gameBox = this.owner.getChildByName('gameBox') as Laya.Sprite;
        this._initSize();
        onTextureReady(() => {
            setDocumentTitle('合成一个大篮球~');
            (this.owner.getChildByName('tip') as Laya.Text).changeText('合成一个大篮球');
            this._drawNextBall();
        });
        
    }

    _initSize () {
        this.width = Laya.stage.width;
        this.height = Laya.stage.height;
        (this.owner.getChildByName('ground') as Laya.Sprite).y = this.height - this._groundHeight;
        this.owner.getChildByName('wallLeft').getComponent(Laya.BoxCollider).height = this.height;
        this.owner.getChildByName('wallRight').getComponent(Laya.BoxCollider).height = this.height;
    }

    _drawNextBall () {
        const size = countSizeByValue(this.nextValue);
        const starPos = 20;
        const start = starPos - (size - starPos) / 2;
        const graphics = (this.owner as Laya.Scene).graphics;
        graphics.clear();
        graphics.drawTexture(getBgTexture(), 0, 0, this.width, this.height);
        graphics.drawTexture(getGroundTexture(), 0, this.height - this._groundHeight, this.width, this._groundHeight);

        graphics.drawTexture(getTextureByValue(this.nextValue), start, start, size, size);
    }

    onStageClick (e: Laya.Event): void {
        // 停止事件冒泡，提高性能，当然也可以不要
        if (this.height !== Laya.stage.height) {
            this._initSize();
        }
        e.stopPropagation();
        // 舞台被点击后，使用对象池创建子弹
        const x = Laya.stage.mouseX;
        const y = 50;
        this._creatNewBall(this.nextValue, x, y);
        this.nextValue = this._randomValue();
        // this.nextValue = 512;
        this._drawNextBall();
        if (this.didTipShow) {
            (this.owner.getChildByName('tip') as Laya.Text).visible = false;
            (this.owner.getChildByName('tip2') as Laya.Text).visible = false;
        }
    }

    geneNewBall (value: number, x: number, y: number, velocity: {x: number; y: number}): void {
        this.score += value;
        (this.owner.getChildByName('scoreText') as Laya.Text).changeText(this.score + '');
        this._creatNewBall(value, x, y, velocity);
        this._checkWin(value);
    }
    _random (a: number, b: number) {
        return (a + Math.round(Math.random() * (b - a)));
    }
    _randomValue () {
        return Math.pow(2, this._random(1, 3));
    }

    _creatNewBall (
        value: number = 2,
        x: number,
        y: number,
        velocity?: {x: number; y: number}
    ) {
        const flyer: Laya.Sprite = Laya.Pool.getItemByCreateFun('ball', this.ball.create, this.ball);
        const box = flyer.getComponent(Laya.CircleCollider) as Laya.CircleCollider;
        if (value !== 2) {
            const ball = flyer.getComponent(Laya.Script) as Ball;
            ball.setValue(value);
            const size = ball.getSize();
            const radius = size / 2;
            flyer.width = size;
            flyer.height = size;
            flyer.pos(x - radius, y - radius);
            flyer.texture = getTextureByValue(value);
            box.radius = size / 2;
        } else {
            const radius = 30 / 2;
            flyer.pos(x - radius, y - radius);
        }
        this._gameBox.addChild(flyer);
        const rig = flyer.getComponent(Laya.RigidBody) as Laya.RigidBody;
        if (velocity) {
            rig.setVelocity(velocity);
        }
        const attr = getRigidAttrByValue(value);
        box.density = attr.d;
        box.friction = attr.f;
        box.restitution = attr.r;
        rig.gravityScale = attr.g;
    }

    _checkWin (value: number) {
        if (this.wined) {
            return;
        }

        if (value === 1024) {
            this.wined = true;
            this.didTipShow = true;
            const tip = (this.owner.getChildByName('tip') as Laya.Text);
            const tip2 = (this.owner.getChildByName('tip2') as Laya.Text);
            tip.visible = true;
            tip.changeText('恭喜您合成了大篮球');
            tip2.visible = true;
            tip2.changeText('继续游戏可以合成更大的篮球哦');
        }

    }
}