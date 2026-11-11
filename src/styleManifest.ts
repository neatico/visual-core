import {
  DESIGN_THEMES,
  designTheme,
  type DesignTheme,
} from "./designSystem.js";
import { languageFont } from "./fontCatalog.js";

/** Persist the resolved tokens, not just a mutable theme name. */
export interface StyleManifest {
  version: 1;
  themeId: string;
  themeVersion: 1;
  theme: DesignTheme;
  fonts: { heading: string; body: string; code: string; quantity?: string; label?: string };
  imagery: {
    medium: "native" | "photography" | "illustration" | "3d";
    referenceAssetIds: string[];
    direction: string;
  };
}

export function createStyleManifest(
  themeId: string,
  copy = "",
  imagery?: Partial<StyleManifest["imagery"]>,
): StyleManifest {
  const theme = designTheme(themeId);
  if (
    !DESIGN_THEMES.some((candidate) => candidate.id === themeId) &&
    !["paper", "midnight", "ocean", "plum"].includes(themeId)
  )
    throw new Error("STYLE_UNKNOWN_THEME");
  const manifest: StyleManifest = {
    version: 1,
    themeId: theme.id,
    themeVersion: 1,
    theme: {
      ...theme,
      palette: { ...theme.palette },
      typography: { ...theme.typography },
      geometry: { ...theme.geometry },
    },
    fonts: {
      heading: languageFont(copy, theme.typography.heading),
      body: languageFont(copy, theme.typography.body),
      code:
        theme.typography.code === "monospace"
          ? "JetBrains Mono"
          : theme.typography.code,
    },
    imagery: {
      medium: "native",
      referenceAssetIds: [],
      direction: "",
      ...imagery,
    },
  };
  return validateStyleManifest(manifest);
}

export function validateStyleManifest(value: unknown): StyleManifest {
  const manifest = value as StyleManifest;
  const fail = (): never => {
    throw new Error("STYLE_INVALID_MANIFEST");
  };
  if (
    !manifest ||
    manifest.version !== 1 ||
    manifest.themeVersion !== 1 ||
    typeof manifest.themeId !== "string" ||
    !manifest.theme ||
    manifest.theme.id !== manifest.themeId ||
    !DESIGN_THEMES.some((theme) => theme.id === manifest.themeId)
  )
    return fail();
  const { palette, typography, geometry } = manifest.theme;
  if (
    !palette ||
    ["background", "surface", "ink", "muted", "accent", "line"].some(
      (key) =>
        !/^#[\da-f]{6}$/i.test(
          (palette as unknown as Record<string, string>)[key] || "",
        ),
    )
  )
    return fail();
  if (
    !typography ||
    ["heading", "body", "code"].some(
      (key) =>
        typeof (typography as unknown as Record<string, unknown>)[key] !==
        "string",
    ) ||
    ["quantity", "label"].some(key => {
      const font = (typography as unknown as Record<string, unknown>)[key];
      return font !== undefined && (typeof font !== "string" || !font.trim() || font.length > 100);
    }) ||
    !Number.isInteger(typography.headingWeight) ||
    typography.headingWeight < 100 ||
    typography.headingWeight > 900
  )
    return fail();
  if (
    !geometry ||
    !Number.isFinite(geometry.radius) ||
    geometry.radius < 0 ||
    geometry.radius > 100 ||
    !Number.isFinite(geometry.spacing) ||
    geometry.spacing <= 0 ||
    geometry.spacing > 4 ||
    !["none", "hairline", "accent"].includes(geometry.rule)
  )
    return fail();
  if (
    !manifest.fonts ||
    Object.keys(manifest.fonts).some(key => !["heading", "body", "code", "quantity", "label"].includes(key)) ||
    ["quantity", "label"].some(key => {
      const font = (manifest.fonts as unknown as Record<string, unknown>)[key];
      return font !== undefined && (typeof font !== "string" || !font.trim() || font.length > 100);
    }) ||
    ["heading", "body", "code"].some((key) => {
      const font = (manifest.fonts as unknown as Record<string, unknown>)[key];
      return typeof font !== "string" || !font.trim() || font.length > 100;
    })
  )
    return fail();
  if (
    !manifest.imagery ||
    !["native", "photography", "illustration", "3d"].includes(
      manifest.imagery.medium,
    ) ||
    typeof manifest.imagery.direction !== "string" ||
    manifest.imagery.direction.length > 2000 ||
    !Array.isArray(manifest.imagery.referenceAssetIds) ||
    manifest.imagery.referenceAssetIds.length > 16 ||
    manifest.imagery.referenceAssetIds.some(
      (id) => typeof id !== "string" || !id || id.length > 160,
    )
  )
    return fail();
  return {
    version: 1,
    themeId: manifest.themeId,
    themeVersion: 1,
    theme: {
      id: manifest.themeId,
      palette: { ...palette },
      typography: { ...typography },
      geometry: { ...geometry },
    },
    fonts: {
      heading: manifest.fonts.heading,
      body: manifest.fonts.body,
      code: manifest.fonts.code,
      ...(manifest.fonts.quantity ? { quantity: manifest.fonts.quantity } : {}),
      ...(manifest.fonts.label ? { label: manifest.fonts.label } : {}),
    },
    imagery: {
      medium: manifest.imagery.medium,
      direction: manifest.imagery.direction,
      referenceAssetIds: [...manifest.imagery.referenceAssetIds],
    },
  };
}
