'use strict';
// version:2019-10-14
module.exports = class FormatCheck {
    /**
     * 檢查字串是否空值或長度為0
     * 461:字串空值或長度為0
     * 462:不合法的格式
     * @param {*} str 字串
     * @param {*} columnsName 欄位名稱
     */
    static checkNotNullString(str, columnsName) {
        const result = typeof str === 'string' && str.length > 0;
        if (!result) {
            let error = new Error('461');
            error.columnsName = columnsName;
            throw error;
        }
    }

    /**
     * 檢查字串是否為電話格式
     * @param {string} str 電話
     */
    static checkPhone(str) {
        const result = /^(\d{2,4}-?)(\d{6,8})(#\d{3,5})?$/.test(str);
        if (!result) {
            let error = new Error('462');
            error.columnsName = '電話';
            throw error;
        }
    }

    /**
     * 檢查數字是否合法
     * @param {number} num 數字
     * @param {number} min 最小值
     * @param {number} max 最大值
     */
    static checkInteger(num, columnsName, min, max) {
        if (!num && !Number.isInteger(num)) {
            let error = new Error('461');
            error.columnsName = columnsName;
            throw error;
        }

        if (!Number.isInteger(num) || (Number.isInteger(min) && num < min) || (Number.isInteger(max) && num > max)) {
            let error = new Error('462');
            error.columnsName = columnsName;
            throw error;
        }
    }

    /**
     * 檢查字串是否為email格式
     * @param {string} str email
     */
    static checkEmail(str) {
        const result = /^\w+([\.\-]\w+)*@\w+(\.\w+)*$/.test(str);
        if (!result) {
            let error = new Error('462');
            error.columnsName = 'email';
            throw error;
        }
    }

    /**
     * 檢查str是否為_enum裡面的字串
     * @param {string} str 字串
     * @param {string} columnsName 欄位名稱
     * @param {Array<string>} _enum 必須符合的字串陣列
     */
    static checkStringEnum(str, columnsName, _enum) {
        if (!_enum.includes(str)) {
            let error = new Error('462');
            error.columnsName = columnsName;
            throw error;
        }
    }

    /**
     * 檢查陣列的欄位是否有重複出現
     * @param {*} list
     * @param {*} columnsName list中要檢查的欄位名稱
     * @param {*} showName 顯示錯誤的名稱
     */
    static checkArrayUnitId(list, columnsName, showName) {
        let map = {};
        if (list instanceof Array) {
            for (const item of list) {
                if (!(item[columnsName] in map)) {
                    map[item[columnsName]] = true;
                } else {
                    let error = new Error('462');
                    error.columnsName = showName;
                    throw error;
                }
            }
        }
    }
};
