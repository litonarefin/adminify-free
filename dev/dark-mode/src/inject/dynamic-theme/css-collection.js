import { forEach } from "../../utils/array";
import { loadAsDataURL } from "../../utils/network";
import { getMatches, formatCSS } from "../../utils/text";

const blobRegex = /url\(\"(blob\:.*?)\"\)/g;

async function replaceBlobs(text) {
    const promises = [];
    getMatches(blobRegex, text, 1).forEach((url) => {
        const promise = loadAsDataURL(url);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return text.replace(blobRegex, () => `url("${data.shift()}")`);
}

export async function collectCSS() {
    const css = [];

    function addStaticCSS(selector, comment) {
        const staticStyle = document.querySelector(selector);
        if (staticStyle && staticStyle.textContent) {
            css.push(`/* ${comment} */`);
            css.push(staticStyle.textContent);
            css.push("");
        }
    }

    addStaticCSS(".adminify--fallback", "Fallback Style");
    addStaticCSS(".adminify--user-agent", "User-Agent Style");
    addStaticCSS(".adminify--text", "Text Style");
    addStaticCSS(".adminify--invert", "Invert Style");
    addStaticCSS(".adminify--variables", "Variables Style");

    const modifiedCSS = [];
    document.querySelectorAll(".adminify--sync").forEach((element) => {
        forEach(element.sheet.cssRules, (rule) => {
            rule && rule.cssText && modifiedCSS.push(rule.cssText);
        });
    });

    if (modifiedCSS.length) {
        const formattedCSS = formatCSS(modifiedCSS.join("\n"));
        css.push("/* Modified CSS */");
        css.push(await replaceBlobs(formattedCSS));
        css.push("");
    }

    addStaticCSS(".adminify--override", "Override Style");

    return css.join("\n");
}
