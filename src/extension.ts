/* eslint-disable @typescript-eslint/naming-convention */
import vscode from 'vscode';
import commands from './commands';

type Object<V, K extends keyof any> = Record<K, V>; 

export type Style = Object<string,
	"opacity" |
	"background-size" |
	"background-repeat" |
	"background-attachment" |
	"background-position">;

export type Config = {
	enabled: boolean;
	mode: "fullscreen" | "editor";
	selected: string;
	carousel: {
		interval: number;
		unique: boolean;
	};
	style: Style;
	images: {
		name: string;
		url: string;
		style?: Partial<Style>;
	}[]
};

export function activate(context: vscode.ExtensionContext) {
	// register commands
	for (let [name, handler] of Object.entries(commands)) {
		let disposable = vscode.commands
			.registerCommand(`background-plus.${name}`, async () => {
				const failure = await handler();
				if (!failure) {
					await vscode.commands
						.executeCommand("workbench.action.reloadWindow");
				}
			});
		
		context.subscriptions.push(disposable);
	}
}

export function deactivate() {}

export function getConfig<K extends keyof Config>(key: K): Config[K] | undefined {
	return vscode.workspace
		.getConfiguration("background-plus")
		.get(key);
}

export function setConfig(key: string, value: unknown) {
	return vscode.workspace
		.getConfiguration("background-plus")
		.update(key, value, true);
}