package demo.test.appbase;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;
import android.media.MediaPlayer;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;// <-- add this line
import com.facebook.react.ReactRootView;// <-- add this line
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.AutocompleteSessionToken;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.api.net.PlacesClient;
import com.google.android.libraries.places.widget.Autocomplete;
import com.google.android.libraries.places.widget.model.AutocompleteActivityMode;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;// <-- add this line
import com.stringeereactnative.StringeeAudioManager;
import java.util.Arrays;
import java.util.List;
// Add the following imports
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.stringee.StringeeClient;
import io.invertase.notifee.NotifeeApiModule;
import java.io.IOException;

public class MainActivity extends ReactActivity {
  public static StringeeClient client;
  public static StringeeAudioManager audioManager;
  public static PlacesClient placesClient = null;
  public static Context contextMainActivity = null;
  
  @Override
  public void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    contextMainActivity = this;
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return NotifeeApiModule.getMainComponent("CloneAppBase");
  }

  @Override// <-- add this line
  protected ReactActivityDelegate createReactActivityDelegate() {// <-- add this line
    return new ReactActivityDelegate(this, getMainComponentName()) {// <-- add this line
      @Override// <-- add this line
      protected ReactRootView createRootView() {// <-- add this line
       return new RNGestureHandlerEnabledRootView(MainActivity.this);// <-- add this line
      }// <-- add this line
    };// <-- add this line
  }// <-- add this line
}
