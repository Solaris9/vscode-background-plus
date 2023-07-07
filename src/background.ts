/* eslint-disable @typescript-eslint/naming-convention */
import path from "path";
import vscode from "vscode";
import fs from "fs/promises";
import { Config, Style, getConfig } from "./extension";

const BODY_SELECTOR = parseFloat(vscode.version) >= 1.78 ? `body:has([id='workbench.parts.editor'])` : 'body';
const keyStart = "/*background-plus-start*/";
const keyEnd = "/*background-plus-end*/";

const cssFileName = "workbench.desktop.main.css";
const cssPath = path.join(require.main!.path, "vs", "workbench", cssFileName);

export const defaultCSS: Partial<Style> = {
    "opacity": 0.8,
    "background-position": "center",
    "background-repeat": "no-repeat",
    "background-size": "cover"
};

export async function install() {
    const content = await fs.readFile(cssPath, { encoding: "utf-8" });

    const images = await getConfig("images") as Config["images"];
    if (!images.length) {
        vscode.window.showInformationMessage("No images were set to use.");
        return;
    }

    const selectedKey = await getConfig("selected") as string | null;
    const selected = images.find(i => i.name === selectedKey) || images[0];

    const selectedStyle = selected.style as Partial<Style>;
    const globalStyle = await getConfig("config") as Partial<Style>;
    const style = { ...defaultCSS, ...globalStyle, ...selectedStyle };

    const url = selected.url.startsWith("file://") ?
        selected.url.replace("file://", "vscode-file://vscode-app") :
        selected.url;

    const css = await generateCSS(style, url);
    await fs.writeFile(cssPath, content + css);
}

export async function uninstall() {
    const content = await fs.readFile(cssPath, { encoding: "utf-8" });

    let start = content.indexOf(keyStart);
    const end = content.indexOf(keyEnd);

    if (start !== -1) {
        start = content[start - 1] === "\n" ? start - 1 : start;
        const part = content.slice(start , end + keyEnd.length);
        await fs.writeFile(cssPath, content.replace(part, ""));
    }
}

async function generateCSS(style: Partial<Style>, url?: string) {
    const css = Object.entries(style)
        .reduce((acc, [k, v]) => acc + `${k}: ${v};`, "");
    
    return `\n${keyStart}\n${BODY_SELECTOR} {
        background-image: url("${url}");
        ${css}
    }\n${keyEnd}`;
}
