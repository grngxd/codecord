import * as vs from 'vscode';

export const output = vs.window.createOutputChannel('Codecord');
output.show();

export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return function(this: any, ...args: any[]) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    } as T;
}