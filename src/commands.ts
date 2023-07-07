/* eslint-disable @typescript-eslint/naming-convention */
import vscode from "vscode";
import { defaultCSS, install, uninstall } from "./background";
import { Config, Style, getConfig, setConfig } from "./extension";

export default {
    add: async function () {
        const items = getConfig("images") as Config["images"];

        let name: string;
        let exists = false;
        
        do {
            name = await vscode.window.showInputBox({
                title: exists ?
                    "That identifier exists already, please set another." :
                    "Set an identifier for this image."
            }) as string;
            exists = !!items.find(i => i.name === name);
        } while (exists);

        const url = await vscode.window.showInputBox({
            title: "Set a URL for this image.",
            validateInput(value) {
                if (!/^((file|https)?:\/\/|\/)/.test(value)) {
                    return "Input is not a valid HTTP image.";
                }

                return null;
            },
        });

        if (!name || !url) {
            return true;
        }
        
        items.push({
            name,
            url: url.startsWith("/") ? `file://${url}` : url
        });

        await setConfig("images", items);
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
        const items = (getConfig("images") as Config["images"]).map(i => i.name);
        const selected = await vscode.window.showQuickPick(items);

        await setConfig("selected", selected);
        await install();
    },
    opacity: async function () {
        const items = getConfig("images") as Config["images"];
        const selectedKey = getConfig("selected") as string | undefined;
        const style = (items.find(i => i.name === selectedKey) ?? items[0]).style ?? getConfig("style") as Style;
        const currentOpacity = (style.opacity ?? defaultCSS.opacity!) * 100;

        const opacity = await promptOpacity(currentOpacity);
        const selected = items.find(i => i.name === selectedKey);

        if (selected?.style) {
            selected.style.opacity = opacity;
            await setConfig("images", items);
        } else {
            const currentStyle = getConfig("style") as Style;
            await setConfig("style", { ...currentStyle, opacity });
        }

        await install();
    },
    "selected-opacity": async function () {
        const items = getConfig("images") as Config["images"];
        const selectedKey = getConfig("selected") as string | undefined;

        if (!items.length || !selectedKey) {
            vscode.window.showInformationMessage("No background images set.");
            return;
        }

        const selected = items.find(i => i.name === selectedKey)!;
        const opacity = await promptOpacity(selected.style?.opacity ?? defaultCSS.opacity!);

        selected.style = { ...selected.style, opacity };
        await setConfig("images", items);

        await install();
    }
};

async function promptOpacity(currentOpacity: number) {
    const opacity = await vscode.window.showInputBox({
        title: `Provide a new background opacity (0 - 100%) (current: ${currentOpacity}%)`,
        validateInput(value) {
            if (!/\d{1,3}%?/.test(value)) {
                return "Value is not a percent, e.g. 85%";
            }

            return null;
        },
    });

    if (!opacity) {
        vscode.window.showErrorMessage(`Failed to get opacity from user input. Defaulting to ${defaultCSS.opacity! * 100}%`);
        return defaultCSS.opacity!;
    }

    return Number(opacity.replace("%", "")) / 100;
}