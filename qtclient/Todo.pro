TEMPLATE = app

QT += qml quick network

SOURCES += main.cpp \
    storage.cpp \
    itemmodel.cpp \
    todoitem.cpp

RESOURCES += qml.qrc \
    images.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(deployment.pri)

HEADERS += \
    storage.h \
    itemmodel.h \
    todoitem.h

OTHER_FILES += \
    Readme.md
