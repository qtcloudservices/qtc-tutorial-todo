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

    Rectangle {
        id: content
        anchors {top: parent.top; horizontalCenter: parent.horizontalCenter; topMargin: width * 0.05 }
        width: parent.width * 0.85
        height: parent.height * 0.85
        color: "#ffffff"
        border.color: "#999999"
        radius: parent.width * 0.01

        Column {
            anchors.top: parent.top
            anchors.topMargin: parent.height * 0.1
            anchors.horizontalCenter: parent.horizontalCenter
            width: parent.width * 0.8
            spacing: parent.height * 0.03

            TodoText {
                id: todoText
                height: content.height * 0.15
                font.pixelSize: 60
                font.bold: true
                text: qsTr("This is Todo!")
            }

            TodoText {
                height: content.height * 0.05
                text: qsTr("The most amazing todo app in the world.")
            }

            Item {
                height: content.height * 0.1
                width: content.width * 0.9
                anchors.horizontalCenter: parent.horizontalCenter

                Button {
                    id: btnSignUp
                    height: parent.height
                    width: parent.width * 0.48
                    text: qsTr("Sign Up")
                    buttonColor: "#5cb85c"
                    onClicked: mainView.push({item: Qt.resolvedUrl("Login.qml"), properties: { signup: true } });
                }

                Button {
                    id: btnLogin
                    anchors.right: parent.right
                    height: parent.height
                    width: parent.width * 0.48
                    text: qsTr("Login")
                    onClicked: mainView.push({item: Qt.resolvedUrl("Login.qml"), properties: { signup: false } });
                }
            }

            Ad {
                anchors.horizontalCenter: parent.horizontalCenter
                height: content.height * 0.16
                width: content.width * 0.9
                icon: "qrc:/images/star.png"
                title: qsTr("It's Simple")
                content: qsTr("It can't be more simple than this. No bells and whistles. Just todos, plain and simple.")
            }

            Ad {
                anchors.horizontalCenter: parent.horizontalCenter
                height: content.height * 0.16
                width: content.width * 0.9
                icon: "qrc:/images/cloud.png"
                title: qsTr("Access Anywhere")
                content: qsTr("Access your todos anywhere from any device. It's powered by Qt Cloud Services.")
            }
        }
    }
}
