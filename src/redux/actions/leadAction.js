import { Action } from './types';

/**
 * định nghĩa các action key
 * ghi nhận thông tin danh sách lead đã được tải lần đầu
*/
export const SET_LOADING = 'SET_LOADING';
export const SET_REFRESHING = 'SET_REFRESHING';
export const SET_FIRST_LOADING = 'SET_FIRST_LOADING';
export const SET_LOAD_MORE = 'SET_LOAD_MORE';
export const SET_PAGING = 'SET_PAGING';
export const SET_KEYWORD = 'SET_KEYWORD';
export const SET_KEYWORD_RELATED = 'SET_KEYWORD_RELATED';
export const SET_FILTER = 'SET_FILTER';
export const SET_OPTIONS_FILTER = 'SET_OPTIONS_FILTER';
export const SET_LEADS = 'SET_LEADS';
export const SET_LEAD_SELECTED = 'SET_LEAD_SELECTED';
export const SET_RELATED_LEADS = 'SET_RELATED_LEADS';
export const INIT_LEAD = 'INIT_LEAD';
export const SET_LOADED = 'SET_LOADED';
export const SET_RELOAD = 'SET_RELOAD';

/**
 * @function setLoaded with @augments loaded : @type {boolean}
 * ghi nhận thông tin danh sách lead đã được tải lần đầu
*/
export function setLoaded(loaded: boolean): Action {
    return {
        type: SET_LOADED,
        loaded: true
    };
}

/**
 * @function setReload with @augments reload : @type {boolean}
 * ghi nhận tình trạng danh sách lead được reload
*/
export function setReload(reload: boolean): Action {
    return {
        type: SET_RELOAD,
        reload: reload
    };
}

/**
 * @function initLeads
 * khởi tạo các thông tin default state 
*/
export function initLeads(): Action {
    return {
        type: INIT_LEAD
    };
}

/**
 * @function setLeadSelected with @augments indexSelected : @type {number}
 * ghi nhận index lead được chọn trong danh sách lead
*/
export function setLeadSelected(indexSelected: number): Action {
    return {
        type: SET_LEAD_SELECTED,
        indexSelected: indexSelected
    };
}

/**
 * @function setRefreshing with @augments refreshing : @type {boolean}
 * Cập nhật tình trạng đang làm tươi danh sách lead
*/
export function setRefreshing(refreshing: boolean): Action {
    return {
        type: SET_REFRESHING,
        refreshing: refreshing
    };
}

/**
 * @function setLoading with @augments loading : @type {boolean}
 * Cập nhật tình trạng đang tải danh sách lead
*/
export function setLoading(loading: boolean): Action {
    return {
        type: SET_LOADING,
        loading: loading
    };
}

/**
 * @function setFirstLoading with @augments firstLoading : @type {boolean}
 * Cập nhật tình trạng đang tải danh sách lead lần đầu
*/
export function setFirstLoading(firstLoading: boolean): Action {
    return {
        type: SET_FIRST_LOADING,
        firstLoading: firstLoading
    };
}

/**
 * @function setLoadMore with @augments loadMore : @type {boolean}
 * Cập nhật tình trạng đang tải thêm leads
*/
export function setLoadMore(loadMore: boolean): Action {
    return {
        type: SET_LOAD_MORE,
        loadMore: loadMore
    };
}

/**
 * @function setPaging with @augments paging : @type {Object}
 * ghi nhận thông tin paging của danh sách lead
*/
export function setPaging(paging: Object): Action {
    return {
        type: SET_PAGING,
        paging: paging
    };
}

/**
 * @function setKeyword with @augments keyword : @type {string}
 * ghi nhận thông tin keyword để tìm kiếm lead
*/
export function setKeyword(keyword: string): Action {
    return {
        type: SET_KEYWORD,
        keyword: keyword
    };
}

/**
 * @function setKeywordRelated with @augments keyword : @type {string}
 * ghi nhận thông tin keyword để tìm kiếm lead theo module related bất kỳ
*/
export function setKeywordRelated(keyword: string): Action {
    return {
        type: SET_KEYWORD_RELATED,
        keyword: keyword
    };
}

/**
 * @function setFilter with @augments filter : @type {Object}
 * ghi nhận option filter danh sách lead được chọn
*/
export function setFilter(filter: Object): Action {
    return {
        type: SET_FILTER,
        filter: filter
    };
}

/**
 * @function setOptionsFilter with @augments optionsFilter : @type {Array<any>}
 * ghi nhận các option filter hiện có cho module lead
*/
export function setOptionsFilter(optionsFilter: Array<any>): Action {
    return {
        type: SET_OPTIONS_FILTER,
        optionsFilter: optionsFilter
    };
}

/**
 * @function setLeads with @augments leads : @type {Array<any>}
 * ghi nhận thông tin danh sách lead đã được tải
*/
export function setLeads(leads: Array<any>): Action {
    return {
        type: SET_LEADS,
        leads: leads
    };
}

/**
 * @function setRelatedLeads with @augments leads : @type {Array<any>}
 * ghi nhận thông tin danh sách lead đã được tải được filter theo module related bất kỳ
*/
export function setRelatedLeads(leads: Array<any>): Action {
    return {
        type: SET_RELATED_LEADS,
        contacts: leads
    };
}
