import { createJSONStorage } from "zustand/middleware";

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
        let parsedValue: unknown = emptyStorageState;
        try {
            parsedValue = JSON.parse(value);
        } catch {
            // 当本地持久化内容损坏时，回退为空配置，避免阻塞插件加载/设置页
            parsedValue = emptyStorageState;
        }

        return await LiteLoader.api.config.set(
            `${PLUGIN_CONFIG.SLUG_PREFIX}/${name}`,
            (parsedValue as Record<string, unknown>) ?? emptyStorageState
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
