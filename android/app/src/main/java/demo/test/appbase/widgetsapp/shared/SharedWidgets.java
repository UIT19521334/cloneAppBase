package demo.test.appbase.widgetsapp.shared;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import demo.test.appbase.commons.Constants;
import demo.test.appbase.widgetsapp.IncomingActivityWidget;
import demo.test.appbase.widgetsapp.ProccessingTicket;
import demo.test.appbase.widgetsapp.ProccessingTicketConfigureActivity;
import demo.test.appbase.widgetsapp.services.UpdateWidgetService;

public class SharedWidgets implements ISharedWidgets {
    private static SharedWidgets INSTANCE;
    private static Context sContext;
    private static String asyncType = "";
    private SharedWidgets(Context context) {
        sContext = context;
    }

    public static SharedWidgets getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE = new SharedWidgets(context);
        }

        return INSTANCE;
    }

    @Override
    public void getIncomingList() {
        SharedPreferences pref = sContext.getSharedPreferences(Constants.ACCOUNT, sContext.MODE_PRIVATE);
        String asyncStatusString = pref.getString(Constants.INCOMING_ACTIVITY_FETCHING_DATA, "");

        if (
            asyncStatusString == null // if status is null
            || (asyncStatusString != null && asyncStatusString.isEmpty()) // OR status is not null and empty string
            || (asyncStatusString != null && !asyncStatusString.isEmpty() && asyncStatusString.equals(Constants.BEHAVIOR_FETCHED)) // Or status is not null and is not empty string and equal BEHAVIOR_FETCHED
            ) {
            try {
                String credentialsString = pref.getString(Constants.CREDENTIALS, "");
                if (credentialsString != null && !credentialsString.isEmpty()) {
                    JSONObject credentials = new JSONObject(credentialsString);
                    String serverUrl = credentials.optString("url");
                    String token = credentials.optString("token");
                    if (!serverUrl.isEmpty() && !token.isEmpty()) {
                        HttpRequestToServer httpRequestToServer = new HttpRequestToServer();
                        List<String> params = new ArrayList<>();
                        params.add(serverUrl);
                        params.add(token);
                        params.add("{\"RequestAction\":\"GetActivityList\",\"Params\":{\"filter\":\"incoming\",\"paging\":{\"order_by\":\"\",\"offset\":0,\"max_results\":50}}}");
                        asyncType = Constants.INCOMING_ACTIVITY;

                        String result = httpRequestToServer.execute(params).get();
                        SharedPreferences.Editor editor = pref.edit();
                        editor.putString(Constants.INCOMING_ACTIVITY_FETCHING_DATA, Constants.BEHAVIOR_FETCHING);
                        editor.commit();
                        //Log.d(SharedWidgets.class.getSimpleName(), "getIncomingList: " + result);
                    } else {
                        SharedPreferences.Editor editor = pref.edit();
                        editor.putString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);
                        editor.putString(Constants.INCOMING_ACTIVITY_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                        editor.commit();
                    }
                }
                else {
                    SharedPreferences.Editor editor = pref.edit();
                    editor.putString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);
                    editor.putString(Constants.INCOMING_ACTIVITY_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                    editor.commit();
                }

            } catch (JSONException | ExecutionException | InterruptedException e) {
                //Log.d(IncomingActivityWidget.class.getSimpleName(), "Error: " + e.getMessage());
                SharedPreferences.Editor editor = pref.edit();
                editor.putString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);
                editor.putString(Constants.INCOMING_ACTIVITY_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                editor.commit();
            }
        }
    }


    @Override
    public void getOpenTicketList() {
        SharedPreferences pref = sContext.getSharedPreferences(Constants.ACCOUNT, sContext.MODE_PRIVATE);
        String asyncStatusString = pref.getString(Constants.PROCESSING_TICKET_FETCHING_DATA, "");
        if (
            asyncStatusString == null // if status is null
            || (asyncStatusString != null && asyncStatusString.isEmpty()) // OR status is not null and empty string
            || (asyncStatusString != null && !asyncStatusString.isEmpty() && asyncStatusString.equals(Constants.BEHAVIOR_FETCHED)) // Or status is not null and is not empty string and equal BEHAVIOR_FETCHED
            ) {
                try {
                    String credentialsString = pref.getString(Constants.CREDENTIALS, "");
                    if (credentialsString != null && !credentialsString.isEmpty()) {
                        JSONObject credentials = new JSONObject(credentialsString);
                        String serverUrl = credentials.optString("url");
                        String token = credentials.optString("token");
                        if (!serverUrl.isEmpty() && !token.isEmpty()) {
                            HttpRequestToServer httpRequestToServer = new HttpRequestToServer();
                            List<String> params = new ArrayList<>();
                            params.add(serverUrl);
                            params.add(token);
                            CharSequence createDateConfig = ProccessingTicketConfigureActivity.loadPref(sContext, Constants.PROCESSING_TICKET_CONFIG_CREATE_DATE, "DESC");
                            CharSequence priorityConfig = ProccessingTicketConfigureActivity.loadPref(sContext, Constants.PROCESSING_TICKET_CONFIG_PRIORITY, "DESC");
                            CharSequence filterByConfig = ProccessingTicketConfigureActivity.loadPref(sContext, Constants.PROCESSING_TICKET_CONFIG_FILTER_BY, "mine");

                            String paramsString = "{\"RequestAction\":\"GetOpenTickets\",\"Params\":{\"ordering\":{\"createdtime\":\"" + createDateConfig + "\",\"priority\":\""+ priorityConfig +"\"},\"filter_by\":\""+filterByConfig+"\"}}";
                            params.add(paramsString);

                            asyncType = Constants.PROCESSING_TICKET;

                            String result = httpRequestToServer.execute(params).get();
                            SharedPreferences.Editor editor = pref.edit();
                            editor.putString(Constants.PROCESSING_TICKET_FETCHING_DATA, Constants.BEHAVIOR_FETCHING);
                            editor.commit();
                        } else {
                            SharedPreferences.Editor editor = pref.edit();
                            editor.putString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);
                            editor.putString(Constants.PROCESSING_TICKET_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                            editor.commit();
                        }
                    }
                    else {
                        SharedPreferences.Editor editor = pref.edit();
                        editor.putString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);
                        editor.putString(Constants.PROCESSING_TICKET_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                        editor.commit();
                    }

                } catch (JSONException | ExecutionException | InterruptedException e) {
                    //Log.d(IncomingActivityWidget.class.getSimpleName(), "Error: " + e.getMessage());
                    SharedPreferences.Editor editor = pref.edit();
                    editor.putString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);
                    editor.putString(Constants.PROCESSING_TICKET_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                    editor.commit();
                }
            }
    }

    class HttpRequestToServer extends AsyncTask<List<String>, Void, String> {

        @Override
        protected String doInBackground(List<String>... lists) {
            //Log.e(SharedWidgets.class.getSimpleName(), "======== Request params: " + lists[0].get(2));
            final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
            RequestBody formBody = RequestBody.create(JSON, lists[0].get(2));
            OkHttpClient client = new OkHttpClient();
            //Log.e(HttpRequestToServer.class.getSimpleName(), "doInBackground: " + lists.toString() );
            Request request = new Request.Builder()
                    .url(lists[0].get(0))
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .header("Token", lists[0].get(1))
                    .post(formBody)
                    .build();
            Response response = null;
            String result = "{}";
            try {
                response = client.newCall(request).execute();
                if(response.isSuccessful()){
                    result = response.body().string();
                }
                else if(response.code() == 401){
                    //Log.e(SharedWidgets.class.getSimpleName(), "doInBackground response: " + response.code() );
                    SharedPreferences pref = sContext.getSharedPreferences(Constants.ACCOUNT, sContext.MODE_PRIVATE);
                    SharedPreferences.Editor editor = pref.edit();
                    editor.putString(Constants.ACCOUNT_STATUS, Constants.UN_AUTHENTICATION);
                    editor.putString(Constants.INCOMING_ACTIVITY_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                    editor.putString(Constants.PROCESSING_TICKET_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                    editor.commit();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return result.isEmpty() ? "{}" : result;
        }

        @Override
        protected void onPostExecute(String result){
            super.onPostExecute(result);
            //Log.e(">>>>>>>", result);
            //Log.e(">>>Async Type", asyncType);

            // Save entry list to local storage
            String dataActivities = "[]";
            try {
                JSONObject dataResponse = new JSONObject(result);
                if (dataResponse != null && dataResponse.optString("success").equals("1")) {
                    JSONArray entryList = dataResponse.getJSONArray("entry_list");
                    if (entryList != null && entryList.length() > 0) {
                        dataActivities = entryList.toString();
                    }
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }

            if (asyncType.equals(Constants.INCOMING_ACTIVITY)){
                SharedPreferences pref = sContext.getSharedPreferences(Constants.INCOMING_ACTIVITY, sContext.MODE_PRIVATE);
                SharedPreferences.Editor editor = pref.edit();
                editor.putString(Constants.INCOMING_ACTIVITY_DATA, dataActivities);
                editor.putString(Constants.INCOMING_ACTIVITY_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                editor.commit();

                // Trigger reload widgets
                Intent intent = new Intent(sContext, IncomingActivityWidget.class);
                intent.setAction(UpdateWidgetService.ACTION_UPDATE_INCOMING_LIST);
                ComponentName componentName=new ComponentName(sContext,getClass().getName());
                AppWidgetManager appWidgetManager=AppWidgetManager.getInstance(sContext);
                int[] appWidgetIds=appWidgetManager.getAppWidgetIds(componentName);
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
                sContext.sendBroadcast(intent);
            }
            else if (asyncType.equals(Constants.PROCESSING_TICKET)) {
                SharedPreferences pref = sContext.getSharedPreferences(Constants.PROCESSING_TICKET, sContext.MODE_PRIVATE);
                SharedPreferences.Editor editor = pref.edit();
                editor.putString(Constants.PROCESSING_TICKET_DATA, dataActivities);
                editor.putString(Constants.PROCESSING_TICKET_FETCHING_DATA, Constants.BEHAVIOR_FETCHED);
                editor.commit();

                // Trigger reload widgets
                Intent intent = new Intent(sContext, ProccessingTicket.class);
                intent.setAction(Constants.ACTION_UPDATE_TICKET_LIST);
                ComponentName componentName=new ComponentName(sContext,getClass().getName());
                AppWidgetManager appWidgetManager=AppWidgetManager.getInstance(sContext);
                int[] appWidgetIds=appWidgetManager.getAppWidgetIds(componentName);
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
                sContext.sendBroadcast(intent);
            }
        }
    }
}
