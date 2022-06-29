
/**
 * @typedef {'HIDDEN_ACTION_SHEET'} HideActionSheet
 */

/**
 * @typedef {'SHOW_ACTION_SHEET'} ShowActionSheet
 */

/**
 * @typedef {'HIDDEN_ALERT'} HiddenAlert
 */

/**
 * @typedef {'DISPLAY_ALERT'} DisplayAlert
 */

/**
 * @typedef {'DISPLAY_MESSAGE_ERROR'} Error
 */

/**
 * @typedef {'DISPLAY_MESSAGE_SUCCESS'} Success
 */

/**
 * @typedef {'DISPLAY_MESSAGE_WARNING'} Waring
 */

/**
* @typedef {'HIDDEN_MESSAGE'} Hidden
*/

/**
* @typedef {'UPDATE_FILTER'} UpdateFilterPerformance
*/

export type Action =
    { type: Error, title: '', message: '' } |
    { type: Success, title: '', message: '' } |
    { type: Waring, title: '', message: '' } |
    { type: Hidden, title: '', message: '' } |
    { type: DisplayAlert, title: '', message: '' } |
    { type: HiddenAlert, title: '', message: '' } |
    { type: ShowActionSheet, title: '', actions: '' } |
    { type: HideActionSheet} |
    { type: UpdateFilterPerformance} |
    {type: 'SHOW_NOTIFICATION' , title: '', message: ''} |
    {type: 'HIDDEN_NOTIFICATION'} |
    {type: 'MARK_UNREAD_NOTIFICATION'} |
    {type: 'MARK_READ_NOTIFICATION'}

export type Dispatch = (action: Action | Array<Action>) => any;
export type GetState = () => Object;
export type PromiseAction = Promise<Action>;
