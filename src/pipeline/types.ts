export type ReplaceFunc = (parentElement: HTMLElement, id: string) => unknown;

/**
 * Data type used by renderer to determine how to render and replace an element.
 */
export interface MsgProcessInfo {
    mark: string;
    replace?: ReplaceFunc;
    id?: string;
}

export interface FragmentProcessFuncRetType {
    original: HTMLElement;
    rendered: HTMLElement;
}

/**
 * Function type that used to process children elements inside QQNT message box.
 */
export type FragmentProcessFunc = (
    parent: HTMLElement,
    element: HTMLElement,
    index: number
) => FragmentProcessFuncRetType | undefined;

export interface PipelineSettingsSnapshot {
    linkify: boolean;
    typographer: boolean;
    unescapeAllHtmlEntities: boolean;
    unescapeGtInText: boolean;
    enableHtmlPurify: boolean;
    forceEnableHtmlPurify: boolean;
}

export interface TextPiece {
    kind: "text";
    value: string;
}

export interface MentionPiece {
    kind: "mention";
    placeholder: string;
    element: HTMLElement;
}

export type InputPiece = TextPiece | MentionPiece;

export interface TextExtractionResult {
    pieces: InputPiece[];
    mentionPlaceholders: Map<string, HTMLElement>;
}

export interface NormalizedTextResult {
    markdownSource: string;
    mentionPlaceholders: Map<string, HTMLElement>;
}
