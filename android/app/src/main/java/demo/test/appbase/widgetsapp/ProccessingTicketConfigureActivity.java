package demo.test.appbase.widgetsapp;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Resources;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import java.util.ArrayList;

import demo.test.appbase.R;
import demo.test.appbase.commons.Constants;
import demo.test.appbase.databinding.ProccessingTicketConfigureBinding;
import demo.test.appbase.widgetsapp.adapter.OptionConfigAdapter;
import demo.test.appbase.widgetsapp.models.OptionConfig;

/**
 * The configuration screen for the {@link ProccessingTicket ProccessingTicket} AppWidget.
 */
public class ProccessingTicketConfigureActivity extends Activity {
    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Spinner spinnerCreateDate;
    private Spinner spinnerPriority;
    private Spinner spinnerFilter;
    ArrayList<OptionConfig> createType = new ArrayList<>();
    ArrayList<OptionConfig> priorityType = new ArrayList<>();
    ArrayList<OptionConfig> filterType = new ArrayList<>();
    OptionConfig createTypeSelected, priorityTypeSelected, filterTypeSelected;

    View.OnClickListener mOnClickListener = new View.OnClickListener() {
        public void onClick(View v) {
            final Context context = ProccessingTicketConfigureActivity.this;

            savePref(context, Constants.PROCESSING_TICKET_CONFIG_CREATE_DATE, createTypeSelected.getKey());
            savePref(context, Constants.PROCESSING_TICKET_CONFIG_PRIORITY, priorityTypeSelected.getKey());
            savePref(context, Constants.PROCESSING_TICKET_CONFIG_FILTER_BY, filterTypeSelected.getKey());

            // It is the responsibility of the configuration activity to update the app widget
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ProccessingTicket.updateAppWidget(context, appWidgetManager, mAppWidgetId);

            // Make sure we pass back the original appWidgetId
            Intent resultValue = new Intent();
            resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
            setResult(RESULT_OK, resultValue);
            finish();
        }
    };
    private ProccessingTicketConfigureBinding binding;

    public ProccessingTicketConfigureActivity() {
        super();
    }

    // Write the prefix to the SharedPreferences object for this widget
    static void savePref(Context context, String PREF_PREFIX_KEY, String text) {
        SharedPreferences.Editor prefs = context.getSharedPreferences(Constants.PROCESSING_TICKET_DATA, context.MODE_PRIVATE).edit();
        prefs.putString(PREF_PREFIX_KEY, text);
        prefs.commit();
    }

    public static CharSequence loadPref(Context context, String PREF_PREFIX_KEY, String defaultValue) {
        SharedPreferences prefs = context.getSharedPreferences(Constants.PROCESSING_TICKET_DATA, context.MODE_PRIVATE);
        String res = prefs.getString(PREF_PREFIX_KEY, defaultValue);

        return res;
    }

    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);

        // Set the result to CANCELED.  This will cause the widget host to cancel
        // out of the widget placement if the user presses the back button.
        setResult(RESULT_CANCELED);

        binding = ProccessingTicketConfigureBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.addButton.setOnClickListener(mOnClickListener);

        OptionConfig optionIncrease = new OptionConfig(this.getString(R.string.filter_increase_label), "ASC", "ASC");
        OptionConfig optionDecrease = new OptionConfig(this.getString(R.string.filter_decrease_label), "DESC", "DESC");
        OptionConfig optionFilterByMine = new OptionConfig(this.getString(R.string.filter_by_mine_label), "mine", "mine");
        OptionConfig optionFilterByAll = new OptionConfig(this.getString(R.string.filter_by_all_label), "all", "all");
        createTypeSelected = optionDecrease;
        priorityTypeSelected = optionDecrease;
        filterTypeSelected = optionFilterByMine;

        Resources res = getResources();

        createType.add(optionDecrease);
        createType.add(optionIncrease);
        spinnerCreateDate = binding.spinnerCreateDate;
        OptionConfigAdapter adapterCreateDate = new OptionConfigAdapter(this, android.R.layout.simple_spinner_dropdown_item, createType, res);
        spinnerCreateDate.setAdapter(adapterCreateDate);
        spinnerCreateDate.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
                createTypeSelected = createType.get(i);
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {

            }
        });

        priorityType.add(optionDecrease);
        priorityType.add(optionIncrease);
        spinnerPriority = binding.spinnerPriority;
        OptionConfigAdapter adapterPriority = new OptionConfigAdapter(this, android.R.layout.simple_spinner_dropdown_item, priorityType, res);
        spinnerPriority.setAdapter(adapterPriority);
        spinnerPriority.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
                priorityTypeSelected = priorityType.get(i);
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {

            }
        });

        filterType.add(optionFilterByMine);
        filterType.add(optionFilterByAll);
        spinnerFilter = binding.spinnerFilterBy;
        OptionConfigAdapter adapterFilter = new OptionConfigAdapter(this, android.R.layout.simple_spinner_dropdown_item, filterType, res);
        spinnerFilter.setAdapter(adapterFilter);
        spinnerFilter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
                filterTypeSelected = filterType.get(i);
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {

            }
        });


        // Find the widget id from the intent.
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            mAppWidgetId = extras.getInt(
                    AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }

        // If this activity was started with an intent without an app widget ID, finish with an error.
        if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }
    }
}