"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetIp = exports.getToken = exports.createRandomString = exports.getLastModifyFilePath = exports.getFileContentByName = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const got_1 = __importDefault(require("got"));
function getFileContentByName(fileName) {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf8');
    }
    return '';
}
exports.getFileContentByName = getFileContentByName;
function getLastModifyFilePath(dir) {
    let filePath = '';
    if (fs.existsSync(dir)) {
        const arr = fs.readdirSync(dir);
        arr.forEach((item) => {
            const fullpath = path.join(dir, item);
            const stats = fs.statSync(fullpath);
            if (stats.isFile()) {
                if (stats.mtimeMs >= 0) {
                    filePath = fullpath;
                }
            }
        });
    }
    return filePath;
}
exports.getLastModifyFilePath = getLastModifyFilePath;
function createRandomString(min, max) {
    const num = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const english = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
    ];
    const ENGLISH = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
    ];
    const special = ['-', '_', '#'];
    const config = num.concat(english).concat(ENGLISH).concat(special);
    const arr = [];
    arr.push(getOne(num));
    arr.push(getOne(english));
    arr.push(getOne(ENGLISH));
    arr.push(getOne(special));
    const len = min + Math.floor(Math.random() * (max - min + 1));
    for (let i = 4; i < len; i++) {
        arr.push(config[Math.floor(Math.random() * config.length)]);
    }
    const newArr = [];
    for (let j = 0; j < len; j++) {
        newArr.push(arr.splice(Math.random() * arr.length, 1)[0]);
    }
    function getOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    return newArr.join('');
}
exports.createRandomString = createRandomString;
function getToken(req) {
    const { authorization } = req.headers;
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
        return authorization.split(' ')[1];
    }
    return '';
}
exports.getToken = getToken;
async function getNetIp(req) {
    const ipArray = [
        ...new Set([
            ...(req.headers['x-real-ip'] || '').split(','),
            ...(req.headers['x-forwarded-for'] || '').split(','),
            req.ip,
            ...req.ips,
            req.socket.remoteAddress,
        ]),
    ];
    let ip = ipArray[0];
    console.log(`访问的ip ${ipArray.toString()}`);
    if (ipArray.length > 1) {
        for (let i = 0; i < ipArray.length; i++) {
            const ipNumArray = ipArray[i].split('.');
            const tmp = ipNumArray[0] + '.' + ipNumArray[1];
            if (tmp === '192.168' ||
                (ipNumArray[0] === '172' &&
                    ipNumArray[1] >= 16 &&
                    ipNumArray[1] <= 32) ||
                tmp === '10.7' ||
                tmp === '127.0') {
                continue;
            }
            ip = ipArray[i];
            break;
        }
    }
    ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
    if (ip.includes('127.0') || ip.includes('192.168') || ip.includes('10.7')) {
        ip = '';
    }
    try {
        const { data } = await got_1.default
            .get(`https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=${ip}&co=&resource_id=6006&t=1555898284898&ie=utf8&oe=utf8&format=json&tn=baidu`)
            .json();
        return { address: data[0].location, ip };
    }
    catch (error) {
        try {
            const { country, regionName, city } = await got_1.default
                .get(`http://ip-api.com/json/${ip}?lang=zh-CN`)
                .json();
            return { address: `${country} ${regionName} ${city}`, ip };
        }
        catch (err) {
            return { address: `获取失败`, ip };
        }
    }
}
exports.getNetIp = getNetIp;
//# sourceMappingURL=util.js.map