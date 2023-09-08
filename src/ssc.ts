import axios, { AxiosInstance } from 'axios';

const BLOCKCHAIN_API = 'blockchain';
const CONTRACTAPI = 'contracts';

export default class SSC {
  axios: AxiosInstance;
  timeout: number;
  id: number;
  timeoutId;
  forceStopStream: boolean;
  rpcs: string[];
  rpcIndex: number;

  /**
   * send a JSON RPC request
   * @param {String[]} rpcNodeUrls the url of the JSON RPC node
   * @param {Number} timeout timeout after which the request is aborted, default 15 secs
   */
  constructor(rpcNodeUrls: string[], timeout = 15000) {
    this.axios = axios.create({
      baseURL: rpcNodeUrls[0],
      timeout,
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
  send(endpoint: string, request: object, callback: Function) {
    if (callback) {
      console.log('with callback');
      this.sendWithCallback(endpoint, request, callback);
    } else return this.sendWithPromise(endpoint, request);
  }

  /**
   * send a JSON RPC request with callback
   * @param {String} endpoint endpoint
   * @param {JSON} request request
   * @param {Function} callback callback called after the request is sent
   * @param {number} retry number of retries
   */
  sendWithCallback(endpoint: string, request: object, callback: Function, retry = 0) {
    const postData = {
      jsonrpc: '2.0',
      id: this.id,
      ...request,
    };

    this.id += 1;

    try {
      this.axios
        .post(endpoint, postData)
        .then((response) => {
          callback(null, response.data.result);
        })
        .catch((error) => {
          // console.log('error there', error);

          if (retry < this.rpcs.length && this.rpcs.length !== 1) {
            console.log('retry', retry);

            return this.useNextRPCNode().then(() => {
              return this.sendWithCallback(endpoint, request, callback, retry + 1);
            });
          } else callback(error, null);
        });
    } catch (err) {
      // console.log('error here', err);
      if (retry < this.rpcs.length && this.rpcs.length !== 1) {
        console.log('retry', retry);
        return this.useNextRPCNode().then(() => {
          return this.sendWithCallback(endpoint, request, callback, retry + 1);
        });
      } else callback('Node non reachable', null);
    }
  }

  /**
   * send a JSON RPC request, return a promise
   * @param {String} endpoint endpoint
   * @param {JSON} request request
   * @param {number} retry number of retries
   * @returns {Promise<JSON>} returns a promise
   */
  sendWithPromise(endpoint: string, request: object, retry = 0) {
    const postData = {
      jsonrpc: '2.0',
      id: this.id,
      ...request,
    };

    this.id += 1;

    return new Promise((resolve, reject) => {
      try {
        this.axios
          .post(endpoint, postData)
          .then((response) => {
            resolve(response.data.result);
          })
          .catch((error) => {
            // console.log('err h', error);
            if (retry < this.rpcs.length && this.rpcs.length !== 1) {
              console.log('retry', retry);

              return this.useNextRPCNode().then(() => {
                return this.sendWithPromise(endpoint, request, retry + 1);
              });
            } else reject(error);
          });
      } catch (err) {
        // console.log('er ther', err);
        if (retry < this.rpcs.length && this.rpcs.length !== 1) {
          console.log('retry', retry);

          return this.useNextRPCNode().then(() => {
            return this.sendWithPromise(endpoint, request, retry + 1);
          });
        } else reject(err);
      }
    });
  }

  /**
   * Get the information of a contract (owner, source code, etc...)
   * @param {String} name contract name
   * @param {Function} callback callback called if passed
   * @returns {Promise<JSON>} returns a promise if no callback passed
   */
  getContractInfo(name: string, callback: Function = null) {
    const request = {
      method: 'getContract',
      params: {
        name,
      },
    };

    return this.send(CONTRACTAPI, request, callback);
  }

  /**
   * retrieve a record from the table of a contract
   * @param {String} contract contract name
   * @param {String} table table name
   * @param {JSON} query query to perform on the table
   * @param {Function} callback callback called if passed
   * @returns {Promise<JSON>} returns a promise if no callback passed
   */
  findOne(contract: string, table: string, query: object, callback: Function = null) {
    const request = {
      method: 'findOne',
      params: {
        contract,
        table,
        query,
      },
    };

    return this.send(CONTRACTAPI, request, callback);
  }

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
  find(
    contract: string,
    table: string,
    query: object,
    limit = 1000,
    offset = 0,
    indexes: object[] = [],
    callback: Function = null,
  ) {
    const request = {
      method: 'find',
      params: {
        contract,
        table,
        query,
        limit,
        offset,
        indexes,
      },
    };

    return this.send(CONTRACTAPI, request, callback);
  }

  /**
   * retrieve the latest block info of the sidechain
   * @param {Function} callback callback called if passed
   * @returns {Promise<JSON>} returns a promise if no callback passed
   */
  getLatestBlockInfo(callback: Function = null) {
    const request = {
      method: 'getLatestBlockInfo',
    };

    return this.send(BLOCKCHAIN_API, request, callback);
  }

  /**
   * retrieve the specified block info of the sidechain
   * @param {Number} blockNumber block number
   * @param {Function} callback callback called if passed
   * @returns {Promise<JSON>} returns a promise if no callback passed
   */
  getBlockInfo(blockNumber: number, callback: Function = null) {
    const request = {
      method: 'getBlockInfo',
      params: {
        blockNumber,
      },
    };

    return this.send(BLOCKCHAIN_API, request, callback);
  }

  /**
   * retrieve the specified transaction info of the sidechain
   * @param {String} txid transaction id
   * @param {Function} callback callback called if passed
   * @returns {Promise<JSON>} returns a promise if no callback passed
   */
  getTransactionInfo(txid: string, callback: Function = null) {
    const request = {
      method: 'getTransactionInfo',
      params: {
        txid,
      },
    };

    return this.send(BLOCKCHAIN_API, request, callback);
  }

  /**
   * stream part of the sidechain
   * @param {Number} startBlock the first block to retrieve
   * @param {Number} endBlock if passed the stream will stop after the block is retrieved
   * @param {Function} callback callback called everytime a block is retrieved
   * @param {Number} pollingTime polling time, default 1 sec
   */
  async streamFromTo(
    startBlock: number,
    endBlock: number = null,
    callback: Function,
    pollingTime = 1000,
  ) {
    try {
      const res = await this.getBlockInfo(startBlock);
      let nextBlock = startBlock;
      if (res !== null) {
        await callback(null, res);
        nextBlock += 1;
      }

      if (endBlock === null || (endBlock && nextBlock <= endBlock)) {
        if (!this.forceStopStream) {
          this.timeoutId = setTimeout(() => {
            this.streamFromTo(nextBlock, endBlock, callback, pollingTime);
          }, pollingTime);
        }
      }
    } catch (err) {
      await callback(err, null);
      this.timeoutId = setTimeout(() => {
        this.streamFromTo(startBlock, endBlock, callback, pollingTime);
      }, pollingTime);
    }
  }

  /**
   * stream the sidechain (starting from the latest block produced)
   * @param {Function} callback callback called everytime a block is retrieved
   * @param {Number} pollingTime polling time, default 1 sec
   */
  async stream(callback: Function, pollingTime = 1000) {
    const { blockNumber } = await this.getLatestBlockInfo();

    this.streamFromTo(blockNumber, null, callback, pollingTime);
  }

  /**
   * Switch to the next RPC Node
   */
  async useNextRPCNode() {
    let newRpcIndex = this.rpcIndex + 1;
    if (newRpcIndex >= this.rpcs.length) newRpcIndex = 0;
    this.rpcIndex = newRpcIndex;
    const newNode = this.rpcs[this.rpcIndex];
    await this.updateNode(newNode);
  }

  /**
   * Update dynamically the RPC without creating a new instance
   * @param {string} newRpcNodeUrl callback called everytime a block is retrieved
   */
  async updateNode(newRpcNodeUrl: string) {
    console.log('update to ', newRpcNodeUrl);
    this.axios = axios.create({
      baseURL: newRpcNodeUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Connection: 'keep-alive',
      },
    });
    this.rpcIndex = this.rpcs.indexOf(newRpcNodeUrl) || 0;
    await sleep(1000);
  }

  getRPC() {
    return this.rpcs[this.rpcIndex];
  }

  /**
   * Stop the stream
   */
  cancelStream() {
    this.forceStopStream = true;
    clearTimeout(this.timeoutId);
  }
}

const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};
