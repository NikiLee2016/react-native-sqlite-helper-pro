/**
 * Created by Niki on 9/7/18 9:59 AM.
 * Email: m13296644326@163.com
 */

import React from 'react';
import {
    Platform
} from 'react-native';
import BaseSqliteClient from "./BaseSqliteClient";

const isIos = Platform.OS === 'ios';
export const commonSqliteConfig = {
    dbName: 'rainon_yiyao_data.db',     //数据库名字, 以.db为后缀, 例如tet.db
    dbVersion: '1.0',  //数据库版本号, 例如1.0
    dbDisplayName: 'RainonApp',  //例如TestSqlite
};

export default class DrugSqliteClient extends BaseSqliteClient{
    constructor() {
        super({
            ...commonSqliteConfig,
            tableName: 'SHOPPING_CART_DRUG',      //表名字
            tableCreateCommand:
            'drugId INTEGER UNIQUE , ' +            //drugId作为去重标志需要设置为unique
            'drugStoreId INTEGER, ' +
            'detail TEXT',
        });
        this.open();
        this.createTable();
    }

    queryDrugByStoreId = (drugStoreId) => {
        return this.query({drugStoreId});
    }

}

