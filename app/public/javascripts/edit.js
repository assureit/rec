function retList(url)
{
    location.href =  url ;
}

function rawDataSort()
{
	var location_val = document.getElementById("location").value;
    location.href = "rawDataList?location=" + location_val;
}

