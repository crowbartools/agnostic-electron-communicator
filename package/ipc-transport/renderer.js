"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (namespace) => {
    if (window == null) {
        return;
    }
    const transport = window[namespace];
    if (transport == null ||
        transport.isAecIpcTransport !== true) {
        return;
    }
    return transport;
};
//# sourceMappingURL=renderer.js.map