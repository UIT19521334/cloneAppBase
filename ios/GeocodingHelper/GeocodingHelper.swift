//
//  GeocodingHelper.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 03/03/2022.
//

import Foundation
import CoreLocation

@objc(GeocodingHelper) // Define Module name Maping
class GeocodingHelper: NSObject, RCTBridgeModule {
  
  // MARK: - Define Module Name to use NativeModule in js code
  static func moduleName() -> String! {
    return "GeocodingHelper";
  }
  
  // MARK: - Allow to access the main thread through dispatch_get_main_queue()
  // The react-native bridge will ensure that native events and methods are always communicated from iOS to JS and visa versa, regardless of which thread they are running on.
  static func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
  @objc
  func getAddress(_ location: String) {
    let geocoder = CLGeocoder()
    let locationConverted = CLLocation.init(latitude: 10.844190568595495, longitude: 106.7116314)
    geocoder.reverseGeocodeLocation(locationConverted, preferredLocale: Locale.current, completionHandler: {
      (placemarks, error) in
      if (error != nil) {
              print("reverse geodcode fail: \(error!.localizedDescription)")
              
            }
      let pm = placemarks! as [CLPlacemark]
      if pm.count > 0 {
                  let placemark = CLPlacemark(placemark: pm[0] as CLPlacemark)

                  let addressLabel = String(format:"%@ %@\n%@ %@ %@\n%@",
                                            placemark.subThoroughfare! ,
                                            placemark.thoroughfare!,
                      placemark.locality!,
                      placemark.postalCode!,
                      placemark.administrativeArea!,
                                            placemark.country!);
        
        print("\(addressLabel)");
              }
              else {
                  print("No Placemarks!")
                  return
              }

    })
  }
}
