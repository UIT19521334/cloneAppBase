package demo.test.appbase.widgetsapp.models;

import java.io.Serializable;

public class IncomingActivity implements Serializable {
    private String id;
    private String title;
    private String startDate;
    private String activityType;

    public IncomingActivity() {
    }

    public IncomingActivity(String id, String title, String startDate, String activityType) {
        this.id = id;
        this.title = title;
        this.startDate = startDate;
        this.activityType = activityType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    @Override
    public String toString() {
        return "IncomingActivity{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", startDate='" + startDate + '\'' +
                ", activityType='" + activityType + '\'' +
                '}';
    }
}
