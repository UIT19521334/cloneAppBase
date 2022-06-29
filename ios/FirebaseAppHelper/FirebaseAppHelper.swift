//
//  FirebaseAppHelper.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 28/04/2022.
//

import Foundation
import Firebase
//import FirebaseAnalytics

@objc(FirebaseAppHelper) // Define Module name Maping
class FirebaseAppHelper: NSObject, RCTBridgeModule {
  
  // MARK: - Define Module Name to use NativeModule in js code
  static func moduleName() -> String! {
    return "FirebaseAppModule";
  }
  
  // MARK: - Allow to access the main thread through dispatch_get_main_queue()
  // The react-native bridge will ensure that native events and methods are always communicated from iOS to JS and visa versa, regardless of which thread they are running on.
  static func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
  //MARK: - Hanlde deleta all Firebase App exist in Application
  @objc func deleteAll(_ callback: RCTResponseSenderBlock) -> Void {
    print("Delete all Firebase App")
    
    // Retrieve a previous created named app.
//    guard let firebaseApps = FirebaseApp.allApps
//          else { assert(false, "Could not retrieve firebaseApp app with any instance") }
//
//    if !firebaseApps.isEmpty {
//      firebaseApps.forEach({(FBApp) in
//        FBApp.value.delete({(success) in
//          print("Delete Firebase App with Instance is \(FBApp.value.name)")
//        });
//      });
//    }
//
    callback([]);
  }
  
  //MARK: - Handle delete Firebase App with Instance
  @objc func delete(_ instanceName: NSString,
              callback: RCTResponseSenderBlock
  ) {
    print("Delete Firebase app with instance: \(instanceName)")
   
    // Retrieve a previous created named app.
//    guard let firebaseApp = FirebaseApp.app(name: "\(instanceName)")
//          else { assert(false, "Could not retrieve firebaseApp app with instance: \(instanceName)") }
//
//      firebaseApp.delete({ (success) in
//        print("Delete Firebase App with Instance is \(firebaseApp.name)")
//        })
//
    callback([]);
  }
  
  //MARK: - Handle intialize new Firebase App
  @objc func initialize(_ projectId: NSString,
                        appId: NSString,
                        apiKey: NSString,
                        senderId: NSString,
                        callback: RCTResponseSenderBlock
  ){
    print("projectId: \(projectId) - appId: \(appId) - apiKey: \(apiKey) -senderId: \(senderId)")
     
    FirebaseApp.app()?.delete({ (success) in
      print("Deleted Firebase App default with status \(success)")
       }) // Delete app as we recreate below.

      // Note: this one is not deleted, so is the default below.
      // [START default_configure_vars]
      // Configure with manual options. Note that projectID and apiKey, though not
      // required by the initializer, are mandatory.
    let newOptions = FirebaseOptions(googleAppID: "\(appId)", gcmSenderID: "\(senderId)")
      newOptions.apiKey = "\(apiKey)"
      newOptions.projectID = "\(projectId)"
    
    // [START default_secondary]
        // Configure an alternative FIRApp.
    FirebaseApp.configure(name: "secondary", options: newOptions)
    
    callback([]);
    
  }
  
  func alertWindow(title: String, message: String) {
      DispatchQueue.main.async(execute: {
          let alertWindow = UIWindow(frame: UIScreen.main.bounds)
          alertWindow.rootViewController = UIViewController()
          alertWindow.windowLevel = UIWindow.Level.alert + 1
      
          let alert2 = UIAlertController(title: title, message: message, preferredStyle: .alert)
          let defaultAction2 = UIAlertAction(title: "OK", style: .default, handler: { action in
          })
          alert2.addAction(defaultAction2)
      
          alertWindow.makeKeyAndVisible()
      
          alertWindow.rootViewController?.present(alert2, animated: true, completion: nil)
      })
  }
  
}
