//
//  CloudproClient.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 09/11/2021.
//


import Foundation

// MARK: - NETWORKING CLASS
//private let url = URL(string: "https://dev.cloudpro.vn/api/SalesAppApi.php")


struct FailableDecodable<Base : Decodable> : Decodable {
  
  let base: Base?
  
  init(from decoder: Decoder) throws {
    let container = try decoder.singleValueContainer()
    self.base = try? container.decode(Base.self)
  }
}

class CloudproClient {
  // MARK: - fetch get Incoming activity list
  class func fetchGetIncomingActivityList(onSuccess: @escaping (ActivityList) -> Void){
    
    getCredentialRequest { credentialRequest in
      print("==================================== Data credentialRequest ================================")
      print(credentialRequest)
      
      //// Declare value
      let token = credentialRequest.token
      guard let urlRequest = URL(string: credentialRequest.url) else { return }
      
      ////  Declare params request
      let paging : [String: Any] = ["order_by" : "", "offset": 0,"max_results": 5]
      
      let Params: [String: Any] = [
        "paging": paging,
        "filter": "incoming"
      ]
      
      let parameters: [String: Any] = [
        "RequestAction" : "GetActivityList",
        "Params": Params
      ]
      
      var request = URLRequest(url: urlRequest)
      request.httpMethod = "POST"
      request.httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: [])
      request.addValue("application/json", forHTTPHeaderField: "Accept")
      request.addValue("application/json", forHTTPHeaderField: "Content-Type")
      request.addValue(token, forHTTPHeaderField: "Token")
      
