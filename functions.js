var request = require("request");
exports.genres =function (callback){
	url="https://api.themoviedb.org/3/genre/movie/list?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4&language=en-US";
	request(url, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body);
      callback(data['genres']);
    }
  });
}
exports.sort=function(){
	return [
		["Popularity Descending","popularity.desc"],
		["Populartiy Ascending","popularity.asc"],
		["Rating Descending","rating.desc"],
		["Rating Ascending","rating.asc"],
		["Release Date Descending","release_date.desc"],
		["Release Date Ascending","release_date.asc"],
		["Title (A-Z)","original_title.asc"],
		["Title (Z-A)","original_title.asc"],
	];
}
exports.keyword_search = function(keyword,callback){
	url="https://api.themoviedb.org/3/search/keyword?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4&query="+keyword+"&page=1";
	request(url,function(err, res,body){
		if(!err & res.statusCode==200){
			var data=JSON.parse(body);
			callback(data['results']);
		}
	});
}