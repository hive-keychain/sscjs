import { AxiosInstance } from 'axios';
export default class SSC {
    axios: AxiosInstance;
    timeout: number;
    id: number;
    timeoutId: any;
    forceStopStream: boolean;
    rpcs: string[];
    rpcIndex: number;
    /**
     * send a JSON RPC request
     * @param {String[]} rpcNodeUrls the url of the JSON RPC node
     * @param {Number} timeout timeout after which the request is aborted, default 15 secs
     */
    constructor(rpcNodeUrls: string[], timeout?: number);
    /**
     * send a JSON RPC request
     * @param {String} endpoint endpoint
     * @param {JSON} request request
     * @param {Function} callback callback called after the request is sent if passed (a promise is returned otherwise)
     */
    send(endpoint: string, request: object, callback: Function): any;
    /**
     * send a JSON RPC request with callback
     * @param {String} endpoint endpoint
     * @param {JSON} request request
     * @param {Function} callback callback called after the request is sent
     * @param {number} retry number of retries
     */
    sendWithCallback(endpoint: string, request: object, callback: Function, retry?: number): any;
    /**
     * send a JSON RPC request, return a promise
     * @param {String} endpoint endpoint
     * @param {JSON} request request
     * @param {number} retry number of retries
     * @returns {Promise<JSON>} returns a promise
     */
    sendWithPromise(endpoint: string, request: object, retry?: number): any;
    /**
     * Get the information of a contract (owner, source code, etc...)
     * @param {String} name contract name
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    getContractInfo(name: string, callback?: Function): any;
    /**
     * retrieve a record from the table of a contract
     * @param {String} contract contract name
     * @param {String} table table name
     * @param {JSON} query query to perform on the table
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    findOne(contract: string, table: string, query: object, callback?: Function): any;
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
    find(contract: string, table: string, query: object, limit?: number, offset?: number, indexes?: object[], callback?: Function): any;
    /**
     * retrieve the latest block info of the sidechain
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    getLatestBlockInfo(callback?: Function): any;
    /**
     * retrieve the specified block info of the sidechain
     * @param {Number} blockNumber block number
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    getBlockInfo(blockNumber: number, callback?: Function): any;
    /**
     * retrieve the specified transaction info of the sidechain
     * @param {String} txid transaction id
     * @param {Function} callback callback called if passed
     * @returns {Promise<JSON>} returns a promise if no callback passed
     */
    getTransactionInfo(txid: string, callback?: Function): any;
    /**
     * stream part of the sidechain
     * @param {Number} startBlock the first block to retrieve
     * @param {Number} endBlock if passed the stream will stop after the block is retrieved
     * @param {Function} callback callback called everytime a block is retrieved
     * @param {Number} pollingTime polling time, default 1 sec
     */
    streamFromTo(startBlock: number, endBlock: number, callback: Function, pollingTime?: number): Promise<void>;
    /**
     * stream the sidechain (starting from the latest block produced)
     * @param {Function} callback callback called everytime a block is retrieved
     * @param {Number} pollingTime polling time, default 1 sec
     */
    stream(callback: Function, pollingTime?: number): Promise<void>;
    /**
     * Switch to the next RPC Node
     */
    useNextRPCNode(): Promise<void>;
    /**
     * Update dynamically the RPC without creating a new instance
     * @param {string} newRpcNodeUrl callback called everytime a block is retrieved
     */
    updateNode(newRpcNodeUrl: string): Promise<void>;
    getRPC(): string;
    /**
     * Stop the stream
     */
    cancelStream(): void;
}
