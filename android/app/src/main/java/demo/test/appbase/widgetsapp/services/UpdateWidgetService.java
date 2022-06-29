package demo.test.appbase.widgetsapp.services;

import android.app.Service;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;
import android.widget.RemoteViews;

import androidx.annotation.Nullable;

import demo.test.appbase.R;

public class UpdateWidgetService {
    private static final String TAG = UpdateWidgetService.class.getSimpleName();
    public static final String ACTION_UPDATE = "demo.test.appbase.widgetsapp.services.ACTION_UPDATE";
    public static final String ACTION_UPDATE_INCOMING_LIST = "demo.test.appbase.widgetsapp.services.ACTION_UPDATE_INCOMING_LIST";
}
