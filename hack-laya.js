/*
 * @Author: tackchen
 * @Date: 2021-03-09 15:49:30
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-06 21:44:53
 * @FilePath: /laya-game/hack-laya.js
 * @Description: Coding something
 */

window.LAYA_BASE = ''; // laya assets存储路径
window.LAYA_BASE_DIR = ''; // 访问的path

function main () {
    const script = document.querySelector('[laya-base]');
    if (script) {
        window.LAYA_BASE = script.getAttribute('laya-base');
        window.LAYA_BASE_DIR = script.getAttribute('laya-base-dir') || location.pathname.substring(1);
    }
    loadLib('index.js');
}

main();

function loadLib (url) {
    const script = document.createElement('script');
    script.async = false;
    
    script.src = concatUrl(url);
    document.body.appendChild(script);

    if (url.indexOf('laya.core') !== -1) {
        script.onload = function () {
            hackLaya();
        };
    }
}

function concatUrl (url) {
    if (isLayaBaseAHttpLink()) {
        return window.LAYA_BASE + url;
    }
    const host = location.protocol + '//' + location.host;
    return host + (window.LAYA_BASE_DIR ? '/' : '') + window.LAYA_BASE + url;
}

function isLayaBaseAHttpLink () {
    return /^https?:\/\//.test(window.LAYA_BASE);
}

function replaceAssetsUrl (url) {
    const head = location.protocol + '//' + location.host;

    let replacement = head;
    if (window.LAYA_BASE_DIR && location.pathname.indexOf(window.LAYA_BASE_DIR) !== -1) {
        replacement += window.LAYA_BASE_DIR;
    }
    const value = (isLayaBaseAHttpLink() ? '' : head) + window.LAYA_BASE;
    return url.replace(replacement, value);
}


function hackLaya () {

    // Laya.Scene.prototype.loadScene = _buildLayaHacker(Laya.Scene.prototype.loadScene)

    // Laya.Scene.open = _buildLayaHacker(Laya.Scene.open);
    

    // Laya.AtlasInfoManager.enable = _buildLayaHacker(Laya.AtlasInfoManager.enable);

    // Laya.ResourceVersion.enable = _buildLayaHacker(Laya.ResourceVersion.enable);

    Laya.SoundManager.playSound = _buildLayaHacker(Laya.SoundManager.playSound);

    const replaceHttpUrlHandle = function (url) {
        // console.log('replaceHttpUrlHandle', url);
        return replaceAssetsUrl(url);
    };
    Laya.HttpRequest.prototype.send = _buildLayaHacker(Laya.HttpRequest.prototype.send, replaceHttpUrlHandle);

    Laya.Loader.prototype._loadHtmlImage = _buildLayaHacker(Laya.Loader.prototype._loadHtmlImage, replaceHttpUrlHandle);

}

function _buildLayaHacker (fn, handle, index) {
    if (!index) {index = 0;}
    if (!handle) {
        handle = function (url) {
            return concatUrl(url);
        };
    }
    return function () {
        // console.log(arguments)
        const args = arguments;
        args[index] = handle(args[index]);
        fn.apply(this, args);
    };
}