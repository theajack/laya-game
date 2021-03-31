/*
 * @Author: tackchen
 * @Date: 2021-03-09 15:49:30
 * @LastEditors: tackchen
 * @LastEditTime: 2021-03-31 11:28:08
 * @FilePath: \laya-demo-empty\hack-laya.js
 * @Description: Coding something
 */

window.LAYA_BASE = '';
window.LAYA_BASE_DIR = '';

function main () {
    const script = document.querySelector('[laya-base]');
    if (script) {
        window.LAYA_BASE = script.getAttribute('laya-base');
        window.LAYA_BASE_DIR = script.getAttribute('laya-base-dir');
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
    return (window.LAYA_BASE_DIR ? '/' : '') + window.LAYA_BASE + url;
}


function hackLaya () {

    // Laya.Scene.prototype.loadScene = _buildLayaHacker(Laya.Scene.prototype.loadScene)

    // Laya.Scene.open = _buildLayaHacker(Laya.Scene.open);
    

    // Laya.AtlasInfoManager.enable = _buildLayaHacker(Laya.AtlasInfoManager.enable);

    // Laya.ResourceVersion.enable = _buildLayaHacker(Laya.ResourceVersion.enable);

    Laya.SoundManager.playSound = _buildLayaHacker(Laya.SoundManager.playSound);

    const replaceHttpUrlHandle = function (url) {
        const head = location.protocol + '//' + location.host + '/';
        let replacement = head;
        if (window.LAYA_BASE_DIR) {
            replacement += window.LAYA_BASE_DIR;
        }
        url = url.replace(replacement, head + window.LAYA_BASE);
        return url;
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