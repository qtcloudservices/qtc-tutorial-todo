/****************************************************************************
**
** Copyright (C) 2014 Digia Plc and/or its subsidiary(-ies).
** Contact: http://www.qt-project.org/legal
**
** This file is part of the examples of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:BSD$
** You may use this file under the terms of the BSD license as follows:
**
** "Redistribution and use in source and binary forms, with or without
** modification, are permitted provided that the following conditions are
** met:
**   * Redistributions of source code must retain the above copyright
**     notice, this list of conditions and the following disclaimer.
**   * Redistributions in binary form must reproduce the above copyright
**     notice, this list of conditions and the following disclaimer in
**     the documentation and/or other materials provided with the
**     distribution.
**   * Neither the name of Digia Plc and its Subsidiary(-ies) nor the names
**     of its contributors may be used to endorse or promote products derived
**     from this software without specific prior written permission.
**
**
** THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
** "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
** LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
** A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
** OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
** LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
** DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
** THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
** (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
** OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
**
** $QT_END_LICENSE$
**
****************************************************************************/

import QtQuick 2.0

Item {
    width: parent.width
    height: parent.height

    property int buttonHeight: parent.height * 0.08

    function addItem(name)
    {
        if (name !== "")
        {
            app.addItem(name, null)
            textinput.text = "";
        }
    }

    Rectangle {
        id: toolbar
        anchors { top: parent.top; left: parent.left; right: parent.right }
        height: parent.height * 0.1
        color: "#e5e5e5"

        Item {
            anchors.left: parent.left
            height: parent.height
            width: parent.width * 0.5

            Image {
                id: leftIcon
                anchors.left: parent.left
                anchors.verticalCenter: parent.verticalCenter
                anchors.margins: parent.height * 0.05
                height: parent.height * 0.4
                width: height
                fillMode: Image.PreserveAspectFit
                source: "qrc:/images/left.png"
            }
            Image {
                id: userIcon
                anchors.left: leftIcon.right
                anchors.verticalCenter: parent.verticalCenter
                anchors.margins: parent.height * 0.05
                height: parent.height * 0.8
                width: height
                fillMode: Image.PreserveAspectFit
                source: "qrc:/images/user.png"
            }
            Text {
                id: loginName
                anchors { left: userIcon.right; verticalCenter: userIcon.verticalCenter; margins: parent.height * 0.1 }
                verticalAlignment: Text.AlignVCenter
                color: "#333333"
                font.pixelSize: Math.min(parent.width*0.08, parent.height*0.4)
                text: app.loggedName
            }

            MouseArea {
                anchors.fill: parent
                onClicked: app.logout()
            }
        }

        Rectangle {
            anchors.bottom: parent.bottom
            width: parent.width
            height: 1
            color: "#aaaaaa"
        }
    }


    Item {
        id: textArea
        anchors { top: toolbar.bottom; topMargin: buttonHeight * 0.5; horizontalCenter: parent.horizontalCenter }
        width: parent.width * 0.9
        height: buttonHeight

        TextInputField {
            id: textinput
            anchors.left: parent.left
            height: parent.height
            width: parent.width * 0.8
            onAccepted: addItem(text,  null)
        }

        Button {
            anchors.right: parent.right
            width: parent.width * 0.2
            height: parent.height
            text: qsTr("Add")
            fontSize: Math.min(width * 0.3, height * 0.3)
            onClicked: addItem(textinput.text, null)
        }
    }


    Text {
        id: emptyText
        anchors.centerIn: parent
        text: qsTr("You don't have any todos.")
        color: "#676767"
        visible: view.count == 0
        font.pixelSize: Math.min(parent.width, parent.height) * 0.05
    }

    ListView {
        id: view
        anchors {
            top: textArea.bottom;
            bottom: parent.bottom;
            topMargin: buttonHeight * 0.5;
            bottomMargin: buttonHeight*0.5;
            horizontalCenter: parent.horizontalCenter
        }
        width: textArea.width
        clip: true

        add: Transition { NumberAnimation { property: "y"; from: -buttonHeight; duration: 300 } }
        addDisplaced: Transition { NumberAnimation { property: "y"; duration: 300 } }
        removeDisplaced: Transition { NumberAnimation { property: "y"; duration: 300 } }
        moveDisplaced: Transition { NumberAnimation { property: "y"; duration: 300 } }

        model: itemModel

        delegate: Rectangle {
            id: itemDelegate
            height: Math.max(buttonHeight, content.contentHeight);
            width: view.width
            color: itemDone ? "#bbbbbb" : "#f1f1f1"
            radius: 1

            Text {
                id: content
                anchors { left: parent.left; verticalCenter: parent.verticalCenter; margins: parent.width * 0.03 }
                verticalAlignment: Text.AlignVCenter
                width: parent.width - buttonHeight
                wrapMode: Text.WordWrap
                color: itemDone ? "#555555" : "#333333"
                font.pixelSize: Math.min(parent.width * 0.05, buttonHeight*0.3)
                text: itemName
            }

            ImageButton {
                id: btn
                anchors { right: parent.right; top: parent.top; }
                height: buttonHeight
                width: height
                buttonEnabled: !itemProcessing
                icon: {
                    if (itemProcessing)
                        return "qrc:/images/loading.png";
                    else
                        return itemDone ? "qrc:/images/close.png" : "qrc:/images/accept.png";
                }
                onClicked: {
                    if (itemDone)
                        app.deleteItem(index, true);
                    else
                        app.finishItem(index, true);
                }

                NumberAnimation {
                    target: btn
                    property: "rotation"
                    duration: 1000
                    from: 0
                    to: 360
                    alwaysRunToEnd: true
                    running: itemProcessing
                    loops: Animation.Infinite
                }
            }

            Rectangle {
                anchors.bottom: parent.bottom
                width: parent.width
                height: 2
                color: itemDone ? "#cccccc" : "#e5e5e5"
            }

            Rectangle {
                anchors.top: parent.top
                width: parent.width
                height: 2
                color: itemDone ? "#aaaaaa" : "#ffffff"
            }
        }
    }
}
