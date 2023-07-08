/* eslint-disable @typescript-eslint/naming-convention */
import path from "path";
import vscode from "vscode";
import fs from "fs/promises";
import { Style, getConfig } from "./extension";

const BODY_SELECTOR = parseFloat(vscode.version) >= 1.78 ? `body:has([id='workbench.parts.editor'])` : 'body';
const keyStart = "/*background-plus-start*/";
const keyEnd = "/*background-plus-end*/";

const cssFileName = "workbench.desktop.main.css";
const cssPath = path.join(require.main!.path, "vs", "workbench", cssFileName);

export const defaultCSS: Partial<Style> = {
    "opacity": "0.85",
    "background-position": "center",
    "background-repeat": "no-repeat",
    "background-size": "cover",
    // "background-attachment": "fixed",
    // "animation-fill-mode": "forwards"
};

export async function install() {
    const content = await fs.readFile(cssPath, { encoding: "utf-8" });
    const images = getConfig("images")!;
    
    if (!images.length) {
        vscode.window.showInformationMessage("No images were set to use.");
        return;
    }

    const css = await generateCSS();
    await fs.writeFile(cssPath, content + css);
}

export async function uninstall() {
    const content = await fs.readFile(cssPath, { encoding: "utf-8" });

    let start = content.indexOf(keyStart);
    const end = content.lastIndexOf(keyEnd);

    if (start !== -1) {
        start = content[start - 1] === "\n" ? start - 1 : start;
        const part = content.slice(start , end + keyEnd.length);
        await fs.writeFile(cssPath, content.replace(part, ""));
    }
}

export async function reinstall() {
    await uninstall();
    await install();
}

async function generateCSS() {
    // const mode = getConfig("mode")!;
    const images = getConfig("images")!;
    // const carouselInterval = getConfig("carousel.interval") as unknown as number;
    // const carouselDuration = Math.ceil(carouselInterval * images.length);
    // const carouselEnabled = carouselInterval > 0 && !selectedKey;

    let css: string;

    // if (carouselEnabled) {
    //     css = `${generateKeyframes("naasd")}
    //     ${BODY_SELECTOR} {
    //         ${toCSS({
    //             ...defaultCSS,
    //             ...getConfig("style"),
    //         })}
    //         animation: naasd ${carouselDuration}s infinite;
    //     }`;
    // } else {
        const selected = images.find(i => i.name === getConfig("selected")) || images[0];
        css = `${BODY_SELECTOR} {
        ${toCSS({
            ...defaultCSS,
            ...getConfig("style"),
            ...selected.style,
            "background-image": `url("${sanitizeURL(selected.url)}");`,
        })}
        }`;
    // }

    return `\n${keyStart}\n${css}\n${keyEnd}`;
}

function generateKeyframes(name: string) {
    const images = getConfig("images")!;
    images.push(images[0]);

    const frames = images.map(({ url, style }, i) => {
        const from = (100 * i / images.length) + "%";
        const to = Math.min(100 * (i + 1) / images.length, 100) + "%";

        return { from, to, url, style };
    });

    return `@keyframes ${name} {
        ${frames.map(({ to, from, url, style }) =>
            `${from}, ${to} {
                background-image: url("${url}");
                ${toCSS(style)}
            }\n`
        ).join("\n")}
    }`;
}

function sanitizeURL(url: string) {
    return url.replace("file://", "vscode-file://vscode-app");
}

function toCSS(style?: Partial<Style & Record<string, string>>) {
    if (!style) {
        return "";
    }

    return Object.entries(style)
        .reduce((acc, [k, v]) => acc + `\t${k}: ${v};\n`, "");
}