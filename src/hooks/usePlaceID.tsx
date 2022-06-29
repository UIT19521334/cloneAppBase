/**
 * @file    : usePlaceID.js
 * @author  : Manh Le
 * @date    : 2022-08-15
 * @purpose : hook used for the feature auto-complete
 * @member  : Manh Le
*/

import PlaceIDModule, { Place } from '../components/PlaceID';

export default function usePlaceID() {

	// func int server PlaceID
	const initPlaceID = (apiKey: string, success: (data: any) => void, error: (err: any) => void) => {
		PlaceIDModule.init(apiKey)
			.then((res) => {
				if (res) {
					success(res);
				}
				else {
					success([]);
				}
			})
			.catch((err) => {
				error(err);
			})
	}

	// func handle search a key word when user typing
	const searchAddress = (query: string, success: (data: Array<Place>) => void, error: (err: any) => void) => {
		PlaceIDModule.searchAddress(query)
			.then((res) => {
				console.log('=================== response data search address ===========');
				console.log(res);
				
				if (res) {
					success(res);
				}
				else {
					success([]);
				}
			})
			.catch((err) => {
				console.log('=================== Error search address ===========');
				console.log(err);
				error(err);
			})
	}

	// func get information place from placeId
	const getPlaceDetail = (placeId: string, success: (data: any) => void, error: (err: any) => void) => {
		PlaceIDModule.getPlaceDetail(placeId)
			.then((res) => {
				console.log('=================== response data get detail address ===========');
				console.log(res);

				if (res) {
					success(res);
				}
				else {
					success([]);
				}
			})
			.catch((err) => {
				console.log('=================== Error get detail address ===========');
				console.log(err);
				error(err);
			})
	}

	return ({
		initPlaceID,
		searchAddress,
		getPlaceDetail
	})
}
