//
//  Flexible.swift
//  CloudproCRMWidgetsExtension
//
//  Created by Margosh Le on 08/04/2022.
//

import Foundation
import SwiftUI

struct FlexibleColumn<Content>: View where Content : View {
    let content: () -> Content

    init(@ViewBuilder _ content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
      VStack{
            content()
        }
        .frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity, alignment: .center)
    }
}


struct FlexibleRow<Content>: View where Content : View {
    let content: () -> Content

    init(@ViewBuilder _ content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        HStack {
            content()
        }
        .frame(minWidth: 0.0, maxWidth: .infinity, minHeight: 0.0, maxHeight: .infinity, alignment: .center)
    }
}
