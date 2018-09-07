# react-native-sqlite-helper-pro
使用前请先确保添加了[react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)库并进行了link, 最好对sql语句有一定的了解, 了解基本的sql增删改查语句, 感兴趣的话建议看看[W3C SQL教程](http://www.w3school.com.cn/sql/index.asp).
## Installation

    yarn add react-native-sqlite-helper-pro

## How to use
**下面是代码例子**

```
/**
 * Created by Niki on 9/8/18 12:59 AM.
 * Email: m13296644326@163.com
 */

import React from 'react';
import {
    View,
    StyleSheet, TouchableOpacity, Text,
} from 'react-native';
import {BaseSqliteClient} from "../index";

export default class TestSqlitePage extends React.PureComponent {

    constructor(props) {
        super(props);
        this.baseSqliteClient = new BaseSqliteClient({
            dbName: 'test_data.db',
            dbVersion: '1.0',
            dbDisplayName: 'TestApp',
            tableName: 'SHOPPING_CART_DRUG',
            tableCreateCommand:
            'drugId INTEGER UNIQUE , ' +            //drugId作为去重标志需要设置为unique
            'drugStoreId INTEGER, ' +
            'detail TEXT',
        });
        this.baseSqliteClient.open();
        this.baseSqliteClient.createTable();
    }

    render() {
        return (
            <View style={styles.container}>
                <BlueButton
                    onPress={() => {
                        this.baseSqliteClient.insert({drugId: 1, drugStoreId: 1, detail: 'a detail data!'})
                            .then(rowsAffected => {
                                if (rowsAffected > 0){
                                    //插入成功
                                    console.log('insert success!')
                                }else {
                                    //插入失败
                                    console.log('insert failed!')
                                }
                            });
                    }}
                    text={'插入数据'}
                />
                <BlueButton
                    onPress={() => {
                        this.baseSqliteClient.update(
                            //params
                            {drugId: 2, drugStoreId: 2, detail: 'a detail data2!'},
                            //where
                            {drugId: 2}
                        )
                            .then(rowsAffected => {
                                if (rowsAffected > 0){
                                    //更新成功
                                    console.log('insert success!')
                                }else {
                                    //更新失败
                                    console.log('insert failed!')
                                }
                            });
                    }}
                    text={'更新数据'}
                />
                <BlueButton
                    onPress={() => {
                        //插入或更新, 优先插入, 如果插入失败(数据已存在), 就更新数据
                        //千万要注意的是, drugId这个字段必须为UNIQUE, 不然进行insert操作时无法判断是否存在重复数据, insertOrUpdate方法也就无效了
                        this.baseSqliteClient.insertOrUpdate(
                            //params
                            {drugId: 2, drugStoreId: 2, detail: 'a detail data2!'},
                            //where
                            {drugId: 2}
                            )
                            .then(rowsAffected => {
                                if (rowsAffected > 0){
                                    //插入或更新成功
                                    console.log('insert success!')
                                }else {
                                    //插入或更新失败
                                    console.log('insert failed!')
                                }
                            });
                    }}
                    text={'插入或更新数据'}
                />
                <BlueButton
                    onPress={() => {
                        //查询数据, 参数为where, 可不传, 表示查询所有数据
                        this.baseSqliteClient.query(
                            //where
                            {drugId: 1}
                            )
                            .then(data => {
                                //data为数组
                                console.log(data)
                            });
                    }}
                    text={'查询数据'}
                />
                <BlueButton
                    onPress={() => {
                        //删除数据
                        this.baseSqliteClient.deleteData(
                            //where
                            {drugId: 1}
                            )
                            .then(data => {

                            });
                    }}
                    text={'删除数据'}
                />
            </View>
        )
    }

	//千万别忘了close
    componentWillUnmount(){
        this.baseSqliteClient && this.baseSqliteClient,close();
    }

}

const BlueButton = (p) => {
    const {text, onPress} = p;
    return ( <TouchableOpacity
        onPress={onPress}
        style={{backgroundColor: '#66abfa', paddingVertical: 5, paddingHorizontal: 10, marginTop: 10}}
    >
        <Text style={{color: '#fff', fontSize: 14}}>{text}</Text>
    </TouchableOpacity>)
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    }
});
```
## 参数说明
**构造方法传入参数说明**

| 参数名          | 默认值				 | 参数说明                                                                                                                                              |
| :------------------ | :----------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dbName             | -      | 数据库名字, 以.db为后缀, 例如tet.db                                                                                                            |
| dbVersion          | 1.0    | 数据库版本号                                                                                                                                        |
| dbDisplayName      |        | 数据库展示名称, 例如TestSqlite                                                                                                                   |
| dbSize             | 1     | 数据库size, 默认为-1, 表示无限制                                                                                                               |
| tableName          | -      | 数据库表的表名                                                                                                                                     |
| tableCreateCommand | -      | 表创建命令; 框架已自动指定id主键, 使用者不要重复指定; 注意: 如果某字段是你的去重依据, 那么千万注意要将该字段设置为unique, 否则insertOrUpdate方法无法使用! |
| debugMode          |        | 是否开启debug模式, 默认开启; 如果开启, 会在console打印一些日志                                                                      |

**方法说明**

| 方法名      | 参数                     | 方法说明                                                                          |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| open           | -                          | 创建或打开书库, 返回数据库代理对象                                    |
| close          | -                          | 关闭数据库通道, 解决性能                                                   |
| createTable    | -                          | 创建表, if not exist                                                               |
| insert         | params                     | 插入一条数据                                                                    |
| update         | params, where              | 修改一条数据                                                                    |
| insertOrUpdate | params, where              | 插入或更新数据; 先尝试插入, 如果有重复数据则更新数据; 注意去重标志字段需要设为unique. |
| query          | where                      | 按照条件数据, 可为空                                                         |
| executeRawSql  | sql, paramsArray: 参数数组 | 执行自定义的sql语句                                                           |
| deleteData     | where                      | 按照条件删除数据                                                              |
| _deleteTable   | 删除table                | 一般仅供测试使用                                                              |

## 建议
 **为了保证代码的可维护性和稳定性, 建议定义一个YourSqliteClient 继承 BaseSqliteClient, 然后在YourSqliteClient中书写业务代码**<br/>
 **记得点赞哦~**