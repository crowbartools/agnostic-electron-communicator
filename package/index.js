"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
const onmessage_1 = __importDefault(require("./onmessage"));
function disconnectHandler() {
    this[symbols_1.$pending].forEach(invocation => {
        invocation.handler({
            id: invocation.id,
            type: 'result',
            name: invocation.name,
            status: 'error',
            data: 'connection lost'
        });
    });
    this[symbols_1.$pending] = [];
}
class Communicator {
    constructor(transport, options) {
        this[_a] = Object.create(null);
        this[_b] = Object.create(null);
        this[_c] = 1;
        let sendTimeout = 30000;
        if (options?.sendTimeout !== null) {
            if (options?.sendTimeout) {
                sendTimeout = options.sendTimeout;
            }
            else {
                sendTimeout = 0;
            }
        }
        let invokeTimeout = 30000;
        if (options?.invokeTimeout !== null) {
            if (options?.invokeTimeout) {
                invokeTimeout = options.invokeTimeout;
            }
            else {
                invokeTimeout = 0;
            }
        }
        if (sendTimeout && invokeTimeout < sendTimeout) {
            invokeTimeout = sendTimeout;
        }
        this[symbols_1.$options] = { sendTimeout, invokeTimeout };
        this[symbols_1.$transport] = transport;
        transport.aecDisconnection(disconnectHandler.bind(this));
        transport.aecMessage(onmessage_1.default.bind(this));
    }
    ready() {
        return this[symbols_1.$transport].aecReady();
    }
    on(event, handler, once = false) {
        if (typeof event !== 'string' || event === '') {
            // error;
        }
        if (typeof handler !== 'function') {
            // error
        }
        if (once != null && !!once !== once) {
            // error
        }
        once = !!once;
        if (this[symbols_1.$listeners][event]) {
            this[symbols_1.$listeners][event].push({ handler, once });
        }
        else {
            this[symbols_1.$listeners][event] = [{ handler, once }];
        }
    }
    off(event, handler, once = false) {
        if (typeof event !== 'string' || event === '') {
            // error;
        }
        if (typeof handler !== 'function') {
            // error
        }
        if (once != null && !!once !== once) {
            // error
        }
        once = !!once;
        const eventListeners = this[symbols_1.$listeners][event];
        if (eventListeners != null) {
            const idx = eventListeners.findIndex(listener => listener.handler === handler && listener.once === once);
            if (idx > -1) {
                eventListeners.splice(idx, 1);
            }
            if (eventListeners.length === 0) {
                delete this[symbols_1.$listeners][event];
            }
        }
    }
    offAll(event) {
        if (event == null) {
            this[symbols_1.$listeners] = Object.create(null);
        }
        else if (typeof event !== 'string' || event === '') {
            // error
        }
        else if (this[symbols_1.$listeners][event]) {
            delete this[symbols_1.$listeners][event];
        }
    }
    invoke(method, ...args) {
        return new Promise((resolver, rejecter) => {
            const msgid = this[symbols_1.$messageId];
            this[symbols_1.$messageId] += 1;
            let fulfilled = false, timeout;
            const resolve = (result) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    resolver(result);
                }
            };
            const reject = (reason) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    rejecter(reason);
                }
            };
            if (this[symbols_1.$options].invokeTimeout) {
                timeout = setTimeout(() => {
                    const idx = this[symbols_1.$pending].findIndex(invocation => invocation.id === msgid);
                    if (idx > -1) {
                        this[symbols_1.$pending].splice(idx, 1);
                    }
                    reject(new Error('invocation timed out'));
                }, this[symbols_1.$options].invokeTimeout);
            }
            this[symbols_1.$pending].push({
                id: msgid,
                name: method,
                handler: (result) => {
                    if (result.status === 'error') {
                        reject(new Error(result.data));
                    }
                    else {
                        resolve(result.data);
                    }
                }
            });
            this[symbols_1.$send]({
                id: msgid,
                type: 'invoke',
                name: method,
                data: args
            })
                .then(() => { }, reject)
                .catch(reject);
        });
    }
    emit(event, ...data) {
        return new Promise((resolver, rejecter) => {
            let fulfilled = false, timeout;
            const resolve = (result) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    resolver(result);
                }
            };
            const reject = (reason) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    rejecter(reason);
                }
            };
            if (this[symbols_1.$options].sendTimeout) {
                timeout = setTimeout(() => {
                    reject(new Error('emit timed out'));
                }, this[symbols_1.$options].sendTimeout);
            }
            this[symbols_1.$send]({
                id: 0,
                type: 'event',
                name: event,
                data
            })
                .then(resolve, reject)
                .catch(reject);
        });
    }
    register(method, handler) {
        if (typeof method !== 'string' || method === '') {
            // error
        }
        if (typeof handler !== 'function') {
            // error
        }
        if (this[symbols_1.$methods][method] != null) {
            // error
        }
        this[symbols_1.$methods][method] = handler;
    }
    unregister(method, handler) {
        if (typeof method !== 'string' || method === '') {
            // error
        }
        if (typeof handler !== 'function') {
            // error
        }
        if (this[symbols_1.$methods][method] == null) {
            return;
        }
        if (this[symbols_1.$methods][method] !== handler) {
            delete this[symbols_1.$methods][method];
        }
    }
    getRemoteMethods() {
        return new Promise((resolver, rejecter) => {
            const msgid = this[symbols_1.$messageId];
            this[symbols_1.$messageId] += 1;
            let fulfilled = false, timeout;
            const resolve = (result) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    resolver(result);
                }
            };
            const reject = (reason) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    rejecter(reason);
                }
            };
            if (this[symbols_1.$options].invokeTimeout) {
                timeout = setTimeout(() => {
                    const idx = this[symbols_1.$pending].findIndex(invocation => invocation.id === msgid);
                    if (idx > -1) {
                        this[symbols_1.$pending].splice(idx, 1);
                    }
                    reject(new Error('requestTimed timed out'));
                }, this[symbols_1.$options].invokeTimeout);
            }
            this[symbols_1.$pending].push({
                id: msgid,
                name: 'getRegisteredMethods',
                handler: (result) => {
                    if (result.status === 'error') {
                        reject(new Error(result.data));
                    }
                    else {
                        resolve(result.data);
                    }
                }
            });
            this[symbols_1.$send]({
                id: msgid,
                type: 'state',
                name: 'getRegisteredMethods',
                data: []
            })
                .then(() => { }, reject)
                .catch(reject);
        });
    }
    [(_a = symbols_1.$listeners, _b = symbols_1.$methods, _c = symbols_1.$messageId, symbols_1.$send)](data) {
        return this[symbols_1.$transport].aecSend(JSON.stringify(data));
    }
}
exports.default = Communicator;
//# sourceMappingURL=index.js.map