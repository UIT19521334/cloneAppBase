//
//  CustomPushPayload.h
//  CloudProSalesApp
//
//  Created by Margosh Le on 13/04/2022.
//

#import <PushKit/PushKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface CustomPushPayload : PKPushPayload

@property (copy) NSDictionary *customDictionaryPayload;

@end

NS_ASSUME_NONNULL_END
