package demo.test.appbase.commons;

import android.app.ActivityManager;
import android.content.Context;
import android.util.Log;

import java.util.List;

public class Helper {
    public static boolean isAppRunning(final Context context, final String packageName) {
        final ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        final List<ActivityManager.RunningTaskInfo> taskList = activityManager.getRunningTasks(10);
        if (taskList != null && (taskList.size() > 0))
        {
            ActivityManager.RunningTaskInfo runningTaskInfo = taskList.get( 0 );
            //Log.e(Helper.class.getSimpleName(), runningTaskInfo.topActivity.getPackageName());
            if (runningTaskInfo.topActivity == null) {
                return false;
            }
            else if (runningTaskInfo.topActivity != null && !runningTaskInfo.topActivity.getPackageName().contains(packageName)) {
                return false;
            }
            else {
                return true;
            }

        }
        return false;
    }

}
