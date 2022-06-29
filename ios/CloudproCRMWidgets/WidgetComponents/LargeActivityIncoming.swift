//
//  LargeActivityIncoming.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 14/02/2022.
//

import Foundation
import SwiftUI

struct ListIcomingActivityView: View {
  @Binding var data: [IncomingActivityItem]?
    var body: some View {
        ForEach(0..<5) { i in
            
          Link(destination: URL(string: "cloudprocrmsales://incoming-activity/\(data?[i].activityid ?? "")")!) {
                ItemListView(
                    isLastItem: Binding.constant(i == 4),
                    title: Binding.constant(data?[i].subject ?? ""),
                    subTitle: Binding.constant("\(data?[i].date_start ?? "") \(data?[i].time_start ?? "")".formatDateTimeString(formatString: "dd/MM/yyy HH:ss")),
                    iconName: Binding.constant(getIconName(i))
                )
            }
            
        }
    }
  
  func getIconName(_ index: Int) -> String {
    switch data?[index].activitytype ?? "" {
    case "Call":
      return "phone";
    case "Meeting":
      return "users";
    case "Task":
      return "tasks"
    default:
      return "";
    }
  }
  
}


struct LargeActivityIncomingView: View {
  var entry: Provider.Entry
  
  var body: some View {
    
    GeometryReader { bound in
      ZStack {
        Color.white
        VStack (spacing: 0){
          
          //// Header
              VStack(alignment: .leading, spacing: 6.0) {
              
                  Text("incoming.activity.title")
                      .font(.headline)
                      .foregroundColor(.black)
                      .fontWeight(.semibold)
                  
                  
                  Text("incoming.activity.description")
                      .font(.footnote)
                      .fixedSize(horizontal: false, vertical: true)
                      .foregroundColor(.gray)
          }
              .padding([.leading, .trailing, .top])
              .padding([.bottom], 6.0)
          .frame(width: bound.size.width, alignment: .leading)
          
          Divider()
              .frame(width: bound.size.width, height: 1.0)
          
          //// Content widgets
          if entry.accountStatus == .UN_AUTHENTICATION {
            AuthenticationView(desciption: Binding.constant(Text("incoming.activity.empty.label")))
          }
            else if (entry.largeActivityData?.isEmpty) == nil {
              EmptyListView(desciption: Binding.constant(Text("incoming.activity.empty.label")))
            }
            else {
              ListIcomingActivityView(data: Binding.constant(entry.largeActivityData))
            }
          
          
          Divider()
              .frame(width: bound.size.width, height: 1.0)
          
          Color.gray
              .opacity(0.05)
              .frame(height: 22)
              .overlay(
                HStack(spacing: 0.0) {
                  Text("widget.time.update.label")
                            .font(.system(size: 10, weight: .regular, design: .default))
                            .italic()
                          .foregroundColor(.blue)
                  Text(entry.date.formatDateToString())
                            .font(.system(size: 10, weight: .regular, design: .default))
                            .italic()
                          .foregroundColor(.blue)
                }
              )
          
        }
        .frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity, alignment: .topLeading)
        
      }
    }
    
  }
}

