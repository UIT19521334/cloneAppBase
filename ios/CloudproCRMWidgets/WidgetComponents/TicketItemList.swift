//
//  TicketItemList.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 07/04/2022.
//

import Foundation
import SwiftUI

struct TicketItem: View {
    @Environment(\.widgetFamily) private var family
    @Binding var ticket: TicketModel
    var body: some View {
        GeometryReader{ bound in
            HStack(spacing: 0.0){
                if family == .systemMedium {
                    ZStack{
                        Circle()
                          .strokeBorder(Color.gray,lineWidth: 1)
                          .foregroundColor(.white)
                          .frame(width: bound.size.height / 1.7 )
                          .opacity(0.3)
                        
                      Image("file-exclamation", bundle: .main)
                            .resizable()
                            .renderingMode(.template)
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.accentColor)
                            .frame(width: 15.0)
                    }
                    .frame(minWidth: bound.size.height, maxWidth: bound.size.height, minHeight: 0.0, maxHeight: .infinity)
                    .opacity(ticket.title.isEmpty ? 0 : 1)
                }
              
                VStack(alignment: .leading, spacing: 3.0){
                  Text(ticket.title)
                        .font(.footnote)
                        .fontWeight(.semibold)
                        .lineLimit(1)
                    
                  if !(ticket.category?.key ?? "").isEmpty || !(ticket.priority?.key ?? "").isEmpty {
                    HStack{

                      if !(ticket.category?.key ?? "").isEmpty {
                        Text(ticket.category?.label ?? "")
                              .font(.system(size: 12.0))
                              .foregroundColor(.black.opacity(0.7))
                      }
                      else {
                        Text("unkown.label")
                              .font(.system(size: 12.0))
                              .foregroundColor(.black.opacity(0.7))
                      }
                      

                        Spacer()

                      if !(ticket.priority?.key ?? "").isEmpty {
                        Text(ticket.priority?.label ?? "")
                              .font(.system(size: 12.0))
                              .foregroundColor(ticket.priority!.key.getPriorityColor())
                      }
                      else {
                        Text("unkown.label")
                              .font(.system(size: 12.0))
                              .foregroundColor("#333333".hexStringToColor())
                      }
                      
                    }
                  }
                  Text(ticket.createdtime.formatDateTimeString(formatString: "dd/MM/YYYY hh:mm"))
                        .font(.system(size: 11.0))
                        .foregroundColor(.gray.opacity(0.8))
                  
                }
                .padding([.trailing], 8.0)
                .padding([.leading], family == .systemLarge ? 18.0 : 0)
                .frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity, alignment: .leading)
            }
        }
    }
}
