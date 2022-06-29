
import { Action } from './types';
import { PARAMS_ACTION_SHEET } from '../../utils/Models/models';

export const SHOW_ACTION_SHEET = 'SHOW_ACTION_SHEET';
export const HIDDEN_ACTION_SHEET = 'HIDDEN_ACTION_SHEET';


export function showActionSheet(params: PARAMS_ACTION_SHEET): Action {
    return {
        type: 'SHOW_ACTION_SHEET',
        title: params.title,
        options: params.options,
        subTitle: params.subTitle,
        iconSelected: params.iconSelected,
        indexSelected: params.indexSelected,
        selectedColor: params.selectedColor,
        iconSelectedStyle: params.iconSelectedStyle,
        backgroundSelectedColor: params.backgroundSelectedColor,
        onSelected: params.onSelected
    };
}

export function hideActionSheet(): Action {
    return {
        type: 'HIDDEN_ACTION_SHEET',
    };
}

