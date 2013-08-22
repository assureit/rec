function clickCell(cell) {
	var radioList = document.getElementsByName("selid");
	if( radioList.length>1 ) {
		document.forms[1].selid[cell].click();
	} else {
		document.forms[1].selid.click();
	}
}

function addView(url)
{
    document.forms[1].editType.value='addEdit' ;
    document.forms[1].action = url ;
    document.forms[1].submit() ;
}

function updateView(url)
{
	var radioList = document.getElementsByName("selid");
	for( var i=0; i<radioList.length; i++ ) {
		if(radioList[i].checked) {
            document.forms[1].editType.value='updateEdit' ;
            document.forms[1].action = url ;
            document.forms[1].submit() ;
		}
	}
}

function deleteView(url)
{
	var radioList = document.getElementsByName("selid");
	for( var i=0; i<radioList.length; i++ ) {
		if(radioList[i].checked) {
		    var res = confirm('選択されたデータを削除します。\nよろしいですか？');
            if( res==true ) {
                document.forms[1].editType.value='delete' ;
                document.forms[1].action = url ;
                document.forms[1].submit() ;
            }
		}
	}
}

function editExecute()
{
    document.forms[1].submit() ;
}

function retList(url)
{
    location.href =  url ;
}

function rawDataSort()
{
	var watchID = document.getElementById("watchID").value;
    location.href = "rawDataList?watchID=" + watchID;
}

function evidenceSort()
{
	var nodeID = document.getElementById("nodeID").value;
    location.href = "evidenceList?nodeID=" + nodeID;
}

function recoveryeviSort()
{
	var nodeID = document.getElementById("nodeID").value;
    location.href = "recoveryeviList?nodeID=" + nodeID;
}
