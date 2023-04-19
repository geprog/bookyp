fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android test

```sh
[bundle exec] fastlane android test
```

Runs all the tests

### android buildDebug

```sh
[bundle exec] fastlane android buildDebug
```

Builds a debug APK

### android beta

```sh
[bundle exec] fastlane android beta
```

Release next beta version to PlayStore

### android production

```sh
[bundle exec] fastlane android production
```

Release next production version to PlayStore

----


## iOS

### ios test

```sh
[bundle exec] fastlane ios test
```

Runs all the tests

### ios release

```sh
[bundle exec] fastlane ios release
```

Release next beta version to AppStore

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
