package demo.test.appbase.stringee.custom;

import com.facebook.react.bridge.ReadableMap;

public interface AnswerScreenInterface {
    static boolean active = false;

    public void onConnected();

    public void onDisconnected();

    public void onConnectFailure();

    public void onEndCall(ReadableMap params);
}