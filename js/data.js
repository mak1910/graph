var data = {};

data.main = function() {
	$('.AccessToken').hide();
}

data.chartInit = function() {
	var ctx = document.getElementById("myChart");
	var data = {
	    labels: ["January", "February", "March", "April", "May", "June", "July"],
	    datasets: [
	        {
	            label: "My First dataset",
	            fill: false,
	            lineTension: 0.1,
	            backgroundColor: "rgba(75,192,192,0.4)",
	            borderColor: "rgba(75,192,192,1)",
	            borderCapStyle: 'butt',
	            borderDash: [],
	            borderDashOffset: 0.0,
	            borderJoinStyle: 'miter',
	            pointBorderColor: "rgba(75,192,192,1)",
	            pointBackgroundColor: "#fff",
	            pointBorderWidth: 1,
	            pointHoverRadius: 5,
	            pointHoverBackgroundColor: "rgba(75,192,192,1)",
	            pointHoverBorderColor: "rgba(220,220,220,1)",
	            pointHoverBorderWidth: 2,
	            pointRadius: 1,
	            pointHitRadius: 10,
	            data: [65, 59, 80, 81, 56, 55, 40],
	            spanGaps: false,
	        }
	    ]
	};
	var myLineChart = new Chart(ctx, {
    	type: 'line',
    	data: data	
    });
}

data.PostsOverTime = function() {
	var postsCounter = {};
	var likesCounter = {};
	var starting 	 = {};

	_.each(globalData.posts, function(post) {
		var date  = post.created_time.substring(0,10);
		var year  = parseInt(date.substring(0,4));
		var month = parseInt(date.substring(5,7));
		
		if(!postsCounter[year]) 
			postsCounter[year] = {};
		if(!postsCounter[year][month])
			postsCounter[year][month] = 0;
		postsCounter[year][month]++;

		if(!likesCounter[year]) 
			likesCounter[year] = {};
		if(!likesCounter[year][month])
			likesCounter[year][month] = 0;
		likesCounter[year][month]+= post.likes.length;

		starting.year  = year;
		starting.month = month;
	})

	var presentTime  = new Date();
	var presentYear  = presentTime.getFullYear();
	var presentMonth = presentTime.getMonth() + 1;

	var labels 	   = [];
	var postsCount = [];
	var likesCount = [];

	for(var j=starting.month; j<=12; j++) {
		labels.push(j + '/' + starting.year);
		postsCount.push(postsCounter[starting.year][j] || 0);
		likesCount.push(likesCounter[starting.year][j] || 0);
	}

	for(var i=starting.year + 1; i<presentYear; i++) {
		for(var j=1; j<=12; j++) {
			labels.push(j + '/' + i);
			postsCount.push(postsCounter[i][j] || 0);
			likesCount.push(likesCounter[starting.year][j] || 0);
		}
	}

	for(var j=1; j<=presentMonth; j++) {
		labels.push(j + '/' + presentYear);
		postsCount.push(postsCounter[presentYear][j] || 0);
		likesCount.push(likesCounter[starting.year][j] || 0);
	}

	console.log(postsCount);
	console.log(likesCount);

	var data = {
	    labels: labels,
	    datasets: [
	        {
	        	type: 'bar',
	            label: "Number of posts",
	            backgroundColor: 'rgba(255, 99, 132, 0.2)',
	            borderColor: 'rgba(255,99,132,1)',
	            borderWidth: 1,
	            data: postsCount,
	        }
	    ]
	};

	var ctx = document.getElementById("PostsByMonth");
	var myBarChart = new Chart(ctx, {
	    type: 'bar',
	    data: data
	});
}

// data.main();

// data.PostsOverTime();
