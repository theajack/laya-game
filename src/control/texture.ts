/*
 * @Autor: theajack
 * @Date: 2021-03-25 21:59:44
 * @LastEditors: tackchen
 * @LastEditTime: 2022-02-10 08:46:25
 * @Description: Coding something
 */

const ballTextures = {
     
};

let bgTexture = null;
export function getBgTexture () {
    return bgTexture;
}
let groundTexture = null;
export function getGroundTexture () {
    return groundTexture;
}

let _onTextureReady = null;
let _number = 0;
const _max = 2;
export function onTextureReady (fn) {
    _onTextureReady = fn;
}

function textureReady () {
    _number ++;
    if (_number >= _max) {
        if (_onTextureReady) {
            _onTextureReady();
        }
    }
}

export function initTexture () {
    for (let i = 0; i < 10; i++) {
        ((index: number) => {
            ballTextures[Math.pow(2, index)] = loadTexture(`test/ball/b${index - 1}.png`);
        })(i + 1);
    }
    bgTexture = loadTexture('test/wall.jpg', textureReady);
    groundTexture = loadTexture('test/ground.jpg', textureReady);
}

function loadTexture (url: string, onReady?: Function) {
    const texture = new Laya.Texture();
    texture.load(url, Laya.Handler.create(this, () => {
        if (onReady) onReady();
    }));
    return texture;
}

export function getTextureByValue (value: number) {
    return ballTextures[value] || ballTextures[1024];
}

export function countSizeByValue (value: number) {
    return getIndexByValue(value) * 12 + 30;
}

function getIndexByValue (value: number) {
    return Math.log2(value) - 1;
}

export function getOrderByValue (value: number) {
    return getIndexByValue(value) - 9;
}


const rigidAttrs = [
    { // 弹珠
        f: 0.1, // 摩擦
        r: 0.3, // 恢复
        g: 1, // 重力
        d: 15, // 密度
    },
    { // 乒乓球
        f: 0.2,
        r: 0.5,
        g: 0.7,
        d: 5,
    },
    { // 网球
        f: 0.4,
        r: 0.6,
        g: 0.8,
        d: 7,
    },
    { // 高尔夫
        f: 0.4,
        r: 0.35,
        g: 0.9,
        d: 12,
    },
    { // 台球
        f: 0.1,
        r: 0.3,
        g: 1,
        d: 15,
    },
    { // 棒球
        f: 0.3,
        r: 0.5,
        g: 0.8,
        d: 9,
    },
    { // 保龄球
        f: 0.1,
        r: 0.3,
        g: 1,
        d: 14,
    },
    { // 排球
        f: 0.2,
        r: 0.4,
        g: 0.8,
        d: 10,
    },
    { // 足球
        f: 0.2,
        r: 0.4,
        g: 0.8,
        d: 10,
    },
    { // 篮球
        f: 0.2,
        r: 0.5,
        g: 0.8,
        d: 11,
    }
];

export function getRigidAttrByValue (value: number) {
    const index =  Math.log2(value) - 1;
    return rigidAttrs[index] || rigidAttrs[rigidAttrs.length - 1];
}