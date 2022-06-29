//
//  Commons.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 10/02/2022.
//

import Foundation
import SwiftUI

// MARK: - Declare color use in app
@available(iOS 13.0, *)
extension Color {
  static let coronapink = Color.init(#colorLiteral(red: 0.9921568627, green: 0.1882352941, blue: 0.4117647059, alpha: 1))
  static let coronayellow = Color.init(#colorLiteral(red: 0.9960784314, green: 0.6705882353, blue: 0, alpha: 1))
  static let coronagrey = Color.init(#colorLiteral(red: 0.2549019608, green: 0.2549019608, blue: 0.2549019608, alpha: 1))
  static let coronagreen = Color.init( #colorLiteral(red: 0.08235294118, green: 0.7960784314, blue: 0.2666666667, alpha: 1))
  static let coronalogo = Color.init( #colorLiteral(red: 0.9607843137, green: 0.537254902, blue: 0.5960784314, alpha: 1))
}

// MARK: - Create format Double to String
extension Double {
  func withCommas() -> String {
    let numberFormatter = NumberFormatter()
    numberFormatter.numberStyle = .decimal
    return numberFormatter.string(from: NSNumber(value:self)) ?? "\(Int(self))"
  }
}


extension Date {
  func formatDateToString() -> String {
    let formatter = DateFormatter()
    
    formatter.dateFormat = "dd/MM/yyyy HH:mm:ss aaa"
    return formatter.string(from: self)
  }
}

// check String is HTML
func isValidHtmlString(_ value: String) -> Bool {
    if value.isEmpty {
        return false
    }
    return (value.range(of: "<(\"[^\"]*\"|'[^']*'|[^'\">])*>", options: .regularExpression) != nil)
}

// MARK: - Create func extension od String
extension String {
  
  subscript (bounds: CountableClosedRange<Int>) -> String {
      let start = index(startIndex, offsetBy: bounds.lowerBound)
      let end = index(startIndex, offsetBy: bounds.upperBound)
      return String(self[start...end])
  }

  subscript (bounds: CountableRange<Int>) -> String {
      let start = index(startIndex, offsetBy: bounds.lowerBound)
      let end = index(startIndex, offsetBy: bounds.upperBound)
      return String(self[start..<end])
  }
  
  // format HTML String to String
  func convertHTMLToString() -> String {
    if self.isEmpty {
      return self
    }
    else if isValidHtmlString(self) {
      let str = self.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression, range: nil)

      return str.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    else {
      return self
    }
  }
  
  //// Format String Datetime to Date
  /// Return is String Value
  func formatDateString() -> String {
    
    if self.isEmpty {
      return ""
    }
    else {
      let formatter = DateFormatter()
      // Convert to Date
      formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
      guard let date = formatter.date(from: self) else { return "" }
      
      // FormatDateString
      formatter.dateFormat = "MMMM  dd"
      let dateFormatCurrent = formatter.string(from: Date())
      let dateFormat = formatter.string(from: date)
      
      ////  IF result equal today then return "Today" else return Date String
      if dateFormat == dateFormatCurrent {
        return "Today"
      }
      else {
        return formatter.string(from: date)
      }
    }
  }
  
  //// Format String Datetime to Time
  /// Return is String Value
  func formatTimeString() -> String {
    
    if self.isEmpty {
      return ""
    }
    else {
      let formatter = DateFormatter()
      // Convert to Date
      formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
      guard let date = formatter.date(from: self) else { return "" }
      
      // FormatDateString
      formatter.dateFormat = "hh:mm a"
      
      return formatter.string(from: date)
    }
  }
  
  //// Format String Datetime to Time
  /// Return is String Value
  func formatDateTimeString(formatString: String) -> String {
    
    if self.isEmpty {
      return ""
    }
    else {
      let formatter = DateFormatter()
      // Convert to Date
      formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
      guard let date = formatter.date(from: self) else { return "" }
      
      // FormatDateString
      formatter.dateFormat = formatString
      
      return formatter.string(from: date)
    }
  }
  
  //// Convert datetime string to date
  func toDate(formatString: String?) -> Date {
    if self.isEmpty {
      return Date()
    }
    else {
      let formatter = DateFormatter()
      // Convert to Date
      formatter.dateFormat = formatString ?? "yyyy-MM-dd HH:mm:ss"
      guard let date = formatter.date(from: self) else { return Date() }
      
      return date
    }
  }
  
  func toTimeAgo() -> String {
    var dateParse = Date()
    
    if !self.isEmpty {
      let formatter = DateFormatter()
      // Convert to Date
      formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
      guard let date = formatter.date(from: self) else { return dateParse.timeAgoDisplay() }
      
      dateParse = date
    }
    
    print(dateParse)
    
    let result = dateParse.timeAgoDisplay()
    
    return result
  }
  
  //// Parse String to json
  func toJson() -> Any? {
    guard let data = self.data(using: .utf8, allowLossyConversion: false) else { return nil }
    return try? JSONSerialization.jsonObject(with: data, options: .mutableContainers)
  }
  //// Get color status of object
  @available(iOS 13.0, *)
  func hexStringToColor() -> Color {
    var cString:String = self.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    
    if (cString.hasPrefix("#")) {
      cString.remove(at: cString.startIndex)
    }
    
    if ((cString.count) != 6) {
      return Color(UIColor.gray)
    }
    
    var rgbValue:UInt64 = 0
    Scanner(string: cString).scanHexInt64(&rgbValue)
    
    return Color(UIColor(
      red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
      green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
      blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
      alpha: CGFloat(1.0)
    ))
  }
  
  //// Get color status of object
  @available(iOS 13.0, *)
  func getEnumColor() -> Color {
    
    ////  Get data App Group by UserDefaults
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    //// Default color
    var valueColor = "#000000"
    
    //// Get meta data in App group
    if let shareData = (sharedDefault.value(forKey: Constant.META_DATA_ACTIVITY_STATUS) as? String) {
      
      //// Parser data string to list EnumItem
      do {
        let dataParser = try JSONDecoder().decode([EnumItem].self, from: Data(shareData.utf8))
        print("==================================== Data Enum Item of the activity ================================")
        print(dataParser)
        
        //// find Enum have key equal with self and color different white color
        for item in dataParser {
          if item.key == self && item.color != "#ffffff" {
            valueColor =  item.color ?? "#000000"
          }
        }
        
      }
      catch {
        print(error)
        valueColor = "#000000"
      }
    }
    else {
      valueColor = "#000000"
    }
    
    return valueColor.hexStringToColor()
  }
  
  //// Get label value status of Ticket
  func getEnumLabel() -> String {
    
    ////  Get data App Group by UserDefaults
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    //// Default value
    var valueLable = ""
    
    //// Get meta data in App group
    if let shareData = (sharedDefault.value(forKey: Constant.META_DATA_ACTIVITY_STATUS) as? String) {
      print("==================================== Data Enum Item String of the activity ================================")
      print(shareData)
      //// Parser data string to list EnumItem
      do {
        let dataParser = try JSONDecoder().decode([EnumItem].self, from: Data(shareData.utf8))
        print("==================================== Data Enum Item of the activity ================================")
        print(dataParser)
        
        //// find Enum have key equal with self to get Lable
        for item in dataParser {
          if item.key == self {
            valueLable =  item.label
          }
        }
        
      }
      catch {
        print(error)
        valueLable = ""
      }
    }
    else {
      valueLable = ""
    }
    
    return valueLable
  }
  
  func getIConModuleName() -> String {
    print(">>>>>>>>>>>>>> Native module Name <<<<<<<<<<<<<<< ")
    print(self)
    
//    return "user_check_in";
    
    switch self {
      case "Leads":
        return IconModuleName.Leads.rawValue
      case "Contacts":
        return IconModuleName.Contacts.rawValue
      case "Potentials":
        return IconModuleName.Potentials.rawValue
      case "Faq":
        return IconModuleName.Faq.rawValue
      case "HelpDesk":
        return IconModuleName.HelpDesk.rawValue
      case "SalesOrder":
        return IconModuleName.SalesOrder.rawValue
      case "Call":
        return IconModuleName.Call.rawValue
      case "Meeting":
        return IconModuleName.Meeting.rawValue
      case "Task":
        return IconModuleName.Task.rawValue
      case "Report":
        return IconModuleName.Report.rawValue
      case "Services":
        return IconModuleName.Services.rawValue
      case "Products":
        return IconModuleName.Products.rawValue
      case "CPEmployee":
        return IconModuleName.CPEmployee.rawValue
      default:
        return IconModuleName.Faq.rawValue
    }
  }
  
  @available(iOS 13.0, *)
  func getPriorityColor() -> Color {
    if self.isEmpty {
      return Color.black
    }
    else {
      switch self.uppercased() {
      case "LOW":
        return "#e67f7d".hexStringToColor();
      case "NORMAL":
        return "#f3a722".hexStringToColor();
      case "HIGH":
        return "#e27337".hexStringToColor();
      case "URGENT":
        return "#cf495c".hexStringToColor();
      default:
        return "#333333".hexStringToColor()
      }
    }
  }
  
}

// MARK: - Get Information config

enum ConfigField {
  case CreatedDate
  case Priority
  case FilterBy
  case DateSelectedOnCalendar
}

func getConfigValue(_ field: ConfigField, _ value: Any) -> String {
  var result = "";
  
  switch field {
  case .CreatedDate:
    result = getSortOptionValue(value as! SortOptions);
  case .Priority:
    result = getSortOptionValue(value as! SortOptions);
  case .FilterBy:
    result = getFilterByValue(value as! FilterType);
  case .DateSelectedOnCalendar:
    result = "DateSelectedOnCalendar";
  }
  return result;
}

func getSortOptionValue(_ value: SortOptions) -> String {
  var res = "DESC";
  
  switch value {
  case .decrease:
    res = "DESC";
    break;
  case .increase:
    res = "ASC";
    break
  case .unknown:
    res = "DESC"
  }
  
  return res;
}

func getFilterByValue(_ value: FilterType) -> String {
  var res = "mine";
  
  switch value {
  case .mine:
    res = "mine";
    break;
  case .all:
    res = "all";
    break
  case .unknown:
    res = "mine"
  }
  
  return res;
}

// MARK: - Init default value of the TicketEntry
extension ProcessTicketEntry {
  
  static func getDefaultValue() -> ProcessTicketEntry {
    return ProcessTicketEntry.init(date: Date(), mediumTicketData: nil, largeTicketData: nil, accountStatus: getAccountStatus())
  }
  
  static func getDefaultTicketListValue(_ numberItem: Int) -> [TicketModel] {
    var result: [TicketModel] = [];
    for _ in 1...numberItem {
      let dataDefault = TicketModel(ticketid: "", ticket_no: "", title: "", createdtime: "", status: "", priority: nil, category: nil)
      result.append(dataDefault)
    }
    
    return result;
  }
  
  static func getAccountStatus() -> AccountStatus {
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    if let accountStatus = sharedDefault.value(forKey: Constant.ACCOUNT) as? String {
      if accountStatus.isEmpty || accountStatus == Constant.UN_AUTHENTICATION {
        return AccountStatus.UN_AUTHENTICATION;
      }
      else {
        return AccountStatus.AUTHENTICATION;
      }
    }
    else {
      return AccountStatus.UN_AUTHENTICATION;
    }
  }
  
  static func getEntry(_ entryList: [TicketModel]?, _ nextDate: Date) -> ProcessTicketEntry {
    if entryList != nil && entryList!.count > 0 {
      //// Parse data
      ///init list data empty
      let ticketItemEmpty = ProcessTicketEntry.getDefaultTicketListValue(5)
      
      //// declare list for medium Widget
      var mediumItemList : [TicketModel] = []
      //// declare list for large Widget
      var largeItemList : [TicketModel] = []
      
      //// Check list for medium widgets
      if entryList!.count >= 2 {
        mediumItemList = Array(entryList![0..<2])
      }
      else {
        mediumItemList.append(entryList!.first!);
        mediumItemList.append(ticketItemEmpty.first!);
      }
      
      //// Check list for large widgets
      if entryList!.count >= 5 {
        largeItemList = entryList!
      }
      else {
        largeItemList = Array(entryList![0..<entryList!.count]);
        for _ in 0...(5 - entryList!.count) {
          largeItemList.append(ticketItemEmpty.first!)
        }
      }
      
      print("================================= Data ticket parse ===============================")
      print(entryList ?? [])
      
      let entry = ProcessTicketEntry.init(date: nextDate, mediumTicketData: mediumItemList, largeTicketData: largeItemList, accountStatus: getAccountStatus())
      return entry;
      
    }
    else {
      let entry = ProcessTicketEntry.init(date: nextDate, mediumTicketData: nil, largeTicketData: nil, accountStatus: getAccountStatus())
      return entry;
    }
  }
  
  static func getEntryFromCache(_ nextDate: Date) -> ProcessTicketEntry {
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    if let ticketList = sharedDefault.value(forKey: Constant.PROCESSING_TICKET_DATA) as? String {
      
      print("==================================== Data Ticket Data from cache ================================")
      print(ticketList )
      
      if ticketList.isEmpty || ticketList == "[]" {
        return getDefaultValue();
      }
      else {
        // convert String to NSData
        let list = ticketList.toJson() as? [TicketModel]
        print("==================================== Data Ticket json paser Data from cache ================================")
        print(list ?? [])
        
        return getEntry(list, nextDate)
      }
    }
    else {
      return getDefaultValue();
    }
  }
}


// MARK: - Create Decode JSON Sting to Object Model
extension Decodable {
  static func map(JSONString:String) -> Self? {
    do {
      let decoder = JSONDecoder()
      decoder.keyDecodingStrategy = .convertFromSnakeCase
      return try decoder.decode(Self.self, from: Data(JSONString.utf8))
    } catch let error {
      print(error)
      return nil
    }
  }
}

//MARK: - Init default value of the ActivityEntry
extension ActivityEntry {
  
  static func getDefaultValue() -> ActivityEntry {
    return ActivityEntry.init(date: Date(), smallActivityData: nil, mediumActivityData: nil, largeActivityData: nil, accountStatus: getAccountStatus())
  }
  
  static func getDefaultActivityListValue(_ numberItem: Int) -> [IncomingActivityItem] {
    var result: [IncomingActivityItem] = [];
    for _ in 1...numberItem {
      let dataDefault = IncomingActivityItem(activityid: "", subject: "", activitytype: "", date_start: "", time_start: "")
      result.append(dataDefault)
    }
    
    return result;
  }
  
  static func getAccountStatus() -> AccountStatus {
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    if let accountStatus = sharedDefault.value(forKey: Constant.ACCOUNT) as? String {
      if accountStatus.isEmpty || accountStatus == Constant.UN_AUTHENTICATION {
        return AccountStatus.UN_AUTHENTICATION;
      }
      else {
        return AccountStatus.AUTHENTICATION;
      }
    }
    else {
      return AccountStatus.UN_AUTHENTICATION;
    }
  }
  
  static func getEntry(_ entryList: [IncomingActivityItem]?, _ nextDate: Date) -> ActivityEntry {
    if entryList!.count > 0 {
      //// Parse data
      ///init list data empty
      let activityItemEmpty = ActivityEntry.getDefaultActivityListValue(5)
      
      //// declare list for medium Widget
      var mediumItemList : [IncomingActivityItem] = []
      //// declare list for large Widget
      var largeItemList : [IncomingActivityItem] = []
      
      //// Check list for medium widgets
      if entryList!.count >= 2 {
        mediumItemList = Array(entryList![0..<2])
      }
      else {
        mediumItemList.append(entryList!.first!);
        mediumItemList.append(activityItemEmpty.first!);
      }
      
      //// Check list for large widgets
      if entryList!.count >= 5 {
        largeItemList = entryList!
      }
      else {
        largeItemList = Array(entryList![0..<entryList!.count]);
        for _ in 0...(5 - entryList!.count) {
          largeItemList.append(activityItemEmpty.first!)
        }
      }
      
      print("================================= Data incoming activity parse ===============================")
      print(entryList ?? [])
      
      let entry = ActivityEntry.init(date: nextDate, smallActivityData: entryList?.first ?? nil, mediumActivityData: mediumItemList, largeActivityData: largeItemList, accountStatus: ActivityEntry.getAccountStatus())
      return entry;
      
    }
    else {
      let entry = ActivityEntry.init(date: nextDate, smallActivityData: nil, mediumActivityData: nil, largeActivityData: nil, accountStatus: ActivityEntry.getAccountStatus())
      return entry;
    }
  }
  
  static func getEntryFromCache(_ nextDate: Date) -> ActivityEntry {
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    if let activityList = sharedDefault.value(forKey: Constant.INCOMING_ACTIVITY_DATA) as? String {
      
      if activityList.isEmpty || activityList == "[]" {
        return getDefaultValue();
      }
      else {
        // convert String to NSData
        let listActi = activityList.toJson() as? [IncomingActivityItem]
        print("==================================== Data json paser Data from cache ================================")
        print(listActi ?? [])
        
        return getEntry(listActi, nextDate)
      }
    }
    else {
      return getDefaultValue();
    }
  }
}

// MARK: - Convert Data
extension IncomingActivityItem {
  static func mapToActivityItem(_ list: [AnyObject]) -> [IncomingActivityItem] {
    var result: [IncomingActivityItem] = [];
    
    if list.count > 0 {
      for item in list {
        let activity = IncomingActivityItem.init(
          activityid: item.value(forKey: "activityid") as! String,
          subject: item.value(forKey: "subject") as! String,
          activitytype: item.value(forKey: "activitytype") as! String,
          date_start: item.value(forKey: "date_start") as! String,
          time_start: item.value(forKey: "time_start") as! String)
        
        result.append(activity)
      }
    }
    
    
    return result;
  }
  
  static func getDefaultValue() -> IncomingActivityItem {
    return IncomingActivityItem.init(activityid: "", subject: "", activitytype: "", date_start: "", time_start: "")
  }
}

extension TicketModel {
  static func mapToTicketItem(_ list: [AnyObject]) -> [TicketModel] {
    var result: [TicketModel] = [];
    
    if list.count > 0 {
      for item in list {
        let activity = TicketModel.init(
          ticketid: item.value(forKey: "ticketid") as! String,
          ticket_no: item.value(forKey: "ticket_no") as! String,
          title: item.value(forKey: "title") as! String,
          createdtime: item.value(forKey: "createdtime") as! String,
          status: item.value(forKey: "status") as! String,
          priority:  EnumItem.getEnumObject(keyField: "ticketpriorities", value: item.value(forKey: "priority") as? String),
          category: EnumItem.getEnumObject(keyField: "ticketcategories", value: item.value(forKey: "category") as? String)
        )
        
        result.append(activity)
      }
    }
    
    
    return result;
  }
  
  static func getDefaultValue() -> TicketModel {
    return TicketModel.init(ticketid: "", ticket_no: "", title: "", createdtime: "", status: "", priority: nil, category: nil);
  }
}

extension EnumItem {
  static func getEnumObject(keyField: String, value: String?) -> EnumItem {
    var res = getDefaultValue();
    
    if !(value!.isEmpty) && !keyField.isEmpty {
      let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
      
      if let enumListString = (sharedDefault.value(forKey: Constant.PROCESSING_TICKET_DATA_ENUM_LIST) as? String) {
        if !enumListString.isEmpty {
          do {
            let dataParser = try JSONDecoder().decode(TicketMetaData.self, from: Data(enumListString.utf8))
            print("==================================== Data Enum Item of the activity ================================")
            print(dataParser)
            
            if keyField == "ticketpriorities" {
              if dataParser.ticketpriorities?.count ?? 0 > 0 {
                for item in dataParser.ticketpriorities! {
                  if item.key == value {
                    res = item;
                  }
                }
              }
            }
            else if keyField == "ticketcategories" {
              if dataParser.ticketcategories?.count ?? 0 > 0 {
                for item in dataParser.ticketcategories! {
                  if item.key == value {
                    res = item;
                  }
                }
              }
            }
          }
          catch {
            print(error)
          }
        }
      }
    }
    
    return res;
  }
  
  static func getDefaultValue() -> EnumItem {
    return EnumItem.init(value: "", color: "#333333", key: "", label: "");
  }
}

struct Constant {
  static let PROCESSING_TICKET_DATA_ENUM_LIST = "PROCESSING_TICKET_DATA_ENUM_LIST";
  static let PROCESSING_TICKET_DATA = "PROCESSING_TICKET_DATA";
  static let ACCOUNT = "ACCOUNT";
  static let CREDENTIALS = "CREDENTIALS";
  static let AUTHENTICATION = "AUTHENTICATION";
  static let UN_AUTHENTICATION = "UN_AUTHENTICATION";
  static let ACCOUNT_STATUS = "ACCOUNT_STATUS";
  static let INCOMING_ACTIVITY_DATA = "INCOMING_ACTIVITY_DATA";
  static let META_DATA_ACTIVITY_STATUS = "META_DATA_ACTIVITY_STATUS";
  static let APP_GROUP = "group.cloudpro.sales.app";
  static let RELOAD_FROM_CACHE = "RELOAD_FROM_CACHE";
  static let RELOAD_FROM_NETWORK = "RELOAD_FROM_NETWORK";
  static let INCOMING_ACTIVITY_RELOAD_TYPE = "INCOMING_ACTIVITY_RELOAD_TYPE";
  static let PROCESSING_TICKET_RELOAD_TYPE = "PROCESSING_TICKET_RELOAD_TYPE";
  // Add by Manh Le at 2022-06-13
  // Purpose: addition new Widgets mapping with a notification screen
  static let NOTIFICATIONS_DATA = "NOTIFICATIONS_DATA";
  static let NOTIFICATIONS_RELOAD_TYPE = "NOTIFICATIONS_RELOAD_TYPE";
  static let CHECK_IN_NOTIFICATIONS_DATA = "CHECK_IN_NOTIFICATIONS_DATA";
  static let CHECK_IN_NOTIFICATIONS_RELOAD_TYPE = "CHECK_IN_NOTIFICATIONS_RELOAD_TYPE";
  // End by Manh Le at 2022-06-13
}

struct WidgetsKind {
  static let INCOMING_ACTIVITY = "IncomingActivityWidgets";
  static let QUICK_CREATE_ACTIVITY = "QuickCeateActivityWidgets";
  static let TICKET_WAIT_PROCESS = "ProcessTicketWidget";
  // Add by Manh Le at 2022-06-13
  // Purpose: addition new Widgets mapping with a notification screen
  static let NOTIFICATIONS = "NotificationsWidget";
  static let CHECKINNOTIFICATIONS = "CheckInNotificationsWidget";
  // End by Manh Le at 2022-06-13
}

// Add by Manh Le at 2022-06-13
// Purpose: addition new Widgets mapping with a notification screen
// Description: create extention for NotificationsEntry
extension NotificationsEntry {
  static func getDefaultValue() -> NotificationsEntry {
    return NotificationsEntry.init(date: Date(), notificationData: nil, accountStatus: getAccountStatus())
  }
  
  static func getAccountStatus() -> AccountStatus {
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    if let accountStatus = sharedDefault.value(forKey: Constant.ACCOUNT) as? String {
      if accountStatus.isEmpty || accountStatus == Constant.UN_AUTHENTICATION {
        return AccountStatus.UN_AUTHENTICATION;
      }
      else {
        return AccountStatus.AUTHENTICATION;
      }
    }
    else {
      return AccountStatus.UN_AUTHENTICATION;
    }
  }
  
  static func getDefaultNotificationsValue(_ numberItem: Int) -> [NotificationItem] {
    var result: [NotificationItem] = [];
    for _ in 1...numberItem {
      let dataDefault = NotificationItem.init(id: "", message: "", type: "", subType: "", relatedRecordId: "", relatedModuleName: "", isInvite: "0", isAcceptInvite: "0", checkInTime: "", read: "1", createdTime: "")
      result.append(dataDefault)
    }
    
    return result;
  }
  
  static func getEntry(_ entryList: [NotificationItem]?, _ nextDate: Date) -> NotificationsEntry {
    if entryList!.count > 0 {
      //// Parse data
      ///init list data empty
      let notificationItemEmpty = NotificationsEntry.getDefaultNotificationsValue(5)
      
      //// declare list for large Widget
      var largeItemList : [NotificationItem] = []
      
      //// Check list for large widgets
      if entryList!.count >= 5 {
        largeItemList = entryList!
      }
      else {
        largeItemList = Array(entryList![0..<entryList!.count]);
        for _ in 0...(5 - entryList!.count) {
          largeItemList.append(notificationItemEmpty.first!)
        }
      }
      
      print("================================= Data incoming activity parse ===============================")
      print(entryList ?? [])
      
      let notificationData: NotificationData = NotificationData.init(entryList: largeItemList, counter: nil)
      let entry = NotificationsEntry.init(date: nextDate, notificationData: notificationData, accountStatus: getAccountStatus())
      return entry;
      
    }
    else {
      let entry = NotificationsEntry.init(date: Date(), notificationData: nil, accountStatus: getAccountStatus())
      return entry;
    }
  }
  
}

extension NotificationData {
  
  static func mapToNotificationItem(_ list: [AnyObject], _ counter: AnyObject?) -> NotificationData {
    var notifies: [NotificationItem] = [];
    var counterData: CounterData? = nil;
    
    if list.count > 0 {
      for item in list {
        
        let dataNotification = item.value(forKey: "data") as AnyObject?
        let extraData = dataNotification?.value(forKey: "extra_data") as AnyObject?
        
        let notify = NotificationItem.init(
          id: dataNotification?.value(forKey: "id") as? String ?? "",
          message: item.value(forKey: "message") as? String ?? "",
          type: dataNotification?.value(forKey: "type") as? String ?? "",
          subType: dataNotification?.value(forKey: "subtype") as? String ?? "",
          relatedRecordId: dataNotification?.value(forKey: "related_record_id") as? String ?? "",
          relatedModuleName: dataNotification?.value(forKey: "related_module_name") as? String ?? "",
          isInvite: extraData?.value(forKey: "inviter") as? String ?? "0",
          isAcceptInvite: extraData?.value(forKey: "accepted") as? String ?? "0",
          checkInTime: extraData?.value(forKey: "checkin_time") as? String ?? "",
          read: dataNotification?.value(forKey: "read") as? String ?? "",
          createdTime: dataNotification?.value(forKey: "created_time") as? String ?? "")
        
        notifies.append(notify)
      }
    }
    
    if counter != nil {
      let notifyData = counter?.value(forKey: "activity_detail") as AnyObject?
      var notifyCount = "0"
      
      if notifyData == nil {
        notifyCount = counter?.value(forKey: "notification") as? String ?? "0"
      }
      else {
        notifyCount = counter?.value(forKey: "notify") as? String ?? "0"
      }
      
      counterData = CounterData.init(
        totalCount: counter?.value(forKey: "total") as? String ?? "0",
        notifyCount: notifyCount,
        notifyUpdateCount: notifyData?.value(forKey: "update") as? String ?? "0",
        notifyCheckinCount: notifyData?.value(forKey: "checkin") as? String ?? "0")
    }
    
    let notificationItemEmpty = NotificationsEntry.getDefaultNotificationsValue(5)
    
    var entryList: [NotificationItem] = [];
    
    if notifies.count >= 5 {
      entryList = notifies
    }
    else {
      entryList = Array(notifies[0..<notifies.count]);
      for _ in 0...(5 - notifies.count) {
        entryList.append(notificationItemEmpty.first!)
      }
    }
    
    return NotificationData.init(entryList: entryList, counter: counterData);
  }
  
  
}

func getConfigValueNotification(_ field: NotifyType) -> String {
  var result = ""
  
  switch field {
  case .update:
    result = "update";
    break;
    
  case .checkin:
    result = "checkin";
    break;
    
  case .unknown:
    result = ""
    break;
  }
  
  return result;
}

func checkNewVersionCRM(currentVersion curVer: String, versionCheck verCheck: String) -> Bool {
  //  7.1.0.20220610.1200
  let dateCurrVer = Int(curVer[6..<14]) ?? 0
  let dateVerCheck = Int(verCheck[6..<14]) ?? 1
  
  let prefixCurrVer = Int(curVer[15..<19]) ?? 0
  let prefixVerCheck = Int(verCheck[15..<19]) ?? 1
  
  print("Current Version: \(String(describing: dateCurrVer)) - \(String(describing: prefixCurrVer))")
  print("Version need checking: \(String(describing: dateVerCheck)) - \(String(describing: prefixVerCheck))")
  
  if dateCurrVer > dateVerCheck {
    return true
  }
  else if (dateCurrVer == dateVerCheck) && (prefixCurrVer >= prefixVerCheck) {
    return true
  }
  else {
    return false
  }
}

extension Date {
  func timeAgoDisplay() -> String {
    let calendar = Calendar.current
    let minuteAgo = calendar.date(byAdding: .minute, value: -1, to: Date())!
    let hourAgo = calendar.date(byAdding: .hour, value: -1, to: Date())!
    let dayAgo = calendar.date(byAdding: .day, value: -1, to: Date())!
    let weekAgo = calendar.date(byAdding: .day, value: -7, to: Date())!
    
    if minuteAgo < self {
      let diff = Calendar.current.dateComponents([.second], from: self, to: Date()).second ?? 0
      return "\(diff) sec ago"
    } else if hourAgo < self {
      let diff = Calendar.current.dateComponents([.minute], from: self, to: Date()).minute ?? 0
      return "\(diff) min ago"
    } else if dayAgo < self {
      let diff = Calendar.current.dateComponents([.hour], from: self, to: Date()).hour ?? 0
      return "\(diff) hrs ago"
    } else if weekAgo < self {
      let diff = Calendar.current.dateComponents([.day], from: self, to: Date()).day ?? 0
      return "\(diff) days ago"
    }
    
    let diff = Calendar.current.dateComponents([.weekOfYear], from: self, to: Date()).weekOfYear ?? 0
    
    return "\(diff) weeks ago"
  }
}
// End by Manh Le at 2022-06-13
