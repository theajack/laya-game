/*
 * @Author: tackchen
 * @Date: 2022-04-06 19:51:49
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-06 23:18:17
 * @FilePath: /laya-game/src/control/ballDropControl.ts
 * @Description: Coding something
 */

export class BallDrop {
    maxDropNumber = 2;

    dropNumber = 0;

    lastTime = 0;
    timeGap = 300;

    constructor () {
        
    }

    onGeneBall () {
        console.log(this.dropNumber, this.maxDropNumber);
        if (!this.canDropBall()) {
            return false;
        }
        this.dropNumber ++;
        this.lastTime = Date.now();
        return true;
    }

    canDropBall () {
        if (Date.now() - this.lastTime < this.timeGap) {
            return false;
        }
        return this.dropNumber < this.maxDropNumber;
    }

    onCollision () {
        if (this.dropNumber > 0) {
            this.dropNumber --;
        }
    }
}