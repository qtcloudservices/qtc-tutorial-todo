TEMPLATE = app

QT += qml quick network websockets

SOURCES += main.cpp \
    storage.cpp \
    itemmodel.cpp \
    todoitem.cpp \
    websocketclient.cpp

RESOURCES += qml.qrc \
    images.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(deployment.pri)

HEADERS += \
    storage.h \
    itemmodel.h \
    todoitem.h \
    websocketclient.h

OTHER_FILES += \
    Readme.md

ANDROID_PACKAGE_SOURCE_DIR = $$PWD/android
