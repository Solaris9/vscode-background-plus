/* eslint-disable @typescript-eslint/naming-convention */
import vscode, { QuickPick, QuickPickItem } from "vscode";
import { defaultCSS, install, uninstall } from "./background";
import { getConfig, setConfig } from "./extension";

async function getSelected(list: QuickPick<QuickPickItem>) {    
    return new Promise((res) => {
        list.show();
        list.onDidAccept(() => {
            res(list.selectedItems[0].label);
        });
    });
}

export default {
    add: async function () {
        const type = await vscode.window.showQuickPick(
            ["Local image", "HTTP image"],
            { title: "Is this a local image or a HTTP image?" }
        );

        let url: string;

        if (type === "Local image") {
            const result = await vscode.window.showOpenDialog({
                canSelectMany: false,
                filters: {
                    Images: [ "webp", "png", "jpg", "jpeg", "gif", "apng" ]
                },
                title: "Select a image to use as a background image."
            });

            url = `file://${result![0].path}`;
        } else {
            url = await vscode.window.showInputBox({
                title: "Set a URL for this image.",
                validateInput(value) {
                    if (!/^((file|https)?:\/\/|\/)/.test(value)) {
                        return "Input is not a valid HTTP image.";
                    }
    
                    return null;
                },
            }) as string;
        }

        const items = getConfig("images")!;
        let name: string, exists = false;
        
        do {
            name = await vscode.window.showInputBox({
                title: exists ?
                    "That identifier exists already, please set another." :
                    "Set an identifier for this image."
            }) as string;
            exists = !!items.find(i => i.name === name);
        } while (exists);

        if (!name || !url) { return true; }
        
        await setConfig("images", [...items, { name, url }]);
        await setConfig("selected", name);
        await install();
    },
    install: async function () {
        await uninstall();
        await install();
    },
    uninstall: async function () {
        await uninstall();
    },
    select: async function () {
        const items = getConfig("images")!.map(i => i.name);

        const quickPick = vscode.window.createQuickPick();
        quickPick.items = [
            { label: "Remove selected background." },
            { label: "", kind: -1 },
            ...items.map(i => ({ label: i }))
        ];
        
        const selected = await getSelected(quickPick);
        await setConfig("selected", selected !== "Remove" ? selected : undefined);
        await install();
    },
    "global-opacity": async function () {
        const currentOpacity = getConfig("style")?.opacity ?? defaultCSS.opacity!;
        const opacity = await promptOpacity(currentOpacity);

        await setConfig("style", { ...getConfig("style"), opacity });
        await install();
    },
    "selected-opacity": async function () {
        const items = getConfig("images")!;
        const selected = items.find(i => i.name === getConfig("selected"));

        if (!selected) {
            vscode.window.showInformationMessage("No background images set.");
            return;
        }

        const opacity = await promptOpacity(selected.style?.opacity ?? defaultCSS.opacity!);
        selected.style = { ...selected.style, opacity };
        await setConfig("images", items);

        await install();
    }
};

async function promptOpacity(currentOpacity: string) {
    const opacity = await vscode.window.showInputBox({
        title: `Provide a new background opacity (0 - 100%) (current: ${Number(currentOpacity) * 100}%)`,
        validateInput(value) {
            if (!/\d{1,3}%?/.test(value)) {
                return "Value is not a percent, e.g. 85%";
            }

            return null;
        },
    });

    if (!opacity) {
        vscode.window.showErrorMessage(`Failed to get opacity from user input. Defaulting to ${Number(defaultCSS.opacity) * 100}%`);
        return defaultCSS.opacity;
    }

    return (Number(opacity.replace("%", "")) / 100).toString();
}