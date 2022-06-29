/**
 * @file    : utils/i18n/index.js
 * @author  : Khiem Ha
 * @date    : 2021-01-26
 * @purpose : file created multiple language
 * @member  : Khiem Ha, Manh Le
*/

import ReactNative from 'react-native';
import I18n from 'react-native-i18n';

// Import all locales
import en_us from './locales/en.js';
import vn_vn from './locales/vn.js';
import vi_vn from './locales/vn.js';

// Add by Manh Le at August 15th, 2021
// Purpose: addition translate to Laos
import la_la from './locales/la.js';
// End by Manh Le

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
    en_us,
    vn_vn,
    vi_vn,
    // Add by Manh Le at August 15th, 2021
    // Purpose: addition translate to Laos
    la_la,
    // End by Manh Le
};

const currentLocale = I18n.currentLocale();

// Is it a RTL language?
export const isRTL = currentLocale.indexOf('he') === 0 || currentLocale.indexOf('ar') === 0;

// Allow RTL alignment in RTL languages
ReactNative.I18nManager.allowRTL(isRTL);

export default I18n;
