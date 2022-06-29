//
//  Credential.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 06/04/2022.
//

import Foundation
import SwiftUI

struct AuthenticationView : View {
    @Binding var desciption: Text

    var body: some View {
        VStack{
            Link(destination: URL(string: "cloudprocrmsales://")!, label: {
                Text("button.signin.label")
                    .padding()
                    .foregroundColor(.blue)
            })
           
          desciption
                .font(.footnote)
                .foregroundColor(.gray)
                .fixedSize(horizontal: false, vertical: true)
                .multilineTextAlignment(.center)
        }
        .padding([.horizontal])
        .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity, alignment: .center)
    }
}
