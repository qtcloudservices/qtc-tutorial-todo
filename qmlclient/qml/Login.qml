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

    property bool signup: false


    function tryToLogin()
    {
        if (username.text != "" && password.text != "")
            app.loginUser(username.text, password.text);
    }

    function tryToSignUp()
    {
        if (realname.text != "" && username.text != "" && password.text != "")
            app.registerUser(realname.text, username.text,password.text)
    }

    Component.onCompleted: {
        if (signup)
            realname.forceActiveFocus()
        else
            username.forceActiveFocus()
    }

    Rectangle {
        anchors {top: parent.top; horizontalCenter: parent.horizontalCenter; topMargin: width * 0.05 }
        width: parent.width * 0.85
        height: signup ? parent.height * 0.8 : parent.height * 0.6
        color: "#ffffff"
        border.color: "#999999"
        radius: parent.width * 0.01

        Item {
            id: content
            anchors {fill: parent; margins: parent.width * 0.07; topMargin: 0 }
            property int buttonHeight: signup ? content.height * 0.17 : content.height * 0.23

            Column {
                anchors { left: parent.left; right: parent.right; top: parent.top }
                spacing: content.height * 0.03

                Item {
                    id: toolbar
                    height: content.height * 0.2
                    width: parent.width

                    Image {
                        anchors { left: parent.left; verticalCenter: parent.verticalCenter }
                        height: parent.height * 0.7
                        width: height
                        fillMode: Image.PreserveAspectFit
                        source: "qrc:/images/user.png"

                        Text {
                            anchors {verticalCenter: parent.verticalCenter; left: parent.right; leftMargin: parent.width * 0.3 }
                            text: signup ? qsTr("Please Sign Up") : qsTr("Please Login")
                            font.pixelSize: Math.min(toolbar.width * 0.09, toolbar.height*0.4)
                        }
                    }

                    MouseArea {
                        anchors.fill: parent
                        onClicked: app.logout()
                    }
                }

                TextNameInputField {
                    id: realname
                    visible: signup
                    height: content.buttonHeight
                    width: parent.width
                    placeholderText: qsTr("Real Name")
                    onAccepted: username.forceActiveFocus()
                }

                TextNameInputField {
                    id: username
                    height: content.buttonHeight
                    width: parent.width
                    placeholderText: qsTr("Username")
                    onAccepted: password.forceActiveFocus()
                }

                TextNameInputField {
                    id: password
                    height: content.buttonHeight
                    width: parent.width
                    placeholderText: qsTr("Password")
                    password: true
                    onAccepted: Qt.inputMethod.hide()
                }

                Button {
                    id: btnSignUp
                    visible: signup
                    height: visible ? content.buttonHeight : 0
                    width: parent.width
                    text: qsTr("Sign Up")
                    buttonColor: "#5cb85c"
                    onClicked: tryToSignUp()
                }

                Button {
                    id: btnLogin
                    visible: !signup
                    height: visible ? content.buttonHeight : 0
                    width: parent.width
                    text: qsTr("Login")
                    onClicked: tryToLogin()
                }
            }

        }
    }
}
