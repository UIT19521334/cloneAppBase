package demo.test.appbase.widgetsapp.models;

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import demo.test.appbase.widgetsapp.factory.TicketListProvider;

public class ProcessTicket {
    private String ticketId;
    private String title;
    private String priority;
    private String time;
    private String category;

    public ProcessTicket() {
    }

    public ProcessTicket(String ticketId, String title, String priority, String time, String category) {
        this.ticketId = ticketId;
        this.title = title;
        this.priority = priority;
        this.time = time;
        this.category = category;
    }

    @Override
    public String toString() {
        return "ProcessTicket{" +
                "ticketId='" + ticketId + '\'' +
                ", title='" + title + '\'' +
                ", priority='" + priority + '\'' +
                ", time='" + time + '\'' +
                ", category='" + category + '\'' +
                '}';
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    static public List<ProcessTicket> toList(JSONArray data) {
        List<ProcessTicket> list = new ArrayList<>();

        for (int i = 0; i < data.length(); i++) {
            try {
                JSONObject item = (JSONObject) data.get(i);
                ProcessTicket processTicket = new ProcessTicket();
                String ticket_priority = item.optString("priority");

                processTicket.setPriority((ticket_priority.isEmpty()) ? "" : ticket_priority);

                String ticket_title = item.optString("title");
                processTicket.setTitle((ticket_title.isEmpty()) ? "" : ticket_title);

                String ticket_time = item.optString("createdtime");
                String datetimeString = "";
                if (!ticket_time.isEmpty()){
                    SimpleDateFormat sdfSource = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
                    SimpleDateFormat sdfDestination = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss");
                    try {
                        Date date = sdfSource.parse(ticket_time);
                        datetimeString = sdfDestination.format(date);

                    } catch (ParseException e) {
                        //Log.e(TicketListProvider.class.getSimpleName(), "Error parse date: " + e.getMessage());
                    }
                }
                processTicket.setTime(datetimeString);

                String ticket_category = item.optString("category");
                processTicket.setCategory((ticket_category.isEmpty()) ? "" : ticket_category);

                String ticket_id = item.optString("ticketid");
                processTicket.setTicketId((ticket_id.isEmpty()) ? "" : ticket_id);

                list.add(processTicket);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return list;
    }
}
