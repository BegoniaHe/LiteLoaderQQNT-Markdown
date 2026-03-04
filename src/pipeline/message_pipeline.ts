import { SELECTORS } from "@/config";
import { mditLogger } from "@/utils/logger";

import { extractTextFragments } from "./input/text_fragment_extractor";
import { normalizeTextPieces } from "./normalize/text_normalizer";
import { renderMarkdown } from "./parse/markdown_engine";
import { rehydrateRenderedHtml } from "./render/html_rehydrator";
import { captureSettingsSnapshot } from "./settings_snapshot";

import type { FragmentProcessFunc } from "./types";

const textElementProcessor: FragmentProcessFunc = (_parent, element, _index) => {
    if (element.tagName !== "SPAN" || !element.classList.contains(SELECTORS.TEXT_ELEMENT)) {
        return undefined;
    }

    mditLogger("debug", "ElementMatch", "Source", element);
    mditLogger("debug", "Element", "Match", "textElementProcessor");

    const settingsSnapshot = captureSettingsSnapshot();
    const extractionResult = extractTextFragments(element);

    if (extractionResult.pieces.length === 0) {
        return undefined;
    }

    const normalizedText = normalizeTextPieces(
        extractionResult.pieces,
        extractionResult.mentionPlaceholders,
        settingsSnapshot
    );

    if (normalizedText.markdownSource.length === 0) {
        return undefined;
    }

    const renderedMarkdown = renderMarkdown(normalizedText.markdownSource, settingsSnapshot);
    const rehydratedHtml = rehydrateRenderedHtml(
        renderedMarkdown,
        normalizedText.mentionPlaceholders,
        settingsSnapshot
    );

    mditLogger("debug", "Rendered/post-processed HTML innterText:", rehydratedHtml);
    const renderedElement = element.cloneNode(false) as HTMLElement;
    renderedElement.innerHTML = rehydratedHtml;

    return {
        original: element,
        rendered: renderedElement,
    };
};

/**
 * Triggered from begin to end, preemptive.
 */
export const processorList: FragmentProcessFunc[] = [textElementProcessor];
