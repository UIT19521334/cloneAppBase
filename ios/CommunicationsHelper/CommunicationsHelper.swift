//
//  CommunicationsHelper.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 23/06/2022.
//

import Foundation
import MessageUI

@objc(CommunicationsHelper)
class CommunicationsHelper: NSObject, RCTBridgeModule {
  // MARK: - Define Module Name to use NativeModule in js code
  static func moduleName() -> String! {
    return "FirebaseAppModule";
  }
  
  // MARK: - Allow to access the main thread through dispatch_get_main_queue()
  // The react-native bridge will ensure that native events and methods are always communicated from iOS to JS and visa versa, regardless of which thread they are running on.
  static func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
  // MARK: - Handle make phone call from phone number
  @objc func phoneCall(_ phoneNumber: NSString,
                       prompt: Bool){
    
    guard let url = URL(string: "\(prompt ? "tel:" : "telprompt:")//\(phoneNumber)"), UIApplication.shared.canOpenURL(url) else { return }
    
    UIApplication.shared.open(url, options: [:], completionHandler: nil)
  }
  
  // MARK: - handle make send SMS with arguments is phoneNumber and body
  @objc func text(_ phoneNumber: NSString,
                  body: NSString){
    
    DispatchQueue.main.async {
      let appdelegate = UIApplication.shared.delegate as! AppDelegate
      let rootViewController = appdelegate.window!.rootViewController
      
      guard MFMessageComposeViewController.canSendText() else {
        print("Unable to send messages.")
        
        return;
      }
      
      let controller = MFMessageComposeViewController()
      controller.recipients = ["\(phoneNumber as String)"]
      controller.body = body as String
      controller.messageComposeDelegate = appdelegate.self
      
      rootViewController.self?.present(controller, animated: true, completion: nil)
    }
  }
  
  //MARK: - handle make send mail
  @objc func email(_ to: NSArray,
                  cc: NSArray,
                  bcc: NSArray,
                  subject: String,
                  body: NSString,
                  isHTML: Bool){
    
    DispatchQueue.main.async {
      let appdelegate = UIApplication.shared.delegate as! AppDelegate
      let rootViewController = appdelegate.window!.rootViewController
      
      guard MFMailComposeViewController.canSendMail() else {
        print("Unable to send mail.")
        
        return;
      }
      
      let controller = MFMailComposeViewController()

      let objCToArray = NSMutableArray(array: to)
      
      if let toArray = objCToArray as NSArray as? [String] {

          // Use swiftArray here
          print(toArray)
          controller.setToRecipients(toArray)
      }
      
      let objCCCArray = NSMutableArray(array: cc)
      
      if let ccArray = objCCCArray as NSArray as? [String] {

          // Use swiftArray here
          print(ccArray)
          controller.setCcRecipients(ccArray)
      }
      
      let objCBccArray = NSMutableArray(array: bcc)
      
      if let bccArray = objCBccArray as NSArray as? [String] {

          // Use swiftArray here
          print(bccArray)
          controller.setBccRecipients(bccArray)
      }
      
      controller.setSubject(subject as String)
      controller.setMessageBody(body as String, isHTML: isHTML)
      controller.mailComposeDelegate = appdelegate.self
      
      rootViewController.self?.present(controller, animated: true, completion: nil)
    }
  }
}
