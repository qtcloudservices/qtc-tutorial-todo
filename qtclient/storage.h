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

#ifndef STORAGE_H
#define STORAGE_H

#include <QAbstractListModel>
#include <QTimer>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QJsonValue>
#include <QJsonDocument>
#include <itemmodel.h>
#include <websocketclient.h>

class Storage : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool loading READ loading NOTIFY loadingChanged)
    Q_PROPERTY(bool loggedIn READ loggedIn NOTIFY loggedInChanged)
    Q_PROPERTY(QString loggedName READ loggedName NOTIFY loggedInChanged)

public:
    /**
     * @brief The RequestType enum
     * RequestType tells the type of the sent request.
     * We save this requestType to the property of the QNetworkReply when sending the request to the server.
     * So we can check the type of the reply when request has finished.
     */
    enum RequestType {
        RegisterUser = 0,
        LoginUser,
        LogoutUser,
        InitItems,
        RefreshItems,
        AddItem,
        FinishItem,
        DeleteItem,
        WebSocketUri
    };
    explicit Storage(ItemModel *model, QObject *parent = 0);
    ~Storage();

    bool loading() const { return m_loading; }
    bool loggedIn() const { return m_loggedIn; }
    QString loggedName() const { return m_loggedName; }

    // User related invokable functions
    Q_INVOKABLE void registerUser(const QString &realname, const QString& username, const QString& password);
    Q_INVOKABLE void loginUser(const QString& username, const QString& password);
    Q_INVOKABLE void logoutUser();
    Q_INVOKABLE bool rememberUser();

    // Data related invokable functions
    Q_INVOKABLE void initItems();
    Q_INVOKABLE void addItem(const QString& name, const QString& globalId = "");
    Q_INVOKABLE void finishItem(int row);
    Q_INVOKABLE void deleteItem(int row);

signals:
    void loadingChanged();
    void loggedInChanged();
    void userRegistered();
    void userLogged();
    void errorOccurred(int code, const QString& message);

private slots:
    void requestFinished(QNetworkReply* reply);
    void refreshItems();
    void messageReceived(QString message);

private:
    QNetworkRequest createRequest(const QString& path, bool sessionId = false);
    QNetworkReply* startRequest(const QNetworkRequest& request, Storage::RequestType type, bool loading = true, const QJsonObject& data = QJsonObject());
    QNetworkReply* getWebSocketUri();
    QString getRandomString() const;
    bool isError(const QJsonDocument& data);
    void setLoading(bool para);
    void setLogged(bool para, const QString& name, const QString& userId, const QByteArray& sessionId);

    ItemModel *m_model;

    QString deviceId;
    // WebSocketClient object
    WebSocketClient *m_ws_client;

    QNetworkAccessManager *m_networkManager;
    bool m_loading;
    QTimer m_refreshTimer;

    bool m_loggedIn;
    QString m_loggedName;
    QString m_userId;
    QByteArray m_sessionId;
    int m_localIndex;
    int m_queueLength;
};

#endif // STORAGE_H
