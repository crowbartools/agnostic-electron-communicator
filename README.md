# (WIP) agnostic-electron-communicator ("AEC")

Transport-agnostic communications for electron apps.

# Install
tbd

# API
```ts
interface Communicator {

    // Creates a new communicator utilitizing the specified transport
    // See Transport interface for more info
    constructor(transport : Transport);

    // Resolves when the specified transport is ready
    ready() : Promise<void>;

    // Registers a remote-invocable method
    register(method: string, handler: (...args: any[]) => any) : void;

    // Unregisters a remote-invocable method
    unregister(method: string, handler: (...args: any[]) => any) : void;

    // Retrieves a list of remote-registered method names
    getRemoteMethods() : Promise<string[]>;

    // Invokes a remote-registered method
    invoke(method: string, ...args: any[]) : Promise<any>;

    // Registers a remote-emitted event listener
    on(event: string, handler: (...args: any[]) => void, once?: boolean = false) : void;

    // Unregisters a remote-emitted event listener
    off(event: string, handler: (...args: any[]) => void, once?: boolean = false) : void;

    // Removes all event listeners.
    // If `event` is specified only the listeners for that event are removed
    offAll(event?: string) : void;

    // Emits an event to the remote side of the transport
    emit(event: string, data: any) : void;
}
```

# Ipc Transport
AEC provides an electron-ipc transport out of the box.

It can be accessed via `/ipc-transport/main`, `/ipc-transport/preload` and `/ipc-transport/renderer`


# Transport Interface
Transports must comform to the following interface:

```ts
interface Transport {
    // returns a promise that resolves when the transport is ready
    aecReady: () => Promise<void>;

    // Registers a call back when/if the transport disconnects
    aecDisconnection: (handler : () => void) => void;

    // Registers a call back when an AEC message is received from the transport
    aecMessage: (handler : (message: string) => void) => void;

    // Sends data through the transport
    aecSend: (data: string) => Promise<void>;

    // Should remove any references to the aec
    aecDisconnect: () => void;
}
```

# Example Usage

### Main Process
```ts
// assume mainWindow is a browser window

import mainIpcTransport from 'agnostic-electron-communicator/ipc-transport/main';
import Communiator from 'agnostic-electron-communicator';

const transport = mainIpcTransport(mainWindow);

const communicator = new Communicator(transport);

await communicator.ready();

// Register methods
// When a promise is returned the communicator waits for it to resolve before responding
communicator.register('toLowerCase', msg => Promise.resolve(msg.toLowerCase()));
communicator.register('toUpperCase', msg => msg.toUpperCase());

communicator.on('foo', async function onFoo() {

    // remove foo event listener
    communicator.off('foo', onFoo);

    // invoke a renderer-side method
    const who = await communicator.invoke('who');
    console.log(`renderer is: ${who}`);

    // emit an event on the renderer side:
    communicator.emit('bar');
});
```

### Preload
```ts
import preloadTransport from 'agnostic-electron-communicator/ipc-transport/preload';
preloadTransport('unique_name_space');
```

### Renderer
```ts
import rendererIpcTransport from 'agnostic-electron-communicator/ipc-transport/renderer';
import Communicator from 'agnostic-electron-communicator';

const transport = rendererIpcTransport('unique_name_space');

const communicator = new Communicator(transport /*, || a fallback transport */);

await communicator.ready();

communicator.register('who', () => 'me');

communicator.on('bar', async () => {
    const uppercased = await communicator.invoke('toUpperCase', 'baz');
    console.log(uppercased);
});

communicator.emit('foo');
```

# license
[Licensed under GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.txt) - Copyright (c) 2022 Crowbar Tools