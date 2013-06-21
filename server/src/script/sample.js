/**
 * モニタチェック用サンプルスクリプト
 * このスクリプトファイルはプリセットで登録される判断用スクリプトである。
 * 以下のルールに沿ってスクリプトの記載を行う。
 * 
 *  1) ファイル名は「(presetID).js」となる。
 *  2) ファイル内部には「function monitor_check(Array, Db)」という関数を定義する。
 *  　　第一引数にはmonitorテーブルのparamsの値が配列として格納される。
 *  　　第二引数にはmongodbに接続済みのDBオブジェクトが引き渡される。
 *  3) 戻り値はtrue/falseで返す。
 *  4）エラーなどで判断が行えない場合はnullを返す
 * 
 * 
 * なお、array型オブジェクトにはmonitorのparams値が格納されますが、一般的には以下の順序で格納されます。
 * 　array[0]：	watchID		: 確認するrawデータに紐づけられたID
 * 　array[1]：	reference	: 閾値の判断値 
 * 　array[2]：	between		: 範囲。メソッドによって「最新データから何秒分」または「最新データから何件分」のどちらかで使用
 * 上記以外のケースは任意とする。原則として独自変数をarray[3]以降に追加する形式を推奨する。
 */
var Const = require('../public/const');

function monitor_check(param_array, db){
	var ret_val = null;

	// このスクリプトの場合、引数に三つのデータが受け取れない場合はエラーとする。
	// 異常時はnullを返し、true/falseはあくまでもモニタの値から判断した場合の戻り値とする
	if(param_array.length < 3) {
		return ret_val;
	}

	var watchID_val = param_array[0];
	var reference_val = param_array[1];
	var between_val = param_array[2];
	var lastUpdate_val = null;
	var totalCount = 0;

	try {
		// 受け取った変数の型チェック
		// watchIDはnumber/stringのいずれでも問題無いが、referenceおよびbetweenはnumberで
		// あることを保証しておく必要がある。
		if(typeof reference_val != "number"){
			throw "error: reference is not number!";
		}
		if(typeof between_val != "number"){
			throw "error: between is not number!";
		}
		
		// rawデータから指定した項目の先頭値を取得する
	    var where = { watchID: watchID_val };
	    var order = { timestamp: -1 };      // -1:desc 1:asc
	    db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
	        collection.find(where).sort(order).toArray(function (err, item_list) {
	            if (err) {
	                console.log('error: An error has occurred');
	                throw err;
	            } else {
	                //console.log(JSON.stringify(item_list));
	                lastUpdate = item_list[0].timestamp;


	                // 指定時間のｎ秒前のDate型を作って検索条件に追加
	                var baseSec = lastUpdate.getTime();
	                var limitDate = new Date();
	                limitDate.setTime(baseSec - between_val * 1000);
	                
	                var where2 = { watchID: watchID_val, timestamp: {$gt: limitDate} };
	                collection.find(where2).sort(order).toArray(function (err, item_list) {
	                    if (err) {
	                        console.log('error: An error has occurred');
	                        throw err;
	                    } else {
	                        //console.log(JSON.stringify(item_list));
	                    	// 対象データが取得出来ているはずなので、ここで実際の計算を行う
	                    	var count = item_list.length;
	                    	var max = undefined;
	                    	var min = undefined;
	                    	var total = 0;
	                    	var ave = 0;
	                    	for(var i = 0; i < count; i++){
	                    		var data = item_list[i].data;
	                    		var number = data.num;
	                    		
	                    		if(typeof max == "undefined"){
	                    			max = number;
	                    		}
	                    		else if(max < number) {
	                    			max = number;
	                    		}
	                    		
	                    		if(typeof min == "undefined"){
	                    			min = number;
	                    		}
	                    		else if(min > number) {
	                    			min = number;
	                    		}
	                    		
	                    		total = total + number;
	                    	}
	                    	ave = total / count;
	                    	// 最大値・最小値・平均値が求められたところで、指定地との比較を実施
	                        if(reference_val <= ave){
	                        	ret_val = true;
	                        }
	                    }
	                    
	                    // 全てのDBアクセスが終わっているのでクローズ
	            	    db.close();
	                });
	            }
	        });	// collection.find(where).sort(order).toArray(function (err, item_list)
	    });		// db.collection(Const.DB_TABLE_RAWDATA, function (err, collection)
	} catch (e) {
	    console.log("失敗：" + e.Message);
	}
	return ret_val;
}