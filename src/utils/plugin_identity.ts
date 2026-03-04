import { PLUGIN_CONFIG } from "@/config";

type PluginPathInfo = {
    plugin?: string;
    data?: string;
};

type PluginManifestInfo = {
    slug?: unknown;
    name?: unknown;
};

type PluginEntry = {
    path?: PluginPathInfo;
    manifest?: PluginManifestInfo;
};

function getPluginEntries(): Array<[string, PluginEntry]> {
    return Object.entries((LiteLoader.plugins ?? {}) as Record<string, PluginEntry>);
}

function isKnownSlug(slug: string): boolean {
    return (
        slug === PLUGIN_CONFIG.SLUG ||
        (PLUGIN_CONFIG.LEGACY_SLUGS as readonly string[]).includes(slug)
    );
}

function isTargetManifest(entry: PluginEntry): boolean {
    const slug = entry.manifest?.slug;
    if (typeof slug === "string" && isKnownSlug(slug)) {
        return true;
    }

    const name = entry.manifest?.name;
    return typeof name === "string" && name === PLUGIN_CONFIG.DISPLAY_NAME;
}

export function resolvePluginSlug(): string | undefined {
    const entries = getPluginEntries();

    const preferredSlugs = [PLUGIN_CONFIG.SLUG, ...PLUGIN_CONFIG.LEGACY_SLUGS];
    for (const slug of preferredSlugs) {
        if (entries.some(([entrySlug]) => entrySlug === slug)) {
            return slug;
        }
    }

    return entries.find(([, entry]) => isTargetManifest(entry))?.[0];
}

export function resolvePluginEntry(): PluginEntry | undefined {
    const slug = resolvePluginSlug();
    if (!slug) {
        return undefined;
    }
    return (LiteLoader.plugins as Record<string, PluginEntry>)[slug];
}

export function resolvePluginPath(): string | undefined {
    return resolvePluginEntry()?.path?.plugin;
}

export function resolvePluginDataPath(): string | undefined {
    return resolvePluginEntry()?.path?.data;
}
