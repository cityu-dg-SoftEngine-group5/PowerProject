"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCodeHttpServer = void 0;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
class VSCodeHttpServer {
    port;
    server = null;
    constructor(port) {
        this.port = port;
    }
    start() {
        this.server = http.createServer((req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                res.writeHead(500);
                res.end('No active text editor');
                return;
            }
            if (req.method === 'GET' && req.url === '/sendtoweb') {
                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                const currentLine = editor.document.lineAt(selection.active.line).text;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    codes: selectedText,
                    line: currentLine
                }));
            }
            else if (req.method === 'POST' && req.url === '/getfromweb') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                });
                req.on('end', () => {
                    try {
                        const { code } = JSON.parse(body);
                        const selection = editor.selection;
                        editor.edit(editBuilder => {
                            editBuilder.replace(selection, code);
                        }).then(success => {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success }));
                        });
                    }
                    catch (error) {
                        res.statusCode = 400;
                        res.end('Invalid JSON');
                    }
                });
            }
            else {
                res.statusCode = 404;
                res.end('Not found');
            }
        });
        this.server.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
    stop() {
        if (this.server) {
            this.server.close();
            console.log(`Server on port ${this.port} closed`);
        }
    }
}
exports.VSCodeHttpServer = VSCodeHttpServer;
//# sourceMappingURL=webserver.js.map