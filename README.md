
# Run
- `yarn start` (which runs expo start)
- run on android via usb locally without internet: `expo start --offline --localhost --android`

# Clear cache
- `expo r -c`

# Publish
- `expo publish`

# Libs used
- UUIDs https://github.com/uuidjs/uuid + https://github.com/LinusU/react-native-get-random-values
- Multi-lang support https://docs.expo.io/versions/latest/sdk/localization/
- Image Picker (from camera or phone library): https://docs.expo.io/versions/latest/sdk/imagepicker/
- Image slider (row of fixed size images): https://github.com/intellidev1991/react-native-image-slider-box
- Image viewer (full screen images with zoom): https://github.com/jobtoday/react-native-image-viewing
- File System: https://docs.expo.io/versions/latest/sdk/filesystem/
- Exporting/sharing: Expo sharing https://docs.expo.io/versions/latest/sdk/sharing/
- Zip: JsZip + fix for expo: https://github.com/Stuk/jszip/issues/521
- Importing: Expo Document Picker https://docs.expo.io/versions/latest/sdk/document-picker/
- Icons: FontAwesome (expo vector icons) https://icons.expo.fyi/
