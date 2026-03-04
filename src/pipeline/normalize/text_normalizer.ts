import { unescapeHtml } from "@/utils/htmlProc";

import type { InputPiece, NormalizedTextResult, PipelineSettingsSnapshot } from "../types";

function normalizeTextValue(text: string, settings: PipelineSettingsSnapshot): string {
    let normalizedText = text.replace(/\r\n?/g, "\n");

    if (settings.unescapeAllHtmlEntities === true) {
        return unescapeHtml(normalizedText);
    }

    if (settings.unescapeGtInText === true) {
        normalizedText = normalizedText.replaceAll("&gt;", ">");
    }

    return normalizedText;
}

/**
 * Normalize extracted text pieces to markdown source based on settings.
 */
export function normalizeTextPieces(
    pieces: InputPiece[],
    mentionPlaceholders: Map<string, HTMLElement>,
    settings: PipelineSettingsSnapshot
): NormalizedTextResult {
    const markdownParts: string[] = [];

    for (const piece of pieces) {
        if (piece.kind === "mention") {
            markdownParts.push(piece.placeholder);
            continue;
        }

        markdownParts.push(normalizeTextValue(piece.value, settings));
    }

    return {
        markdownSource: markdownParts.join(""),
        mentionPlaceholders: new Map(mentionPlaceholders),
    };
}
