import { type default as Communicator } from ".";
import { type AECMessage } from './types';

import { $destroyed, $listeners, $methods, $pending, $send } from './symbols';

export default function onMessage(this: Communicator, message: string) : void {
    if (this[$destroyed]) {
        console.error(new Error('message received after communicator has been destroyed'));
        return;
    }
    let packet : AECMessage;
    try {
        packet = JSON.parse(message);
        if (typeof packet.id !== 'number' && typeof packet.id !== 'string') {
            throw new Error(`invalid id property in received message: ${message}`);
        }
        if (typeof packet.name !== 'string' || packet.name === '') {
            throw new Error(`invalid name property in recieved message: ${message}`);
        }
    } catch (err) {
        console.error(err);
        return;
    }

    const send = this[$send];

    const { id, type, name, status, data } = packet;

    let idx : number;

    switch (type) {

    case 'event':
        const eventListeners = this[$listeners][name];
        if (eventListeners == null) {
            return;
        }
        if (eventListeners.length === 0) {
            delete this[$listeners][name];
            return;
        }
        idx = 0;
        while (idx < eventListeners.length) {
            const listener = eventListeners[idx];
            try {
                listener.handler(data);
            } catch (err) {
                console.log(err);
            }
            if (listener.once) {
                eventListeners.splice(idx, 1);
            } else {
                idx += 1;
            }
        }
        return;


    case 'invoke':
        const onError = (reason?: Error | string) : void => {
            if (reason == null) {
                reason = 'unknown error';
            } else if (reason instanceof Error) {
                reason = reason.message;
            }
            send({ id, type: 'result', name, status: 'error', data: reason });
        }
        const method = this[$methods][name];
        if (!method) {
            onError('unknown method');
            return;
        }
        try {
            const result = method(...data);
            if (result instanceof Promise) {
                result
                    .then(
                        (result : any) => { send({ id, type: 'result', name, status: 'ok', data: result }); },
                        onError
                    )
                    .catch(onError);
            } else {
                send({ id, type: 'result', name, status: 'ok', data: result });
            }
        } catch (err : any) {
            onError(err);
        }
        return;


    case 'result':
        const pendingInvocations = this[$pending];
        if (pendingInvocations == null || pendingInvocations.length === 0) {
            return;
        }
        idx = pendingInvocations.findIndex(invocation => invocation.id === id && invocation.name === name);
        if (idx === -1) {
            return;
        }
        const invocation = pendingInvocations.splice(idx, 1)[0];
        if (status !== 'error' && status !== 'ok') {
            console.error(new Error(`invalid invoke result status: ${message}`));
            invocation.handler({ id, type, name, status: 'error', data: 'invalid invoke result status' });
            return;
        }
        invocation.handler(packet);
        return;


    case 'state':
        if (name === 'getRegisteredMethods') {
            send({ id, type: 'result', name, status: 'ok', data: Object.keys(this[$methods]) });
        } else {
            send({ id, type: 'result', name, status: 'error', data: 'unknown state requested' });
        }
        return;


    default:
        console.log(new Error(`unknown message type received: ${message}`));
    }
}