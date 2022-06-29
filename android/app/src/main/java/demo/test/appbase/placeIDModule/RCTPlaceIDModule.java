package demo.test.appbase.placeIDModule;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.android.gms.common.api.ApiException;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.AddressComponent;
import com.google.android.libraries.places.api.model.AutocompletePrediction;
import com.google.android.libraries.places.api.model.AutocompleteSessionToken;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.api.net.FetchPlaceRequest;
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest;
import com.google.android.libraries.places.api.net.PlacesClient;

import java.util.Arrays;
import java.util.List;

public class RCTPlaceIDModule extends ReactContextBaseJavaModule {
    private static String TAG = "RCTPlaceIDModule";
    private static ReactApplicationContext reactContext;
    private static PlacesClient placesClient = null;

    public RCTPlaceIDModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "PlaceIDModule";
    }

    // Khởi tạo đăng ký service PlaceID với api key
    @ReactMethod
    public void init(String apiKey, Promise promise) {
        try {
            if (!Places.isInitialized()) {
                Places.initialize(reactContext, apiKey);
            }

            placesClient = Places.createClient(reactContext);
        } catch (Exception e) {
            promise.reject("Error", e.getMessage());
        } finally {
            promise.resolve("Init GMS PlaceID successful!");
        }
    }

    // Khởi tạo mới sesstion cho mỗi lần search địa chỉ
    public AutocompleteSessionToken getSessionToken() {
        return AutocompleteSessionToken.newInstance();
    }

    @ReactMethod
    public void searchAddress(String query, Promise promise) {
        // khởi tạo 1 sesstion token mới
        AutocompleteSessionToken token = this.getSessionToken();

        // tạo 1 query request lên google để tìm địa chỉ theo text được user nhập
        FindAutocompletePredictionsRequest request = FindAutocompletePredictionsRequest.builder()
                .setSessionToken(token)
                .setQuery(query.toString())
                .build();

        // gọi hàm tìm địa chỉ với request phía trên
        placesClient.findAutocompletePredictions(request)
                // thêm function đển lắng nghe sự kiện sau khi có data trả về
                .addOnSuccessListener(response -> {
                    // Khới tạo mảng các địa chỉ có thể tìm được
                    // và gửi lại lên phía js
                    WritableArray array = new WritableNativeArray();
                    // chạy forEach lấy từng thông tin địa chị trả về
                    // và thêm vào danh sách temp vừa mới khởi tạo phía trên
                    // ở đây sẽ lấy 2 thông tin là placeID và fullAddress
                    for (AutocompletePrediction prediction : response.getAutocompletePredictions()) {

                        WritableMap place = Arguments.createMap();
                        place.putString("placeID", prediction.getPlaceId());
                        place.putString("fullAddress", prediction.getFullText(null).toString());
                        array.pushMap(place);
                    }

                    // sau khi xử lý dữ liệu trả về thì sẽ gọi hàm trả ngược dữ liệu lên phía js
                    promise.resolve(array);
                })
                //Thêm function để lắng nghe sự kiện nếu quá trình tìm địa chỉ có lỗi
                // Trong hàm này xử lý trả thông tin lỗi lên cho phía js code
                .addOnFailureListener((exception) -> {
                    if (exception instanceof ApiException) {
                        ApiException apiException = (ApiException) exception;
                        promise.reject("Search Error", apiException.getMessage());
                    }
                });
    }

    @ReactMethod
    public void getPlaceDetail(String placeID, Promise promise) {
        final List<Place.Field> placeFields = Arrays.asList(Place.Field.ADDRESS_COMPONENTS, Place.Field.LAT_LNG);

        // Construct a request object, passing the place ID and fields array.
        final FetchPlaceRequest request = FetchPlaceRequest.newInstance(placeID, placeFields);

        // gửi request lấy thông tin place detail
        placesClient.fetchPlace(request)
                .addOnSuccessListener((response) -> {
                    Place place = response.getPlace();

                    //format Address component list
                    WritableArray arrAddressComponent = new WritableNativeArray();

                    for (AddressComponent component : place.getAddressComponents().asList()) {

                        WritableMap addressCompo = Arguments.createMap();
                        addressCompo.putString("long_name", component.getName());
                        addressCompo.putString("short_name", component.getShortName());

                        WritableArray types = new WritableNativeArray();
                        for (String type : component.getTypes()) {
                            types.pushString(type);
                        }

                        addressCompo.putArray("types", types);

                        arrAddressComponent.pushMap(addressCompo);
                    }

                    //Parse location
                    WritableMap location = Arguments.createMap();
                    location.putDouble("latitude", place.getLatLng().latitude);
                    location.putDouble("longitude", place.getLatLng().longitude);

                    //Parse geometry
                    WritableMap geometry = Arguments.createMap();
                    geometry.putMap("location", location);


                    //Result
                    WritableMap result = Arguments.createMap();
                    result.putArray("address_components", arrAddressComponent);
                    result.putMap("geometry", geometry);

                    promise.resolve(result);

                })
                .addOnFailureListener((exception) -> {
                    if (exception instanceof ApiException) {
                        final ApiException apiException = (ApiException) exception;
                        final int statusCode = apiException.getStatusCode();
                        // TODO: Handle error with given status code.
                        promise.reject("Search Error", apiException.getMessage());
                    }
                });
    }
}