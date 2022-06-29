//
//  CloudproCRMWidgets.swift
//  CloudproCRMWidgets
//
//  Created by Margosh Le on 08/11/2021.
//
// Purpose: declare Widgets used in this app

import WidgetKit
import SwiftUI
import Intents

@main
struct CloudproCRMWidgets: WidgetBundle {
  @WidgetBundleBuilder
  var body: some Widget {
    QuickCeateActivityWidgets()
    IncomingActivityWidgets()
    ProcessTicketWidget()
    NotificationsWidget()
  }
}
