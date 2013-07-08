var Const = require('../public/const');
var fs = require('fs');

// rawデータの監視
exports.watchRawDataByPriority = function () {
    var sortTime = new Date();
    sortTime.setSeconds(0);
    sortTime.setMilliseconds(0);
    sortTime.setTime(sortTime.getTime() - (60 * 1000 * Const.WATCH_INTERVAL));     // 1周期前から検索

    var key = { priority: { $gt: 0 }, entrytime: { $gt: sortTime} };
    db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
        collection.find(key, { _id: 0 }).toArray(function (err, item_list) {
            if (err) {
                console.log('error: An error has occurred');
            } else {
                item_list.forEach(function (item) {
                    console.log(" priority over = " + JSON.stringify(item));
                    // call api?
                });
            }
        });
    });
};

// エビデンスの追加
function wrCallback(err, nodeId, ret_status) {
    if (ret_status == true) ret_status = 1;
    else if (ret_status == false) ret_status = 0;
    //console.log('wrCallback ret_status: ' + ret_status);

    if (ret_status != null) {
        // エビデンスの読み込み
        var key = { nodeID: nodeId };   // ※nodeIDが数値型だと数値型にしないと駄目のよう
        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_EVIDENCE, function (err, collection2) {
            collection2.find(key, { _id: 0 }).sort(order).toArray(function (err, evid_list) {
                //console.log(JSON.stringify(evid_list));
                if (!err) {
                    if ((evid_list.length > 0 && ret_status != evid_list[0].status)     // エビデンスと実行結果を比較
                        || (evid_list.length == 0 && nodeId != null)) {               // レコードがない場合
                        // エビデンスを追加
                        var evidenceID_val = nodeId + Const.getUnixtimeString();
                        var timestamp_val = Const.getIsoDateString();
                        doc = { evidenceID: evidenceID_val, nodeID: nodeId, timestamp: timestamp_val, status: ret_status, entrytime: new Date() };
                        collection2.insert(doc, { safe: true }, function (err, result) {
                            if (err) {
                                console.log('error: An error has occurred [watchMonitor : collection2.insert evidence ]');
                            } else {
                                console.log(" add EVIDENCE status change=" + nodeId);
                            }
                        });
                    }
                }
            });
        });
    };
}


// モニタの監視
exports.watchMonitor = function () {

    try {
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection1) {
            collection1.find(null).toArray(function (err, moni_list) {
                if (err) {
                    console.log('error: An error has occurred');
                } else {
                    moni_list.forEach(function (item) {
                        //console.log(JSON.stringify(item));
                        //console.log("nodeID=" + item.nodeID + ", presetID=" + item.presetID + ", params=" + item.params);

                        /*------------------------------------------------------
                        // プリセットからの読み込み実行
                        var key = { presetID: item.presetID };
                        db.collection(Const.DB_TABLE_PRESET, function (err, collection3) {
                            collection3.findOne(key, function (err, preset) {
                                if (preset!=null) {
                                    console.log('■ exe: ' + preset.script);
                                    eval(preset.script);
                                    ret_status = test2(item.params);     // 実行
                                }
                            });
                        });
                        -------------------------------------------------------*/

                        // スクリプトの読み込みと実行
                        var filename = Const.SCRIPT_FOLDER + item.presetID + '.js';
                        fs.readFile(filename, 'utf8', function (err, data) {
                            if (err) {
                                console.log('error: file read error' + err);
                            } else {
                                try {
                                    // 外部スクリプトの呼び出し
                                    eval(data);
                                    monitor_check(item.watchID, item.nodeID, item.params, db, wrCallback);     // 実行
                                } catch (e) {
                                    console.log('script error: ' + e + '   [presetID=' + item.presetID + ']');
                                }
                            }
                        });     // readFile
                    });     // forEach
                }
            });
        });
    } catch (e) {
        console.log('watch regularly Error: ' + e);
    }
};


