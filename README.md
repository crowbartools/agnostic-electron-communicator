# (WIP) agnostic-electron-communicator ("AEC")

Transport-agnostic communications for electron apps.

# Install
tbd

# API

### `new Communicator(transport)`
Creates a new communicator, leveraging the specified [transport](#transport_interface) instance

### `.register(method: string, handler: (...args: any[]) => any) : void`
Registers a remote-invocable method

### `.unregister(method: string, handler: (...args: any[]) => any) : void`
Unregisters a remote-invocable method

### `.getRemoteMethods() : Promise<string[]>`
Retrieves a list of remote-registered methods

### `.invoke(method: string, ...args: any[]) : Promise<any>`
Invokes a remote-registered method, returns a promise that resolves with the result

### `.on(event: string, handler: (...args: any[]) => void, once?: boolean = false) : void`
Registers an event listener

### `.off(event: string, handler: (...args: any[]) => void, once?: boolean = false) : void`
Unreigsters an event listener

### `.offAll(event?: string) : void`
Removes all event listeners. If `event` is specified just the listeners for that even are removed

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

communicator.on('hello', () => {
    console.log('hello message received from renderer');
    communicator.emit('hi');
})

mainWindow.webContents.on('did-finish-load', () => {
    communicator.emit('')
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
communicator.on('hi', () => {
    console.log('hi message received from main');
})
communicator.emit('hello');
```

# license
[Licensed under GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.txt) - Copyright (c) 2022 Crowbar Tools