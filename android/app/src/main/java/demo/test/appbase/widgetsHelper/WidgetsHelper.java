package demo.test.appbase.widgetsHelper;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import demo.test.appbase.commons.Constants;
import demo.test.appbase.widgetsapp.IncomingActivityWidget;
import demo.test.appbase.widgetsapp.ProccessingTicket;

public class WidgetsHelper extends ReactContextBaseJavaModule {
    private static final int MODE_PRIVATE = Context.MODE_PRIVATE;
    private static String TAG = WidgetsHelper.class.getSimpleName();
    private static ReactApplicationContext reactContext;

    public WidgetsHelper(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "WidgetsHelper";
    }

    @ReactMethod
    public void setCredentials(String credentials){
        //Log.d(TAG, "Credentials information: " + credentials);

        // -------------------- Save information credentials use for the call API reload data
        SharedPreferences pref = reactContext.getSharedPreferences(Constants.ACCOUNT, MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(Constants.CREDENTIALS, credentials);
        editor.putString(Constants.ACCOUNT_STATUS, Constants.AUTHENTICATION);
        editor.commit();

        // ---------------------- Start: Reload Incoming Activity Widget -------------------------------
        
        Intent intent = new Intent(getCurrentActivity().getApplicationContext(), IncomingActivityWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(getCurrentActivity().getApplicationContext()).getAppWidgetIds(new ComponentName(getCurrentActivity().getApplicationContext(), IncomingActivityWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        getCurrentActivity().getApplicationContext().sendBroadcast(intent);
        // ---------------------- End: Reload Incoming Activity Widget -------------------------------

        // ---------------------- Start: Reload Processing Ticket Widget -------------------------------
        Intent intentTicket = new Intent(getCurrentActivity().getApplicationContext(), ProccessingTicket.class);
        intentTicket.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] idsTicket = AppWidgetManager.getInstance(getCurrentActivity().getApplicationContext()).getAppWidgetIds(new ComponentName(getCurrentActivity().getApplicationContext(), ProccessingTicket.class));
        intentTicket.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsTicket);
        getCurrentActivity().getApplicationContext().sendBroadcast(intentTicket);
        // ---------------------- End: Reload Processing Ticket Widget -------------------------------

    }

    @ReactMethod
    public void setIncomingData(String data){
        //Log.d(TAG, "Incoming activity data information: " + data);
        // -------------------- Save Incoming activity data to cache
        SharedPreferences pref = reactContext.getSharedPreferences(Constants.INCOMING_ACTIVITY, MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(Constants.INCOMING_ACTIVITY_DATA, data);
        editor.commit();

        // ---------------------- Start: Reload Incoming Activity Widget -------------------------------
        Intent intent = new Intent(getCurrentActivity().getApplicationContext(), IncomingActivityWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(getCurrentActivity().getApplicationContext()).getAppWidgetIds(new ComponentName(getCurrentActivity().getApplicationContext(), IncomingActivityWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        getCurrentActivity().getApplicationContext().sendBroadcast(intent);
        // ---------------------- End: Reload Incoming Activity Widget -------------------------------
    }

    @ReactMethod
    public void setMetaDataActivityStatus(String data){
        //Log.d(TAG, "Meta Data Activity Status information: " + data);
        // -------------------- Save Meta data activity status data to cache
        SharedPreferences pref = reactContext.getSharedPreferences(Constants.INCOMING_ACTIVITY, MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(Constants.META_DATA_ACTIVITY_STATUS, data);
        editor.commit();
    }

    @ReactMethod
    public void setProcessingTicketData(String data) {
        //Log.d(TAG, "Processing ticket data information: " + data);
        // -------------------- Save information ticket data to cache
        SharedPreferences pref = reactContext.getSharedPreferences(Constants.PROCESSING_TICKET, MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(Constants.PROCESSING_TICKET_DATA, data);
        editor.commit();

        // ---------------------- Start: Reload Processing Ticket Widget -------------------------------
        Intent intentTicket = new Intent(getCurrentActivity().getApplicationContext(), ProccessingTicket.class);
        intentTicket.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] idsTicket = AppWidgetManager.getInstance(getCurrentActivity().getApplicationContext()).getAppWidgetIds(new ComponentName(getCurrentActivity().getApplicationContext(), ProccessingTicket.class));
        intentTicket.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsTicket);
        getCurrentActivity().getApplicationContext().sendBroadcast(intentTicket);
        // ---------------------- End: Reload Processing Ticket Widget -------------------------------
    }

    @ReactMethod
    public void setMetaDataTicket(String data){
        //Log.d(TAG, "Meta Data Ticket Status information: " + data);
        // -------------------- Save Meta data Ticket status to cache
        SharedPreferences pref = reactContext.getSharedPreferences(Constants.PROCESSING_TICKET, MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(Constants.PROCESSING_TICKET_DATA_ENUM_LIST, data);
        editor.commit();
    }
}
