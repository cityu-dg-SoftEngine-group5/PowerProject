"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamToString = streamToString;
async function streamToString(stream) {
    const reader = stream.getReader();
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        if (value)
            chunks.push(value);
    }
    return Buffer.concat(chunks).toString('utf-8');
}
//# sourceMappingURL=streamToString.js.map