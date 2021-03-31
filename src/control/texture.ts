/*
 * @Autor: theajack
 * @Date: 2021-03-25 21:59:44
 * @LastEditors: tackchen
 * @LastEditTime: 2021-03-31 11:26:46
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
            Laya.Texture2D.load(`test/ball/b${index - 1}.png`, Laya.Handler.create(this, (texture: Laya.Texture) => {
                ballTextures[Math.pow(2, index)] = texture;
            }));
        })(i + 1);
    }
    Laya.Texture2D.load(`test/wall.jpg`, Laya.Handler.create(this, (texture: Laya.Texture) => {
        bgTexture = texture;
        textureReady();
    }));
    Laya.Texture2D.load(`test/ground.jpg`, Laya.Handler.create(this, (texture: Laya.Texture) => {
        groundTexture = texture;
        textureReady();
    }));
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

export function getRigidAttrByValue (value: number) {
    const index =  Math.log2(value) - 1;
    return rigidAttrs[index] || rigidAttrs[rigidAttrs.length - 1];
}