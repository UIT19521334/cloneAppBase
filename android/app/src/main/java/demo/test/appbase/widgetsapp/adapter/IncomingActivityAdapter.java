package demo.test.appbase.widgetsapp.adapter;

import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.widget.RemoteViewsService;

import demo.test.appbase.widgetsapp.factory.ActivityListProvider;

public class IncomingActivityAdapter extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        int appWidgetId = intent.getIntExtra(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID);
        return (new ActivityListProvider(this.getApplicationContext(), intent));

    }
}
