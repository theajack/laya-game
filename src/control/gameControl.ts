
import Ball from '../object/ball';
import {BallDrop} from './ballDropControl';
import {countSizeByValue, getBgTexture, getGroundTexture, getRigidAttrByValue, getTextureByValue, initTexture, onTextureReady} from './texture';

/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */

function setDocumentTitle (text: string) {
    if (window.document) {
        try {
            window.document.title = text;
        } catch (e) {
            
        }
    }
}

setDocumentTitle('游戏资源加载中...');


export const TextManager = (() => {
    let titleText: Laya.Text;
    let descText: Laya.Text;
    return {
        init (control: GameControl) {
            titleText = control.owner.getChildByName('tip') as Laya.Text;
            descText = control.owner.getChildByName('tip2') as Laya.Text;
        },
        setText (title: string, desc?:string) {
            titleText.changeText(title);
            titleText.visible = true;

            if (desc) {
                descText.changeText(desc);
                descText.visible = true;
            }
        },

        clearText () {
            titleText.visible = false;
            descText.visible = false;
        }
    };
})();

const HighScoreManager = (() => {

    const KEY = 'BALL_HIGH_SCORE';

    let high = 0;

    let text: Laya.Text;

    return {
        initText (control: GameControl) {
            const value = Laya.LocalStorage.getItem(KEY);
            if (value) {
                high = parseInt(value);
            }
            text = control.owner.getChildByName('highText') as Laya.Text;
            text.changeText(high + '');
        },
        record (score: number) {
            if (score > high) {
                high = score;
                Laya.LocalStorage.setItem(KEY, high + '');
                text.changeText(high + '');
            }
        }
    };
})();

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

    private losed = false;

    ballDrop = new BallDrop();

    constructor () {
        super();
        GameControl.instance = this;
        (window as any).game = this;
    }

    onEnable (): void {
        this._gameBox = this.owner.getChildByName('gameBox') as Laya.Sprite;
        this._initSize();
        this._initGravity();
        initTexture();
        onTextureReady(() => {
            setDocumentTitle('合成一个大篮球~');
            (this.owner.getChildByName('tip') as Laya.Text).changeText('合成一个大篮球');
            this._drawNextBall();
        });
        HighScoreManager.initText(this);
        TextManager.init(this);
    }

    _initGravity () {

        Laya.Gyroscope.instance.on(Laya.Event.CHANGE, this, (bool, info) => {
            const value = info.gamma;
            const abs = Math.abs(value);
            if (abs < 10) {
                Laya.Physics.I.gravity = {x: 0, y: 10};
            } else {
                const sign = Math.sign(value);
                Laya.Physics.I.gravity = {x: ((abs / 30) + 1) * sign, y: 10};
            }
        });
    }

    _initSize () {
        this.width = Laya.stage.width;
        this.height = Laya.stage.height;
        (this.owner.getChildByName('ground') as Laya.Sprite).y = this.height - this._groundHeight;
        this.owner.getChildByName('wallLeft').getComponent(Laya.BoxCollider).height = this.height;
        this.owner.getChildByName('wallRight').getComponent(Laya.BoxCollider).height = this.height;
    }

    _drawNextBall (mouseX?: number) {
        const size = countSizeByValue(this.nextValue);
        const starPos = 20;
        const start = starPos - (size - starPos) / 2;
        const graphics = (this.owner as Laya.Scene).graphics;
        graphics.clear();
        const bt = getBgTexture();

        graphics.drawTexture(bt, 0, 0, this.width, this.height);
        graphics.drawTexture(getGroundTexture(), 0, this.height - this._groundHeight, this.width, this._groundHeight);

        const x = typeof mouseX === 'number' ? mouseX - size / 2 : start;
        graphics.drawTexture(getTextureByValue(this.nextValue), x, start, size, size);
    }

    onStageMouseDown (e: Laya.Event): void {
        e.stopPropagation();
        if (this.losed) {
            return;
        }
        if (this.ballDrop.canDropBall()) {
            this._drawNextBall(Laya.stage.mouseX);
        }
    }
    onStageMouseUp (e: Laya.Event): void {
        // console.log('onStageMouseUp');
        e.stopPropagation();
        if (this.losed) {
            this.resetGame();
            return;
        }
        this.onDropNewBall();
    }
    onStageMouseMove (e: Laya.Event): void {
        e.stopPropagation();
        if (this.losed) {
            return;
        }
        if (this.ballDrop.canDropBall())
            this._drawNextBall(Laya.stage.mouseX);
    }
    // Laya.Gyroscope.instance.on(Laya.Event.CHANGE,this, (a,b,c)=>{

    //     console.log(a,b,c)
    // });
    // onStageClick (e: Laya.Event): void {
    //     // 停止事件冒泡，提高性能，当然也可以不要
    //     e.stopPropagation();
    //     this.onDropNewBall();
    // }

    onDropNewBall () {
        // console.log('onDropNewBall');
        if (this.height !== Laya.stage.height) {
            this._initSize();
        }

        if (!this.ballDrop.onGeneBall()) {
            return;
        }

        const x = Laya.stage.mouseX;
        const y = 50;
        this._creatNewBall(this.nextValue, x, y, {x: 0, y: 4}); // ! 给一个初始速度
        this.nextValue = this._randomValue();
        // this.nextValue = 512;
        this._drawNextBall();
        if (this.didTipShow) {
            TextManager.clearText();
        }
    }

    setScore (value: number) {
        this.score = value;
        (this.owner.getChildByName('scoreText') as Laya.Text).changeText(value + '');
    }

    geneNewBall (value: number, x: number, y: number, velocity: {x: number; y: number}): void {
        this.setScore(this.score + value);
        this._creatNewBall(value, x, y, velocity).hasCollide = true;
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
        velocity?: {x: number; y: number},
    ) {
        // 舞台被点击后，使用对象池创建球
        const flyer: Laya.Sprite = Laya.Pool.getItemByCreateFun('ball', this.ball.create, this.ball);
        const box = flyer.getComponent(Laya.CircleCollider) as Laya.CircleCollider;

        const ball = flyer.getComponent(Laya.Script) as Ball;
        if (value !== 2) {
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
        return ball;
    }

    _checkWin (value: number) {
        if (this.wined) {
            return;
        }

        if (value === 1024) {
            this.wined = true;
            this.didTipShow = true;

            TextManager.setText(
                '恭喜您合成了大篮球',
                '继续游戏可以合成更大的篮球哦'
            );
        }

    }

    gamerOver () {
        if (this.losed) return;
        this.losed = true;
        HighScoreManager.record(this.score);

        TextManager.setText(
            '游戏结束',
            '点击屏幕重新开始'
        );
    }

    resetGame () {
        this._gameBox.removeChildren();
        this.setScore(0);
        this.losed = false;
        TextManager.clearText();
    }
}