//
//  WidgetsHelper.m
//  CloudProSalesApp
//
//  Created by Margosh Le on 09/12/2021.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// MARK: - Define Module Name maping with class name of file Swift handle
@interface RCT_EXTERN_MODULE(WidgetsHelper, NSObject)

  //MARK: - Define function setMetaDataTicketStatus: contains information status of the Activity
  RCT_EXTERN_METHOD(setMetaDataActivityStatus: (NSString *)data)

  //  MARK: - Define function setTicketData: contains information incoming activity list
  ////  Params: incomingList (String)
  RCT_EXTERN_METHOD(setIncomingData: (NSString *)incomingList)

  //MARK: - Define function setCredentials: contains information such as Token and URL
  RCT_EXTERN_METHOD(setCredentials: (NSString *)credentials)

  //MARK: - Define function setProcessingTicketData: contains information list ticket wait process
  RCT_EXTERN_METHOD(setProcessingTicketData: (NSString *)data)

  //MARK: - Define function setMetaDataTicket: contains information meta data of module Ticket
  RCT_EXTERN_METHOD(setMetaDataTicket: (NSString *)data)
@end
