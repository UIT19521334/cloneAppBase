package demo.test.appbase;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import demo.test.appbase.commons.CheckPermission;
import demo.test.appbase.commons.DetectLockScreen;
import demo.test.appbase.communicationsModule.RCTCommunicationsModule;
import demo.test.appbase.firebaseAppModule.RCTFirebaseAppModule;
import demo.test.appbase.placeIDModule.RCTPlaceIDModule;
import demo.test.appbase.stringee.custom.RNStringeeCall2CustomModule;
import demo.test.appbase.stringee.custom.RNStringeeCallCustomModule;
import demo.test.appbase.stringee.custom.RNStringeeClientCustomModule;
import demo.test.appbase.stringee.custom.StringeeModule;
import demo.test.appbase.widgetsHelper.WidgetsHelper;

public class CustomModulePackage implements ReactPackage {

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<NativeModule> createNativeModules(
                              ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();

    modules.add(new DetectLockScreen(reactContext));
    modules.add(new RCTPlaceIDModule(reactContext));
    modules.add(new RCTFirebaseAppModule(reactContext));
    modules.add(new CheckPermission(reactContext));
    modules.add(new StringeeModule(reactContext));
    modules.add(new RNStringeeCallCustomModule(reactContext));
    modules.add(new RNStringeeCall2CustomModule(reactContext));
    modules.add(new RNStringeeClientCustomModule(reactContext));
    modules.add(new WidgetsHelper(reactContext));
    modules.add(new RCTCommunicationsModule(reactContext));
    return modules;
  }

}
