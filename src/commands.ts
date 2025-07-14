import * as vs from 'vscode';
import { output } from './lib';


export const registerCommands = (ctx: vs.ExtensionContext) => {
    const commands: { [key: string]: (...args: any[]) => any } = {
        "vscode-extension.sayHello": async (...args: any[]) => {
            output.appendLine(JSON.stringify(args));
            
            const name = await vs.window.showInputBox({ prompt: 'Please enter your name' });
            vs.window.showInformationMessage(`Hello, ${name || 'World'}!`);
        },
    };

    Object.entries(commands).forEach(([name, handler]) => {
        const disposable = vs.commands.registerCommand(name, handler);
        ctx.subscriptions.push(disposable);
    });
}