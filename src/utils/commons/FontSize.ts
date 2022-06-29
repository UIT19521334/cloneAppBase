/**
 * @file    : FontSize.ts
 * @author  : Manh Le
 * @date    : 2021-04-13
 * @purpose : file config font size use in app
 * @member  : Manh Le
*/
import Global from "../../Global";

export const UIFontSize = {
    LARGE_TITLE: 'largeTitle',
    TITLE: 'title',
    HEADLINE: 'headline',
    BODY: 'body',
    CALLOUT: 'callout',
    CAPTION: 'caption',
    FOOTNOTE: 'footnote',
    HELP_TEXT: 'helpText',
    DEFAULT: 'default'
}

const defaultFontSize = {
    largeTitle: 22,
    title: 18,
    headline: 16,
    body: 14,
    callout: 14,
    caption: 14,
    footnote: 12,
    helpText: 11,
    default: 14
}

export const systemFont = (fontType: string): number => {

    const defaultValue = defaultFontSize[fontType];

    if (Global.configsApp?.fontSize && Object.keys(Global.configsApp?.fontSize).length > 0) {
        return Global.configsApp?.fontSize?.[fontType];
    }

    return defaultValue
}