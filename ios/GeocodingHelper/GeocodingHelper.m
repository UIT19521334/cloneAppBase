//
//  GeocodingHelper.m
//  CloudProSalesApp
//
//  Created by Margosh Le on 03/03/2022.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
// MARK: - Define Module Name maping with class name of file Swift handle
@interface RCT_EXTERN_MODULE(GeocodingHelper, NSObject)

//MARK: - Define function setMetaDataTicketStatus: contains information status of the Activity
  RCT_EXTERN_METHOD(getAddress: (NSString *)location)
//@implementation GeocodingHelper
//
//// MARK: - requires use Main Queue Setup
//+ (BOOL)requiresMainQueueSetup
//{
//  return NO;
//}
//
////MARK: Define module name
//RCT_EXPORT_MODULE(GeocodingHelper);
//
////MARK: - Define function get full address from location, Exm: latlng: "9.923088,105.725947", apiKey: ""
//RCT_EXPORT_METHOD(getAddressFromLocation:(NSString *)latlng
//                  apiKey: (NSString *)apiKey
//                  resolver: (RCTPromiseResolveBlock)resolve
//                  rejecter: (RCTPromiseRejectBlock)reject)
//{
//
//  NSString *urlGeocoding = [NSString stringWithFormat:@"https://maps.googleapis.com/maps/api/geocode/json?address=%@&key=%@", latlng,apiKey];
//  NSLog(@"URL request: %@", urlGeocoding);
//
//  NSMutableURLRequest *URLRequestGetAddress = [self initializeRequest:urlGeocoding setMethod:@"GET" setBody:nil];
//
//  // add content-type and authorization headers
//  [self addRequestHeaders:URLRequestGetAddress];
//
//  [NSURLConnection sendAsynchronousRequest:URLRequestGetAddress queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *addressResponse, NSData *dataRespone, NSError *error) {
//    // create NSDictionary out of JSON data that is returned
//            NSDictionary *responseDictionary = [self getHttpResponse:URLRequestGetAddress response:addressResponse data:dataRespone error:error];
//            if( responseDictionary == nil)
//                return;
//
//    NSLog(@"%@", responseDictionary);
//  }];
//
//}
//
////***********************************************************************************************
//// --- HELPER FUNCTIONS ---
////***********************************************************************************************
//- (NSMutableURLRequest *) initializeRequest:(NSString *) url setMethod:(NSString *) method setBody:(NSData *) body
//{
//    // create a request using the passed parameters for url, method, and body
//    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
//    [request setHTTPMethod:method];
//    [request setHTTPBody:body];
//    [request setURL:[NSURL URLWithString:url]];
//    return request;
//}
//
///////////////////////////////////////////////////////////////////////////////////////////////////
//- (void) addRequestHeaders:(NSMutableURLRequest *) request
//{
//    // also set the Content-Type header (other accepted type is application/xml)
//    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
//}
///////////////////////////////////////////////////////////////////////////////////////////////////
//- (NSDictionary *) getHttpResponse:(NSMutableURLRequest *) request response:(NSURLResponse *) response data:(NSData *) data error:(NSError *) error
//{
//    if (error) {
//        NSLog(@"Error sending request %@\n. Got Response %@\n Error is: %@\n", request, response, error);
//        return nil;
//    }
//    // we use NSJSONSerialization to parse the JSON formatted response
//    NSError *jsonError = nil;
//    return [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&jsonError];
//}
///////////////////////////////////////////////////////////////////////////////////////////////////
//- (NSString *)jsonStringFromObject:(id)object {
//    NSString *string = [[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:object options:0 error:nil] encoding:NSUTF8StringEncoding];
//    return string;
//}

@end
