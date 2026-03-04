import { purifyHtml } from "@/utils/htmlProc";
import { mditLogger } from "@/utils/logger";

import type { PipelineSettingsSnapshot } from "../types";

function shouldPurify(settings: PipelineSettingsSnapshot): boolean {
    return settings.forceEnableHtmlPurify || settings.enableHtmlPurify;
}

function applyPurifyIfNeeded(renderedHtml: string, settings: PipelineSettingsSnapshot): string {
    if (shouldPurify(settings) === true) {
        mditLogger("debug", "Purify", "Input:", `${renderedHtml}`);
        return purifyHtml(renderedHtml) as string;
    }

    return renderedHtml;
}

function replaceTextNodePlaceholders(
    textNode: Text,
    mentionPlaceholders: Map<string, HTMLElement>
): void {
    const placeholders = Array.from(mentionPlaceholders.keys());
    if (placeholders.length === 0) {
        return;
    }

    const originalText = textNode.data;
    if (originalText.length === 0) {
        return;
    }

    const hasPlaceholder = placeholders.some((placeholder) => originalText.includes(placeholder));
    if (!hasPlaceholder) {
        return;
    }

    const fragments: Node[] = [];
    const ownerDocument = textNode.ownerDocument;
    let cursor = 0;

    while (cursor < originalText.length) {
        let nearestIndex = -1;
        let nearestPlaceholder = "";

        for (const placeholder of placeholders) {
            const currentIndex = originalText.indexOf(placeholder, cursor);
            if (currentIndex === -1) {
                continue;
            }

            if (nearestIndex === -1 || currentIndex < nearestIndex) {
                nearestIndex = currentIndex;
                nearestPlaceholder = placeholder;
            }
        }

        if (nearestIndex === -1) {
            fragments.push(ownerDocument.createTextNode(originalText.slice(cursor)));
            break;
        }

        if (nearestIndex > cursor) {
            fragments.push(ownerDocument.createTextNode(originalText.slice(cursor, nearestIndex)));
        }

        const mentionElement = mentionPlaceholders.get(nearestPlaceholder);
        if (mentionElement) {
            fragments.push(ownerDocument.importNode(mentionElement, true));
        } else {
            fragments.push(ownerDocument.createTextNode(nearestPlaceholder));
        }

        cursor = nearestIndex + nearestPlaceholder.length;
    }

    if (fragments.length === 0) {
        return;
    }

    textNode.replaceWith(...fragments);
}

function rehydrateMentionNodes(
    renderedDoc: Document,
    mentionPlaceholders: Map<string, HTMLElement>
): void {
    if (mentionPlaceholders.size === 0) {
        return;
    }

    const textNodes: Text[] = [];
    const walker = renderedDoc.createTreeWalker(renderedDoc.body, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node instanceof Text) {
            textNodes.push(node);
        }
    }

    for (const textNode of textNodes) {
        replaceTextNodePlaceholders(textNode, mentionPlaceholders);
    }
}

export function rehydrateRenderedHtml(
    renderedHtml: string,
    mentionPlaceholders: Map<string, HTMLElement>,
    settings: PipelineSettingsSnapshot
): string {
    const purifiedHtml = applyPurifyIfNeeded(renderedHtml, settings);
    if (purifiedHtml.trim().length === 0) {
        return "";
    }

    const renderedDoc = new DOMParser().parseFromString(purifiedHtml, "text/html");
    rehydrateMentionNodes(renderedDoc, mentionPlaceholders);

    return renderedDoc.body.innerHTML;
}
