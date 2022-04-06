import GameControl from '../control/gameControl';
import {countSizeByValue, getOrderByValue} from '../control/texture';

export default class Ball extends Laya.Script {
    /** @prop {name:value, tips:"球的数值", type:Number, default:1000}*/
    public value: number = 2;
    /** @prop {name:size, tips:"球的直径", type:Number, default:1000}*/
    public size: number = 30;
    // 更多参数说明请访问: https://ldc2.layabox.com/doc/?nav=zh-as-2-4-0
    constructor () { super(); }

    private _removed: boolean = false;

    hasCollide = false;
    
    onEnable (): void {
        // rig.setVelocity({ x: 0, y: 0 });
    }

    onDisable (): void {
        this._removed = true;
    }

    onTriggerEnter (other: Laya.BoxCollider, self: Laya.BoxCollider, contact: any): void {

        if (other.label !== 'wall') {
            if (!this.hasCollide) {
                this.hasCollide = true;
                GameControl.instance.ballDrop.onCollision();
            }
        }

        if (this._removed) {
            return;
        }

        const otherOwner = other.owner;

        const otherObject = otherOwner.getComponent(Laya.Script);
        if (otherObject && otherObject._removed) {
            return;
        }

        // Laya.loader.getRes()
        // (this.owner as Laya.Sprite).texture.set
        // (this.owner as Laya.Sprite).graphics.drawTexture(Laya.loader.getRes('test/ball/b0.png'), 0, 0, 30, 30)

        const thisOwner: Laya.RigidBody = this.owner.getComponent(Laya.RigidBody);
        if (other.label === 'ball') {
            const ball = otherOwner.getComponent(Laya.Script) as Ball;
            if (ball.value === this.value) {
                const otherRigid = otherOwner.getComponent(Laya.RigidBody);
                // debugger
                const velocity = {
                    x: thisOwner.linearVelocity.x + otherRigid.linearVelocity.x,
                    y: thisOwner.linearVelocity.y + otherRigid.linearVelocity.y,
                };
                const pos = contact.getHitInfo().points[0];
                this.owner.removeSelf();
                otherOwner.removeSelf();
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

    setValue (value: number): void{
        this.value = value;
        this.size = countSizeByValue(this.value);
        const text = (this.owner.getChildByName('value') as Laya.Text);
        text.width = this.size;
        text.height = this.size;
        if (this.value > 1024) {
            text.changeText(getOrderByValue(this.value) + '');
        }
    }

    getSize () {
        return this.size;
    }

    onUpdate (): void {
        if (this._removed) return;
        if ((this.owner as Laya.Sprite).y <= 0) {
            GameControl.instance.gamerOver();
        }
    }
}