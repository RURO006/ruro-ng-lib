# nodejs mysql 工具

`讓交易更方便使用`

## 設定連線

```js
let NinDb = require('@goldenapple/mysql-tool').DB;

function getDB() {
    return new NinDb(getPoolOption(), getConnectionOption());
}

function getConnectionOption() {
    return {
        host: 'test.example.ap-northeast-1.rds.amazonaws.com',
        user: 'admin',
        password: 'ppaassswwoorrdd',
        database: 'defaultDb',
        port: '3306',
        charset: 'utf8mb4',
        timezone: '+8:00',
    };
}
function getPoolOption() {
    return {
        connectionLimit: 1,
        host: 'test.example.ap-northeast-1.rds.amazonaws.com',
        user: 'admin',
        password: 'ppaassswwoorrdd',
        database: 'defaultDb',
        port: '3306',
        charset: 'utf8mb4',
        timezone: '+8:00',
    };
}
```

## 使用方法

```js
/**
 * 一次性Query
 * */
async function test1(id) {
    let ninDb = getDB();
    let result = await ninDb.oneQuery(
        `SELECT * FROM Table
        WHERE id=?`,
        [id]
    );
    return result;
}

/**
 * 簡易批次(同一個連線)，可透過參數設定是否使用交易、Pool，交易必須有FOR UPDATE來鎖表才有作用
 * */
async function test2(userId, orderId) {
    let ninDb = getDB();

    let results = await ninDb.batchQuery(
        [
            {
                commandText: `SELECT * FROM User
                WHERE id=? FOR UPDATE;`,
                value: [userId],
                resultName: 'User',
            },
            {
                commandText: `SELECT * FROM Order
                WHERE id=?;`,
                value: [orderId],
                resultName: 'Order',
            },
            {
                commandText: `UPDATE User SET name=?
                WHERE id=?;`,
                value: ['newUserName', userId],
                resultName: 'User',
            },
        ],
        false,
        true
    );
    return { User: results['User'], Order: results['Order'] };
}

/**
 * 自訂交易，較為彈性，但必須在發生錯誤時呼叫rollback。交易必須有FOR UPDATE來鎖表才有作用。
 * */
async function test3(userId, orderId, orderCreateTime) {
    let ninDb = getDB();

    let conn = ninDb.createConn();
    // 使用交易
    await ninDb.beginTrans(conn);
    try {
        let userTable = await ninDb.queryTrans(
            conn,
            `SELECT * FROM User
                WHERE id=? FOR UPDATE;`,
            [maxCount, workId]
        );
        if (userTable.length == 0) {
            throw new Error('找不到使用者');
        }
        let orderTable = await ninDb.queryTrans(
            conn,
            `SELECT * FROM Order
            WHERE id=? AND createTime>?`,
            [orderId, orderCreateTime]
        );

        if (userTable[0]['orderId'] != orderTable[0]['id']) {
            throw new Error('訂單編號不一致');
        }

        await ninDb.commitTrans(conn);
        return { ok: 1 };
    } catch (e) {
        console.log('catch rollback');
        await new Promise((resolve, reject) => {
            conn.rollback(() => {
                conn.destroy();
                reject(e);
            });
        });
    }
}
```
