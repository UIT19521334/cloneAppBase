//
//  Notifications.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 13/06/2022.
//  Purpose: addition new Widgets mapping with a notification screen
//


import WidgetKit
import SwiftUI
import Intents

struct NotificationProvider : IntentTimelineProvider {
  typealias Intent = NotifiesIntent
  typealias Entry = NotificationsEntry
  
  func placeholder(in context: Context) -> NotificationsEntry {
    NotificationsEntry.getDefaultValue()
  }
  
  func getSnapshot(for configuration: NotifiesIntent, in context: Context, completion: @escaping (NotificationsEntry) -> Void) {
    let entry = NotificationsEntry.getDefaultValue()
    completion(entry)
  }
  
  func getTimeline(for configuration: NotifiesIntent, in context: Context, completion: @escaping (Timeline<NotificationsEntry>) -> Void) {
    var entries: [NotificationsEntry] = []
    // Generate a timeline consisting of five entries an hour apart, starting from the current date.
    
    let currentDate = Date()
    let nextDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
    
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    //Get information credentials
    if (sharedDefault.value(forKey: Constant.CREDENTIALS) as? String) != nil {
      
      // Get status Acccount
      if let accountStatus = (sharedDefault.value(forKey: Constant.ACCOUNT) as? String) {
        
        // Check status Account is Authentication
        if !accountStatus.isEmpty && accountStatus != Constant.UN_AUTHENTICATION {
          @ObservedObject var store = SessionStore()
          sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)
          
          if store.versionCRM != nil {
            store.fetchVersionCRM(completion: { version in
              
              store.fetchNotification("notify", getConfigValueNotification(configuration.notifyType), checkNewVersionCRM(currentVersion: version, versionCheck: "7.1.0.20220610.1200"), completion: { (notificationData, error) in
                
                if error != nil {
                  
                  return
                }
                
                if notificationData != nil {
                  print("================================= Data respone ===============================")
                  print(notificationData ?? "")
                  let entry = NotificationsEntry.init(date: nextDate, notificationData: notificationData, accountStatus: NotificationsEntry.getAccountStatus())
                  
                  entries.append(entry)
                  
                  let timeline = Timeline(entries: entries, policy: .atEnd)
                  completion(timeline)
                }
              })
              
            })
          }
          else {
            store.fetchNotification("notify", getConfigValueNotification(configuration.notifyType), checkNewVersionCRM(currentVersion: store.versionCRM ?? "7.1.0.20220510.1200", versionCheck: "7.1.0.20220610.1200"), completion: { (notificationData, error) in
              
              if error != nil {
                
                return
              }
              
              if notificationData != nil {
                print("================================= Data respone ===============================")
                print(notificationData ?? "")
                let entry = NotificationsEntry.init(date: nextDate, notificationData: notificationData, accountStatus: NotificationsEntry.getAccountStatus())
                
                entries.append(entry)
                
                let timeline = Timeline(entries: entries, policy: .atEnd)
                completion(timeline)
              }
            })
            
          }
          
        }
        // Check status Account is UnAuthentication
        else {
          sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
          let entry = NotificationsEntry.init(date: nextDate, notificationData: nil, accountStatus: NotificationsEntry.getAccountStatus())
          entries.append(entry)
          
          let timeline = Timeline(entries: entries, policy: .atEnd)
          completion(timeline)
        }
        
      }
      // Get status Acccount
      else {
        sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
        let entry = NotificationsEntry.init(date: nextDate, notificationData: nil, accountStatus: NotificationsEntry.getAccountStatus())
        entries.append(entry)
        
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
      }
      
    }
    //Get information credentials
    else {
      sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
      let entry = NotificationsEntry.init(date: nextDate, notificationData: nil, accountStatus: NotificationsEntry.getAccountStatus())
      entries.append(entry)
      
      let timeline = Timeline(entries: entries, policy: .atEnd)
      completion(timeline)
    }
  }
}

struct NotificationsWidgetsEntryView : View {
  var entry: NotificationsEntry
  @Environment(\.widgetFamily) private var family
  
  var body: some View {
    ZStack {
      Color.white
      
      VStack(spacing: 0.0) {
        Color.accentColor.overlay(
          HStack{
            
            Image(systemName: "bell")
              .resizable()
              .renderingMode(.template)
              .aspectRatio(contentMode: .fit)
              .foregroundColor(.white)
              .frame(width: 15.0)
            
            Text("notifications.title")
              .font(.system(size: 15.0))
              .fontWeight(.semibold)
              .lineLimit(1)
              .foregroundColor(.white)
            
            Spacer()
            
            Image("btn_search", bundle: .main)
              .resizable()
              .aspectRatio(contentMode: .fit)
              .frame(width: 24.0, height: 24.0)
          }
            .padding([.horizontal])
            .padding([.top], 8.0)
            .padding([.bottom], 5.0)
            .frame(minWidth: 0.0, maxWidth: .infinity, alignment: .leading)
        ).frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 40.0, maxHeight: 40.0, alignment: .leading)
        
        Divider()
        
        if entry.accountStatus == .UN_AUTHENTICATION {
          AuthenticationView(desciption: Binding.constant(Text("notifications.login.description")))
        }
        else if entry.notificationData == nil || entry.notificationData?.entryList == nil || entry.notificationData!.entryList!.isEmpty {
          EmptyListView(desciption: Binding.constant(Text("notifications.empty.label")))
        }
        else if (entry.notificationData?.entryList != nil) {
          FlexibleColumn {
            GeometryReader { bound in
              VStack(spacing: 0.0){
                if family == .systemMedium {
                    ForEach(0..<2) { i in
                      Link(destination: URL(string: "cloudprocrmsales://notifications/\(entry.notificationData?.entryList?[i].relatedRecordId ?? "")")!) {
                        NotifyitemList(notify: Binding.constant(entry.notificationData?.entryList?[i] ?? nil))
                          .frame(width: bound.size.width, height: bound.size.height / 2)
                      }
                    }
                }
                else if family == .systemLarge {
                  ForEach(0..<5) { i in
                    Link(destination: URL(string: "cloudprocrmsales://notifications/\(entry.notificationData?.entryList?[i].relatedRecordId ?? "")")!) {
                      NotifyitemList(notify: Binding.constant(entry.notificationData?.entryList?[i] ?? nil))
                        .frame(width: bound.size.width, height: bound.size.height / 5 - 1)
  
                      if i < 4 {
                        Divider().padding([.leading])
                      }
                    }
                  }
                }
                
              }.frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity)
            }
          }
        }
      }
      .frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity)
    }
  }
}

struct NotificationsWidget: Widget {
  let kind: String = WidgetsKind.NOTIFICATIONS
  
  var body: some WidgetConfiguration {
    IntentConfiguration(
      kind: kind,
      intent: NotifiesIntent.self,
      provider: NotificationProvider()
    ) { entry in
      NotificationsWidgetsEntryView(entry: entry)
    }
    .supportedFamilies([.systemMedium, .systemLarge])
    .configurationDisplayName("notifications.title")
    .description("notifications.description")
  }
}
