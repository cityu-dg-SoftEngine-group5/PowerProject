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
exports.selectModel = selectModel;
const vscode = __importStar(require("vscode"));
const api_1 = require("../shared/api");
async function selectModel() {
    const config = vscode.workspace.getConfiguration('powerproject');
    const api_provider = config.get('apiProvider');
    let selectedModel;
    vscode.window.showInformationMessage(api_provider);
    if (api_provider === 'openai') {
        const modelIds = Object.keys(api_1.openAiNativeModels);
        selectedModel = await vscode.window.showQuickPick(modelIds, {
            title: 'Select OpenAI Model',
            placeHolder: 'Select a model',
        });
    }
    else if (api_provider === 'anthropic') {
        const modelIds = Object.keys(api_1.anthropicModels);
        selectedModel = await vscode.window.showQuickPick(modelIds, {
            title: 'Select Anthropic Model',
            placeHolder: 'Select a model',
        });
    }
    if (selectedModel) {
        await config.update('modelId', selectedModel, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Selected model: ${selectedModel}`);
    }
    else {
        vscode.window.showInformationMessage('No model selected');
    }
}
//# sourceMappingURL=selectmodel.js.map