import { type Transport, type AECMessage } from './types';

export { Transport, AECMessage };

import { $listeners, $methods, $transport, $messageId, $options, $pending, $send } from './symbols';

import messageHandler from './onmessage';

interface CommunicatorOptions {
    sendTimeout?: number;
    invokeTimeout?: number;
}

interface EventListener {
    handler: (data: any) => void;
    once: boolean;
}

interface PendingInvocation {
    id: number;
    name: string;
    handler: (result : AECMessage) => void;
}

function disconnectHandler(this: Communicator) {
    this[$pending].forEach(invocation => {
        invocation.handler({
            id: invocation.id,
            type: 'result',
            name: invocation.name,
            status: 'error',
            data: 'connection lost'
        })
    });
    this[$pending] = [];
}

export default class Communicator {
    private [$transport] : Transport;
    private [$listeners] : Record<string, EventListener[]> = Object.create(null);
    private [$methods] : Record<string, (...args: any[]) => Promise<any>> = Object.create(null);
    private [$options] : CommunicatorOptions;

    private [$pending] : PendingInvocation[];
    private [$messageId] : number = 1;

    constructor(transport: Transport, options?: CommunicatorOptions) {

        let sendTimeout = 30000;
        if (options?.sendTimeout !== null) {
            if (options?.sendTimeout) {
                sendTimeout = options.sendTimeout;
            } else {
                sendTimeout = 0;
            }
        }

        let invokeTimeout = 30000;
        if (options?.invokeTimeout !== null) {
            if (options?.invokeTimeout) {
                invokeTimeout = options.invokeTimeout;
            } else {
                invokeTimeout = 0;
            }
        }

        if (sendTimeout && invokeTimeout < sendTimeout) {
            invokeTimeout = sendTimeout;
        }

        this[$options] = {sendTimeout, invokeTimeout};

        this[$transport] = transport;
        transport.aecDisconnection(disconnectHandler.bind(this));
        transport.aecMessage(messageHandler.bind(this));
    }

    ready() {
        return this[$transport].aecReady();
    }

    on(event: string, handler: () => void, once: boolean = false) : void {
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
        if (this[$listeners][event]) {
            this[$listeners][event].push({handler, once});
        } else {
            this[$listeners][event] = [{handler, once}];
        }
    }

    off(event: string, handler: () => void, once: boolean = false) : void {
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

        const eventListeners = this[$listeners][event];
        if (eventListeners != null) {
            const idx = eventListeners.findIndex(listener => listener.handler === handler && listener.once === once);
            if (idx > -1) {
                eventListeners.splice(idx, 1);
            }
            if (eventListeners.length === 0) {
                delete this[$listeners][event];
            }
        }
    }

    offAll(event?: string) : void {
        if (event == null) {
            this[$listeners] = Object.create(null);

        } else if (typeof event !== 'string' || event === '') {
            // error

        } else if (this[$listeners][event]) {
            delete this[$listeners][event];
        }
    }

    invoke(method: string, ...args: any[]) : Promise<any> {
        return new Promise((resolver, rejecter) => {
            const msgid = this[$messageId];
            this[$messageId] += 1;

            let fulfilled = false,
                timeout : NodeJS.Timeout;

            const resolve = (result : any) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    resolver(result);
                }
            };

            const reject = (reason : any) : void => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    rejecter(reason);
                }
            };

            if (this[$options].invokeTimeout) {
                timeout = setTimeout(
                    () : void => {
                        const idx = this[$pending].findIndex(invocation => invocation.id === msgid);
                        if (idx > -1) {
                            this[$pending].splice(idx, 1);
                        }
                        reject(new Error('invocation timed out'));
                    },
                    this[$options].invokeTimeout
                );
            }

            this[$pending].push({
                id: msgid,
                name: method,
                handler: (result : AECMessage) : void => {
                    if (result.status === 'error') {
                        reject(new Error(result.data));
                    } else {
                        resolve(result.data);
                    }
                }
            });

            this[$send]({
                    id: msgid,
                    type: 'invoke',
                    name: method,
                    data: args
                })
                .then( () => {}, reject )
                .catch( reject );
        });
    }

    emit(event: string, ...data: any[]) : Promise<void> {
        return new Promise((resolver, rejecter) => {

            let fulfilled = false,
                timeout : NodeJS.Timeout;

            const resolve = (result: any) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    resolver(result);
                }
            };

            const reject = (reason : any) : void => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    rejecter(reason);
                }
            };

            if (this[$options].sendTimeout) {
                timeout = setTimeout(
                    () : void => {
                        reject(new Error('emit timed out'));
                    },
                    this[$options].sendTimeout
                );
            }

            this[$send]({
                    id: 0,
                    type: 'event',
                    name: event,
                    data
                })
                .then(resolve, reject)
                .catch(reject);
        });
    }

    register(method: string, handler: (...args: any[]) => Promise<any>) {
        if (typeof method !== 'string' || method === '') {
            // error
        }
        if (typeof handler !== 'function') {
            // error
        }

        if (this[$methods][method] != null) {
            // error
        }
        this[$methods][method] = handler;
    }

    unregister(method: string, handler: (...args: any[]) => Promise<any>) : void {
        if (typeof method !== 'string' || method === '') {
            // error
        }
        if (typeof handler !== 'function') {
            // error
        }
        if (this[$methods][method] == null) {
            return;
        }
        if (this[$methods][method] !== handler) {
            delete this[$methods][method];
        }
    }

    getRemoteMethods() : Promise<any> {
        return new Promise((resolver, rejecter) => {
            const msgid = this[$messageId];
            this[$messageId] += 1;

            let fulfilled = false,
                timeout : NodeJS.Timeout;

            const resolve = (result: any) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    resolver(result);
                }
            };

            const reject = (reason : any) : void => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!fulfilled) {
                    fulfilled = true;
                    rejecter(reason);
                }
            };

            if (this[$options].invokeTimeout) {
                timeout = setTimeout(
                    () : void => {
                        const idx = this[$pending].findIndex(invocation => invocation.id === msgid);
                        if (idx > -1) {
                            this[$pending].splice(idx, 1);
                        }
                        reject(new Error('requestTimed timed out'));
                    },
                    this[$options].invokeTimeout
                );
            }

            this[$pending].push({
                id: msgid,
                name: 'getRegisteredMethods',
                handler: (result : AECMessage) : void => {
                    if (result.status === 'error') {
                        reject(new Error(result.data));
                    } else {
                        resolve(result.data);
                    }
                }
            });

            this[$send]({
                id: msgid,
                type: 'state',
                name: 'getRegisteredMethods',
                data: []
            })
            .then( () => {}, reject )
            .catch( reject );
        });
    }

    [$send](data: any) {
        return this[$transport].aecSend(JSON.stringify(data));
    }
}