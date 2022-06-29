package demo.test.appbase.widgetsapp.adapter;

import android.content.Context;
import android.content.res.Resources;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;

import demo.test.appbase.R;
import demo.test.appbase.widgetsapp.models.OptionConfig;

public class OptionConfigAdapter extends ArrayAdapter<OptionConfig> {
    private Context context;
    private ArrayList<OptionConfig> itemList;
    public Resources res;
    OptionConfig currRowVal = null;
    LayoutInflater inflater;

    public OptionConfigAdapter(@NonNull Context context, int textViewResourceId, ArrayList<OptionConfig> itemList,
                               Resources resLocal) {
        super(context, textViewResourceId, itemList);
        this.context = context;
        this.itemList = itemList;
        this.res = resLocal;
        inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

    @Override
    public View getDropDownView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        return getCustomView(position, convertView, parent);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        return getCustomView(position, convertView, parent);
    }

    public View getCustomView(int position, View convertView, ViewGroup parent) {
        View row = inflater.inflate(R.layout.option_row, parent, false);
        currRowVal = null;
        currRowVal = itemList.get(position);
        TextView label = row.findViewById(R.id.txt_option_row_item);
        label.setText(currRowVal.getLabel());
        return row;
    }
}
