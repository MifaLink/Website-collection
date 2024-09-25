// 返回正确的四位数年份格式
function getYear(year) {
	// .match()  a string method in JavaScript searches a string for a match against a regular expression. It returns an array of matches if found or null if no match is found.
    //[\d]: This part matches any digit (0-9). \d is shorthand for [0-9]
	if(year) {
		return year.match(/[\d]{4}/); // This is regex (https://en.wikipedia.org/wiki/Regular_expression)
	}
}


// Function to iterate over the fetched records and dynamically append them to the DOM
// 这里的data是AJAX返回的数据
function iterateRecords(data) {
	// Log the entire data object to the console for debugging
	console.log(data);

	// Use $.each() to loop through each record in the API response
    // 这个data数据结构中，通常会包含一个 result 对象，里面有记录（records 数组）
	$.each(data.result.records, function(recordKey, recordValue) {

		// Extract relevant information from each record
		var recordTitle = recordValue["dc:title"];
		var recordYear = getYear(recordValue["dcterms:temporal"]);
		var recordImage = recordValue["150_pixel_jpg"];
		var recordImageLarge = recordValue["1000_pixel_jpg"];
		var recordDescription = recordValue["dc:description"];

		 // Check if all the necessary fields are present
		if(recordTitle && recordYear && recordImage && recordDescription && recordImageLarge) {

			if(recordYear < 1900) { // Only get records from the 19th century
				// Dynamically create a new section element with the record's details
				$("#records").append(
					$('<article class="record">').append(
						$('<h2>').text(recordTitle),// Append the title as <h2>
						$('<h3>').text(recordYear),// Append the year as <h3>
						
						// $("<a>"): 创建一个新的 <a> 元素，用于包含图片。
						// .attr("href", recordImageLarge): 将 href 属性设置为 recordImageLarge 变量的大图像的URL
						$("<a>").attr("href", recordImageLarge).addClass("strip").attr("data-strip-caption", recordTitle).append(
							$('<img>').attr("src", recordImage)
						),// Append the image

						//$('<img>').attr("src", recordImage),
						$('<p>').text(recordDescription)
					)// Append the description
				);
			}
		}

		// this function would make a loaded class after previous stage is finished.
		setTimeout(function () {
			$("body").addClass("loaded");
		}, 2000); // 2 seconds

		// jQuery 选择filter-count里的strong元素
		// 把文本元素通过.text()设置成(".record:visible").length，即可见记录的数量
		// :visible 是一个伪类选择器，用于选择当前在页面上可见（display not none && opacity != 0）的元素。
		$("#filter-count strong").text($(".record:visible").length);

		// .keyup(): 绑定一个键盘事件处理程序，keyup 事件在用户松开按键时触发
		$("#filter-text").keyup(function(event) {
			// $(this).val(): $(this) 代表当前的输入框（即 #filter-text）提取到的值
			var searchTerm = $(this).val();
			console.log(searchTerm);
			$(".record").hide();
			$(".record:contains('" + searchTerm + "')").show();
			// 用于选择查询后在页面上可见的记录
			$("#filter-count strong").text($(".record:visible").length);
		});

	});

}

// When the document is ready, make the AJAX request
$(document).ready(function() {
	// 把stringfy后的本地data再次转换成json模式
	var slqData = JSON.parse(localStorage.getItem("slqData"));

	if (slqData) {
		console.log("Source: localStorage");
		iterateRecords(slqData);
	} else {
		console.log("Source: ajax call");
		// Define the data object with the resource ID and limit for the API request
        // url 是 API 的基础地址，data 对象中的 resource_id 和 limit 会自动被附加到这个 URL 上，形成完整的请求地址
		var data = {
			resource_id: "9eaeeceb-e8e3-49a1-928a-4df76b059c2d",
			limit: 50
		}

		// Perform an AJAX request to fetch the records
		$.ajax({
			url: "https://data.qld.gov.au/api/3/action/datastore_search",
			data: data,// Send the data object (resource_id and limit) with the request
			dataType: "jsonp", // We use "jsonp" to ensure AJAX works correctly locally (otherwise XSS).
			cache: true,
			success: function(data) {
				// convert the JSON object into a string
				// 每次ajax 运行的时候，本地储存的数据都会被重写
				localStorage.setItem("slqData", JSON.stringify(data));
				// Call the iterateRecords function on successful retrieval of data
				iterateRecords(data);
			}
		});

	}

});