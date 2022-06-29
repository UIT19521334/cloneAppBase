package demo.test.appbase.communicationsModule;

import android.content.Intent;
import android.net.Uri;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

public class RCTCommunicationsModule extends ReactContextBaseJavaModule {
    private static String TAG = "RCTCommunicationsModule";
    private static ReactApplicationContext reactContext;

    public RCTCommunicationsModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "CommunicationsModule";
    }

    // Xu ly make phone call
    @ReactMethod
    public void phoneCall(String phoneNumber, Promise promise) {
        try {
            Intent intent = new Intent(Intent.ACTION_DIAL);
            intent.setData(Uri.parse("tel:" + phoneNumber));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
        } catch (Exception e) {
            promise.reject("Error", e.getMessage());
        } finally {
            promise.resolve("Make phone call to " + phoneNumber +" successful!");
        }
    }

    // Xu ly make send sms
    @ReactMethod
    public void text(String phoneNumber, String body, Promise promise) {
        try {
            Uri sms_uri = Uri.parse("smsto:" +phoneNumber);
            Intent sms_intent = new Intent(Intent.ACTION_SENDTO, sms_uri);
            sms_intent.putExtra("sms_body", body);
            sms_intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(sms_intent);

        } catch (Exception e) {
            promise.reject("Error", e.getMessage());
        } finally {
            promise.resolve("Make phone call to " + phoneNumber +" successful!");
        }
    }

    // Xu ly make send sms
    @ReactMethod
    public void email(ReadableArray addresses, ReadableArray addressesCC, ReadableArray addressesBCC, String subject, String message, Promise promise) {
        try {
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setData(Uri.parse("mailto:"));
            intent.setType("*/*");

            String[] emailsValue = null;

            if (addresses != null && (addresses.size() > 0)) {
                emailsValue = addresses.toArrayList().toArray(new String[0]);
            }
            else {
                emailsValue = new String[0];
            }

            String[] emailsCCValue = null;

            if (addressesCC != null && (addressesCC.size() > 0)) {
                emailsCCValue = addressesCC.toArrayList().toArray(new String[0]);
            }
            else {
                emailsCCValue = new String[0];
            }


            String[] emailsBCCValue = null;

            if (addressesBCC != null && (addressesBCC.size() > 0)) {
                emailsBCCValue = addressesBCC.toArrayList().toArray(new String[0]);
            }
            else {
                emailsBCCValue = new String[0];
            }

            intent.putExtra(Intent.EXTRA_EMAIL, emailsValue);
            intent.putExtra(Intent.EXTRA_CC, emailsCCValue);
            intent.putExtra(Intent.EXTRA_BCC, emailsBCCValue);
            intent.putExtra(Intent.EXTRA_SUBJECT, subject == null ? "" : subject);
            intent.putExtra(Intent.EXTRA_TEXT, message == null ? "" : message);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
        } catch (Exception e) {
            promise.reject("Error", e.getMessage());
        } finally {
            promise.resolve("Make send email successful!");
        }
    }

}
