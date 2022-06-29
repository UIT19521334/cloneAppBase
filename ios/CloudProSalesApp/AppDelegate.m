#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase.h>
#import <PushKit/PushKit.h>
#import "RNVoipPushNotificationManager.h"      /* <------ add this line */
#import "RNCallKeep.h"
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
@import GooglePlaces;
#import "RNQuickActionManager.h"
#import "Orientation.h"
#import "RCTPlaceIDModule.h"
#import "CustomPushPayload.h"
#import <CodePush/CodePush.h>
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  if ([FIRApp defaultApp] == nil) {
      [FIRApp configure];
    }
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"CloudProSalesApp"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
   center.delegate = self;
  
  return YES;
}


/* Add PushKit delegate method */

// --- Handle updated push credentials
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

// --- Handle incoming pushes (for ios <= 10)
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type {
  [self pushRegistry:registry didReceiveIncomingPushWithPayload:payload forType:type withCompletionHandler:nil];
}

// --- Handle incoming pushes (for ios >= 11)
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  NSLog(@"didReceiveIncomingPushWithPayload: %@", payload.dictionaryPayload);

  NSDictionary *payloadDataDic = payload.dictionaryPayload[@"data"][@"map"][@"data"][@"map"];
  NSString *callId = payloadDataDic[@"callId"];
  NSNumber *serial = payloadDataDic[@"serial"];
  NSString *callStatus = payloadDataDic[@"callStatus"];

  NSString *fromAlias = payloadDataDic[@"from"][@"map"][@"alias"];
  NSString *fromNumber = payloadDataDic[@"from"][@"map"][@"number"];
  NSString *callName = fromAlias != NULL ? fromAlias : fromNumber != NULL ? fromNumber : @"Connecting...";

  NSString *uuid = [[[NSUUID UUID] UUIDString] lowercaseString];
  NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
  [dict setObject:uuid forKey:@"uuid"];
  [dict setObject:serial forKey:@"serial"];
  [dict setObject:callId forKey:@"callId"];
  
  NSDateFormatter *objDateformat = [[NSDateFormatter alloc] init];
         [objDateformat setDateFormat:@"yyyy-MM-dd hh:mm:ss"];
         NSString    *strTime = [objDateformat stringFromDate:[NSDate date]];
         NSString    *strUTCTime = [self GetUTCDateTimeFromLocalTime:strTime];
  
  NSString *content = [NSString stringWithFormat:@"\nDateTime: %@ \n\ncallId: %@\n serial: %@\n callStatus: %@\n fromAlias: %@\n fromNumber: %@\n callName: %@\n uuid: %@\n\n\n", strUTCTime, callId, serial, callStatus, fromAlias, fromNumber, callName, uuid];
  [self writeToLogFile: @"=============================================================================================================="];
  [self writeToLogFile: content];

  if (callId != NULL && [callStatus isEqual: @"started"]) {
    // --- Process the received push
    CustomPushPayload *customPayload = [[CustomPushPayload alloc] init];
    customPayload.customDictionaryPayload = dict;
    [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:customPayload forType:type];

    // --- You should make sure to report to callkit BEFORE execute `completion()`
    [RNCallKeep reportNewIncomingCall:uuid handle:@"Stringee" handleType:@"generic" hasVideo:false localizedCallerName:callName supportsHolding:false supportsDTMF:true supportsGrouping:false supportsUngrouping:false fromPushKit:true payload:nil withCompletionHandler:nil];
  }
  else {
    // Show fake call
    [RNCallKeep reportNewIncomingCall:uuid handle:@"Stringee" handleType:@"generic" hasVideo:false localizedCallerName:callName supportsHolding:false supportsDTMF:true supportsGrouping:false supportsUngrouping:false fromPushKit:true payload:nil withCompletionHandler:nil];
    [RNCallKeep endCallWithUUID:uuid reason:1];
  }

  if (completion != nil) {
    completion();
  }
}

