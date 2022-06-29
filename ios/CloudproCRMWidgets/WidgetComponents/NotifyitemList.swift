//
//  NotifyitemList.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 14/06/2022.
//

import SwiftUI

struct NotifyitemList: View {
  @Binding var notify: NotificationItem?
  
  var body: some View {
    HStack{
      ZStack(alignment: .center){
        Circle()
          .strokeBorder(Color.gray,lineWidth: 1)
          .foregroundColor(.white)
          .frame(width: 44.0)
          .opacity(0.3)
        
        Image("\(notify?.relatedModuleName ?? "")".getIConModuleName(), bundle: .main)
          .resizable()
          .renderingMode(.template)
          .aspectRatio(contentMode: .fit)
          .foregroundColor(.accentColor)
          .frame(width: 16.0)
      }
      .padding([.leading], 4.0)
      .frame(width: 44.0, alignment: .center)
      
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .center) {
          Text((notify?.message ?? "").convertHTMLToString())
            .font(.system(size: 14.0))
            .fontWeight((notify?.read ?? "1") == "0" ? .semibold : .medium)
            .foregroundColor(.black.opacity((notify?.read ?? "1") == "0" ? 1 : 0.6))
            .lineLimit(2)
          
          if notify != nil && notify!.read == "0" {
            Spacer()
            
            Circle()
              .fill(Color.red)
              .frame(width: 8)
          }
        }
        
        HStack() {
          Text("\((notify?.createdTime ?? "").toTimeAgo())")
            .font(.system(size: 12.0))
            .foregroundColor(.gray.opacity(0.8))
          
          if notify != nil &&  notify!.isInvite == "1" {
            Spacer()
            
            Link(destination: URL(string: "cloudprocrmsales://notifications-accept/\(notify!.relatedRecordId)")!) {
              Text("Accept")
                .font(.system(size: 13.0))
                .foregroundColor(.red)
                .fontWeight(.semibold)
            }
          }
        }.padding(.bottom, 4.0)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    }
    .frame(maxWidth:.infinity, maxHeight: .infinity, alignment: .leading)
    .padding(.horizontal)
  }
}
