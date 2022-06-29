package demo.test.appbase.widgetsapp.factory;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;
import demo.test.appbase.BuildConfig;
import demo.test.appbase.R;
import demo.test.appbase.commons.Constants;
import demo.test.appbase.widgetsapp.IncomingActivityWidget;
import demo.test.appbase.widgetsapp.models.IncomingActivity;
import demo.test.appbase.widgetsapp.shared.SharedWidgets;

public class ActivityListProvider implements RemoteViewsService.RemoteViewsFactory {
    private List<IncomingActivity> listItemList = new ArrayList();
    private String responseString = "";
    private Context context = null;
    private int appWidgetId;
 
    public ActivityListProvider(Context applicationContext, Intent intent) {
        this.context = applicationContext;
        appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID);

        populateListItem();
    }

    private void populateListItem() {

        SharedPreferences pref = context.getSharedPreferences(Constants.INCOMING_ACTIVITY, context.MODE_PRIVATE);
        String dataString = pref.getString(Constants.INCOMING_ACTIVITY_DATA, "[]");
        try {
            JSONArray activityList = new JSONArray(dataString);
            if (activityList != null && (activityList.length() > 0)) {
                for (int i = 0; i < activityList.length(); i++) {
                    JSONObject entryItem = activityList.getJSONObject(i);
                    IncomingActivity activity = new IncomingActivity();

                    String id = entryItem.optString("activityid");
                    activity.setId(id.isEmpty() ? "" : id);

                    String title = entryItem.optString("subject");
                    activity.setTitle(title.isEmpty() ? "" : title);

                    String activityType = entryItem.optString("activitytype");
                    activity.setActivityType(activityType.isEmpty() ? "" : activityType);

                    SimpleDateFormat sdfSource = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
                    SimpleDateFormat sdfDestination = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss");
                    String dateStart = entryItem.optString("date_start") + " " + entryItem.optString("time_start");
                    String datetimeStart = "";
                    try {
                        Date date = sdfSource.parse(dateStart);
                        datetimeStart = sdfDestination.format(date);

                    } catch (ParseException e) {
                        //Log.e(ActivityListProvider.class.getSimpleName(), "Error parse date: " + e.getMessage());
                    }

                    activity.setStartDate(datetimeStart.isEmpty() ? "" : datetimeStart);

                    listItemList.add(activity);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        //Log.e(ActivityListProvider.class.getSimpleName(), "populateListItem: " + dataString);
    }

    @Override
    public void onCreate() {

    }

    @Override
    public void onDataSetChanged() {
        //Log.e(ActivityListProvider.class.getSimpleName(), "On dataset change");
        listItemList.clear();
        populateListItem();
    }

    @Override
    public void onDestroy() {

    }

    @Override
    public int getCount() {
        if (listItemList != null) {
            return listItemList.size();
        } else {
            return 0;
        }
    }

    @Override
    public RemoteViews getViewAt(int i) {
        final RemoteViews remoteView = new RemoteViews(
                context.getPackageName(), R.layout.list_row);
        IncomingActivity listItem = listItemList.get(i);
        remoteView.setTextViewText(R.id.txt_title_row_item, listItem.getTitle());
        remoteView.setTextViewText(R.id.txt_sub_title_row_item, listItem.getStartDate());

        Bundle extras = new Bundle();
        extras.putString(Constants.ACTION_ONCLICK_INCOMING_ITEM_EXTRA, listItem.getId());
        Intent fillIntent = new Intent();
        fillIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        fillIntent.putExtras(extras);
        Uri uriOpenActivity = Uri.parse("cloudprocrmsales://incoming-activity/" + listItem.getId());
        fillIntent.setData(uriOpenActivity);
        remoteView.setOnClickFillInIntent(R.id.item_row, fillIntent);

        switch (listItem.getActivityType().toLowerCase()) {
            case "call":
                remoteView.setImageViewResource(R.id.img_row_item, R.drawable.call_rounded);
                break;

            case "meeting":
                remoteView.setImageViewResource(R.id.img_row_item, R.drawable.meeting_rounded);
                break;

            default:
                remoteView.setImageViewResource(R.id.img_row_item, R.drawable.task_rounded);
                break;
        }
        return remoteView;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return appWidgetId;
    }

    @Override
    public long getItemId(int i) {
        return i;
    }

    @Override
    public boolean hasStableIds() {
        return false;
    }
}
