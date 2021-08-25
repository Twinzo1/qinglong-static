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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const util_1 = require("../config/util");
const config_1 = __importDefault(require("../config"));
const fs = __importStar(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let AuthService = class AuthService {
    constructor(logger) {
        this.logger = logger;
    }
    async login(payloads) {
        if (!fs.existsSync(config_1.default.authConfigFile)) {
            return this.initAuthInfo();
        }
        let { username, password, ip, address } = payloads;
        const content = fs.readFileSync(config_1.default.authConfigFile, 'utf8');
        const timestamp = Date.now();
        if (content) {
            const { username: cUsername, password: cPassword, retries = 0, lastlogon, lastip, lastaddr, } = JSON.parse(content);
            if ((cUsername === 'admin' && cPassword === 'adminadmin') ||
                !cUsername ||
                !cPassword) {
                return this.initAuthInfo();
            }
            if (retries > 2 && Date.now() - lastlogon < Math.pow(3, retries) * 1000) {
                return {
                    code: 410,
                    message: `失败次数过多，请${Math.round((Math.pow(3, retries) * 1000 - Date.now() + lastlogon) / 1000)}秒后重试`,
                    data: Math.round((Math.pow(3, retries) * 1000 - Date.now() + lastlogon) / 1000),
                };
            }
            if (username === cUsername && password === cPassword) {
                const data = util_1.createRandomString(50, 100);
                let token = jsonwebtoken_1.default.sign({ data }, config_1.default.secret, {
                    expiresIn: 60 * 60 * 24 * 3,
                    algorithm: 'HS384',
                });
                fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify(Object.assign(Object.assign({}, JSON.parse(content)), { token, lastlogon: timestamp, retries: 0, lastip: ip, lastaddr: address })));
                return { code: 200, data: { token, lastip, lastaddr, lastlogon } };
            }
            else {
                fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify(Object.assign(Object.assign({}, JSON.parse(content)), { retries: retries + 1, lastlogon: timestamp, lastip: ip, lastaddr: address })));
                return { code: 400, message: config_1.default.authError };
            }
        }
        else {
            return this.initAuthInfo();
        }
    }
    initAuthInfo() {
        const newPassword = util_1.createRandomString(16, 22);
        fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify({
            username: 'admin',
            password: newPassword,
        }));
        return {
            code: 100,
            message: '已初始化密码，请前往auth.json查看并重新登录',
        };
    }
};
AuthService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object])
], AuthService);
exports.default = AuthService;
//# sourceMappingURL=auth.js.map