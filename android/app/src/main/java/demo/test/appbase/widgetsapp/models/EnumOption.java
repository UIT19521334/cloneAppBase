package demo.test.appbase.widgetsapp.models;

import static android.content.Context.MODE_PRIVATE;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import demo.test.appbase.commons.Constants;

public class EnumOption {
    private String value;
    private String color;
    private String assigned;
    private String key;
    private String label;

    public EnumOption(String value, String color, String assigned, String key, String label) {
        this.value = value;
        this.color = color;
        this.assigned = assigned;
        this.key = key;
        this.label = label;
    }

    public EnumOption() {
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getAssigned() {
        return assigned;
    }

    public void setAssigned(String assigned) {
        this.assigned = assigned;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    @Override
    public String toString() {
        return "EnumOption{" +
                "value='" + value + '\'' +
                ", color='" + color + '\'' +
                ", assigned='" + assigned + '\'' +
                ", key='" + key + '\'' +
                ", label='" + label + '\'' +
                '}';
    }

    public static EnumOption getEumObject(Context context, String key, String status) {
        EnumOption res = new EnumOption("", "#333333", "", "", "Không xác định");
        if (!key.isEmpty() && !status.isEmpty()) {
            SharedPreferences prefs = context.getSharedPreferences(Constants.PROCESSING_TICKET, MODE_PRIVATE);
            String enumListString = prefs.getString(Constants.PROCESSING_TICKET_DATA_ENUM_LIST, "{}");
            Gson gson = new GsonBuilder().create();
            try {
                JSONObject enumList = new JSONObject(enumListString);
                JSONArray enumTicketFieldList = enumList.getJSONArray(key);
                for (int i = 0; i < enumTicketFieldList.length(); i++) {
                    String enumKey = enumTicketFieldList.getJSONObject(i).optString("key");
                    if (enumKey.toUpperCase().equals(status.toUpperCase())){
                        EnumOption itemSelected = gson.fromJson(enumTicketFieldList.getJSONObject(i).toString(), EnumOption.class);
                        boolean isLightColor = "".equalsIgnoreCase(itemSelected.getColor()) || "#fff".equalsIgnoreCase(itemSelected.getColor()) ||  "#ffffff".equalsIgnoreCase(itemSelected.getColor());
                        itemSelected.setColor(isLightColor ? "#333333" : itemSelected.getColor());
                        return itemSelected;
                    }
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return res;
    }
}
