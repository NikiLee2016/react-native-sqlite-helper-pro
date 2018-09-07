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