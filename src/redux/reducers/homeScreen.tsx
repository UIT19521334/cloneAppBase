
import type { Action } from '../actions/types';

import { UPDATE_FILTER } from '../actions/homeScreen';
import { HomeState } from '../../utils/Models/models';
import { OptionsPeriod } from '../../utils/commons/commons';

const initialState: HomeState = {
    filterPerformance: OptionsPeriod()[2]
};

export default function (state: HomeState = initialState, action: Action): HomeState {

    if (action.type === UPDATE_FILTER) {
        return {
            ...state,
            filterPerformance: action.period,
        };
    }
    return state;
}
