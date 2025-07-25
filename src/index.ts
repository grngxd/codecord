import { Client } from '@xhayper/discord-rpc';
import * as vs from 'vscode';
import { languages } from './assets';
import { registerCommands } from './commands';
import { debounce, output } from './lib';

const now = Date.now();

let rpc: Client;
let status: vs.StatusBarItem;

let idleTimeout: number | undefined;

const updateActivity = debounce(() => {
    const editor = vs.window.activeTextEditor;

    if (!editor) {
        if (idleTimeout) clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            rpc.user?.setActivity({
                startTimestamp: now,
                state: "Idling",
                largeImageKey: "idle",
                largeImageText: "idle",
            });
            output.appendLine("No active editor, setting idle activity.");
        }, 5 * 1000);
        return;
    }
    if (idleTimeout) clearTimeout(idleTimeout);

    const fileName = editor.document.fileName.split(/[\\/]/).pop();
    const workspace = vs.workspace.name || "No Workspace";
    const language = editor.document.languageId.toLowerCase();
    const problems = vs.languages.getDiagnostics(editor.document.uri).length;

    const key = languages.includes(language) ? language : "plaintext";

    rpc.user?.setActivity({
        startTimestamp: now,
        details: `Workspace: ${workspace}`,
        state: `Editing ${fileName}${problems > 0 ? ` (${problems} ${problems > 1 ? "problems": "problem"} found)` : ''}`,
        largeImageKey: key,
        largeImageText: language.padEnd(2, ' '),
    }).then(() => {
            output.appendLine(`Updating activity: ${fileName} (${language}) in ${workspace}`);  
    }).catch(err => {
        output.appendLine(`Failed to update activity: ${err.message}`);
        vs.window.showErrorMessage(`Failed to update activity: ${err.message}`);
    });
}, 150);

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