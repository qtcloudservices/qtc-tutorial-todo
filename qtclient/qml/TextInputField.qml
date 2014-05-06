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

Rectangle {
    id: root
    radius: 2
    border.color: input.activeFocus ? "#428bca" : "#999999"
    border.width: input.activeFocus ? 2 : 1
    color: "#ffffff"

    signal accepted(string text)
    property alias text: input.text
    property alias placeholderText: placeholder.text
    property bool password: false

    function forceActiveFocus()
    {
        input.forceActiveFocus()
        input.selectAll()
    }

    TextInput {
        id: input
        anchors.fill: parent
        anchors.margins: parent.height * 0.2
        verticalAlignment: Text.AlignVCenter
        activeFocusOnPress: true
        cursorVisible: activeFocus || focus
        onAccepted: root.accepted(text)
        echoMode: root.password ? TextInput.Password : TextInput.Normal
        font.pixelSize: Math.min(width * 0.1, height*0.45)
        inputMethodHints: Qt.ImhNoPredictiveText
        clip: true
    }

    Text {
        id: placeholder
        anchors.fill: parent
        anchors.margins: parent.height * 0.2
        color: "#cccccc"
        font.pixelSize: input.font.pixelSize
        verticalAlignment: Text.AlignVCenter
        opacity: !input.cursorVisible && !input.text.length && input.enabled
        Behavior on opacity { NumberAnimation{} }
    }

    MouseArea {
        anchors.fill: parent
        onClicked: {
            root.forceActiveFocus()
            Qt.inputMethod.show()
        }
    }

}

