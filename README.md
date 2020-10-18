# About
Pocket Chef is a free and open source recipe manager mobile application.

<img src="assets/images/icon.png" width="100" height="100"/>

![Screenshots](screenshots/Screenshots.md)

Overview:
- No network connection necessary, everything happens on your device 
- Add/take photos
- Ingredients, instructions, utensils and notes distinct sections
- Number of people toggler with ingredient quantity multiplication
- Export a recipe (to markdown or zip if there are pictures)
- Import a recipe
- Multi-lang (English & French)
- Multi-platform: available on [Android](https://play.google.com/store/apps/details?id=fr.ghelouis.pocketchef) and iOS, soon!

The import/export feature effectively enables users to send each other recipes (e.g via whatsapp or email). It is a very simple format which also means that users are free to write recipes outside of Pocket Chef before importing them. If curious, the specifics of the format can be found in the wiki [here](https://github.com/ghelouis/pocketchef/wiki/Recipe-format).

# Mindset
The idea is to apply the [KISS
principle](https://en.wikipedia.org/wiki/KISS_principle) and try and keep
things as simple as possible. This makes it easier for developers as well as
users. This approach led to:
- the app is written in pure javascript, with as few libraries as possible;
- the import/export format uses raw text (markdown-flavored) and zip, both
of which are easy to handle and understand.

# Development
This is a cross-platform (Android & iOS) app built in React Native using
[Expo](https://expo.io/). The code source is purely javascript.

## Run
- run on local network: `expo start`
- run on android via usb locally without internet: `expo start --offline --localhost --android`

## Clear cache
- `expo r -c`

## Publish
- `expo publish`

## Manage dependencies
- Install package: `expo install <package>`
- Remove package: `yarn remove <package>`

## Libraries used
- UUIDs: https://github.com/uuidjs/uuid + https://github.com/LinusU/react-native-get-random-values
- Multi-lang support: https://docs.expo.io/versions/latest/sdk/localization/
- Image Picker (from camera or phone library): https://docs.expo.io/versions/latest/sdk/imagepicker/
- Image slider (row of fixed size images): https://github.com/intellidev1991/react-native-image-slider-box
- Image viewer (full screen images with zoom): https://github.com/jobtoday/react-native-image-viewing
- File System: https://docs.expo.io/versions/latest/sdk/filesystem/
- Exporting/sharing: Expo sharing https://docs.expo.io/versions/latest/sdk/sharing/
- Zip: JsZip + fix for expo: https://github.com/Stuk/jszip/issues/521
- Importing: Expo Document Picker https://docs.expo.io/versions/latest/sdk/document-picker/
- Icons: FontAwesome via expo vector icons: https://docs.expo.io/guides/icons/ (see full list here: https://icons.expo.fyi/)
