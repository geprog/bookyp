# Android app

The app (trusted web app) is created with [bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap/).

To use the bubblewrap cli, you first need to run `docker build -t bubblewrap .` in this directory.

After that you can simply use the bubblewrap cli by running `./bubblewrap.sh [your command]`.

## Creating new app version

For example to create a new version of the app run `./bubblewrap.sh build`. The android key store credentials can be found as secure note in password vault. The note is named `bookyp android keys`. After running the build command you will get a new app bundle at `app/app-release-bundle.aab` which you can upload to the Google Play-store console.
