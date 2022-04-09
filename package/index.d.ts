import { type Transport, type AECMessage } from './types';
export { Transport, AECMessage };
import { $destroyed, $listeners, $methods, $transport, $messageId, $options, $pending, $send } from './symbols';
interface CommunicatorOptions {
    sendTimeout?: number;
    invokeTimeout?: number;
}
export default class Communicator {
    private [$destroyed];
    private [$transport];
    private [$listeners];
    private [$methods];
    private [$options];
    private [$pending];
    private [$messageId];
    constructor(transport: Transport, options?: CommunicatorOptions);
    [$send](data: any): Promise<void>;
    ready(): Promise<void>;
    destroyed(): Boolean;
    on(event: string, handler: () => void, once?: boolean): void;
    off(event: string, handler: () => void, once?: boolean): void;
    offAll(event?: string): void;
    invoke(method: string, ...args: any[]): Promise<any>;
    emit(event: string, ...data: any[]): Promise<void>;
    register(method: string, handler: (...args: any[]) => Promise<any>): void;
    unregister(method: string, handler: (...args: any[]) => Promise<any>): void;
    getRemoteMethods(): Promise<any>;
    destroy(): void;
}
