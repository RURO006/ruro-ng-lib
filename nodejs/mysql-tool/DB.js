"use strict";

var mysql = require("mysql");

module.exports = class DB {
  /**
   * poolOption、connectionOption至少其中一個要有設定值，看之後要使用哪種來決定。備註:在執行query之前再給值也可以。
   * @param {*} poolOption "mysql.createPool"會用到
   * @param {*} connectionOption "mysql.createConnection"會用到
   * @param {*} queryTimeout query的timeout時間，預設40000 (40秒)。
   */
  constructor(
    poolOption = null,
    connectionOption = null,
    queryTimeout = 40000
  ) {
    this.poolOption = poolOption;
    this.connectionOption = connectionOption;
    this.queryTimeout = queryTimeout; // 40s
    // this.init();
  }

  createConn() {
    if (!this.connectionOption) {
      throw new Error("connectionOption要有設定值。");
    }
    return mysql.createConnection(this.connectionOption);
  }

  createPool() {
    if (!this.poolOption) {
      throw new Error("poolOption要有設定值。");
    }
    return mysql.createPool(this.poolOption);
  }

  async getConn(pool) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(connection);
      });
    });
  }

  /**
   * 執行commandText，
   * @param {string} commandText sql語法
   * @param {Array<any>} values commandText的參數，防注入攻擊。??:欄位、表名。?:值。
   * @param {*} connection 可以是null，會自動產生。
   * @param {boolean} destroy 是否要中斷連接，預設true。
   */
  async oneQuery(
    commandText = "",
    values = [],
    connection = null,
    destroy = true
  ) {
    console.log(commandText);
    console.log(values);
    if (!connection) connection = this.createConn();
    if (connection.hasBeginTrans)
      throw new Error("connection有包含交易，請改用queryTrans來執行。");
    return new Promise((resolve, reject) => {
      connection.query(
        {
          sql: commandText,
          timeout: this.queryTimeout, // 40s
          values: values
        },
        (error, results, fields) => {
          if (destroy) connection.destroy();

          if (error) {
            reject(error);
            return;
          }
          resolve(results);
        }
      );
    });
  }

  /**
   * 開始交易，最後需要用commitTrans執行。
   * 交易中有些語法不適用，請看下面網址
   * https://dev.mysql.com/doc/refman/5.5/en/implicit-commit.html
   */
  beginTrans(connection) {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(err => {
        if (err) {
          reject(err);
          return;
        }
        connection.hasBeginTrans = true;
        resolve();
      });
    });
  }

  /**
   * 執行commandText，這是交易最後需要呼叫commitTrans才算真的執行。
   * @param {*} connection
   * @param {string} commandText sql語法
   * @param {Array<any>} values commandText的參數，防注入攻擊。
   */
  async queryTrans(connection, commandText = "", values = []) {
    console.log("commandText", commandText);
    console.log("values", values);
    if (!connection) throw new Error("connection不能是null");

    return new Promise((resolve, reject) => {
      connection.query(
        {
          sql: commandText,
          timeout: this.queryTimeout, // 40s
          values: values
        },
        (error, results, fields) => {
          if (error) {
            console.log("queryTrans rollback");
            return connection.rollback(() => {
              reject(error);
            });
          }
          resolve(results);
        }
      );
    });
  }

  /**
   * 執行交易
   */
  async commitTrans(connection) {
    return new Promise((resolve, reject) => {
      connection.commit(err => {
        connection.destroy();
        if (err) {
          console.log("commitTrans rollback");
          return connection.rollback(() => {
            reject(err);
          });
        }
        resolve();
      });
    });
  }

  /**
   * 批次執行，方便用。
   * @param {Array<{commandText, value,resultName}>} commandArray [{commandText, value}]，value可以是[變數,'值']或function:(results,index)=>return [results[0],'qwe'];。resultName代表result回傳的名稱，用來當作新的參考。
   * @param {boolean} usePool 是否使用Pool，預設false。
   * @param {boolean} useTrans 是否使用交易，預設false。
   */
  async batchQuery(commandArray = [], usePool = false, useTrans = false) {
    let results = [];
    let conn = null;
    if (
      !(commandArray instanceof Array) &&
      "commandText" in commandArray &&
      "value" in commandArray
    )
      commandArray = [commandArray];

    if (usePool) {
      //使用pool連線
      let pool = this.createPool();
      conn = await this.getConn(pool);
    } else {
      //一般連線
      conn = this.createConn();
    }

    if (useTrans) {
      //有用交易
      await this.beginTrans(conn);
      try {
        for (let i = 0; i < commandArray.length; i++) {
          // console.log("iii", commandArray[i]);
          let oneResult;
          let value;
          if (commandArray[i].value instanceof Function) {
            value = await commandArray[i].value(results, i);
          } else value = commandArray[i].value;
          oneResult = await this.queryTrans(
            conn,
            commandArray[i].commandText,
            value
          );
          // 如果有設定resultName，則新增resultName當回傳參考。
          if (commandArray[i].resultName) {
            results[commandArray[i].resultName] = oneResult;
          }
          results.push(oneResult);
        }
        await this.commitTrans(conn);
      } catch (e) {
        console.log("catch rollback");
        await new Promise((resolve, reject) => {
          conn.rollback(() => {
            conn.destroy();
            reject(e);
          });
        });
      }
    } else {
      //沒有用交易
      for (let i = 0; i < commandArray.length; i++) {
        let oneResult;
        let value;
        if (commandArray[i].value instanceof Function) {
          value = await commandArray[i].value(results, i);
        } else value = commandArray[i].value;
        oneResult = await this.oneQuery(
          commandArray[i].commandText,
          value,
          conn,
          i == commandArray.length - 1
        );
        // 如果有設定resultName，則新增resultName當回傳參考。
        if (commandArray[i].resultName) {
          results[commandArray[i].resultName] = oneResult;
        }
        results.push(oneResult);
      }
    }
    return results;
  }
};
