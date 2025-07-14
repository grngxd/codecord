import { Client } from '@xhayper/discord-rpc';
import * as vs from 'vscode';
import { registerCommands } from './commands';
import { output } from './lib';

let rpc: Client;
let status: vs.StatusBarItem;

export const activate = (ctx: vs.ExtensionContext) => {
    registerCommands(ctx);
    status = vs.window.createStatusBarItem(vs.StatusBarAlignment.Left, 100);
    status.text = "Codecord: Connecting...";
    status.show();
    ctx.subscriptions.push(status);

    output.appendLine("starting codecord...");

    rpc = new Client({
        clientId: "1394268648473886780",
    });

    rpc.on("ready", () => {
        output.appendLine(`codecord is ready! logged in as @${rpc.user?.username}.`);

        rpc.user?.setActivity({
            state: "Idling",
        });

        status.text = `Codecord: Connected`;
    });

    rpc.login().catch(err => {
        output.appendLine(`failed to connect to discord: ${err.message}`);
        vs.window.showErrorMessage(`failed to connect to discord: ${err.message}`)

        status.text = `Codecord: Disconnected`;
        status.tooltip = `${err.message}`;
    });
};

export const deactivate = () => {
    output.dispose();
    rpc && rpc.destroy();

    output.appendLine("codecord stopped.");
};