//
//  WidgetsHelper.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 09/12/2021.
//

import Foundation
import WidgetKit
import UIKit
import AVFoundation

@objc(WidgetsHelper) // Define Module name Maping
class WidgetsHelper: NSObject, RCTBridgeModule {
  
  // MARK: - Define Module Name to use NativeModule in js code
  static func moduleName() -> String! {
    return "WidgetsHelper";
  }
  
  // MARK: - Allow to access the main thread through dispatch_get_main_queue()
  // The react-native bridge will ensure that native events and methods are always communicated from iOS to JS and visa versa, regardless of which thread they are running on.
  static func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
  //MARK: - Save the Credentials information to App Group
  @objc
  @available(iOS 14.0, *) // Check this func only use for IOS >= 14.0
  func setCredentials(_ credentials: String) {
    print("========================== Params to save Credentials ========================")
    print(credentials)
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)! // init App Group
    
    if credentials.isEmpty {
      sharedDefault.removeObject(forKey: Constant.CREDENTIALS)
      sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)  // Set value to app group
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.INCOMING_ACTIVITY) // Reload the Widget
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.TICKET_WAIT_PROCESS) // Reload the Widget
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.NOTIFICATIONS) // Reload the Widget
    }
    else {
      sharedDefault.set("\(credentials)", forKey: Constant.CREDENTIALS)  // Set value to app group
      sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)  // Set value to app group
      //// Refresh widget incoming activity
      sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.INCOMING_ACTIVITY_RELOAD_TYPE) // Set value to app group
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.INCOMING_ACTIVITY) // Reload the Widget
      
      //Refresh widget ticket wait process
      sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.PROCESSING_TICKET_RELOAD_TYPE) // Set value to app group
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.TICKET_WAIT_PROCESS) // Reload the Widget
      
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.NOTIFICATIONS) // Reload the Widget
    }
  }
  
  // MARK: - Save the incoming activity List information to the App Pool and then reload the Widget
  @objc
  @available(iOS 14.0, *)
  func setIncomingData(_ incomingList: NSString) {
    print("========================== Params to save Incoming Activity Data ========================")
    print(incomingList)
    //// Check activity list is empty
    //// If it's empty then Remove information in App group and then reload the Widgets
    ///If it's not empty then save information in App group and then reload the Widgets
    if incomingList == "[]" {
      let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
      sharedDefault.removeObject(forKey: Constant.INCOMING_ACTIVITY_DATA)
      sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.INCOMING_ACTIVITY_RELOAD_TYPE) // Set value to app group
      #if arch(arm64) || arch(i386) || arch(x86_64)
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.INCOMING_ACTIVITY)
      #endif
    }
    else {
      let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
      sharedDefault.set("\(incomingList)", forKey: Constant.INCOMING_ACTIVITY_DATA)
      sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.INCOMING_ACTIVITY_RELOAD_TYPE) // Set value to app group
      #if arch(arm64) || arch(i386) || arch(x86_64)
        WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.INCOMING_ACTIVITY)
      #endif
    }
  }
  
  //MARK: - Save the MetaData status of the Activity
  @objc
  @available(iOS 14.0, *)
  func setMetaDataActivityStatus(_ data: String) {
    print("========================== Params to save MetaData Activity Status ========================")
    print(data)
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)! // init App Group
    sharedDefault.set("\(data)", forKey: Constant.META_DATA_ACTIVITY_STATUS) // Set value to app group
  }
  
  //MARK: - Save information ticket data to cache
  @objc
  @available(iOS 14.0, *)
  func setProcessingTicketData(_ data: String) {
    print("========================== Params to Save information ticket data to cache ========================")
    print(data)
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)! // init App Group
    if data == "[]" {
      
      sharedDefault.removeObject(forKey: Constant.PROCESSING_TICKET_DATA)
      sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.PROCESSING_TICKET_RELOAD_TYPE) // Set value to app group
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.TICKET_WAIT_PROCESS)
    }
    else {
     
      sharedDefault.set("\(data)", forKey: Constant.PROCESSING_TICKET_DATA) // Set value to app group
      sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.PROCESSING_TICKET_RELOAD_TYPE) // Set value to app group
      WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.TICKET_WAIT_PROCESS) // Reload the Widget
    }
  }
  
  //MARK: - Save Meta data Ticket status to cache
  @objc
  @available(iOS 14.0, *)
  func setMetaDataTicket(_ data: String) {
    print("========================== Params to Save Meta data Ticket status to cache ========================")
    print(data)
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)! // init App Group
    sharedDefault.set("\(data)", forKey: Constant.PROCESSING_TICKET_DATA_ENUM_LIST) // Set value to app group
    sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.PROCESSING_TICKET_RELOAD_TYPE) // Set value to app group
    WidgetCenter.shared.reloadTimelines(ofKind: WidgetsKind.TICKET_WAIT_PROCESS) // Reload the Widget
  }

}
