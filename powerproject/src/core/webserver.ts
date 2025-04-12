import * as vscode from 'vscode';
import { streamToString } from '../utils/streamToString';
import * as http from 'http';

export class VSCodeHttpServer {
    private server: http.Server | null = null;

    constructor(private port: number) {}

    public start() {
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
            } else if (req.method === 'POST' && req.url === '/getfromweb') {
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
                    } catch (error) {
                        res.statusCode = 400;
                        res.end('Invalid JSON');
                    }
                });
            } else {
                res.statusCode = 404;
                res.end('Not found');
            }
        });

        this.server.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

    public stop(): void {
        if (this.server) {
            this.server.close();
            console.log(`Server on port ${this.port} closed`);
        }
    }
}
