//
//  TicketWaitProcess.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 07/04/2022.
//

import WidgetKit
import SwiftUI
import Intents

struct ProcessTicketProvider: IntentTimelineProvider {
  func placeholder(in context: Context) -> ProcessTicketEntry {
    ProcessTicketEntry.getDefaultValue()
  }
  
  func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (ProcessTicketEntry) -> Void) {
    completion(ProcessTicketEntry.getDefaultValue())
  }
  
  func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    var entries: [ProcessTicketEntry] = []
    let currentDate = Date()
    let nextDate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!
    
    let sharedDefault = UserDefaults(suiteName: Constant.APP_GROUP)!
    
    if (sharedDefault.value(forKey: Constant.CREDENTIALS) as? String) != nil{
      
      if let accountStatus = (sharedDefault.value(forKey: Constant.ACCOUNT) as? String) {
        
        if !accountStatus.isEmpty && accountStatus != Constant.UN_AUTHENTICATION {
          
          if let reloadMode = sharedDefault.value(forKey: Constant.PROCESSING_TICKET_RELOAD_TYPE) as? String {
            
            if !reloadMode.isEmpty && reloadMode == Constant.RELOAD_FROM_NETWORK {
              @ObservedObject var store = SessionStore()
              
              store.fetchTicketWaitProcessList(getConfigValue(.CreatedDate, configuration.createdDate),
                                               getConfigValue(.Priority, configuration.priority),
                                               getConfigValue(.FilterBy, configuration.filterBy)
              ) { data in
                print("================================= Data respone ===============================")
                print(data)
                sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.PROCESSING_TICKET_RELOAD_TYPE)
                
                let entry = ProcessTicketEntry.getEntry(data.entryList, nextDate)
                entries.append(entry)
                
                let timeline = Timeline(entries: entries, policy: .atEnd)
                completion(timeline)
              }
            }
            else if !reloadMode.isEmpty && reloadMode == Constant.RELOAD_FROM_CACHE {
              sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)
              sharedDefault.set(Constant.RELOAD_FROM_NETWORK, forKey: Constant.PROCESSING_TICKET_RELOAD_TYPE)
              
              let entry = ProcessTicketEntry.getEntryFromCache(nextDate)
              entries.append(entry)
              
              let timeline = Timeline(entries: entries, policy: .atEnd)
              completion(timeline)
            }
            else {
              sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)
              let entry = ProcessTicketEntry.init(date: nextDate, mediumTicketData: nil, largeTicketData: nil, accountStatus: ActivityEntry.getAccountStatus())
              entries.append(entry)
              
              let timeline = Timeline(entries: entries, policy: .atEnd)
              completion(timeline)
            }
            
          }
          else {
            sharedDefault.set(Constant.AUTHENTICATION, forKey: Constant.ACCOUNT)
            let entry = ProcessTicketEntry.init(date: nextDate, mediumTicketData: nil, largeTicketData: nil, accountStatus: ActivityEntry.getAccountStatus())
            entries.append(entry)
            
            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
          }
          
        }
        else {
          sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
          let entry = ProcessTicketEntry.init(date: nextDate, mediumTicketData: nil, largeTicketData: nil, accountStatus: ActivityEntry.getAccountStatus())
          entries.append(entry)
          
          let timeline = Timeline(entries: entries, policy: .atEnd)
          completion(timeline)
        }
        
      }
      else {
        sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
        let entry = ProcessTicketEntry.init(date: nextDate, mediumTicketData: nil, largeTicketData: nil, accountStatus: ActivityEntry.getAccountStatus())
        entries.append(entry)
        
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
      }
      
    }
    else {
      sharedDefault.set(Constant.UN_AUTHENTICATION, forKey: Constant.ACCOUNT)
      let entry = ProcessTicketEntry.init(date: nextDate, mediumTicketData: nil, largeTicketData: nil, accountStatus: ActivityEntry.getAccountStatus())
      entries.append(entry)
      
      let timeline = Timeline(entries: entries, policy: .atEnd)
      completion(timeline)
    }
    
  }
}

struct WidgetEntryView: View {
  let entry: ProcessTicketEntry
  @Environment(\.widgetFamily) private var family
  
  var body: some View {
    ZStack{
      Color.white
      
      VStack(spacing: 0.0) {
        
        Color.accentColor.overlay(
          HStack{
            
            if family == .systemLarge {
              Image("file-exclamation", bundle: .main)
                .resizable()
                .renderingMode(.template)
                .aspectRatio(contentMode: .fit)
                .foregroundColor(.white)
                .frame(width: 15.0)
            }
            
            Text("processing.ticket.title")
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
          AuthenticationView(desciption: Binding.constant(Text("processing.ticket.login.description")))
        }
        else if (entry.largeTicketData?.isEmpty) == nil && family == .systemLarge {
          EmptyListView(desciption: Binding.constant(Text("processing.ticket.empty.label")))
        }
        else if (entry.mediumTicketData?.isEmpty) == nil && family == .systemMedium {
          EmptyListView(desciption: Binding.constant(Text("processing.ticket.empty.label")))
        }
        else {
          FlexibleColumn {
            GeometryReader { bound in
              VStack(spacing: 0.0){
                
                if family == .systemMedium {
                  ForEach(0..<2) { i in
                    Link(destination: URL(string: "cloudprocrmsales://process-ticket/\(entry.mediumTicketData![i].ticketid)")!) {
                      TicketItem(ticket: Binding.constant(entry.mediumTicketData![i]))
                        .frame(width: bound.size.width, height: bound.size.height / 2)
                    }
                  }
                }
                else if family == .systemLarge {
                  ForEach(0..<5) { i in
                    Link(destination: URL(string: "cloudprocrmsales://process-ticket/\(entry.largeTicketData![i].ticketid)")!) {
                      TicketItem(ticket: Binding.constant(entry.largeTicketData![i]))
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

struct ProcessTicketWidget: Widget {
  let kind: String = WidgetsKind.TICKET_WAIT_PROCESS
  
  var body: some WidgetConfiguration {
    IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: ProcessTicketProvider()) { entry in
      WidgetEntryView(entry: entry)
    }
    .supportedFamilies([.systemMedium, .systemLarge])
    .configurationDisplayName("processing.ticket.title")
    .description("processing.ticket.description")
  }
}
