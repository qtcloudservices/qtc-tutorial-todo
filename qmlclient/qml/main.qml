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

import QtQuick 2.2
import QtQuick.Controls 1.1
import Qt.WebSockets 1.0
import "Storage.js" as Storage

Item {
    id: app
    width: 480
    height: 800

    property bool loading: false
    property bool loggedIn: false
    property string loggedName: ""
    property string device: ""

    function randomString() {
        var chars = "abcdefghiklmnopqrstuvwxyz";
        var string_length = 8;
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring.toString();
    }

    // Register user
    function registerUser(name, username, password)
    {
        Storage.registerUser(name, username, password)
    }

    // Login user
    function loginUser(username, password)
    {
        device = randomString()
        Storage.loginUser(username, password)
    }

    // Logout user
    function logout()
    {        
        Storage.logoutUser()
    }

    // Add new item to the model
    function addItem(name, itemId)
    {
        Storage.addItem(name, itemId);
    }

    // Finish item
    function finishItem(row, remote)
    {
        Storage.finishItem(row, remote);
    }

    // Delete item
    function deleteItem(row, remote)
    {
        Storage.deleteItem(row, remote);
    }

    WebSocket {
        id: socket

        active: true
        onTextMessageReceived: {
            Storage.handleWebsocketMessage(message)
        }
        onStatusChanged: {
            if (socket.status == WebSocket.Error) {
              console.log("Error: " + socket.errorString)
            } else if (socket.status == WebSocket.Open) {
              console.log("WebSocket connected")

            } else if (socket.status == WebSocket.Closed) {
              console.log("WebSocket closed")
            }
        }
    }


    ListModel {
        id: itemModel
    }

    Rectangle {
        id: background
        anchors.fill: parent
        focus: true

        // Draw gradient background
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#ffffff" }
            GradientStop { position: 1.0; color: "#999999" }
        }

        Image {
            anchors.centerIn: parent
            width: Math.max(parent.width, parent.height)
            height: width
            rotation: -20
            opacity: 0.1
            source: "qrc:/images/qtlogo.png"
        }

        StackView {
            id: mainView
            anchors.fill: parent
            initialItem: Qt.resolvedUrl("Home.qml");
        }

        ErrorInfo { id: errorInfo }
        LoadingInfo { id: loadingInfo }
    }
}
