
import { Action } from './types';
import { Period } from '../../utils/Models/models';

export const UPDATE_FILTER = 'UPDATE_FILTER';

export function setFilterPerformance(params: Period): Action {
    return {
        type: 'UPDATE_FILTER',
        period: params
    };
}
