import { SELECTORS } from "@/config";

import type { InputPiece, TextExtractionResult } from "../types";

const MENTION_PLACEHOLDER_PREFIX = "\uE000";
const MENTION_PLACEHOLDER_SUFFIX = "\uE001";

function buildMentionPlaceholder(index: number): string {
    return `${MENTION_PLACEHOLDER_PREFIX}${index}${MENTION_PLACEHOLDER_SUFFIX}`;
}

function isMentionElement(node: Node): boolean {
    return node instanceof HTMLElement && node.matches(SELECTORS.AT_ELEMENT);
}

function pushTextPiece(pieces: InputPiece[], value: string): void {
    if (value.length === 0) {
        return;
    }

    const lastPiece = pieces[pieces.length - 1];
    if (lastPiece && lastPiece.kind === "text") {
        lastPiece.value += value;
        return;
    }

    pieces.push({
        kind: "text",
        value,
    });
}

function isBlockLikeElement(node: Node): boolean {
    if (!(node instanceof HTMLElement)) {
        return false;
    }

    const display = window.getComputedStyle(node).display;
    return (
        display === "block" ||
        display === "list-item" ||
        display === "table" ||
        display === "flex" ||
        display === "grid"
    );
}

function shouldInsertSiblingNewline(
    root: HTMLElement,
    parent: Node,
    current: Node,
    next: Node | undefined
): boolean {
    if (next === undefined) {
        return false;
    }

    if (parent !== root) {
        return false;
    }

    if (isMentionElement(current) || isMentionElement(next)) {
        return false;
    }

    if (current instanceof HTMLElement && current.tagName === "BR") {
        return false;
    }

    if (isBlockLikeElement(current)) {
        return true;
    }

    return false;
}

/**
 * Extract text from QQNT text element while preserving line breaks and @ mention placeholders.
 */
export function extractTextFragments(element: HTMLElement): TextExtractionResult {
    const pieces: InputPiece[] = [];
    const mentionPlaceholders = new Map<string, HTMLElement>();
    let mentionIndex = 0;

    function pushMentionPiece(node: HTMLElement): void {
        const placeholder = buildMentionPlaceholder(mentionIndex);
        mentionIndex += 1;

        mentionPlaceholders.set(placeholder, node.cloneNode(true) as HTMLElement);
        pieces.push({
            kind: "mention",
            placeholder,
            element: node,
        });
    }

    function walkNode(node: Node): void {
        if (node.nodeType === Node.TEXT_NODE) {
            pushTextPiece(pieces, (node as Text).data);
            return;
        }

        if (!(node instanceof HTMLElement)) {
            return;
        }

        if (isMentionElement(node)) {
            pushMentionPiece(node);
            return;
        }

        if (node.tagName === "BR") {
            pushTextPiece(pieces, "\n");
            return;
        }

        walkChildren(node);
    }

    function walkChildren(parent: Node): void {
        const children = Array.from(parent.childNodes);
        for (let index = 0; index < children.length; index++) {
            const current = children[index];
            const next = children[index + 1];

            walkNode(current);

            if (shouldInsertSiblingNewline(element, parent, current, next)) {
                pushTextPiece(pieces, "\n");
            }
        }
    }

    walkChildren(element);

    return {
        pieces,
        mentionPlaceholders,
    };
}
