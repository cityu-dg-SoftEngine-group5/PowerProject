import * as vscode from 'vscode';
import { ApiConfiguration, OpenAiNativeModelId, openAiNativeModels, AnthropicModelId, anthropicModels } from '../shared/api';

export async function selectModel() {
    const config = vscode.workspace.getConfiguration('powerproject');
    const api_provider = config.get('apiProvider') as string;
    let selectedModel: string | undefined;
    vscode.window.showInformationMessage(api_provider);

    if(api_provider === 'openai') {
        const modelIds = Object.keys(openAiNativeModels) as OpenAiNativeModelId[];
        selectedModel = await vscode.window.showQuickPick(modelIds, {
            title: 'Select OpenAI Model',
            placeHolder: 'Select a model',
        });
    }
    else if(api_provider === 'anthropic') {
        const modelIds = Object.keys(anthropicModels) as AnthropicModelId[];
        selectedModel = await vscode.window.showQuickPick(modelIds, {
            title: 'Select Anthropic Model',
            placeHolder: 'Select a model',
        });
    }

    if (selectedModel) {
        await config.update('modelId', selectedModel, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Selected model: ${selectedModel}`);
    } else {
        vscode.window.showInformationMessage('No model selected');
    }

}