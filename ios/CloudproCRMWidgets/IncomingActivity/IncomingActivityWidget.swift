//
//  IncomingActivityWidget.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 06/04/2022.
//

import WidgetKit
import SwiftUI
import Intents

struct Provider: TimelineProvider {
  
  func placeholder(in context: Context) -> ActivityEntry {
    ActivityEntry.getDefaultValue()
  }
  
  func getSnapshot(in context: Context, completion: @escaping (ActivityEntry) -> ()) {
    let entry = ActivityEntry.getDefaultValue()
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<ActivityEntry>) -> ()) {
    var entries: [ActivityEntry] = []
    // Generate a timeline consisting of five entries an hour apart, starting from the current date.
    let currentDate = Date()
    let nextDate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!
    
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    if (sharedDefault.value(forKey: Constant.CREDENTIALS) as? String) != nil{
      
      if let accountStatus = (sharedDefault.value(forKey: Constant.ACCOUNT) as? String) {
        if !accountStatus.isEmpty && accountStatus != Constant.UN_AUTHENTICATION {
          
          if let reloadMode = sharedDefault.value(forKey: Constant.INCOMING_ACTIVITY_RELOAD_TYPE) as? String {
            if !reloadMode.isEmpty && reloadMode == Constant.RELOAD_FROM_NETWORK {
              @ObservedObject var store = SessionStore()
              
              store.fetchIncomingActivityList { data in
                print("================================= Data respone ===============================")
                print(data)
                  let entry = ActivityEntry.getEntry(data.entryList, nextDate)
                  entries.append(entry)
                  
                  let timeline = Timeline(entries: entries, policy: .atEnd)
                  completion(timeline)
              }
            }
            else if !reloadMode.isEmpty && reloadMode == Constant.RELOAD_FROM_CACHE {
              sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)
              
              let entry = ActivityEntry.getEntryFromCache(nextDate)
              entries.append(entry)
              
              let timeline = Timeline(entries: entries, policy: .atEnd)
              completion(timeline)
            }
            else {
              sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)
              let entry = ActivityEntry.init(date: nextDate, smallActivityData: nil, mediumActivityData: nil, largeActivityData: nil, accountStatus: ActivityEntry.getAccountStatus())
              entries.append(entry)
              
              let timeline = Timeline(entries: entries, policy: .atEnd)
              completion(timeline)
            }
          }
          else {
            sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)
            let entry = ActivityEntry.init(date: nextDate, smallActivityData: nil, mediumActivityData: nil, largeActivityData: nil, accountStatus: ActivityEntry.getAccountStatus())
            entries.append(entry)
            
            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
          }
          
        }
        else {
          sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
          let entry = ActivityEntry.init(date: nextDate, smallActivityData: nil, mediumActivityData: nil, largeActivityData: nil, accountStatus: ActivityEntry.getAccountStatus())
          entries.append(entry)
          
          let timeline = Timeline(entries: entries, policy: .atEnd)
          completion(timeline)
        }
      }
      else {
        sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
        let entry = ActivityEntry.init(date: nextDate, smallActivityData: nil, mediumActivityData: nil, largeActivityData: nil, accountStatus: ActivityEntry.getAccountStatus())
        entries.append(entry)
        
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
      }
      
    }
    else {
      sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
      let entry = ActivityEntry.init(date: nextDate, smallActivityData: nil, mediumActivityData: nil, largeActivityData: nil, accountStatus: ActivityEntry.getAccountStatus())
      entries.append(entry)
      
      let timeline = Timeline(entries: entries, policy: .atEnd)
      completion(timeline)
    }
  }
  
}

struct CRMWidgetsEntryView : View {
  var entry: Provider.Entry
  @Environment(\.widgetFamily) private var family
  
  var body: some View {
    ZStack {
      Color.white
      LargeActivityIncomingView(entry: entry)
    }
  }
}

struct IncomingActivityWidgets: Widget {
  let kind: String = WidgetsKind.INCOMING_ACTIVITY
  
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      CRMWidgetsEntryView(entry: entry)
    }
    .supportedFamilies([.systemLarge])
    .configurationDisplayName("incoming.activity.title")
    .description("incoming.activity.description")
  }
}
