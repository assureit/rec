var mongo = require('mongodb');
var Const = require('./const');

db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
db.open(function (err, db) {
    if (!err) {
         console.log('open mongoDB for regularly.');
        setInterval(getData,60000.0);
    }
});

var getData = function () {
    try {
        console.log("▼ run " + Const.getDateString());
        watchRawDataByPriority();
        watchMonitor();
    } catch (e) {
        console.log("● error：" + e.Message);
    }
}

// rawデータの監視
function watchRawDataByPriority() {
    var where = { priority: {$gt:0} };
   
    console.log('watchRawDataByPriority');
    db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
        collection.find(where, { _id: 0 }).toArray(function (err, item_list) {
            if (err) {
                console.log('error: An error has occurred');
            } else {
                item_list.forEach(function (item) {
                    console.log(JSON.stringify(item));
                    // call api?
                });
            }
        });
    });
};

// モニタの監視
function watchMonitor() {
    db.collection(Const.DB_TABLE_MONITOR, function (err, collection1) {
        collection1.find(null, { _id: 0 }).toArray(function (err, item_list) {
            if (err) {
                console.log('error: An error has occurred');
            } else {
                item_list.forEach(function (item) {
                    //console.log(JSON.stringify(item));
                    console.log("nodeID=" + item.nodeID);

                    // ここでスクリプトを実行
                    console.log(" exe script");
//var testtest = require('./testtest');
//console.log(" testtest=" + testtest.getDateString());

                    var ret_status = 0;


                    var where = { nodeID: Number(item.nodeID) };   // ※nodeIDが数値型だと数値型にしないと駄目のよう

                    db.collection(Const.DB_TABLE_EVIDENCE, function (err, collection2) {
                        collection2.find(where, { _id: 0 }).toArray(function (err, evid_list) {
                            console.log(JSON.stringify(evid_list));
                            if (!err) {
                                if (evid_list.length > 0) {
                                    // エビデンスと実行結果を比較
                                    console.log(" db status=" + evid_list[0].status);
                                } else {
                                    // エビデンスの追加
                                    var evidenceID_val = Const.getRawID(item.nodeID);
                                    var timestamp_val = Const.getIsoDateString();
                                    doc = { evidenceID: evidenceID_val, nodeID: Number(item.nodeID), timestamp: timestamp_val, status: ret_status };
                                    console.log(" add EVIDENCE");
                                }
                                console.log("nodeID add=" + item.nodeID);
                            }
                        });
                    });
                });
            }
        });
    });
};

