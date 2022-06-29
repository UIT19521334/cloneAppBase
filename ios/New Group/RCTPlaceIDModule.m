//
//  RCTPlaceIDModule.m
//  CloudProSalesApp
//
//  Created by Margosh Le on 12/06/2021.
//

#import <Foundation/Foundation.h>
#import "RCTPlaceIDModule.h"
#import <React/RCTLog.h>
@import GooglePlaces;

//// Define _placesClient variable
static GMSPlacesClient *_placesClient = nil;

@implementation RCTPlaceIDModule

// MARK: - requires Native Module use Main Queue Setup
+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

//MARK: Define module name
RCT_EXPORT_MODULE(PlaceIDModule);


// MARK: - function init GMSPlacesClient (required)
RCT_EXPORT_METHOD(init: (NSString *)apiKey
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
{
  if (apiKey) {
    RCTLogInfo(@"Key maps API: %@", apiKey);
    dispatch_async(dispatch_get_main_queue(), ^{
      @try {
          [GMSPlacesClient provideAPIKey:apiKey];
          _placesClient = [GMSPlacesClient sharedClient];
       }
       @catch (NSException *exception) {
          NSLog(@"%@", exception.reason);
         reject(@"@Error: ", exception.reason, nil);
       }
       @finally {
          NSLog(@"init GMS PlaceID successful!");
         resolve(@"init GMS PlaceID successful!");
       }
    });
  }
  else {
    reject(@"@Error: ", @"API key cannot be empty.", nil);
  }
  
}

//MARK: - Func search place
RCT_EXPORT_METHOD(searchAddress:(NSString *)query
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
{
 RCTLogInfo(@"Pretending to create an event %@", query);

  ///  create new session when async data
  GMSAutocompleteSessionToken *token = [[GMSAutocompleteSessionToken alloc] init];

  /// Create a type filter.
  GMSAutocompleteFilter *_filter = [[GMSAutocompleteFilter alloc] init];
  
  /// set type filter is search all
  _filter.type = kGMSPlacesAutocompleteTypeFilterNoFilter;
  
  /// handle async data matched
  [_placesClient findAutocompletePredictionsFromQuery:query
  filter:_filter sessionToken:token callback:^(NSArray<GMSAutocompletePrediction *> * _Nullable results, NSError * _Nullable error) {
    
    /// return error: API key may be limited request or wrong
    if (error != nil) {
      NSLog(@"Error search PlaceID %@", error);
      NSString *err = [error localizedDescription];
      reject(@"error",err, error);
      return;
    }
    
    /// reqonse place list
    if (results != nil) {
      /// init array place temp
      NSMutableArray *places = [NSMutableArray array];
      
      // parse data place just get fillAddress and placeID (use get information palce detail)
      for (GMSAutocompletePrediction *result in results) {
       
        [places addObject: @{@"fullAddress": result.attributedFullText.string, @"placeID": result.placeID}];
      }
      
      NSLog(@"Result lenght PlaceID %lu", (unsigned long)[places count]);
      
      ///return final result
      resolve(places);
    }
  }];
}

//MARK: - get information PlaceDetail from placeId
RCT_EXPORT_METHOD(getPlaceDetail: (NSString *)placeId
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
{
  GMSPlaceField fields = (GMSPlaceFieldCoordinate | GMSPlaceFieldAddressComponents);

  [_placesClient fetchPlaceFromPlaceID:placeId placeFields:fields sessionToken:nil callback:^(GMSPlace * _Nullable place, NSError * _Nullable error) {
    if (error != nil) {
      NSLog(@"An error occurred %@", [error localizedDescription]);
      reject(@"Error", [error localizedDescription], error);
      return;
    }
    if (place != nil) {
      NSLog(@"The selected place is: %f, %f", [place coordinate].latitude, [place coordinate].longitude );
      
      NSMutableArray *addressDetail = [NSMutableArray array];
      
      for (GMSAddressComponent *result in [place addressComponents]) {
       
        [addressDetail addObject: @{@"long_name": result.name,
                                    @"short_name": result.shortName,
                                    @"types": result.types
        }];
      }
      
      NSObject *result = @{
        @"geometry": @{
            @"location": @{
                @"latitude": @([place coordinate].latitude),
                @"longitude": @([place coordinate].longitude)
            }
        },
        @"address_components" : addressDetail
      };
      
      resolve(result);
    }
  }];
}

@end
