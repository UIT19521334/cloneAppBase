package demo.test.appbase.widgetsapp.factory;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

import demo.test.appbase.R;
import demo.test.appbase.commons.Constants;
import demo.test.appbase.widgetsapp.models.EnumOption;
import demo.test.appbase.widgetsapp.models.ProcessTicket;

public class TicketListProvider implements RemoteViewsService.RemoteViewsFactory {
    private List<ProcessTicket> listItemList = new ArrayList();
    private Context context = null;
    private int appWidgetId;
    private static final String TAG = TicketListProvider.class.getSimpleName();

    public TicketListProvider(Context applicationContext, Intent intent) {
        this.context = applicationContext;
        appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID);

        populateListItem();
    }

    private void populateListItem() {

        SharedPreferences pref = context.getSharedPreferences(Constants.PROCESSING_TICKET, context.MODE_PRIVATE);
        String dataString = pref.getString(Constants.PROCESSING_TICKET_DATA, "[]");
        try {
            JSONArray activityList = new JSONArray(dataString);
            if (activityList != null && (activityList.length() > 0)) {
                listItemList.addAll(ProcessTicket.toList(activityList));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        //Log.e(TicketListProvider.class.getSimpleName(), "populateListItem: " + listItemList);
    }

    @Override
    public void onCreate() {

    }

    @Override
    public void onDataSetChanged() {
        //Log.e(TicketListProvider.class.getSimpleName(), "On dataset change");
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
                context.getPackageName(), R.layout.ticket_list_row);
        ProcessTicket listItem = listItemList.get(i);
        //Log.e(TAG, "getViewAt: " + listItem.toString() + ", Title: " + listItem.getTitle());
        remoteView.setTextViewText(R.id.txt_ticket_title, listItem.getTitle());
        remoteView.setTextViewText(R.id.txt_ticket_time, listItem.getTime());

        Bundle extras = new Bundle();
        extras.putString(Constants.ACTION_ONCLICK_TICKET_ITEM_EXTRA, listItem.getTicketId());
        Intent fillIntent = new Intent();
        fillIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        fillIntent.putExtras(extras);
        Uri uriOpenTicket = Uri.parse("cloudprocrmsales://process-ticket/" + listItem.getTicketId());
        fillIntent.setData(uriOpenTicket);
        remoteView.setOnClickFillInIntent(R.id.item_ticket_row, fillIntent);

        if (listItem.getPriority() == null || "".equalsIgnoreCase(listItem.getPriority())) {
            remoteView.setViewVisibility(R.id.view_priority_ticket, View.GONE);
            remoteView.setTextViewText(R.id.txt_ticket_priority, "");

        }
        else {
            remoteView.setViewVisibility(R.id.view_priority_ticket, View.VISIBLE);
            EnumOption optionTicketPriority = EnumOption.getEumObject(context, "ticketpriorities", listItem.getPriority());
            remoteView.setTextViewText(R.id.txt_ticket_priority, optionTicketPriority.getLabel().isEmpty() ? listItem.getPriority() : optionTicketPriority.getLabel());

        }

        if (listItem.getCategory() == null || "".equalsIgnoreCase(listItem.getCategory())) {
            remoteView.setViewVisibility(R.id.view_category_ticket, View.GONE);
            remoteView.setTextViewText(R.id.txt_ticket_category, "");
        }
        else {
            remoteView.setViewVisibility(R.id.view_category_ticket, View.VISIBLE);
            EnumOption optionTicketCategory = EnumOption.getEumObject(context, "ticketcategories", listItem.getCategory());
            remoteView.setTextViewText(R.id.txt_ticket_category, optionTicketCategory.getKey().isEmpty() ? listItem.getCategory() : optionTicketCategory.getLabel());
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
