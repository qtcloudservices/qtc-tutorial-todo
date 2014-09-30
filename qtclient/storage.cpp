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

#include "storage.h"
#include <QtDebug>
#include <QSettings>

#define REQUEST_URL "http://qtc-tutorial-todo.qtcloudapp.com"
#define REFRESH_INTERVAL 10000


Storage::Storage(ItemModel *model, QObject *parent) :
    QObject(parent),
    m_model(model),
    m_networkManager(0),
    m_loading(false),
    m_localIndex(0),
    m_queueLength(0)
{
    //The QNetworkAccessManager class allows the application to send network requests and receive replies
    m_networkManager = new QNetworkAccessManager(this);
    connect(m_networkManager, SIGNAL(finished(QNetworkReply*)), this, SLOT(requestFinished(QNetworkReply*)));
    deviceId = getRandomString();
    //Configure refresh timer
//    connect(&m_refreshTimer, SIGNAL(timeout()), this, SLOT(refreshItems()));
//    m_refreshTimer.setInterval(REFRESH_INTERVAL);

    //Get session information
    QSettings settings("Digia", "Qt Cloud Todo");
    m_sessionId = settings.value("sessionId", "").toByteArray();
    m_loggedName = settings.value("name", "").toString();
    m_userId = settings.value("userId", "").toString();
    m_loggedIn = !m_sessionId.isEmpty();
}

Storage::~Storage()
{
    // Save session information
    QSettings settings("Digia", "Qt Cloud Todo");
    settings.setValue("sessionId", m_sessionId);
    settings.setValue("userId", m_userId);
    settings.setValue("name", m_loggedName);
    settings.sync();
}


QNetworkReply* Storage::getWebSocketUri()
{
    QNetworkRequest request;
    request.setUrl(QUrl(QString("%1%2").arg(REQUEST_URL).arg("/api/websocket")));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader(QByteArray("x-todo-session"), m_sessionId);

    QNetworkReply *reply = m_networkManager->get(request);
    reply->setProperty("requestType", WebSocketUri);
    return reply;
}

void Storage::messageReceived(QString message) {
    qDebug() << "Message received:" << message;
    QJsonDocument jsonResponse = QJsonDocument::fromJson(message.toUtf8());
    QJsonObject jsonObj = jsonResponse.object();
    QString event = jsonObj.value("meta").toObject().value("eventName").toString();
    QJsonObject todo = jsonObj.value("object").toObject();

    if(event == "delete") {
        m_model->deleteItem(m_model->itemRow(todo.value("id").toString()));
    }
    if(todo.value("device") != deviceId) {
        if(event == "create") {
            addItem(todo.value("text").toString(), todo.value("id").toString());

        }
        else if(event == "update") {
            m_model->finishItem(m_model->itemRow(todo.value("id").toString()));
        }
    }

    setLoading(false);
}

void Storage::registerUser(const QString &name, const QString& username, const QString& password)
{
    QJsonObject data;
    data["name"] = name;
    data["username"] = username;
    data["password"] = password;

    // Send registration information to the server
    startRequest(createRequest("/api/register"), RegisterUser, true, data);
}

void Storage::loginUser(const QString& username, const QString& password)
{
    QJsonObject data;
    data["username"] = username;
    data["password"] = password;

    // Send login information to the server
    startRequest(createRequest("/api/login"), LoginUser, true, data);
}

void Storage::logoutUser()
{
    // Send logout-info to the server
    startRequest(createRequest("/api/logout", true), LogoutUser, false);

    // Logout locally
    m_refreshTimer.stop();
    m_model->clearItems();
    setLogged(false, "", "","");
}

bool Storage::rememberUser()
{
    return !m_sessionId.isEmpty();
}

void Storage::refreshItems()
{
    // Request all items from the server and update changed items to the local model. See requestFinished
    // We send refresh query only if there is no any pending requests
    if (m_queueLength == 0)
        startRequest(createRequest("/api/todos", true), RefreshItems, false);
}

void Storage::initItems()
{
    // Request all items from the server and init local model. See requestFinished
    startRequest(createRequest("/api/todos", true), InitItems);
}

void Storage::addItem(const QString& name, const QString& globalId)
{
    // Generate new localId and add item to the model with localId
    QString localId = QString("localId_%1").arg(++m_localIndex);
    m_model->addItem(localId, name, false, false);

    if(globalId == "") {
        QJsonObject data;
        data["text"] = name;
        data["done"] = false;
        data["device"] = deviceId;
        // Send request to the server
        QNetworkReply *reply = startRequest(createRequest("/api/todos", true), AddItem, false, data);
        if (reply != 0)
            reply->setProperty("localId", localId);
    }
    else {
        m_model->updateLocalId(localId, globalId);
    }
}

void Storage::finishItem(int row)
{
    // Set item in processing mode and finish it
    QString id = m_model->itemId(row);
    m_model->setProcessing(row, true);
    m_model->finishItem(row);

    // Send requeset to the server
    QJsonObject data;
    data["done"] = true;
    data["device"] = deviceId;
    startRequest(createRequest(QString("/api/todos/%1").arg(id), true), FinishItem, false, data);
}

