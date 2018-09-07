/**
 * Created by Niki on 9/6/18 10:14 AM.
 * Email: m13296644326@163.com
 */

import React from 'react';
import {
    Platform
} from 'react-native';

const isIos = Platform.OS === 'ios';
import SQLiteStorage from 'react-native-sqlite-storage';

const getInsertPartByObj = (params) => {
    let sqlPart = Object.keys(params).reduce((pre, now) => pre + ',' + now);
    let sqlPart2 = Object.keys(params).reduce((pre, now, index) => {
        if (index === 0) {
            return pre + '?';
        }
        return pre + ', ?';
    }, '');
    return {
        sqlPart,
        sqlPart2,
        paramsPart: Object.values(params)
    }
};

const getUpdatePartByObj = (params) => {
    let keys = Object.keys(params);
    let sqlPart = keys.reduce((pre, now, index) => {
        if (index === 0) {
            return pre + `${now} = ?`;
        }
        return pre + `, ${now} = ?`;
    }, '');
    return {
        sqlPart,
        paramsPart: Object.values(params),
    }
};

logSuccess = (name, info) => {
    console.log('SQLiteStorage ' + name + ' success!');
    info && console.log('successInfo: ');
    info && console.log(info);
};

logError = (name, err) => {
    console.log('SQLiteStorage ' + name + ' failed!');
    err && console.log('errInfo: ');
    console.log(err);
};

getCallbacks = (action, tableName) => [
    (info, results) => logSuccess(action + ' ' + tableName, results),
    (err) => logError(action + ' ' + tableName, err),
];
export default class BaseSqliteClient {

    /**
     *
     * @param dbName                数据库名字, 以.db为后缀, 例如tet.db
     * @param dbVersion             数据库版本号, 例如1.0
     * @param dbDisplayName         例如TestSqlite
     * @param dbSize                数据库size, 默认为-1, 表示无限制
     * @param tableName             表名字
     * @param tableCreateCommand    表创建命令, 框架已自动指定id主键, 使用者不要重复指定
     *                              注意: 如果某字段是你的去重依据, 那么千万注意要将该字段设置为unique, 否则insertOrUpdate方法无法使用!
     * @param debugMode             是否开启debug模式, 默认开启; 如果开启, 会在console打印一些日志
     *
     * 注意: 如果某字段是你的去重复依据, 那么千万注意要将该字段设置为unique, 否则insertOrUpdate方法无法使用!
     */
    constructor({dbName, dbVersion, dbDisplayName, dbSize = -1, tableName, tableCreateCommand, debugMode = true}) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.dbDisplayName = dbDisplayName;
        this.dbSize = dbSize;
        this.tableName = tableName;
        this.tableCreateCommand = tableCreateCommand;
        SQLiteStorage.DEBUG(debugMode);
        this.dataBase = null;
    }

    open = () => {
        this.dataBase = SQLiteStorage.openDatabase(
            this.dbName,
            this.dbVersion,
            this.dbDisplayName,
            this.dbSize,
            ...getCallbacks('open database data', this.tableName),
        );
        return this.dataBase;
    };

    close = () => {
        this.dataBase && this.dataBase.close();
        this.dataBase = null;
    };

    createTable = () => {
        if (!this.dataBase) {
            this.open();
        }
        this.dataBase.transaction(tx => {
                tx.executeSql(`CREATE TABLE IF NOT EXISTS ${this.tableName} (` +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                    this.tableCreateCommand
                    + ')',
                    [],
                    () => this.logSuccess('create table ' + this.tableName),
                    (err) => this.logError('create table ' + this.tableName, err)
                );
            },
            ...getCallbacks('create table', this.tableName),
        );
    };

    insert = params => {
        const {sqlPart, sqlPart2, paramsPart} = getInsertPartByObj(params);
        //先update, 如果row小于0, 那么insert
        if (!this.dataBase) {
            this.open();
        }
        return new Promise((res, rej) => {
            this.dataBase.transaction(tx => {
                    tx.executeSql(
                        `INSERT INTO ${this.tableName} (${sqlPart}) VALUES (${sqlPart2})`,
                        paramsPart,
                        (info, results) => res(results.rowsAffected),
                        (err) => {
                            getCallbacks('insert data', this.tableName)[1](err);
                            //todo ios平台不一定报这个错
                            if (err && err.message && err.message.indexOf('UNIQUE constraint failed') >= 0) {
                                //差不多就是报错的意思
                                res(0);
                            }
                        },
                    );
                },
                ...getCallbacks('insert data', this.tableName),
            )
        });
    };

    update = (params, where) => {
        const {sqlPart, paramsPart} = getUpdatePartByObj(params);
        const {sqlPart: sqlPartWhere, paramsPart: paramsPartWhere} = getUpdatePartByObj(where);
        return new Promise((res, rej) => {
            this.dataBase.transaction(tx => {
                    let data = tx.executeSql(
                        `UPDATE ${this.tableName} SET ${sqlPart} WHERE ${sqlPartWhere}`,
                        [...paramsPart, ...paramsPartWhere],
                        (info, results) => res(results.rowsAffected),
                        getCallbacks('update data', this.tableName)[1],
                    );
                    console.log(data);
                },
                ...getCallbacks('update data', this.tableName),
            )
        })
    };

    insertOrUpdate = (params, where) => {
        return this.insert(params)
            .then(rowsAffected => {
                //如果顺利插入
                if (rowsAffected > 0) {
                    return rowsAffected;
                }
                //如果由于重复无法顺利插入
                else {
                    return this.update(params, where);
                }
            });
    };

    query = where => {
        let wherePart = '';
        let whereParams = [];
        if (where && JSON.stringify(where) !== '{}') {
            const {sqlPart, paramsPart} = getUpdatePartByObj(where);
            wherePart = 'WHERE ' + sqlPart;
            whereParams = paramsPart;
        }
        return new Promise((res, rej) => {
            this.dataBase.transaction(tx => {
                    tx.executeSql(
                        `SELECT * FROM ${this.tableName} ${wherePart}`,
                        whereParams,
                        (info, results) => {
                            let finalData = [];
                            if (results && results.rows && results.rows.length > 0) {
                                for (let i = 0; i < results.rows.length; i++) {
                                    finalData.push(results.rows.item(i));
                                }
                            }
                            res(finalData);
                        },
                        getCallbacks('insert data', this.tableName)[1],
                    );
                },
                ...getCallbacks('select data', this.tableName),
            )
        });
    };

    executeRawSql = (sqlStr: string, params?: Array )=> {
        return new Promise((res, rej) => {
            this.dataBase.transaction(tx => {
                    tx.executeSql(
                        sqlStr,
                        params,
                        (info, results) => {
                            res(results);
                        },
                        err => rej(err),
                    );
                },
                ...getCallbacks('raw sql', this.tableName),
            )
        });
    };

    deleteData = (where) => {
        const {sqlPart, paramsPart} = getUpdatePartByObj(where);
        return new Promise((res, rej) => {
            this.dataBase.transaction(tx => {
                    tx.executeSql(
                        `DELETE FROM ${this.tableName} WHERE ${sqlPart}`,
                        paramsPart,
                        (info, results) => res(results.rowsAffected),
                        getCallbacks('update data', this.tableName)[1],
                    );
                },
                ...getCallbacks('delete data', this.tableName),
            )
        })
    };

    _deleteTable = (tableName) => {
        this.dataBase.transaction(tx => {
                tx.executeSql(
                     `drop table ${tableName}`,
                    [],
                    ...getCallbacks('delete table', this.tableName),
                )
            },
            ...getCallbacks('delete table', this.tableName),
        )
    }

}
