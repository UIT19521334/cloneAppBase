//
//  CloudproModel.swift
//  CloudProSalesApp
//
//  Created by Margosh Le on 09/11/2021.
//

import WidgetKit
import SwiftUI
import Intents

// MARK: - Model Credentials contain information token login
struct Credentials: Codable, Hashable {
  let url: String
  let token: String
}

enum AccountStatus {
  case AUTHENTICATION
  case UN_AUTHENTICATION
}

// MARK: - Model activity Entry of the Widgets
struct ActivityEntry: TimelineEntry {
    let date: Date
    let smallActivityData: IncomingActivityItem?
    let mediumActivityData: [IncomingActivityItem]?
    let largeActivityData: [IncomingActivityItem]?
    let accountStatus: AccountStatus?
}

// MARK: - Model contain incoming activity lít
struct ActivityList: Codable, Hashable {
  let entryList: [IncomingActivityItem]?
}

// MARK: - Model activvity
struct IncomingActivityItem: Codable, Hashable {
  let activityid : String
  let subject : String
  let activitytype : String
  let date_start : String
  let time_start : String
}

// MARK: - Model Enum Item List of the metadata
struct EnumItem: Codable, Hashable {
    let value : String?
    let color : String?
    let key : String
    let label : String
}

struct WidgetData: Decodable {
   var token: String
}

struct WidgetTextData: Decodable {
   var text: String
}

struct Cloudpro: Decodable {
    let IncomingActivities: [IncomingActivity]
}

struct IncomingActivity: Decodable {
  let activityid : String
  let subject : String
  let activitytype : String
  let date_start : String
  let time_start : String
}

struct ProcessTicketEntry: TimelineEntry {
  let date: Date;
  let mediumTicketData: [TicketModel]?
  let largeTicketData: [TicketModel]?
  let accountStatus: AccountStatus?
}

// MARK: - Model Ticket
struct TicketModel: Codable, Hashable {
  let ticketid : String
  let ticket_no : String
  let title : String
  let createdtime : String
  let status : String
  let priority : EnumItem?
  let category : EnumItem?
}

// MARK: - Model contain incoming activity lít
struct TicketProcessList: Codable, Hashable {
  let entryList: [TicketModel]?
}

struct TicketMetaData: Codable, Hashable {
  let ticketcategories: [EnumItem]?
  let ticketpriorities: [EnumItem]?
}

// MARK: - Notification Widget
struct NotificationsEntry: TimelineEntry {
  let date: Date
  let notificationData: NotificationData?
  let accountStatus: AccountStatus?
}

struct CounterData: Codable, Hashable {
  let totalCount: String
  let notifyCount: String
  let notifyUpdateCount: String
  let notifyCheckinCount: String
}

struct NotificationData: Codable, Hashable {
  let entryList: [NotificationItem]?
  let counter: CounterData?
}

struct NotificationItem: Codable, Hashable {
  let id: String
  let message: String
  let type: String
  let subType: String
  let relatedRecordId: String
  let relatedModuleName: String
  let isInvite: String
  let isAcceptInvite: String
  let checkInTime: String
  let read: String
  let createdTime: String
}

struct CRMVersion: Codable, Hashable {
  let version: String
}

enum CodeError: String, CodingKey {
  case permissionDenied = "permissionDenied"
  case requiredNewVersionCRM = "requiredNewVersionCRM"
  case requestFailure = "requestFailure"
  case responseNotSuccess = "responseNotSuccess"
  case emptyData = "emptyData"
}

struct NotifyError: Codable, Hashable {
  let messageError: String?
  let codeError: String
}

enum IconModuleName: String, CodingKey {
  case Leads = "user"
  case Contacts = "user-tie"
  case Accounts = "building"
  case Potentials = "sack"
  case HelpDesk = "file-exclamation"
  case SalesOrder = "file-invoice-dollar"
  case Faq = "question-circle"
  case Call = "phone-alt"
  case Meeting = "users"
  case Task = "tasks"
  case Report = "chart-pie-alt"
  case Products = "box"
  case Services = "toolbox"
  case CPEmployee = "user_check_in"
}

// MARK: - Check-in Notification Widget
struct CheckInNotificationsEntry: TimelineEntry {
  let date: Date
}
