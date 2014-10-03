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

#include "itemmodel.h"
#include <QtDebug>

ItemModel::ItemModel(QObject *parent) :
    QAbstractListModel(parent),
    m_firstDoneIndex(0)
{
}

bool ItemModel::setData(const QModelIndex &index, const QVariant &value, int role)
{
    if (index.row() < 0 || index.row() >= rowCount())
        return false;

    TodoItem *pItem = m_data[index.row()];
    switch(role) {
    case IdRole: pItem->setId(value.toString()); break;
    case NameRole: pItem->setName(value.toString()); break;
    case DoneRole: pItem->setDone(value.toBool()); break;
    case ProcessingRole: pItem->setProcessing(value.toBool()); break;
    default: return false;
    }

    emit dataChanged(index, index);

    return true;
}

QVariant ItemModel::data(const QModelIndex & index, int role) const
{
    if (index.row() < 0 || index.row() >= rowCount())
        return QVariant();

    TodoItem *pItem = m_data[index.row()];

    switch(role) {
    case IdRole: return pItem->id();
    case NameRole: return pItem->name();
    case DoneRole: return pItem->done();
    case ProcessingRole: return pItem->processing();
    default: return QVariant();
    }
}

int	ItemModel::rowCount(const QModelIndex & parent) const
{
    Q_UNUSED(parent)
    return m_data.size();
}

QHash<int, QByteArray> ItemModel::roleNames() const
{
    QHash<int, QByteArray> roleNames;
    roleNames[IdRole] = "itemId";
    roleNames[NameRole] = "itemName";
    roleNames[DoneRole] = "itemDone";
    roleNames[ProcessingRole] = "itemProcessing";

    return roleNames;
}

void ItemModel::addItem(const QString& id, const QString& name, bool done, bool processing)
{
    int row = done ? m_firstDoneIndex : 0;
    beginInsertRows(QModelIndex(), row, row);
    m_data.insert(row, new TodoItem(id,name,done,processing));
    if (!done)
        m_firstDoneIndex++;
    endInsertRows();
}

void ItemModel::setProcessing(const QString& id, bool processing)
{
    for (int i=0; i<m_data.size(); i++) {
        if (m_data[i]->id() == id) {
            setProcessing(i, processing);
            break;
        }
    }
}

void ItemModel::setProcessing(int row, bool processing)
{
    if (row >= 0 && row < m_data.size())
        setData(index(row,0), processing, ProcessingRole);
}

void ItemModel::finishItem(int row)
{
    if (row >= 0 && row < m_data.size()) {
        setData(index(row,0), true, DoneRole);

        if (row != m_firstDoneIndex && row != (m_firstDoneIndex-1)) {
            int targetRow = row < m_firstDoneIndex ? m_firstDoneIndex-1 : m_firstDoneIndex;

            beginMoveRows(QModelIndex(), row, row, QModelIndex(), m_firstDoneIndex);
            m_data.insert(targetRow, m_data.takeAt(row));
            endMoveRows();
        }
        m_firstDoneIndex--;
    }
}

void ItemModel::modifyItem(int row, const QString &name, bool done)
{
    if (row >= 0 && row < m_data.size()) {
        QModelIndex ind = index(row,0);
        setData(ind, name, NameRole);

        if (done != m_data[row]->done()) {
            if (done)
                finishItem(row);
            else
                setData(ind, done, DoneRole);
        }
    }
}

void ItemModel::modifyItem(const QString& id, const QString& name, bool done)
{
    for (int i=0; i<m_data.size(); i++) {
        if (m_data[i]->id() == id) {
            modifyItem(i, name, done);
            break;
        }
    }
}

void ItemModel::updateLocalId(const QString& localId, const QString& globalId)
{
    for (int i=0; i<m_data.size(); i++) {
        if (m_data[i]->id() == localId) {
            QModelIndex ind = index(i,0);
            setData(ind, globalId, IdRole);
            setData(ind, false, ProcessingRole);
            break;
        }
    }
}

void ItemModel::deleteItem(int row)
{
    if (row >= 0 && row < m_data.size()) {
        beginRemoveRows(QModelIndex(), row, row);

        if (!m_data[row]->done())
            m_firstDoneIndex--;

        delete m_data.takeAt(row);

        endRemoveRows();
    }
}

void ItemModel::deleteItem(const QString& id)
{
    for (int i=0; i<m_data.size(); i++) {
        if (m_data[i]->id() == id) {
            deleteItem(i);
            break;
        }
    }
}

void ItemModel::clearItems()
{
    beginResetModel();
    qDeleteAll(m_data);
    m_data.clear();
    m_firstDoneIndex = 0;
    endResetModel();
}

void ItemModel::initData(const QJsonArray& data)
{
    beginResetModel();
    qDeleteAll(m_data);
    m_data.clear();

    // We add done-items to the end of the list
    for (int i=data.count(); i--;) {
        QJsonObject obj = data.at(i).toObject();
        TodoItem *item = new TodoItem(obj.value("id").toString(),
                                   obj.value("text").toString(),
                                   obj.value("done").toBool());
        if (item->done())
            m_data << item;
        else
            m_data.insert(0, item);
    }

    // Calculate first done-index
    m_firstDoneIndex = data.count();
    for (int i=0; i<m_data.size(); i++) {
        if (m_data[i]->done()) {
            m_firstDoneIndex = i;
            break;
        }
    }
    endResetModel();
}

void ItemModel::refreshData(QJsonArray& data)
{
    // 1. Update available items and delete unnecessary items
    for (int i=m_data.size(); i--;) {
        QString id = m_data[i]->id();
        bool bFound = false;
        for (int j=data.count(); j--;) {
            QJsonObject obj = data.at(j).toObject();
            if (obj.value("id").toString() == id) {
                modifyItem(i, obj.value("text").toString(), obj.value("done").toBool());
                data.removeAt(j);
                bFound = true;
                break;
            }
        }

        if (!bFound)
            deleteItem(i);
    }

    // 2. Add new items
    for (int i=data.count(); i--;) {
        QJsonObject obj = data.at(i).toObject();
        addItem(obj.value("id").toString(), obj.value("text").toString(), obj.value("done").toBool(), false);
    }
}

QString ItemModel::itemId(int row) const
{
    if (row >= 0 && row < m_data.size())
        return m_data[row]->id();


    return "";
}

int ItemModel::itemRow(const QString& id) const
{
    for(int i=0; i< m_data.size(); i++) {
        if(m_data[i]->id()== id)
            return i;
    }
    return -1;
}
