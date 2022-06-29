//
//  FirebaseAppHelper.m
//  CloudProSalesApp
//
//  Created by Margosh Le on 28/04/2022.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// MARK: - Define Module Name maping with class name of file Swift handle
@interface RCT_EXTERN_MODULE(FirebaseAppHelper, NSObject)

//MARK: - Func handle delete all Firebase instance existed
RCT_EXTERN_METHOD(deleteAll: (RCTResponseSenderBlock)callback)

//MARK: - Func handle delete a specified Firebase instance
RCT_EXTERN_METHOD(delete:
                  (NSString *)instanceName
                  callback:(RCTResponseSenderBlock)
                  )

//MARK: - Func handle initialize the other Firebase Instance
RCT_EXTERN_METHOD(initialize: (NSString *)projectId
                        appId:(NSString *)appId
                       apiKey:(NSString *)apiKey
                     senderId:(NSString *)senderId
                     callback:(RCTResponseSenderBlock)
                  )

@end

