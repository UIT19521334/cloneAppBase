/**
 * @file    : WidgetHelpers/index.ts
 * @author  : Manh Le
 * @date    : 2021-08-15
 * @purpose : create module bridge use to JS communicate with SDK PlaceID
 * @member  : Manh Le
*/

import { NativeModules } from 'react-native';

interface PlaceLocation {
    latitude: any; // type double from android, long from ios
    longitude: any; // type double from android, long from ios
}

interface PlaceGeometry {
    location: PlaceLocation;
}

export interface PlaceDetail {
    address_components: String;
    geometry: PlaceGeometry;
}

export interface Place {
    fullAddress: string;
    placeID: string;
}

interface PlaceID {
    init: (apiKey: string) => Promise<any>;
    getPlaceDetail: (placeId: string) => Promise<any>;
    searchAddress: (keyword: string) => Promise<Array<Place>>;
}

export default NativeModules.PlaceIDModule as PlaceID;
