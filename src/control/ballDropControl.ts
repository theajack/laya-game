/*
 * @Author: tackchen
 * @Date: 2022-04-06 19:51:49
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-06 21:27:05
 * @FilePath: /laya-game/src/control/ballDropControl.ts
 * @Description: Coding something
 */

export class BallDrop {
    maxDropNumber = 2;

    dropNumber = 0;

    constructor () {
        
    }

    onGeneBall () {
        console.log(this.dropNumber, this.maxDropNumber);
        if (!this.canDropBall()) {
            return false;
        }
        this.dropNumber ++;
        return true;
    }

    canDropBall () {
        return this.dropNumber < this.maxDropNumber;
    }

    onCollision () {
        if (this.dropNumber > 0) {
            this.dropNumber --;
        }
    }
}