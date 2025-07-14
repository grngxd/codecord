import * as vs from 'vscode';
import { registerCommands } from './commands';
import { output } from './lib';

export const activate = (ctx: vs.ExtensionContext) => {
    registerCommands(ctx);
    output.appendLine('vscode extension!');
    vs.window.showInformationMessage('vscode extension!');
};

export const deactivate = () => {};