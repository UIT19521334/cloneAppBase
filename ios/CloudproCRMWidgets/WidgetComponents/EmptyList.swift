//
//  EmptyList.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 06/04/2022.
//

import Foundation
import SwiftUI

struct EmptyListView : View {
    
    @Binding var desciption: Text
    
    var body: some View {
        ZStack{
          desciption
                .font(.footnote)
                .foregroundColor(.red)
                .fixedSize(horizontal: false, vertical: true)
                .multilineTextAlignment(.center)
                
        }
        .padding([.horizontal])
        .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity, alignment: .center)
    }
}
