//
//  ItemListView.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 06/04/2022.
//

import Foundation
import SwiftUI

struct ItemListView: View {
    @Binding var isLastItem: Bool
    @Binding var title: String
    @Binding var subTitle: String
    @Binding var iconName: String
    
    var body: some View {
        HStack {
            ZStack(alignment: .center){
              if iconName != "" {
                Circle()
                  .strokeBorder(Color.gray,lineWidth: 1)
                  .foregroundColor(.white)
                  .frame(width: 34.0)
                  .opacity(0.3)
                
                Image("\(iconName)", bundle: .main)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 14.0)
                    .foregroundColor(.accentColor)
              }
            }
            .padding([.leading], 4.0)
            .frame(width: 44.0, alignment: .center)
            
          VStack(alignment: .leading) {
              VStack(alignment: .leading, spacing: 4.0){
                  Text("\(title)")
                      .font(.system(size: 15.0))
                      .multilineTextAlignment(.leading)
                  
                  
                  Text("\(subTitle)")
                      .font(.system(size: 12.0))
                      .foregroundColor(.gray)
                      .multilineTextAlignment(.leading)
              }
              .padding([.trailing])
              .padding([.leading], 0.0)
          .frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 0.0,  maxHeight: .infinity, alignment: .leading)
                
                if(!isLastItem) {
                    Divider()
                        .frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 1.0, maxHeight: 1.0)
                }
                
                    
            }
            
        }
            .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity, alignment: .center)
    }
}
