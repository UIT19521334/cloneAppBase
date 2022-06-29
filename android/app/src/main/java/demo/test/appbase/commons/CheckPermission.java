package demo.test.appbase.commons;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CheckPermission extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    public CheckPermission(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "CheckPermissionAndroid";
    }

    @ReactMethod
    public void checkAutoStart() {
        try
        {
            //Open the specific App Info page:
            Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
            getCurrentActivity().startActivity(intent);
        }
        catch ( ActivityNotFoundException e )
        {
            //Open the generic Apps page:
            Intent intent = new Intent(android.provider.Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS);
            getCurrentActivity().startActivity(intent);
        }
//        AutoStartHelper.getInstance().getAutoStartPermission(reactContext, getCurrentActivity());
    }
}
