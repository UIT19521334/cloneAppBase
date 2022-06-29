package demo.test.appbase.widgetsapp.models;

public class OptionConfig {
    private String label;
    private String key;
    private String value;

    public OptionConfig() {}

    public OptionConfig(String label, String key, String value) {
        this.label = label;
        this.key = key;
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return "OptionConfig{" +
                "label='" + label + '\'' +
                ", key='" + key + '\'' +
                ", value='" + value + '\'' +
                '}';
    }
}
