import { Action } from './types';

export const SET_LOADING = 'SET_LOADING';
export const SET_REFRESHING = 'SET_REFRESHING';
export const SET_FIRST_LOADING = 'SET_FIRST_LOADING';
export const SET_LOAD_MORE = 'SET_LOAD_MORE';
export const SET_PAGING = 'SET_PAGING';
export const SET_KEYWORD = 'SET_KEYWORD';
export const SET_KEYWORD_RELATED = 'SET_KEYWORD_RELATED';
export const SET_FILTER = 'SET_FILTER';
export const SET_OPTIONS_FILTER = 'SET_OPTIONS_FILTER';
export const SET_CONTACTS = 'SET_CONTACTS';
export const SET_RELATED_CONTACTS = 'SET_RELATED_CONTACTS';
export const SET_CONTACT_SELECTED = 'SET_CONTACT_SELECTED';
export const INIT_CONTACT = 'INIT_CONTACT';
export const SET_CONTACT_LOADED = 'SET_CONTACT_LOADED';
export const SET_CONTACT_RELOAD = 'SET_CONTACT_RELOAD';

export function setContactLoaded(loaded: boolean): Action {
    
    return {
        type: SET_CONTACT_LOADED,
        loaded: true
    };
}

export function setContactReload(reload: boolean): Action {
    
    return {
        type: SET_CONTACT_RELOAD,
        reload: reload
    };
}

export function initContacts(): Action {
    
    return {
        type: INIT_CONTACT
    };
}

export function setContactSelected(indexSelected: number): Action {
    
    return {
        type: SET_CONTACT_SELECTED,
        indexSelected: indexSelected
    };
}

export function setRefreshing(refreshing: boolean): Action {
    return {
        type: SET_REFRESHING,
        refreshing: refreshing
    };
}

export function setLoading(loading: boolean): Action {
    return {
        type: SET_LOADING,
        loading: loading
    };
}

export function setFirstLoading(firstLoading: boolean): Action {
    return {
        type: SET_FIRST_LOADING,
        firstLoading: firstLoading
    };
}

export function setLoadMore(loadMore: boolean): Action {
    return {
        type: SET_LOAD_MORE,
        loadMore: loadMore
    };
}

export function setPaging(paging: Object): Action {
    return {
        type: SET_PAGING,
        paging: paging
    };
}

export function setKeyword(keyword: string): Action {
    return {
        type: SET_KEYWORD,
        keyword: keyword
    };
}

export function setKeywordRelated(keyword: string): Action {
    return {
        type: SET_KEYWORD_RELATED,
        keyword: keyword
    };
}

export function setFilter(filter: Object): Action {
    return {
        type: SET_FILTER,
        filter: filter
    };
}

export function setOptionsFilter(optionsFilter: Array<any>): Action {
    return {
        type: SET_OPTIONS_FILTER,
        optionsFilter: optionsFilter
    };
}

export function setContacts(contacts: Array<any>): Action {
    return {
        type: SET_CONTACTS,
        contacts: contacts
    };
}

export function setRelatedContacts(contacts: Array<any>): Action {
    return {
        type: SET_RELATED_CONTACTS,
        contacts: contacts
    };
}
