
# Run
- yarn start (which runs expo start)
- run on android via usb locally without internet: expo start --localhost --android

# Publish
- expo publish

# Libs used
- Multi-lang support https://docs.expo.io/versions/latest/sdk/localization/
- Image Picker (from camera or phone library): https://docs.expo.io/versions/latest/sdk/imagepicker/
- Image slider (row of fixed size images): https://github.com/intellidev1991/react-native-image-slider-box
- Image viewer (full screen images with zoom): https://github.com/jobtoday/react-native-image-viewing
- File System: https://docs.expo.io/versions/latest/sdk/filesystem/

- Media Library: https://docs.expo.io/versions/latest/sdk/media-library/
Used for exporting recipes. This is due to the filesystem library not
supporting writing to external storage yet (see
https://expo.canny.io/feature-requests/p/ability-to-save-files-on-internal-storage).

- Exporting a recipe: Expo sharing https://docs.expo.io/versions/latest/sdk/sharing/
