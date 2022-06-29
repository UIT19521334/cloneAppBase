
import type { Action } from '../actions/types';

import { SHOW_ACTION_SHEET, HIDDEN_ACTION_SHEET } from '../actions/actionSheet';
import { ActionSheetState } from '../../utils/Models/models';
import { Colors } from '../../themes/colors/Colors';

const initialState: ActionSheetState = {
    isShow: false,
    options: [],
    title: '',
    subTitle: '',
    iconSelected: '',
    selectedColor: Colors.functional.primary,
    backgroundSelectedColor: Colors.white.white3,
    iconSelectedStyle: null,
    indexSelected: -1,
    onSelected: null
};

export default function (state: ActionSheetState = initialState, action: Action): ActionSheetState {

    if (action.type === SHOW_ACTION_SHEET) {
        return {
            ...state,
            isShow: true,
            title: action.title || '',
            options: action.options || [],
            subTitle: action.subTitle || '',
            iconSelected: action.iconSelected || '',
            indexSelected: action.indexSelected,
            selectedColor: action.selectedColor || Colors.functional.primary,
            iconSelectedStyle: action.iconSelectedStyle,
            backgroundSelectedColor: action.backgroundSelectedColor || Colors.white.white3,
            onSelected: action.onSelected
        };
    }

    if (action.type === HIDDEN_ACTION_SHEET) {
        return {
            ...state,
            isShow: false,
            title: '',
            subTitle: '',
            iconSelected: '',
            indexSelected: -1,
            onSelected: null
        };
    }

    return state;
}
