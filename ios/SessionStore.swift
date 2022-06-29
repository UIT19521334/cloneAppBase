//
//  SessionStore.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 10/02/2022.
//

import Foundation
import Combine

@available(iOS 13.0, *)
final class SessionStore: ObservableObject {
    @Published  var currentIncomingList : ActivityList?
    @Published  var currentTicketList : TicketProcessList?
    @Published  var versionCRM : String?
  
    init(){
      CloudproClient.fetchCrmVersion(onSuccess: {
        self.versionCRM = $0
      })
    }
}

@available(iOS 13.0, *)
extension SessionStore{
    // Get data incoming activity list
    func fetchIncomingActivityList(completion : @escaping(ActivityList)->()){
        CloudproClient.fetchGetIncomingActivityList{
          self.currentIncomingList = $0
          completion($0)
        }
    }
  
  // Get data ticketlist
  func fetchTicketWaitProcessList(_ createdDate: String, _ priority: String, _ filterBy: String, completion : @escaping(TicketProcessList)->()){
    CloudproClient.fetchTicketWaitProcessList(createdDate, priority, filterBy, onSuccess: {
      self.currentTicketList = $0
      completion($0)
    });
  }
  
  // Get Data notification List
  func fetchNotification(_ type: String, _ subType: String, _ isNewVersion: Bool , completion: @escaping(NotificationData?, NotifyError?) -> ()) {
    CloudproClient.fetchNotifyData(type, subType, isNewVersion, completionHandler: { (notificationData, error) in
        completion(notificationData, error)
    })
    
  }
  
  // fetch information version CRM
  func fetchVersionCRM(completion: @escaping(String) -> ()) {
    CloudproClient.fetchCrmVersion(onSuccess: {
      self.versionCRM = $0
      completion($0)
    })
  }
}
