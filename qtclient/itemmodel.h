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

#ifndef ITEMMODEL_H
#define ITEMMODEL_H

#include <QAbstractListModel>
#include <todoitem.h>
#include <QJsonValue>
#include <QJsonArray>
#include <QJsonObject>

class ItemModel : public QAbstractListModel
{
    Q_OBJECT
public:
    enum RoleTypes {
        IdRole = Qt::UserRole + 1,
        NameRole,
        DoneRole,
        ProcessingRole
    };

    explicit ItemModel(QObject *parent = 0);

    bool setData(const QModelIndex &index, const QVariant &value, int role);
    QVariant data(const QModelIndex & index, int role=Qt::DisplayRole) const;
    int	rowCount(const QModelIndex & parent = QModelIndex()) const;
    QHash<int, QByteArray> roleNames() const;

    void addItem(const QString& id, const QString& name, bool done, bool processing);
    void updateLocalId(const QString& localId, const QString& globalId);
    void modifyItem(const QString& id, const QString& name, bool done);
    void finishItem(int row);
    void deleteItem(int row);
    void deleteItem(const QString& id);
    void clearItems();
    void initData(const QJsonArray& data);
    void refreshData(QJsonArray& data);

    void setProcessing(const QString& id, bool processing);
    void setProcessing(int row, bool processing);

    QString itemId(int row) const;
    int itemRow(const QString& id) const;

private:
    void modifyItem(int row, const QString& name, bool done);

    QList<TodoItem*> m_data;
    int m_firstDoneIndex;

};

#endif // ITEMMODEL_H
