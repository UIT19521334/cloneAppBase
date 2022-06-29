
import type { Action } from '../actions/types';

import {
    SET_LEADS,
    SET_OPTIONS_FILTER,
    SET_FILTER,
    SET_KEYWORD,
    SET_PAGING,
    SET_LOAD_MORE,
    SET_FIRST_LOADING,
    SET_LOADING,
    SET_REFRESHING,
    SET_LEAD_SELECTED,
    INIT_LEAD,
    SET_LOADED,
    SET_RELOAD,
    SET_RELATED_CONTACTS,
    SET_KEYWORD_RELATED
} from '../actions/leadAction';
import { LeadState } from '../../utils/Models/models';
import { getLabel, getIcon } from '../../utils/commons/commons'

const initialState: LeadState = {
    reload: false,
    loaded: false,
    indexSelected: -1,
    loadMore: false,
    loading: false,
    firstLoading: false,
    refreshing: false,
    paging: {},
    keyword: '',
    keywordRelated: '',
    filter: {
        cv_id: '',
        viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_leads') })
    },
    optionsFilter: [],
    leads: [],
    relatedLeads: [],
    actionsMore: [
        {
            label: getLabel('common.btn_edit'),
            icon: getIcon('Edit'),
            key: 'edit'
        },
        {
            label: getLabel('common.btn_location'),
            icon: getIcon('Location'),
            key: 'location'
        },
        {
            label: getLabel('common.btn_send_email'),
            icon: getIcon('Mail'),
            key: 'mail'
        },
        {
            label: getLabel('common.btn_duplicate'),
            icon: getIcon('Duplicate'),
            key: 'duplicate'
        },
        {
            label: getLabel('common.btn_delete'),
            icon: getIcon('Delete'),
            key: 'delete'
        }
    ]
};

export default function (state: LeadState = initialState, action: Action): LeadState {
    switch (action.type) {
        case INIT_LEAD:
            return {
                ...state,
                ...initialState

            }
        case SET_LOADED:
            return {
                ...state,
                loaded: action.loaded

            }
        case SET_RELOAD:
            return {
                ...state,
                reload: action.reload
            }
        case SET_LEAD_SELECTED:
            return {
                ...state,
                indexSelected: action.indexSelected

            }
        case SET_LEADS:

            return {
                ...state,
                leads: action.leads

            }
        case SET_RELATED_CONTACTS:

            return {
                ...state,
                relatedLeads: action.leads

            }
        case SET_OPTIONS_FILTER:

            return {
                ...state,
                optionsFilter: action.optionsFilter
            }
        case SET_FILTER:

            return {
                ...state,
                filter: action.filter
            }
        case SET_KEYWORD:

            return {
                ...state,
                keyword: action.keyword
            }
        case SET_KEYWORD_RELATED:

            return {
                ...state,
                keywordRelated: action.keyword
            }
        case SET_PAGING:

            return {
                ...state,
                paging: action.paging
            }
        case SET_LOAD_MORE:

            return {
                ...state,
                loadMore: action.loadMore
            }
        case SET_FIRST_LOADING:

            return {
                ...state,
                firstLoading: action.firstLoading
            }
        case SET_LOADING:

            return {
                ...state,
                loading: action.loading
            }
        case SET_REFRESHING:

            return {
                ...state,
                refreshing: action.refreshing
            }
    }

    return state;
}