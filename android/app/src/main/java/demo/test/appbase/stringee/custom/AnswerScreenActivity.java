package demo.test.appbase.stringee.custom;

import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.TextView;
import android.view.View;
import android.content.Context;
import android.app.Activity;

import androidx.appcompat.app.AppCompatActivity;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.squareup.picasso.Picasso;

import demo.test.appbase.R;

public class AnswerScreenActivity extends AppCompatActivity implements AnswerScreenInterface {

    private static final String TAG = "MessagingService";
    private TextView tvName;
    private TextView tvTimer;
    private TextView tvCompany;
    private ImageView ivAvatar;
    private String uuid = "";
    static boolean active = false;
    private static Activity fa;
    private long startTime = 0;
    private int duration = 0;
    private static Boolean mute = true;
    private static Boolean speaker = false;
    static AnimateImage muteBtn = null;
    static AnimateImage speakerBtn = null;
    //runs without a timer by reposting this handler at the end of the runnable
    Handler timerHandler = new Handler();
    Runnable timerRunnable = new Runnable() {

        @Override
        public void run() {
            long millis = System.currentTimeMillis() - startTime;
            int seconds = (int) (millis / 1000);
            duration = seconds;
            int minutes = seconds / 60;
            seconds = seconds % 60;

            tvTimer.setText(String.format("%d:%02d", minutes, seconds));

            timerHandler.postDelayed(this, 500);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        fa = this;

        setContentView(R.layout.activity_anwser_call);

        tvName = findViewById(R.id.tvName);
        tvTimer = findViewById(R.id.tvInfo);
        ivAvatar = findViewById(R.id.ivAvatar);
        tvCompany = findViewById(R.id.tvCompanyName);

        Bundle bundle = getIntent().getExtras();
        if (bundle != null) {
            if (bundle.containsKey("uuid")) {
                uuid = bundle.getString("uuid");
            }
            if (bundle.containsKey("name")) {
                String name = bundle.getString("name");
                tvName.setText(name);
            }
            
            if (bundle.containsKey("avatar")) {
                String avatar = bundle.getString("avatar");
                if (avatar != null) {
                    Picasso.get().load(avatar).transform(new CircleTransform()).into(ivAvatar);
                }
            }

            if (bundle.containsKey("company")) {
                String company = bundle.getString("company");
                tvCompany.setText(company);
            }
        }

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);


        AnimateImage endCallBtn = findViewById(R.id.btnEndCall);
        endCallBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                timerHandler.removeCallbacks(timerRunnable);
                WritableMap params = Arguments.createMap();
                params.putBoolean("accept", false);
                params.putString("uuid", uuid);
                params.putInt("duration", duration);

                if (!IncomingCallModule.reactContext.hasCurrentActivity()) {
                    params.putBoolean("isHeadless", true);
                }

                sendEvent("endCallNative", params);
            }
        });

        muteBtn = findViewById(R.id.btnMute);
        muteBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                changeStateMute();
            }
        });

        speakerBtn = findViewById(R.id.btnSpeaker);
        speakerBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                changeStateSpeaker();
            }
        });

    }

    private BroadcastReceiver aLBMuteReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            // perform action here.
            //Log.w(TAG, "Set muted " + intent.getBooleanExtra("isMute", false));
            Boolean isMute = intent.getBooleanExtra("isMute", false);
            if (isMute){
                mute = true;
                muteBtn.setImageResource(R.drawable.mute);
            }
            else {
                mute = false;
                muteBtn.setImageResource(R.drawable.mute_selected);
            }
        }
    };

    private BroadcastReceiver aLBSpeakerReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            // perform action here.
            //Log.w(TAG, "Set muted " + intent.getBooleanExtra("isMute", false));
            Boolean isMute = intent.getBooleanExtra("isMute", false);
            if (isMute){
                speaker = true;
                speakerBtn.setImageResource(R.drawable.volum_selected);
            }
            else {
                speaker = false;
                speakerBtn.setImageResource(R.drawable.volum);
            }
        }
    };

    @Override
    public void onStart() {
        super.onStart();
        active = true;

        startTime = System.currentTimeMillis();
        timerHandler.postDelayed(timerRunnable, 0);

        LocalBroadcastManager.getInstance(this).registerReceiver(aLBMuteReceiver, new IntentFilter("setMuteEvent"));
        LocalBroadcastManager.getInstance(this).registerReceiver(aLBSpeakerReceiver, new IntentFilter("setSpeakerEvent"));
    }

    @Override
    protected void onPause() {
        super.onPause();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(aLBMuteReceiver);
        LocalBroadcastManager.getInstance(this).unregisterReceiver(aLBSpeakerReceiver);
    }

    @Override
    public void onStop() {
        super.onStop();
        active = false;
    }

    public static void dismissAnswerCall() {
        if (fa != null) {
            fa.finish();
        }
    }

    @Override
    public void onBackPressed() {
        // Dont back
    }

    private void changeStateMute() {
        //Log.w(TAG, "Mute change: "+ !mute);
        WritableMap params = Arguments.createMap();
        params.putBoolean("isMute", mute ? false : true);

        if (!IncomingCallModule.reactContext.hasCurrentActivity()) {
            params.putBoolean("isHeadless", true);
        }

        sendEvent("changeStateMute", params);
    }

    private void changeStateSpeaker() {
        WritableMap params = Arguments.createMap();
        params.putBoolean("isSpeaker", speaker ? false : true);

        if (!IncomingCallModule.reactContext.hasCurrentActivity()) {
            params.putBoolean("isHeadless", true);
        }

        sendEvent("changeStateSpeaker", params);
    }

    public static void setMute(boolean isMute) {
        mute = isMute;
    }

    @Override
    public void onConnected() {
        //Log.d(TAG, "onConnected: ");
        runOnUiThread(new Runnable() {
            @Override
            public void run() {

            }
        });
    }

    @Override
    public void onDisconnected() {
        //Log.d(TAG, "onDisconnected: ");

    }

    @Override
    public void onConnectFailure() {
        //Log.d(TAG, "onConnectFailure: ");

    }

    @Override
    public void onEndCall(ReadableMap params) {
        //Log.d(TAG, "onIncoming: ");
    }

    private void sendEvent(String eventName, WritableMap params) {
        IncomingCallModule.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

}