//
//  CommunicationsHelper.m
//  CloudProSalesApp
//
//  Created by Margosh Le on 23/06/2022.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// MARK: - Define Module Name maping with class name of file Swift handle
@interface RCT_EXTERN_MODULE(CommunicationsHelper, NSObject)

//MARK: - Func handle make call
RCT_EXTERN_METHOD(phoneCall: (NSString *)phoneNumber
                  prompt:(BOOL *)prompt
                  )

//MARK: - Func handle open sms
RCT_EXTERN_METHOD(text: (NSString *)phoneNumber
                  body:(NSString *)body
                  )

//MARK: - Func handle open sms
RCT_EXTERN_METHOD(email: (NSArray *)to
                  cc:(NSArray *)cc
                  bcc:(NSArray *)bcc
                  subject:(NSString *)subject
                  body:(NSString *)body
                  isHTML:(BOOL *)isHTML
                  )

@end
