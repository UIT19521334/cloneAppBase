/**
 * @file    : themes/index.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : config themes used in app
 * @member  : Manh Le, Khiem Ha
*/

import { createText, createBox } from "@shopify/restyle";

const theme = {
    colors: {
        primary: '#008ecf',
        successful: '#35bf8e',
        warning: '#ffa600',
        dangerous: '#de425b',
        white1: '#ffffff',
        white2: '#f8f8f8',
        white3: '#f0f0f0',
        white4: '#e9e9e9',
        white5: '#e2e2e2',
        black1: '#333333',
        black2: '#5a5a5a',
        black3: '#858585',
        black4: '#b2b2b2',
        black5: '#e2e2e2'
    },
    spacing: {
        z: 0,
        s: 2,
        m: 6,
        l: 12,
        xl: 24,
    },
    textVariants: {
        title2: {
            fontSize: 20,
            lineHeight: 30,
        },
        desc: {
            fontSize: 14,
            lineHeight: 25,
        },
        label: {
            fontSize: 14,
            lineHeight: 25,
        },
        label2B: {
            fontSize: 16,
            fontWeight: '600'
        },
        headerSection: {
            fontSize: 14,
            fontWeight: 'bold'
        },
        time: {
            fontSize: 12,
            color: 'black3'
        },
    },
    breakpoints: {},
};

export type Theme = typeof theme;

export const Text = createText<Theme>();

export const Box = createBox<Theme>();

export default theme;