-(void) writeToLogFile:(NSString*)content{
    content = [NSString stringWithFormat:@"%@\n",content];

    //get the documents directory:
    NSString *documentsDirectory = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
    NSString *fileName = [documentsDirectory stringByAppendingPathComponent:@"hydraLog.txt"];

    NSFileHandle *fileHandle = [NSFileHandle fileHandleForWritingAtPath:fileName];
    if (fileHandle){
        [fileHandle seekToEndOfFile];
        [fileHandle writeData:[content dataUsingEncoding:NSUTF8StringEncoding]];
        [fileHandle closeFile];
    }
    else{
        [content writeToFile:fileName
                  atomically:NO
                    encoding:NSUTF8StringEncoding
                       error:nil];
    }
}

- (NSString *) GetUTCDateTimeFromLocalTime:(NSString *)IN_strLocalTime
{
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyy-MM-dd hh:mm:ss"];
    NSDate  *objDate    = [dateFormatter dateFromString:IN_strLocalTime];
    [dateFormatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
    NSString *strDateTime   = [dateFormatter stringFromDate:objDate];
    return strDateTime;
}

//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}

- (void)application:(UIApplication *)application performActionForShortcutItem:(UIApplicationShortcutItem *)shortcutItem completionHandler:(void (^)(BOOL succeeded)) completionHandler {
  [RNQuickActionManager onQuickActionPress:shortcutItem completionHandler:completionHandler];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  while ([[UIDevice currentDevice] isGeneratingDeviceOrientationNotifications]) {
      [[UIDevice currentDevice] endGeneratingDeviceOrientationNotifications];
  }

  return [Orientation getOrientation];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [CodePush bundleURL];
#endif
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
  [self endBackgroundTask];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
  [self extendBackgroundRunningTime];
}

- (void)endBackgroundTask {
  if (self.backgroundUpdateTask != UIBackgroundTaskInvalid) {
    [[UIApplication sharedApplication] endBackgroundTask:self.backgroundUpdateTask];
    self.backgroundUpdateTask = UIBackgroundTaskInvalid;
  }
}

- (void)extendBackgroundRunningTime {
  if (self.backgroundUpdateTask != UIBackgroundTaskInvalid) {
    return;
  }

  self.backgroundUpdateTask = [[UIApplication sharedApplication] beginBackgroundTaskWithName:@"extendBackgroundRunningTimeForCallKit" expirationHandler:^{
    [self endBackgroundTask];
  }];

  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [NSThread sleepForTimeInterval:5.0f];
    [[UIApplication sharedApplication] endBackgroundTask:self.backgroundUpdateTask];
    self.backgroundUpdateTask = UIBackgroundTaskInvalid;
  });
}

- (void)messageComposeViewController:(nonnull MFMessageComposeViewController *)controller didFinishWithResult:(MessageComposeResult)result {
  switch (result)
      {
          case MFMailComposeResultCancelled:
              NSLog(@"Mail cancelled");
              break;
          case MFMailComposeResultSaved:
              NSLog(@"Mail saved");
              break;
          case MFMailComposeResultSent:
              NSLog(@"Mail sent");
              break;
          default:
              break;
      }
  
    // Close the Mail Interface
     [controller dismissViewControllerAnimated:YES completion:nil];
}

- (void) mailComposeController:(MFMailComposeViewController *)controller didFinishWithResult:(MFMailComposeResult)result error:(NSError *)error
{
    switch (result)
    {
        case MFMailComposeResultCancelled:
            NSLog(@"Mail cancelled1");
            break;
        case MFMailComposeResultSaved:
            NSLog(@"Mail saved1");
            break;
        case MFMailComposeResultSent:
            NSLog(@"Mail sent1");
            break;
        case MFMailComposeResultFailed:
            NSLog(@"Mail sent failure: %@", [error localizedDescription]);
            break;
        default:
            break;
    }

    // Close the Mail Interface
    [controller dismissViewControllerAnimated:YES completion:nil];
}

@end
