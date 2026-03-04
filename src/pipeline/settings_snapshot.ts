import { useSettingsStore } from "@/states/settings";

import type { PipelineSettingsSnapshot } from "./types";

/**
 * Capture a stable settings snapshot for one rendering pass.
 */
export function captureSettingsSnapshot(): PipelineSettingsSnapshot {
    const settings = useSettingsStore.getState();

    return {
        linkify: settings.linkify,
        typographer: settings.typographer,
        unescapeAllHtmlEntities: settings.unescapeAllHtmlEntities,
        unescapeGtInText: settings.unescapeGtInText,
        enableHtmlPurify: settings.enableHtmlPurify,
        forceEnableHtmlPurify: settings.forceEnableHtmlPurify() === true,
    };
}
