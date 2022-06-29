package demo.test.appbase.stringee.custom;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.app.Activity;
import android.view.WindowManager;
import android.content.Context;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import java.util.Timer;
import java.util.TimerTask;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class IncomingCallModule extends ReactContextBaseJavaModule {

    public static ReactApplicationContext reactContext;
    public static Activity mainActivity;

    private static final String TAG = "RNIC:IncomingCallModule";
    private WritableMap headlessExtras;
    private String currentUuid = "";
    private String currentName = "";
    private String currentAvatar = "";
    private String currentInfo = "";
    private String currentCompanyName = "";

    public IncomingCallModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        mainActivity = getCurrentActivity();
    }

    @Override
    public String getName() {
        return "IncomingCallCustom";
    }

    @ReactMethod
    public void display(String uuid, String name, String avatar, String info, String company, int timeout) {

        if (UnlockScreenActivity.active) {
            return;
        }
        if (reactContext != null) {

            this.setCurrentCallKit(uuid, name, avatar, info, company);

            Bundle bundle = new Bundle();
            bundle.putString("uuid", uuid);
            bundle.putString("name", name);
            bundle.putString("avatar", avatar);
            bundle.putString("info", info);
            bundle.putString("company", company);
            Intent i = new Intent(reactContext, UnlockScreenActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET +
            Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT +
            Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
            
            i.putExtras(bundle);
            reactContext.startActivity(i);

            if (timeout > 0) {
                new Timer().schedule(new TimerTask() {          
                    @Override
                    public void run() {
                        // this code will be executed after timeout seconds
                        UnlockScreenActivity.dismissIncoming();
                    }
                }, timeout);
            }
        }
    }

    @ReactMethod
    public void display1(String uuid, String name, String avatar, String info, String company, int timeout) {

        if (AnswerScreenActivity.active) {
            return;
        }
        if (reactContext != null) {
            Bundle bundle = new Bundle();
            bundle.putString("uuid", uuid);
            bundle.putString("name", name);
            bundle.putString("avatar", avatar);
            bundle.putString("info", info);
            bundle.putString("company", company);
            Intent i = new Intent(reactContext, AnswerScreenActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET +
                    Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT +
                    Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);

            i.putExtras(bundle);
            reactContext.startActivity(i);
        }
    }

    private void setCurrentCallKit(String uuid, String name, String avatar, String info, String company) {
        this.currentUuid = uuid;
        this.currentName = name;
        this.currentAvatar = avatar;
        this.currentInfo = info;
        this.currentCompanyName = company;
    }

      @ReactMethod
    public void setCallActive(String uuid) {
        //Log.w(TAG, "UUID: " + uuid + " - Current UUID: " + currentUuid);
         if (uuid.equals(currentUuid)) {
             //Log.w(TAG, "Corrected uuid ");

             if (AnswerScreenActivity.active) {
                return;
            }

             if (reactContext != null) {
                 Bundle bundle = new Bundle();
                 bundle.putString("uuid", uuid);
                 bundle.putString("name", currentName);
                 bundle.putString("avatar", currentAvatar);
                 bundle.putString("info", currentInfo);
                 bundle.putString("company", currentCompanyName);
                 Intent i = new Intent(reactContext, AnswerScreenActivity.class);
                 i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                 i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET +
                         Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT +
                         Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);

                 i.putExtras(bundle);
                 reactContext.startActivity(i);
             }

         }
         else {
             return;
         }
    }

    @ReactMethod
    public void dismiss() {
        UnlockScreenActivity.dismissIncoming();
        return;
    }

    @ReactMethod
    public void dismissAnswer() {
        AnswerScreenActivity.dismissAnswerCall();
        return;
    }

    @ReactMethod
    public void setMute(String isMute) {
        //Log.w(TAG, "HAS call setMute func " + isMute);
        Intent intent = new Intent("setMuteEvent");
        intent.putExtra("isMute", isMute.equals("ON"));
        LocalBroadcastManager.getInstance(getAppContext()).sendBroadcast(intent);
    }

    @ReactMethod
    public void setSpeaker(String isSpeaker) {
        //Log.w(TAG, "HAS call setMute func " + isSpeaker);
        Intent intent = new Intent("setSpeakerEvent");
        intent.putExtra("isMute", isSpeaker.equals("ON"));
        LocalBroadcastManager.getInstance(getAppContext()).sendBroadcast(intent);
    }

    private Context getAppContext() {
        return this.reactContext.getApplicationContext();
    }

    @ReactMethod
    public void backToForeground() {
        Context context = getAppContext();
        String packageName = context.getApplicationContext().getPackageName();
        Intent focusIntent = context.getPackageManager().getLaunchIntentForPackage(packageName).cloneFilter();
        Activity activity = getCurrentActivity();
        boolean isOpened = activity != null;
        //Log.d(TAG, "backToForeground, app isOpened ?" + (isOpened ? "true" : "false"));

        if (isOpened) {
            focusIntent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            activity.startActivity(focusIntent);
        }
    }

    @ReactMethod
    public void backToMyApp() {
        Context context = getAppContext();
        Uri uriSignIn = Uri.parse("cloudprocrmsales://");
        Intent intentSignIn = new Intent(Intent.ACTION_VIEW, uriSignIn);
        if ((Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)){
            intentSignIn.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        }
        context.startActivity(intentSignIn);
    }

    @SuppressLint("WrongConstant")
    @ReactMethod
    public void openAppFromHeadlessMode(String uuid) {
        Context context = getAppContext();
        String packageName = context.getApplicationContext().getPackageName();
        Intent focusIntent = context.getPackageManager().getLaunchIntentForPackage(packageName).cloneFilter();
        Activity activity = getCurrentActivity();
        boolean isOpened = activity != null;

        if (!isOpened) {
            focusIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

            final WritableMap response = new WritableNativeMap();
            response.putBoolean("isHeadless", true);
            response.putString("uuid", uuid);

            this.headlessExtras = response;

            getReactApplicationContext().startActivity(focusIntent);
        }
    }

    @ReactMethod
    public void getExtrasFromHeadlessMode(Promise promise) {
        if (this.headlessExtras != null) {
            promise.resolve(this.headlessExtras);

            this.headlessExtras = null;

            return;
        }

        promise.resolve(null);
    }
}
