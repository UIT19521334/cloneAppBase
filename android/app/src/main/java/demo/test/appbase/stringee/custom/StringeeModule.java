package demo.test.appbase.stringee.custom;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.stringee.StringeeClient;
import com.stringee.call.StringeeCall;
import com.stringee.call.StringeeCall2;
import com.stringee.exception.StringeeError;
import com.stringee.listener.StatusListener;
import com.stringee.listener.StringeeConnectionListener;
import com.stringeereactnative.StringeeAudioManager;

import org.json.JSONObject;

import java.util.Set;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import demo.test.appbase.MainActivity;
import demo.test.appbase.stringee.custom.Commons;
import demo.test.appbase.commons.Helper;

public class StringeeModule extends ReactContextBaseJavaModule {
    public static ReactApplicationContext reactContext;
    public static Activity mainActivity;
    private StringeeCall mStringeeCall;
    private Handler handler;
    private static final String TAG = "RNIC:StringeeModules";

    public StringeeModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        mainActivity = getCurrentActivity();
    }

    @NonNull
    @Override
    public String getName() {
        return "StringeeModules";
    }

    @ReactMethod
    public void appRunning(Promise promise) {
        try {
            if (Helper.isAppRunning(reactContext, "demo.test.appbase")){
                promise.resolve("RUNNING");
            }
            else {
                promise.resolve("NOT_RUNNING");
            }
        }
        catch (Exception e) {
            promise.reject("Error", e.getMessage());
        }

    }


    @ReactMethod
    public void disconnect() {
        if (MainActivity.client != null) {
            MainActivity.client.disconnect();
        }
    }

    @ReactMethod
    public void initAnswer(String callId, Callback callback) {

        if (MainActivity.client == null || !MainActivity.client.isConnected()) {
            //Log.d(TAG, "StringeeClient is not initialized or connected.");
            callback.invoke(false, -1, "StringeeClient is not initialized or connected.");
            return;
        }

        if (callId == null || callId.isEmpty()) {
            //Log.d(TAG, "The call id is invalid.");
            callback.invoke(false, -2, "The call id is invalid.");
            return;
        }

        mStringeeCall = Commons.callsMap.get(callId);

        if (mStringeeCall == null) {
            //Log.d(TAG, "The call is not found.");
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        handler = new Handler(Looper.getMainLooper());
        handler.post(new Runnable() {
            @Override
            public void run() {
                StringeeAudioManager audioManager = StringeeAudioManager.create(getReactApplicationContext());
                audioManager.start(new StringeeAudioManager.AudioManagerEvents() {
                    @Override
                    public void onAudioDeviceChanged(StringeeAudioManager.AudioDevice selectedAudioDevice, Set<StringeeAudioManager.AudioDevice> availableAudioDevices) {
                        if (!mStringeeCall.isVideoCall()) {
                            switch (selectedAudioDevice) {
                                case WIRED_HEADSET:
                                    audioManager.setSpeakerphoneOn(false);
                                    break;
                                case BLUETOOTH:
                                    audioManager.setSpeakerphoneOn(false);
                                    break;
                                case SPEAKER_PHONE:
                                    audioManager.setSpeakerphoneOn(mStringeeCall.isVideoCall());
                                    break;
                            }
                        } else {
                            if (selectedAudioDevice == StringeeAudioManager.AudioDevice.WIRED_HEADSET || selectedAudioDevice == StringeeAudioManager.AudioDevice.BLUETOOTH) {
                                audioManager.setSpeakerphoneOn(false);
                            } else {
                                audioManager.setSpeakerphoneOn(true);
                            }
                        }
                        //Log.d("Stringee", "onAudioManagerDevicesChanged: " + availableAudioDevices + ", "
                                // + "selected: " + selectedAudioDevice);
                    }
                });
                MainActivity.audioManager = audioManager;
            }
        });

        mStringeeCall.setCallListener(new StringeeCall.StringeeCallListener() {
            @Override
            public void onSignalingStateChange(StringeeCall stringeeCall, StringeeCall.SignalingState signalingState, String s, int i, String s1) {

                //Log.d(TAG, "StringeeCall SignalingState" + signalingState);
            }

            @Override
            public void onError(StringeeCall stringeeCall, int i, String s) {
                //Log.d(TAG, "StringeeCall onError" + i + " - " + s);
            }

            @Override
            public void onHandledOnAnotherDevice(StringeeCall stringeeCall, StringeeCall.SignalingState signalingState, String s) {
                //Log.d(TAG, "StringeeCall onHandledOnAnotherDevice" + signalingState);
            }

            @Override
            public void onMediaStateChange(StringeeCall stringeeCall, StringeeCall.MediaState mediaState) {
                //Log.d(TAG, "StringeeCall onMediaStateChange" + mediaState);
            }

            @Override
            public void onLocalStream(StringeeCall stringeeCall) {
                //Log.d(TAG, "StringeeCall onLocalStream callId" + stringeeCall.getCallId());
            }

            @Override
            public void onRemoteStream(StringeeCall stringeeCall) {
                //Log.d(TAG, "StringeeCall onRemoteStream callId" + stringeeCall.getCallId());
            }

            @Override
            public void onCallInfo(StringeeCall stringeeCall, JSONObject jsonObject) {
                //Log.d(TAG, "StringeeCall onCallInfo" + jsonObject.toString());
            }
        });

        mStringeeCall.ringing(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });

        callback.invoke(true, 0, "Success");
    }

    @ReactMethod
    public void initAndConnectStringee(String token) {

        if (MainActivity.client == null) {
            MainActivity.client = new StringeeClient(reactContext);

            MainActivity.client.setConnectionListener(new StringeeConnectionListener() {
                @Override
                public void onConnectionConnected(StringeeClient stringeeClient, boolean b) {
                    //Log.d(TAG, "Stringee connected with "+ stringeeClient.getUserId());
                    WritableMap params = Arguments.createMap();
                    params.putString("userId", stringeeClient.getUserId());
                    params.putInt("projectId", stringeeClient.getProjectId());
                    params.putBoolean("isReconnecting", b);
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onConnectedNative", params);
                }

                @Override
                public void onConnectionDisconnected(StringeeClient stringeeClient, boolean b) {
                    //Log.d(TAG, "Stringee disconnected! ");
                    WritableMap params = Arguments.createMap();
                    params.putString("userId", stringeeClient.getUserId());
                    params.putInt("projectId", stringeeClient.getProjectId());
                    params.putBoolean("isReconnecting", b);
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onDisconnectedNative", params);
                }

                @Override
                public void onIncomingCall(StringeeCall stringeeCall) {
                    //Log.d(TAG, "Stringee onIncomingCall width callid: " + stringeeCall.getCallId());

                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if (Commons.isInCall) {
                                stringeeCall.reject();
                            } else {
                                Commons.callsMap.put(stringeeCall.getCallId(), stringeeCall);
                                WritableMap params = Arguments.createMap();
                                if (MainActivity.client != null) {
                                    params.putString("userId", MainActivity.client.getUserId());
                                }
                                params.putString("callId", stringeeCall.getCallId());
                                params.putString("from", stringeeCall.getFrom());
                                params.putString("to", stringeeCall.getTo());
                                params.putString("fromAlias", stringeeCall.getFromAlias());
                                params.putString("toAlias", stringeeCall.getToAlias());
                                int callType = 1;
                                if (stringeeCall.isPhoneToAppCall()) {
                                    callType = 3;
                                }
                                params.putInt("callType", callType);
                                params.putBoolean("isVideoCall", stringeeCall.isVideoCall());
                                params.putString("customDataFromYourServer", stringeeCall.getCustomDataFromYourServer());

                                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onIncomingCallNative", params);
                            }
                        }
                    });
                }

                @Override
                public void onIncomingCall2(StringeeCall2 stringeeCall2) {
                    //Log.d(TAG, "Stringee StringeeCall2 width callid:" + stringeeCall2.getCallId());
                    WritableMap params = Arguments.createMap();
                    if (MainActivity.client != null) {
                        params.putString("userId", MainActivity.client.getUserId());
                    }
                    params.putString("callId", stringeeCall2.getCallId());
                    params.putString("from", stringeeCall2.getFrom());
                    params.putString("to", stringeeCall2.getTo());
                    params.putString("fromAlias", stringeeCall2.getFromAlias());
                    params.putString("toAlias", stringeeCall2.getToAlias());
                    int callType = 2;
                    params.putInt("callType", callType);
                    params.putBoolean("isVideoCall", stringeeCall2.isVideoCall());
                    params.putString("customDataFromYourServer", stringeeCall2.getCustomDataFromYourServer());

                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onIncomingCall2Native", params);
                }

                @Override
                public void onConnectionError(StringeeClient stringeeClient, StringeeError stringeeError) {
                    //Log.d(TAG, "Stringee onConnectionError! ");
                    WritableMap params = Arguments.createMap();
                    params.putInt("code", stringeeError.getCode());
                    params.putString("message", stringeeError.getMessage());
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onConnectionErrorNative", params);
                }

                @Override
                public void onRequestNewToken(StringeeClient stringeeClient) {
                    //Log.d(TAG, "Stringee onRequestNewToken! ");
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onRequestNewTokenNative", null);
                }

                @Override
                public void onCustomMessage(String s, JSONObject jsonObject) {
                    //Log.d(TAG, "Stringee onCustomMessage! ");
                    WritableMap params = Arguments.createMap();
                    params.putString("from", s);
                    params.putString("data", jsonObject.toString());
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onRequestNewTokenNative", null);
                }

                @Override
                public void onTopicMessage(String s, JSONObject jsonObject) {
                    //Log.d(TAG, "Stringee onTopicMessage! ");
                }
            });

            MainActivity.client.connect(token);
        }
    }

    private static void sendEvent(String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
