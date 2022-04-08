# (WIP) agnostic-electron-communicator

Transport-agnostic communicator for electron apps.

[Licensed under GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.txt) - Copyright (c) 2022 Crowbar Tools

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