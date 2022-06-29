package demo.test.appbase.widgetsapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.widget.RemoteViews;

import demo.test.appbase.R;

/**
 * Implementation of App Widget functionality.
 */
public class ActivityQuickActionWidget extends AppWidgetProvider {
    private static final String OnClickCreateCall = "OnClickCreateCall";
    private static final String OnClickCreateMeeting = "OnClickCreateMeeting";
    private static final String OnClickCreateTask = "OnClickCreateTask";
    private static final String OnClickSearch = "OnClickSearch";

    protected static PendingIntent getPendingSelfIntent(Context context, String action) {
        Intent intent = new Intent(context, ActivityQuickActionWidget.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setAction(action);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        }
        else {
            return PendingIntent.getBroadcast(context, 0, intent, 0);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.activity_quick_action_widget);

        views.setOnClickPendingIntent(R.id.btn_call, getPendingSelfIntent(context, OnClickCreateCall));
        views.setOnClickPendingIntent(R.id.btn_meeting, getPendingSelfIntent(context, OnClickCreateMeeting));
        views.setOnClickPendingIntent(R.id.btn_task, getPendingSelfIntent(context, OnClickCreateTask));
        views.setOnClickPendingIntent(R.id.btn_global_search, getPendingSelfIntent(context, OnClickSearch));

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
    public void onReceive(Context context, Intent intent) {
        //Log.e(this.getClass().getName(), "onReceive: intent="+intent.getAction());

        if (intent.getAction().equals("android.appwidget.action.APPWIDGET_UPDATE")){
            ComponentName componentName=new ComponentName(context,getClass().getName());
            AppWidgetManager appWidgetManager=AppWidgetManager.getInstance(context);
            int[] appWidgetIds=appWidgetManager.getAppWidgetIds(componentName);
            this.onUpdate(context, appWidgetManager, appWidgetIds);
        }

        // Has press to the button create call activity
        if (OnClickCreateCall.equals(intent.getAction())){
            createActivity(ActivityType.CALL, context);
        }

        // Has press to the button create call activity
        if (OnClickCreateMeeting.equals(intent.getAction())){
            createActivity(ActivityType.MEETING, context);
        }

        // Has press to the button create task activity
        if (OnClickCreateTask.equals(intent.getAction())){
            createActivity(ActivityType.TASK, context);
        }

        // Has press to the button create task activity
        if (OnClickSearch.equals(intent.getAction())){
            createActivity(ActivityType.GLOBAL_SEARCH, context);
        }
    }

    private static void createActivity(ActivityType type, Context ctx){
        //Log.e(ActivityQuickActionWidget.class.getSimpleName(), "createActivity: " + type );
        switch (type) {
            case CALL:
                Uri uriCreateAcCall = Uri.parse("cloudprocrmsales://actions/call");
                Intent intentCreateAcCall = new Intent(Intent.ACTION_VIEW, uriCreateAcCall);
                if ((Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)){
                    intentCreateAcCall.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                }
                ctx.startActivity(intentCreateAcCall);
                break;

            case TASK:
                Uri uriCreateAcTask = Uri.parse("cloudprocrmsales://actions/task");
                Intent intentCreateAcTask = new Intent(Intent.ACTION_VIEW, uriCreateAcTask);
                if ((Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)){
                    intentCreateAcTask.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                }
                ctx.startActivity(intentCreateAcTask);

                break;

            case MEETING:
                Uri uriCreateAcMeeting = Uri.parse("cloudprocrmsales://actions/meeting");
                Intent intentCreateAcMeeting = new Intent(Intent.ACTION_VIEW, uriCreateAcMeeting);
                if ((Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)){
                    intentCreateAcMeeting.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                }
                ctx.startActivity(intentCreateAcMeeting);

                break;

            case GLOBAL_SEARCH:
                Uri uriSearch = Uri.parse("cloudprocrmsales://actions/globalsearch");
                Intent intentSearch = new Intent(Intent.ACTION_VIEW, uriSearch);
                if ((Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)){
                    intentSearch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                }
                ctx.startActivity(intentSearch);
                break;
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}