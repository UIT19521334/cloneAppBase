package demo.test.appbase.commons;

import android.app.KeyguardManager;
import android.content.Context;
import android.os.Build;
import android.os.PowerManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class DetectLockScreen extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  public DetectLockScreen(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
    return "DetectLockScreen";
  }

  @ReactMethod
  public void isLockScreen(Promise promise) {
    if(isDeviceLocked(reactContext)) {
     promise.resolve("LOCKED"); 
    }
    else {
      promise.resolve("UNLOCK"); 
    }
  }

  /**
 * Returns true if the device is locked or screen turned off (in case password not set)
 */
 private boolean isDeviceLocked(Context context) {
    boolean isLocked = false;

    // First we check the locked state
    KeyguardManager keyguardManager = (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);
    boolean inKeyguardRestrictedInputMode = keyguardManager.inKeyguardRestrictedInputMode();

    if (inKeyguardRestrictedInputMode) {
        isLocked = true;

    } else {
        // If password is not set in the settings, the inKeyguardRestrictedInputMode() returns false,
        // so we need to check if screen on for this case
        PowerManager powerManager = (PowerManager)context.getSystemService(Context.POWER_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            isLocked = !powerManager.isInteractive();
        } else {
            //noinspection deprecation
            isLocked = !powerManager.isScreenOn();
        }
    }

     return isLocked;
  }

}