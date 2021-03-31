/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import gameControl from "./control/gameControl"
import ball from "./object/ball"
/*
* 游戏初始化配置;
*/
export default class GameConfig{
    static width:number=375;
    static height:number=667;
    static scaleMode:string="fixedwidth";
    static screenMode:string="none";
    static alignV:string="top";
    static alignH:string="left";
    static startScene:any="main.scene";
    static sceneRoot:string="";
    static debug:boolean=false;
    static stat:boolean=false;
    static physicsDebug:boolean=false;
    static exportSceneToJson:boolean=true;
    constructor(){}
    static init(){
        var reg: Function = Laya.ClassUtils.regClass;
        reg("control/gameControl.ts",gameControl);
        reg("object/ball.ts",ball);
    }
}
GameConfig.init();