void Storage::deleteItem(int row)
{
    // Delete item from model and send request to the server
    QString id = m_model->itemId(row);
    m_model->deleteItem(row);
    startRequest(createRequest(QString("/api/todos/%1").arg(id), true), DeleteItem, false);
}

QNetworkRequest Storage::createRequest(const QString &path, bool sessionId)
{
    QNetworkRequest request;
    request.setUrl(QUrl(QString("%1%2").arg(REQUEST_URL).arg(path)));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    if (sessionId)
        request.setRawHeader(QByteArray("x-todo-session"), m_sessionId);

    return request;
}

QNetworkReply* Storage::startRequest(const QNetworkRequest& request, Storage::RequestType type, bool loading, const QJsonObject& data)
{
    // Set loading flag
    setLoading(loading);

    // Send request depends on the RequestType
    QNetworkReply *reply = 0;

    switch(type) {
    case RegisterUser:
    case LoginUser:
    case AddItem:
        reply = m_networkManager->post(request, QJsonDocument(data).toJson());
        break;
    case LogoutUser:
    case InitItems:
    case RefreshItems:
        reply = m_networkManager->get(request);
        break;
    case FinishItem:
        reply = m_networkManager->put(request, QJsonDocument(data).toJson());
        break;
    case DeleteItem:
        reply = m_networkManager->deleteResource(request);
        break;
    default: break;
    }

    // If request is ok, we set requestType to the reply and handle reply in requestFinished-slot depending on this type
    if (reply != 0) {
        reply->setProperty("requestType", type);
        m_queueLength++;
    }

    return reply;
}

bool Storage::isError(const QJsonDocument& data)
{
    // Check if data includes an error
    if (data.isObject()) {
        QJsonObject d = data.object();
        if (d.contains("error")) {
            d = d.value("error").toObject();
            emit errorOccurred(d.value("code").toInt(), d.value("message").toString());
            return true;
        }
    }

    return false;
}

void Storage::requestFinished(QNetworkReply *reply)
{
    // Get requestType from the reply
    RequestType requestType = (RequestType)reply->property("requestType").toInt();
    m_queueLength--;

    // Set loading false
    setLoading(false);

    // Check reply
    if (reply->error() != QNetworkReply::NoError) {
        emit errorOccurred((int)reply->error(), reply->errorString());
    }
    else if (requestType != LogoutUser) {
        QJsonDocument replyData = QJsonDocument::fromJson(reply->readAll());
        if (!isError(replyData)) {
            switch (requestType) {
            case WebSocketUri:
            {

                QJsonObject data = replyData.object();
                m_ws_client = new WebSocketClient(QUrl(data.value("uri").toString()), this);
                QObject::connect(m_ws_client, &WebSocketClient::onMessageReceived, this, &Storage::messageReceived);
                break;
            }
            case RegisterUser:
            {
                // Send signal that user has registered
                emit userRegistered();
                break;
            }
            case LoginUser:
            {
                // Login user
                QJsonObject data = replyData.object();
                setLogged(true, data.value("name").toString(), data.value("userId").toString(), data.value("session").toString().toUtf8());
                emit userLogged();
                break;
            }
            case InitItems:
            {
                // Init all todo-items. This will occurs just after logging in
                // Start refresh timer
                //m_refreshTimer.start();
                m_model->initData(replyData.array());
                m_localIndex = m_model->rowCount() + 1;
                this->getWebSocketUri();
                break;
            }
            case RefreshItems:
            {
                // Refresh items. When user has logged in, we request/refresh items now and then (see REFRESH_INTERVAL)
                QJsonArray array = replyData.array();
                m_model->refreshData(array);
                break;
            }
            case AddItem:
            {
                // When user wants to add item, we add it to the local model immediately (see addItem())
                // Here we receive the global id to the added item and update it
                // updateLocalId-function also set processing-flag to false for this item
                m_model->updateLocalId(reply->property("localId").toString(), replyData.object().value("id").toString());
                break;
            }
            case FinishItem:
            {
                // When we receive this request, it means that item has succesfully modified in the server side.
                // So we can set processing-flag to false for this item.
                m_model->setProcessing(replyData.object().value("id").toString(), false);
                break;
            }
            default: break;
            }
        }
    }

    reply->deleteLater();
}

void Storage::setLoading(bool para)
{
    m_loading = para;
    emit loadingChanged();
}

void Storage::setLogged(bool para, const QString& name, const QString& userId, const QByteArray& sessionId)
{
    m_loggedIn = para;
    m_loggedName = name;
    m_sessionId = sessionId;
    m_userId = userId;
    emit loggedInChanged();
}

QString Storage::getRandomString() const
{
   const QString possibleCharacters("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
   const int randomStringLength = 12; // assuming you want random strings of 12 characters

   QString randomString;
   for(int i=0; i<randomStringLength; ++i)
   {
       int index = qrand() % possibleCharacters.length();
       QChar nextChar = possibleCharacters.at(index);
       randomString.append(nextChar);
   }
   return randomString;
}
