package demo.test.appbase.widgetsapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Calendar;

import demo.test.appbase.R;
import demo.test.appbase.commons.Constants;
import demo.test.appbase.widgetsapp.adapter.IncomingActivityAdapter;
import demo.test.appbase.widgetsapp.services.UpdateWidgetService;
import demo.test.appbase.widgetsapp.shared.SharedWidgets;


enum ActivityType {
    CALL, MEETING, TASK, GLOBAL_SEARCH
}

/**
 * Implementation of App Widget functionality.
 */
public class IncomingActivityWidget extends AppWidgetProvider {
    private final String TAG = IncomingActivityWidget.class.getSimpleName();
    protected static PendingIntent getPendingSelfIntent(Context context, String action) {
        Intent intent = new Intent(context, IncomingActivityWidget.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setAction(action);
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
//            return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
//        }
//        else {
            return PendingIntent.getBroadcast(context, 0, intent, 0);
//        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        SharedPreferences pref = context.getSharedPreferences(Constants.ACCOUNT, context.MODE_PRIVATE);

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.incoming_activity_widget);
        String accountStatus = pref.getString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);

        //=================================== Start handle list view =========================
        //RemoteViews Service needed to provide adapter for ListView
        Intent svcIntent = new Intent(context, IncomingActivityAdapter.class);

        svcIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        //setting a unique Uri to the intent
        //don't know its purpose to me right now
        svcIntent.setData(Uri.parse(
                svcIntent.toUri(Intent.URI_INTENT_SCHEME)));
        //setting adapter to listview of the widget
        views.setRemoteAdapter(appWidgetId, R.id.list_view_incoming_activity_widget,
                svcIntent);
        if (!accountStatus.isEmpty() && Constants.AUTHENTICATION.equals(accountStatus)) {
            //setting an empty view in case of no data
            views.setEmptyView(R.id.list_view_incoming_activity_widget, R.id.empty_incoming_ticket_view);
        } else {
            views.setEmptyView(R.id.list_view_incoming_activity_widget, R.id.layout_incoming_ticket_sign_in);
        }

        Intent intent = new Intent(context, IncomingActivityWidget.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setAction(Constants.ACTION_ONCLICK_INCOMING_ITEM);
        intent.putExtra(Constants.ACTION_ONCLICK_INCOMING_ITEM_EXTRA, "0");
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        //config to handle onClick item of list view
        views.setPendingIntentTemplate(R.id.list_view_incoming_activity_widget, pendingIntent);
        views.setOnClickPendingIntent(R.id.btn_incoming_ticket_login, getPendingSelfIntent(context, Constants.ACTION_ONCLICK_SIGN_IN));

        //=================================== End handle list view =========================


        //=================================== Start handle update datetime update =========================
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss aaa");
        Calendar calendar = Calendar.getInstance();
        String dateTimeUpdated = simpleDateFormat.format(calendar.getTime()).toString();

        views.setTextViewText(R.id.txt_incoming_activity_datetime_updated, context.getResources().getString(R.string.label_last_updated) + " " + dateTimeUpdated);
        //=================================== End handle update datetime update =========================


        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        //Log.e(TAG, "AppWidget status: " + intent.getAction() + " "  + intent.getStringExtra("activity_id"));

        // Handle after async call api
        if (intent.getAction().equals(UpdateWidgetService.ACTION_UPDATE_INCOMING_LIST)) {
            ComponentName componentName = new ComponentName(context, getClass().getName());
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.list_view_incoming_activity_widget);
            this.onUpdate(context, appWidgetManager, appWidgetIds);
        }

        // The first time create widget
        // - Create a time interval with the refresh Widget every 1 minute
        // - First load data
        if (intent.getAction().equals("android.appwidget.action.APPWIDGET_UPDATE")) {

            SharedWidgets.getInstance(context).getIncomingList();
            ComponentName componentName = new ComponentName(context, getClass().getName());
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);
            this.onUpdate(context, appWidgetManager, appWidgetIds);
        }

        // Has Item onclick
        if (intent.getAction().equals(Constants.ACTION_ONCLICK_INCOMING_ITEM)) {
            Intent intentOpenActivity = new Intent(Intent.ACTION_VIEW, intent.getData());
            if ((Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)){
                intentOpenActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            }
            context.startActivity(intentOpenActivity);
        }

        // Has SignIn onclick
        if (intent.getAction().equals(Constants.ACTION_ONCLICK_SIGN_IN)) {
            Uri uriSignIn = Uri.parse("cloudprocrmsales://");
            Intent intentSignIn = new Intent(Intent.ACTION_VIEW, uriSignIn);
            if ((Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)){
                intentSignIn.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            }
            context.startActivity(intentSignIn);
        }
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}