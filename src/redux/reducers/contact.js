import type { Action } from '../actions/types';
import {
    SET_CONTACTS,
    SET_OPTIONS_FILTER,
    SET_FILTER,
    SET_KEYWORD,
    SET_KEYWORD_RELATED,
    SET_PAGING,
    SET_LOAD_MORE,
    SET_FIRST_LOADING,
    SET_LOADING,
    SET_REFRESHING,
    SET_CONTACT_SELECTED,
    INIT_CONTACT,
    SET_CONTACT_LOADED,
    SET_CONTACT_RELOAD,
    SET_RELATED_CONTACTS
} from '../actions/contactActions';
import { ContactState } from '../../utils/Models/models';
import { getLabel, getIcon } from '../../utils/commons/commons'

const initialState: ContactState = {
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
        viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_contacts') })
    },
    optionsFilter: [],
    contacts: [],
    relatedContacts: [],
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

export default function (state: ContactState = initialState, action: Action): ContactState {

    switch (action.type) {
        case INIT_CONTACT:
            return {
                ...state,
                ...initialState

            }
        case SET_CONTACT_LOADED:
            return {
                ...state,
                loaded: action.loaded

            }
        case SET_CONTACT_RELOAD:
            return {
                ...state,
                reload: action.reload
            }
        case SET_CONTACT_SELECTED:
            return {
                ...state,
                indexSelected: action.indexSelected

            }
        case SET_CONTACTS:

            return {
                ...state,
                contacts: action.contacts

            }
        case SET_RELATED_CONTACTS:

            return {
                ...state,
                relatedContacts: action.contacts

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