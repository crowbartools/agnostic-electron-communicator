export const $destroyed = Symbol('AgnosticElectronCommunicator instance destroyed');
export const $listeners = Symbol('AgnosticElectronCommunicator instance registered event listeners');
export const $methods   = Symbol('AgnosticElectronCommunicator instance registered invokable methods');
export const $transport = Symbol('AgnosticElectronCommunicator instance transports list');
export const $messageId = Symbol('AgnosticElectronCommunicator instance next message id');
export const $options   = Symbol('AgnosticElectronCommunicator instance options');
export const $pending   = Symbol('AgnosticElectronCommunicator instance pending invocations');
export const $send      = Symbol('AgnosticElectronCommunicator send method');