      // fetch data
      URLSession.shared.dataTask(with: request) { (data, response, error) in
        guard let data = data, error == nil else{  return }
        let responseString = String(data: data, encoding: .utf8)
        print("responseString = \(String(describing: responseString))")
        
        do {
          
          ////parse JSON
          let jsonData = try JSONSerialization.jsonObject(with: data) as! Dictionary<String, Any>
          print("==================================== Data json paser Data ================================")
          print(jsonData)
          
          //// check if data return have file success is 1
          if let success = jsonData["success"] as? String {
            if success == "1" {
              if let entryList = jsonData["entry_list"] as AnyObject? {
                
                if entryList.isEqual(to: []) {
                  DispatchQueue.main.async { onSuccess(ActivityList(entryList: []))}
                }
                else {
                  //// Parser data string to TicketItem List
                  let dataParser = IncomingActivityItem.mapToActivityItem(entryList as! [AnyObject])
                  print("==================================== Data Activity Item List ================================")
                  print(dataParser)
                  
                  DispatchQueue.main.async { onSuccess(ActivityList(entryList: dataParser))}
                }
                
              }
              else {
                DispatchQueue.main.async { onSuccess(ActivityList(entryList: []))}
              }
            }
            //// success not equal 1
            else {
              DispatchQueue.main.async { onSuccess(ActivityList(entryList: []))}
            }
          }
          else {
            DispatchQueue.main.async { onSuccess(ActivityList(entryList: []))}
          }
          
        }
        catch {
          print("========================= Error request =======================")
          print(error.localizedDescription)
          
          DispatchQueue.main.async { onSuccess(ActivityList(entryList: []))}
        }
        
      }.resume()
      
    }
  }
  
  // MARK: - fetch get ticket wait process
  class func fetchTicketWaitProcessList(_ createdTime: String, _ priority: String, _ filterBy: String, onSuccess: @escaping (TicketProcessList) -> Void) {
    getCredentialRequest { credentialRequest in
      print("==================================== Data credentialRequest ================================")
      print(credentialRequest)
      
      let token = credentialRequest.token
      guard let urlRequest = URL(string: credentialRequest.url) else { return }
      
      ////  Declare params request
      let ordering : [String: Any] = ["createdtime" : createdTime, "priority": priority]
      
      let Params: [String: Any] = [
        "ordering": ordering,
        "filter_by": filterBy
      ]
      
      let parameters: [String: Any] = [
        "RequestAction" : "GetOpenTickets",
        "Params": Params
      ]
      
      var request = URLRequest(url: urlRequest)
      request.httpMethod = "POST"
      request.httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: [])
      request.addValue("application/json", forHTTPHeaderField: "Accept")
      request.addValue("application/json", forHTTPHeaderField: "Content-Type")
      request.addValue(token, forHTTPHeaderField: "Token")
      
      // fetch data
      URLSession.shared.dataTask(with: request) { (data, response, error) in
        
        guard let data = data, error == nil else{  return }
        let responseString = String(data: data, encoding: .utf8)
        print("responseString = \(String(describing: responseString))")
        
        if error != nil{
          print("Error \(String(describing: error))")
          DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
          return
        }
        
        if let httpResponse = response as? HTTPURLResponse{
          if httpResponse.statusCode == 401{
            print("========================= Error request =======================")
            print("Stattus code Error: \(httpResponse.statusCode)");
            let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
            sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
            DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
            return
          }
          else if httpResponse.statusCode == 200 {
            do {
              ////parse JSON
              let jsonData = try JSONSerialization.jsonObject(with: data) as! Dictionary<String, Any>
              print("==================================== Data Ticket json paser Data ================================")
              print(jsonData)
              
              //// check if data return have file success is 1
              if let success = jsonData["success"] as? String {
                if success == "1" {
                  if let entryList = jsonData["entry_list"] as AnyObject? {
                    
                    if entryList.isEqual(to: []) {
                      DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
                    }
                    else {
                      //// Parser data string to TicketItem List
                      let dataParser = TicketModel.mapToTicketItem(entryList as! [AnyObject])
                      print("==================================== Data Ticket Item List ================================")
                      print(dataParser)
                      
                      DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: dataParser))}
                    }
                    
                  }
                  else {
                    DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
                  }
                }
                //// success not equal 1
                else {
                  DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
                }
              }
              else {
                DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
              }
              
            }
            catch {
              print("========================= Error request =======================")
              print(error.localizedDescription)
              
              DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
            }
          }
          else {
            print("========================= Error request =======================")
            print("Stattus code Error: \(httpResponse.statusCode)");
            
            DispatchQueue.main.async { onSuccess(TicketProcessList(entryList: []))}
          }
        }
      }.resume()
    }
  }
  
  // MARK: - Get information Credential
  class func getCredentialRequest(onSuccess: @escaping (Credentials) -> Void){
    
    ////  Get data App Group by UserDefaults
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    let resultDefault = Credentials(url: "" , token: "")
    
    if let shareData = (sharedDefault.value(forKey: Constant.CREDENTIALS) as? String) {
      
      //// Parser data string to Credentials
      let dataParser = Credentials.map(JSONString: shareData)
      print("==================================== Data Credentials ================================")
      print(dataParser ?? "")
      
      if ((dataParser?.url) != nil) {
        DispatchQueue.main.async { onSuccess(Credentials(url: dataParser?.url ?? "", token: dataParser?.token ?? ""))}
      }
      else {
        DispatchQueue.main.async { onSuccess(Credentials(url: "" , token: dataParser?.token ?? ""))}
      }
      
    }
    else {
      DispatchQueue.main.async{ onSuccess(resultDefault)}
    }
  }
  
  //MARK: - Get infor version CRM
  class func fetchCrmVersion(onSuccess: @escaping (String) -> Void) {
    getCredentialRequest { credentialRequest in
      
      print("==================================== Data credentialRequest ================================")
      print(credentialRequest)
      
      if credentialRequest.url.isEmpty {
        return;
      }
      
      guard let urlRequest = URL(string: credentialRequest.url.replacingOccurrences(of: "/api/SalesAppApi.php", with: "/vtigerversion.php")) else { return }
      
      URLSession.shared.dataTask(with: urlRequest) { data, response, error in
        
        guard let data = data, error == nil else{  return }
        
        if error == nil {
          DispatchQueue.main.async{onSuccess("")}
          return;
        }
        
        let responseString = String(data: data, encoding: .utf8)
        print("responseString = \(responseString ?? "")")
        let crmVersion = responseString ?? ""
        
        if crmVersion.isEmpty {
          DispatchQueue.main.async{onSuccess("")}
        }
        else {
          DispatchQueue.main.async{onSuccess(crmVersion)}
        }
      }
    }
  }
  
  // MARK: - Get notification data
  class func fetchNotifyData(_ notificationType: String ,_ notifyType: String, _ isNewVersion: Bool, completionHandler: @escaping (NotificationData?, NotifyError?) -> Void) {
    
    getCredentialRequest{ credentialRequest in
      print("==================================== Data credentialRequest ================================")
      print(credentialRequest)
      
      if credentialRequest.url.isEmpty || credentialRequest.token.isEmpty {
        let notiError = NotifyError.init(messageError: "Error: Permisstion denied!", codeError: CodeError.permissionDenied.stringValue)
        completionHandler(nil, notiError)
      }
      else {
        
        let token = credentialRequest.token
        guard let urlRequest = URL(string: credentialRequest.url) else { return }
        
        ////  Declare params request
        let paging : [String: Any] = ["offset" : 0]
        
        var type = notificationType
        var subType = notifyType
        
        if !isNewVersion && type == "notify" {
          type = "notification"
          subType = ""
        }
        
        let Params: [String: Any] = [
          "type": type,
          "sub_type": subType,
          "paging": paging
        ]
        
        let parameters: [String: Any] = [
          "RequestAction" : "GetNotificationList",
          "Params": Params
        ]
        
        var request = URLRequest(url: urlRequest)
        request.httpMethod = "POST"
        request.httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: [])
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(token, forHTTPHeaderField: "Token")
        
        // fetch data
        URLSession.shared.dataTask(with: request) { (data, response, error) in
          guard let data = data, error == nil else{  return }
          let responseString = String(data: data, encoding: .utf8)
          print("responseString = \(String(describing: responseString))")
          
          if error != nil{
            print("Error \(String(describing: error))")
            let notiError = NotifyError.init(messageError: "Error \(String(describing: error))", codeError: CodeError.requestFailure.stringValue)
            DispatchQueue.main.async { completionHandler(nil, notiError) }
            return
          }
          
          if let httpResponse = response as? HTTPURLResponse{
            
            if httpResponse.statusCode == 200 {
              do {
                ////parse JSON
                let jsonData = try JSONSerialization.jsonObject(with: data) as! Dictionary<String, Any>
                print("==================================== Data Notification json paser Data ================================")
                print(jsonData)
                
                //// check if data return have file success is 1
                if let success = jsonData["success"] as? String {
                  if success == "1" {
                    if let entryList = jsonData["entry_list"] as AnyObject? {
                      
                      if entryList.isEqual(to: []) {
                        let notiError = NotifyError.init(messageError: "Error: Response is unsuccessful!", codeError: CodeError.emptyData.stringValue)
                        DispatchQueue.main.async { completionHandler(nil, notiError) }
                        
                      }
                      else {
                        
                        if let counter = jsonData["counts"] as AnyObject? {
                          //// Parser data string to TicketItem List
                          let dataParser = NotificationData.mapToNotificationItem(entryList as! [AnyObject], counter)
                          print("==================================== Data Notification Item List ================================")
                          print(dataParser)

                          DispatchQueue.main.async { completionHandler(dataParser, nil)}
                        }
                        else {
                          //// Parser data string to TicketItem List
                          let dataParser = NotificationData.mapToNotificationItem(entryList as! [AnyObject], nil)
                          print("==================================== Data Notification Item List ================================")
                          print(dataParser)

                          DispatchQueue.main.async { completionHandler(dataParser, nil)}
                        }
                        
                        
                      }
                      
                    }
                    else {
                      let notiError = NotifyError.init(messageError: "Error: Response is unsuccessful!", codeError: CodeError.emptyData.stringValue)
                      DispatchQueue.main.async { completionHandler(nil, notiError) }
                    }
                  }
                  //// success not equal 1
                  else {
                    let notiError = NotifyError.init(messageError: "Error: Response is unsuccessful!", codeError: CodeError.responseNotSuccess.stringValue)
                    DispatchQueue.main.async { completionHandler(nil, notiError) }
                  }
                }
                else {
                  let notiError = NotifyError.init(messageError: "Network request fail!", codeError: CodeError.requestFailure.stringValue)
                  DispatchQueue.main.async { completionHandler(nil, notiError) }
                }
                
              }
              catch {
                print("========================= Error request =======================")
                print(error.localizedDescription)
                
                let notiError = NotifyError.init(messageError: "Network request fail!", codeError: CodeError.requestFailure.stringValue)
                DispatchQueue.main.async { completionHandler(nil, notiError) }
              }
            }
            else if httpResponse.statusCode == 401 {
              let notiError = NotifyError.init(messageError: "Error: Permisstion denied!", codeError: CodeError.permissionDenied.stringValue)
              DispatchQueue.main.async { completionHandler(nil, notiError) }
            }
            else {
              let notiError = NotifyError.init(messageError: "Network request fail!", codeError: CodeError.requestFailure.stringValue)
              DispatchQueue.main.async { completionHandler(nil, notiError) }
            }
            
          }
          else {
            let notiError = NotifyError.init(messageError: "Network request fail!", codeError: CodeError.requestFailure.stringValue)
            DispatchQueue.main.async { completionHandler(nil, notiError) }
          }
        }.resume()
        
      }
      
    }
  }
}

