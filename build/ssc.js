"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var BLOCKCHAIN_API = 'blockchain';
var CONTRACTAPI = 'contracts';
var SSC = /** @class */ (function () {
    /**
     * send a JSON RPC request
     * @param {String[]} rpcNodeUrls the url of the JSON RPC node
     * @param {Number} timeout timeout after which the request is aborted, default 15 secs
     */
    function SSC(rpcNodeUrls, timeout) {
        if (timeout === void 0) { timeout = 15000; }
        this.axios = axios_1.default.create({
            baseURL: rpcNodeUrls[0],
            timeout: timeout,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Connection: 'keep-alive',
            },
        });
        this.timeout = timeout;
        this.id = 1;
        this.timeoutId = null;
        this.forceStopStream = false;
        this.rpcs = rpcNodeUrls;
        this.rpcIndex = 0;
    }
    /**
     * send a JSON RPC request
     * @param {String} endpoint endpoint
     * @param {JSON} request request
     * @param {Function} callback callback called after the request is sent if passed (a promise is returned otherwise)
     */
    SSC.prototype.send = function (endpoint, request, callback) {
        if (callback) {
            this.sendWithCallback(endpoint, request, callback);
        }
        else
            return this.sendWithPromise(endpoint, request);
    };
    /**
     * send a JSON RPC request with callback
     * @param {String} endpoint endpoint
     * @param {JSON} request request
     * @param {Function} callback callback called after the request is sent
     * @param {number} retry number of retries
     */
    SSC.prototype.sendWithCallback = function (endpoint, request, callback, retry) {
        var _this = this;
        if (retry === void 0) { retry = 0; }
        var postData = __assign({ jsonrpc: '2.0', id: this.id }, request);
        this.id += 1;
        try {
            this.axios
                .post(endpoint, postData)
                .then(function (response) {
                callback(null, response.data.result);
            })
                .catch(function (error) {
                // console.log('error there', error);
                if (retry < _this.rpcs.length && _this.rpcs.length !== 1) {
                    console.log('retry', retry);
                    _this.useNextRPCNode();
                    return _this.sendWithCallback(endpoint, request, callback, retry + 1);
                }
                else
                    callback(error, null);
            });
        }
        catch (err) {
            // console.log('error here', err);
            if (retry < this.rpcs.length && this.rpcs.length !== 1) {
                console.log('retry', retry);
                this.useNextRPCNode();
                return this.sendWithCallback(endpoint, request, callback, retry + 1);
            }
            else
                callback('Node non reachable', null);
        }
    };
    /**
     * send a JSON RPC request, return a promise
     * @param {String} endpoint endpoint
     * @param {JSON} request request
     * @param {number} retry number of retries
     * @returns {Promise<JSON>} returns a promise
     */
    SSC.prototype.sendWithPromise = function (endpoint, request, retry) {
        var _this = this;
        if (retry === void 0) { retry = 0; }
        var postData = __assign({ jsonrpc: '2.0', id: this.id }, request);
        this.id += 1;
        return new Promise(function (resolve, reject) {
            try {
                _this.axios
                    .post(endpoint, postData)
                    .then(function (response) {
                    resolve(response.data.result);
                })
                    .catch(function (error) {
                    // console.log('err h', error);
                    if (retry < _this.rpcs.length && _this.rpcs.length !== 1) {
                        console.log('retry w p', retry);
                        _this.useNextRPCNode();
                        resolve(_this.sendWithPromise(endpoint, request, retry + 1));
                    }
                    else
                        reject(error);
                });
            }
            catch (err) {
                // console.log('er ther', err);
                if (retry < _this.rpcs.length && _this.rpcs.length !== 1) {
                    console.log('retry w p c', retry);
                    _this.useNextRPCNode();
                    resolve(_this.sendWithPromise(endpoint, request, retry + 1));
                }
                else
                    reject(err);
            }
        });
    };
    /**
     * Get the information of a contract (owner, source code, etc...)
     * @param {String} name contract name
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    SSC.prototype.getContractInfo = function (name, callback) {
        if (callback === void 0) { callback = null; }
        var request = {
            method: 'getContract',
            params: {
                name: name,
            },
        };
        return this.send(CONTRACTAPI, request, callback);
    };
    /**
     * retrieve a record from the table of a contract
     * @param {String} contract contract name
     * @param {String} table table name
     * @param {JSON} query query to perform on the table
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    SSC.prototype.findOne = function (contract, table, query, callback) {
        if (callback === void 0) { callback = null; }
        var request = {
            method: 'findOne',
            params: {
                contract: contract,
                table: table,
                query: query,
            },
        };
        return this.send(CONTRACTAPI, request, callback);
    };
    /**
     * retrieve records from the table of a contract
     * @param {String} contract contract name
     * @param {String} table table name
     * @param {JSON} query query to perform on the table
     * @param {Integer} limit limit the number of records to retrieve
     * @param {Integer} offset offset applied to the records set
     * @param {Array<Object>} indexes array of index definitions { index: string, descending: boolean }
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    SSC.prototype.find = function (contract, table, query, limit, offset, indexes, callback) {
        if (limit === void 0) { limit = 1000; }
        if (offset === void 0) { offset = 0; }
        if (indexes === void 0) { indexes = []; }
        if (callback === void 0) { callback = null; }
        var request = {
            method: 'find',
            params: {
                contract: contract,
                table: table,
                query: query,
                limit: limit,
                offset: offset,
                indexes: indexes,
            },
        };
        return this.send(CONTRACTAPI, request, callback);
    };
    /**
     * retrieve the latest block info of the sidechain
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    SSC.prototype.getLatestBlockInfo = function (callback) {
        if (callback === void 0) { callback = null; }
        var request = {
            method: 'getLatestBlockInfo',
        };
        return this.send(BLOCKCHAIN_API, request, callback);
    };
    /**
     * retrieve the specified block info of the sidechain
     * @param {Number} blockNumber block number
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    SSC.prototype.getBlockInfo = function (blockNumber, callback) {
        if (callback === void 0) { callback = null; }
        var request = {
            method: 'getBlockInfo',
            params: {
                blockNumber: blockNumber,
            },
        };
        return this.send(BLOCKCHAIN_API, request, callback);
    };
    /**
     * retrieve the specified transaction info of the sidechain
     * @param {String} txid transaction id
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    SSC.prototype.getTransactionInfo = function (txid, callback) {
        if (callback === void 0) { callback = null; }
        var request = {
            method: 'getTransactionInfo',
            params: {
                txid: txid,
            },
        };
        return this.send(BLOCKCHAIN_API, request, callback);
    };
    /**
     * stream part of the sidechain
     * @param {Number} startBlock the first block to retrieve
     * @param {Number} endBlock if passed the stream will stop after the block is retrieved
     * @param {Function} callback callback called everytime a block is retrieved
     * @param {Number} pollingTime polling time, default 1 sec
     */
    SSC.prototype.streamFromTo = function (startBlock, endBlock, callback, pollingTime) {
        if (endBlock === void 0) { endBlock = null; }
        if (pollingTime === void 0) { pollingTime = 1000; }
        return __awaiter(this, void 0, void 0, function () {
            var res, nextBlock_1, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        return [4 /*yield*/, this.getBlockInfo(startBlock)];
                    case 1:
                        res = _a.sent();
                        nextBlock_1 = startBlock;
                        if (!(res !== null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, callback(null, res)];
                    case 2:
                        _a.sent();
                        nextBlock_1 += 1;
                        _a.label = 3;
                    case 3:
                        if (endBlock === null || (endBlock && nextBlock_1 <= endBlock)) {
                            if (!this.forceStopStream) {
                                this.timeoutId = setTimeout(function () {
                                    _this.streamFromTo(nextBlock_1, endBlock, callback, pollingTime);
                                }, pollingTime);
                            }
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        return [4 /*yield*/, callback(err_1, null)];
                    case 5:
                        _a.sent();
                        this.timeoutId = setTimeout(function () {
                            _this.streamFromTo(startBlock, endBlock, callback, pollingTime);
                        }, pollingTime);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * stream the sidechain (starting from the latest block produced)
     * @param {Function} callback callback called everytime a block is retrieved
     * @param {Number} pollingTime polling time, default 1 sec
     */
    SSC.prototype.stream = function (callback, pollingTime) {
        if (pollingTime === void 0) { pollingTime = 1000; }
        return __awaiter(this, void 0, void 0, function () {
            var blockNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getLatestBlockInfo()];
                    case 1:
                        blockNumber = (_a.sent()).blockNumber;
                        this.streamFromTo(blockNumber, null, callback, pollingTime);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Switch to the next RPC Node
     */
    SSC.prototype.useNextRPCNode = function () {
        var newRpcIndex = this.rpcIndex + 1;
        if (newRpcIndex >= this.rpcs.length)
            newRpcIndex = 0;
        this.rpcIndex = newRpcIndex;
        var newNode = this.rpcs[this.rpcIndex];
        this.updateNode(newNode);
    };
    /**
     * Update dynamically the RPC without creating a new instance
     * @param {string} newRpcNodeUrl callback called everytime a block is retrieved
     */
    SSC.prototype.updateNode = function (newRpcNodeUrl) {
        console.log('update to ', newRpcNodeUrl);
        this.axios = axios_1.default.create({
            baseURL: newRpcNodeUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Connection: 'keep-alive',
            },
        });
        this.rpcIndex = this.rpcs.indexOf(newRpcNodeUrl) || 0;
    };
    SSC.prototype.getRPC = function () {
        return this.rpcs[this.rpcIndex];
    };
    /**
     * Stop the stream
     */
    SSC.prototype.cancelStream = function () {
        this.forceStopStream = true;
        clearTimeout(this.timeoutId);
    };
    return SSC;
}());
exports.default = SSC;
//# sourceMappingURL=ssc.js.map