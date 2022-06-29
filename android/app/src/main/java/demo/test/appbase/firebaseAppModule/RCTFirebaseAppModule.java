package demo.test.appbase.firebaseAppModule;

import android.content.Context;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class RCTFirebaseAppModule extends ReactContextBaseJavaModule {
    private static String TAG = "RCTFirebaseAppModule";
    private static Context reactContext;

    public RCTFirebaseAppModule(@Nullable ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "FirebaseAppModule";
    }

    @ReactMethod
    public void deleteAll() {
        if (FirebaseApp.getApps(reactContext).size() > 0) {
            for (int i = 0; i < FirebaseApp.getApps(reactContext).size() - 1; i++) {
                FirebaseApp.getApps(reactContext).get(i).delete();
            }
        }
    }

    @ReactMethod
    public void delete(String instanceName) {
        if (FirebaseApp.getApps(reactContext).size() - 1 > 0) {
            FirebaseApp firebaseApp = FirebaseApp.getInstance(instanceName);
            firebaseApp.delete();
        }
    }

    @ReactMethod
    public void initialize(String projectId, String appId, String apiKey, String senderId, Promise promise) {

        if (projectId.isEmpty() || appId.isEmpty() || apiKey.isEmpty()) {
            try {
                deleteAll();
                promise.reject("Error", "Initialize Firebase failure!");
            }
            catch (Exception e) {
                Log.e(TAG, e.getMessage());
                promise.reject("Error", e.getMessage());
            }
            return;
        }

        // delete current Firebase App
        try {
            delete(FirebaseApp.DEFAULT_APP_NAME);
        }
        catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }

        // Manually configure Firebase Options. The following fields are REQUIRED:
        //   - Project ID
        //   - App ID
        //   - API Key
        FirebaseOptions options = new FirebaseOptions.Builder()
                .setProjectId(projectId)
                .setApplicationId(appId)
                .setApiKey(apiKey)
                .build();

        // Initialize with other app
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            FirebaseApp.getApps(reactContext)
                    .stream()
                    .filter(firebaseApp -> firebaseApp.getName().equals(FirebaseApp.DEFAULT_APP_NAME))
                    .findFirst()
                    .orElseGet(() -> FirebaseApp.initializeApp(reactContext /* Context */, options, FirebaseApp.DEFAULT_APP_NAME));

            promise.resolve("Initialize Firebase successful!");
        }
        else {
            if (FirebaseApp.getApps(reactContext).isEmpty()) {
                FirebaseApp.initializeApp(reactContext /* Context */, options, FirebaseApp.DEFAULT_APP_NAME);
                promise.resolve("Initialize Firebase successful!");
            }
            else {
                try {
                    FirebaseApp firebaseApp = FirebaseApp.getInstance(FirebaseApp.DEFAULT_APP_NAME);
                    if (firebaseApp == null) {
                        FirebaseApp.initializeApp(reactContext /* Context */, options, FirebaseApp.DEFAULT_APP_NAME);
                    }
                    promise.resolve("Initialize Firebase successful!");
                } catch (IllegalStateException illegalStateException) {
                    Log.e(TAG, illegalStateException.getMessage());
                    FirebaseApp.initializeApp(reactContext /* Context */, options, FirebaseApp.DEFAULT_APP_NAME);
                    promise.resolve("Initialize Firebase successful!");
                } catch (Exception e) {
                    Log.e(TAG, e.getMessage());
                    FirebaseApp.initializeApp(reactContext /* Context */, options, FirebaseApp.DEFAULT_APP_NAME);
                    promise.resolve("Initialize Firebase successful!");
                }

            }
        }
    }
}
