package demo.test.appbase.widgetsapp.adapter;

import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.widget.RemoteViewsService;

import demo.test.appbase.widgetsapp.factory.TicketListProvider;

public class ProcessingTicketAdapter extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        int appWidgetId = intent.getIntExtra(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID);
        return (new TicketListProvider(this.getApplicationContext(), intent));

    }
}
