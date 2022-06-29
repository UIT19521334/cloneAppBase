/**
 * @file    : WidgetHelpers/index.ts
 * @author  : Manh Le
 * @date    : 2022-06-14
 * @purpose : create module bridge use to JS communicate with Widget app
 * @member  : Manh Le
*/

import { NativeModules, Platform } from 'react-native';

interface WidgetHelpersModule {
	setCredentials: (credentials: string) => void;
	setIncomingData: (incomingList: string) => void;
	setMetaDataActivityStatus: (data: string) => void;
	setProcessingTicketData: (data: string) => void;
	setMetaDataTicket: (data: string) => void;
	setNotifyUpdateData: (updateList: string) => void;
	setNotifyCheckInData: (checkInList: string) => void;
}

const RNWidgetHelpers = NativeModules.WidgetsHelper as WidgetHelpersModule;

interface Credentials {
	token: string,
	url: string
}

interface MetaDataTicket {
	ticketcategories: Array<any>;
	ticketpriorities: Array<any>;
}

interface NotificationItem {
	id: string;
	message: string;
    type: string,
    subType: string,
	relatedRecordId: string;
    relatedModuleName: string,
	read: string;
	createdTime: string;
	isInvite: string;
	isAcceptInvite: string;
	checkInTime: string;
}

class WidgetHelpers {
	static setCredentials(credentials: Credentials) {
		RNWidgetHelpers?.setCredentials?.(JSON.stringify(credentials));
	}

	static setIncomingData(incomingList: Array<any>) {
		if (Platform.OS == 'android') {
			RNWidgetHelpers?.setIncomingData?.(JSON.stringify(incomingList));
		}
		else {
			let res: Array<any> = [];
			if (incomingList) {
				res = incomingList.map((item) => {
					return {
						activityid: item?.activityid,
						subject: item?.subject,
						activitytype: item?.activitytype,
						date_start: item?.date_start,
						time_start: item?.time_start
					}
				});
			}

			RNWidgetHelpers?.setIncomingData?.(JSON.stringify(res));
		}
	}

	static setMetaDataActivityStatus(data: any) {
		RNWidgetHelpers?.setMetaDataActivityStatus?.(JSON.stringify(data));
	}

	static setProcessingTicketData(data: Array<any>) {
		if (Platform.OS == 'android') {
			try {
				RNWidgetHelpers?.setProcessingTicketData?.(JSON.stringify(data));
			} catch (error) {
				console.log('setProcessingTicketData Error: ', error);
			}
		}
		else if (Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14) {
			let res: Array<any> = [];

			if (data) {
				res = data.map((item) => {
					return {
						ticketid: item?.ticketid,
						ticket_no: item?.ticket_no,
						title: item?.title,
						createdtime: item?.createdtime,
						status: item?.status,
						priority: item?.priority,
						category: item?.category
					}
				});
			}

			try {
				RNWidgetHelpers?.setProcessingTicketData?.(JSON.stringify(res));
			} catch (error) {
				console.log('setProcessingTicketData Error: ', error);
			}
		}
	}

	static setMetaDataTicket(data: MetaDataTicket) {
		if (Platform.OS == 'android' || (Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14)) {
			RNWidgetHelpers?.setMetaDataTicket?.(JSON.stringify(data));
		}
	}

	static setNotifyUpdateData(data: Array<any>) {
		if (Platform.OS == 'android' || (Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14)) {
			let res: Array<NotificationItem> = [];

			if (data) {
				res = data.map((item) => {
					const notiItem: NotificationItem = {
                        id: item?.data?.id,
                        message: item?.message,
                        relatedRecordId: item?.data?.related_record_id,
                        read: item?.data?.read,
                        createdTime: item?.data?.created_time,
                        isInvite: item?.data?.extra_data?.inviter || '0',
                        isAcceptInvite: item?.data?.extra_data?.accepted || '0',
                        checkInTime:  item?.data?.extra_data?.checkin_time || '',
                        type: item?.data?.type,
                        subType: item?.data?.subtype,
                        relatedModuleName: item?.data?.related_module_name
                    }

					return notiItem;
				});
			}

			try {
				RNWidgetHelpers?.setNotifyUpdateData?.(JSON.stringify(res));
			} catch (error) {
				console.log('setProcessingTicketData Error: ', error);

			}
		}
	}

	static setNotifyCheckInData(data: Array<any>) {
		if (Platform.OS == 'android' || (Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14)) {
			let res: Array<NotificationItem> = [];

			if (data) {
				res = data.map((item) => {
					const notiItem: NotificationItem = {
                        id: item?.data?.id,
                        message: item?.message,
                        relatedRecordId: item?.data?.related_record_id,
                        read: item?.data?.read,
                        createdTime: item?.data?.created_time,
                        isInvite: '0',
                        isAcceptInvite: '0',
                        checkInTime: item?.data?.extra_data?.checkin_time || '',
                        type: '',
                        subType: '',
                        relatedModuleName: ''
                    }

					return notiItem;
				});
			}

			try {
				RNWidgetHelpers?.setNotifyCheckInData?.(JSON.stringify(res));
			} catch (error) {
				console.log('setProcessingTicketData Error: ', error);

			}
		}
	}
}