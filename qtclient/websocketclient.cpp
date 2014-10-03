#include "websocketclient.h"
#include <QtCore/QDebug>

WebSocketClient::WebSocketClient(const QUrl &url, QObject *parent) :
    QObject(parent),
    m_url(url)
{
    connect(&m_webSocket, &QWebSocket::connected, this, &WebSocketClient::onConnected);
    connect(&m_webSocket, &QWebSocket::disconnected, this, &WebSocketClient::closed);
    m_webSocket.open(QUrl(url));
}

void WebSocketClient::onConnected()
{
    qDebug() << "WebSocket connected";
    connect(&m_webSocket, &QWebSocket::textMessageReceived,
            this, &WebSocketClient::onTextMessageReceived);
}

void WebSocketClient::onTextMessageReceived(QString message)
{
    emit onMessageReceived(message);
}
