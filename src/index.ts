import { Client } from '@xhayper/discord-rpc';
import * as vs from 'vscode';
import { registerCommands } from './commands';
import { output } from './lib';

let rpc: Client;
let status: vs.StatusBarItem;

const updateActivity = () => {
    const editor = vs.window.activeTextEditor;
    if (!editor) {
        rpc.user?.setActivity({
            state: "Idling",
            largeImageKey: "idle",
            largeImageText: "Idle",
        });
        return;
    }

    const fileName = editor.document.fileName.split(/[\\/]/).pop();
    const workspace = vs.workspace.name || "No Workspace";
    const language = editor.document.languageId;
    const problems = vs.languages.getDiagnostics(editor.document.uri).length;

    rpc.user?.setActivity({
        details: `Workspace: ${workspace}`,
        state: `Editing ${fileName}${problems > 0 ? ` (${problems} problems found)` : ''}`,
        largeImageKey: language,
        largeImageText: language,
    });
}

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
        updateActivity();
        status.text = `Codecord: Connected`;

        ctx.subscriptions.push(
            vs.window.onDidChangeActiveTextEditor(updateActivity),
            vs.workspace.onDidOpenTextDocument(updateActivity),
            vs.workspace.onDidCloseTextDocument(updateActivity)
        );
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