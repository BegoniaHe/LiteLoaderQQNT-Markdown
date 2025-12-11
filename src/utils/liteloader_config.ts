import { createJSONStorage, StateStorage } from "zustand/middleware";

import { PLUGIN_CONFIG } from "@/config";

const emptyStorageState = {};

const _storage = {
    async getItem(name: string) {
        return JSON.stringify(
            await LiteLoader.api.config.get(
                `${PLUGIN_CONFIG.SLUG_PREFIX}/${name}`,
                emptyStorageState
            )
        );
    },
    async setItem(name: string, value: string) {
        return await LiteLoader.api.config.set(
            `${PLUGIN_CONFIG.SLUG_PREFIX}/${name}`,
            JSON.parse(value)
        );
    },
    async removeItem(name: string) {
        return await LiteLoader.api.config.set(
            `${PLUGIN_CONFIG.SLUG_PREFIX}/${name}`,
            emptyStorageState
        );
    },
};

export const LiteLoaderStorage = createJSONStorage(() => _storage);
