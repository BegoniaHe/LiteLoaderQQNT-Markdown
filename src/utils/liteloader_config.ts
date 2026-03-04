import { createJSONStorage } from "zustand/middleware";

import { PLUGIN_CONFIG } from "@/config";

const emptyStorageState: Record<string, unknown> = {};
const missingStorageStateKey = "__mdit_missing_storage_state__";
const missingStorageState: Record<string, unknown> = {
    [missingStorageStateKey]: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStorageState(value: string): Record<string, unknown> {
    try {
        const parsed = JSON.parse(value);
        return isRecord(parsed) ? parsed : emptyStorageState;
    } catch {
        return emptyStorageState;
    }
}

function isMissingStorageState(value: Record<string, unknown>): boolean {
    return value[missingStorageStateKey] === true && Object.keys(value).length === 1;
}

function buildStorageKey(prefix: string, name: string): string {
    return `${prefix}/${name}`;
}

const _storage = {
    async getItem(name: string) {
        const currentStorageKey = buildStorageKey(PLUGIN_CONFIG.SLUG_PREFIX, name);
        const currentValue = await LiteLoader.api.config.get(
            currentStorageKey,
            missingStorageState
        );

        if (!isMissingStorageState(currentValue)) {
            return JSON.stringify(currentValue);
        }

        for (const legacyPrefix of PLUGIN_CONFIG.LEGACY_SLUGS) {
            const legacyStorageKey = buildStorageKey(legacyPrefix, name);
            const legacyValue = await LiteLoader.api.config.get(
                legacyStorageKey,
                missingStorageState
            );

            if (isMissingStorageState(legacyValue)) {
                continue;
            }

            await LiteLoader.api.config.set(currentStorageKey, legacyValue);
            return JSON.stringify(legacyValue);
        }

        return JSON.stringify(emptyStorageState);
    },
    async setItem(name: string, value: string) {
        const parsedValue = parseStorageState(value);

        return await LiteLoader.api.config.set(
            buildStorageKey(PLUGIN_CONFIG.SLUG_PREFIX, name),
            parsedValue
        );
    },
    async removeItem(name: string) {
        return await LiteLoader.api.config.set(
            buildStorageKey(PLUGIN_CONFIG.SLUG_PREFIX, name),
            emptyStorageState
        );
    },
};

export const LiteLoaderStorage = createJSONStorage(() => _storage);
