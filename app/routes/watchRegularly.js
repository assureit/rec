var Const = require('../public/const');

// rawデータの監視
exports.watchRawData = function () {
    var sortTime = new Date();
    sortTime.setSeconds(0);
    sortTime.setMilliseconds(0);
    sortTime.setTime(sortTime.getTime() - (60 * 1000 * Const.WATCH_INTERVAL));     // 1周期前から検索

    var key = { data: { $gt: 100 }, entrytime: { $gt: sortTime} };      // 例えばdata値が100より大きい場合
    db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
        collection.find(key, { _id: 0 }).toArray(function (err, item_list) {
            if (err) {
                console.log('error: An error has occurred');
            } else {
                item_list.forEach(function (item) {
                    console.log(" data over = " + JSON.stringify(item));
                    
                    // call api?





                });
            }
        });
    });
};

