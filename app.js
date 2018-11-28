var express = require("express");
var app = express();
var request = require("request");
var functions=require('./functions.js');
var body_parser = require('body-parser');
var session = require('express-session');
var urlencodedParser = body_parser.urlencoded({extended:false});
app.set("view engine", "ejs");
app.use(express.static("public"));
//creating express-session
app.use(session({
  secret : 'dsagfdasjvbcyub4274gyw8efh98',
  cookie:{
    expires:600000
  }
}));
//index page
app.get("/", function(req, res) {
  var top_rated=[];
  var discover=[];
  request('https://api.themoviedb.org/3/movie/top_rated?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4',function(err,response,body){
    if(!err && response.statusCode==200){
      top_rated=JSON.parse(body)
      request('https://api.themoviedb.org/3/discover/movie?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4',function(er,resp,bdy){
        if(!er && resp.statusCode==200){
          discover=JSON.parse(bdy);
          res.render("index",{top_rated:top_rated['results'].slice(0,10),discover:discover['results'].slice(0,10)});
        }
        else
          res.render("index",{top_rated:top_rated,discover:discover});
      });
    }
    else
      res.render("index",{top_rated:top_rated,discover:discover});
  });
});

/*
API Collections
*/
//collecting api response

app.post('/api/top_rated',urlencodedParser,function(req,res){
  var url="https://api.themoviedb.org/3/movie/top_rated?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4&page="+req.body.page;
  request(url, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body);
      res.render("api_response",{
        data:data['results'],
        pages:data['total_pages'],
        current:req.body.page,
      });
    }
  });
});

app.post('/api/recently_released',urlencodedParser,function(req,res){
  var url="https://api.themoviedb.org/3/discover/movie?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4&page="+req.body.page+"&sort_by="+req.body.sort+"&with_genres="+req.body.genre;
  request(url, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body);
      res.render("api_response",{
        data:data['results'],
        pages:data['total_pages'],
        current:req.body.page,
      });
    }
  });
});
//populate watch later
app.post('/api/my_watch_list',urlencodedParser,function(req,res){
  var url="https://api.themoviedb.org/3/account/{account_id}/watchlist/movies?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4&language=en-US&session_id="+req.session.user.session+"&sort_by=created_at.asc&page=1";
  request(url, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body);
      res.render("api_response",{
        data:data['results'],
        pages:data['total_pages'],
        current:req.body.page,
      });
    }
  });
});

//home page search api
app.get('/api/search/:keyword',function(req,res){
  var url="https://api.themoviedb.org/3/search/multi?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4&language=en-US&query="+req.params.keyword+"&page=1";
  request(url,function(err,response,body){
    if(!err && response.statusCode==200){
      var data=JSON.parse(body);
      res.send(JSON.stringify(data['results'])); 
    }
  });
});
//add to watch later
app.get('/api/watch_later/:id',function(req,res){
  var url="https://api.themoviedb.org/3/account/{account_id}/watchlist?api_key=5ab7ffa7bd3e1a329cf7685a5cec9ab4&session_id="+req.session.user.session;
  var id=req.params.id;
  var requestData={
    "media_type":"movie",
    "media_id":id,
    "watchlist":true
  };
  request.post({url:url,method:"POST",json:requestData},function(err,response,body){
    if(!err && response.statusCode==201){
      res.status(200).send(JSON.stringify({'success':true}));
    }
    else{
      res.status(200).send(JSON.stringify({'success':false}));
    }
  });
});
//todo : like api
app.post('/api/like/:id',function(req,res){
  console.log(req.params.id);
})
//login api 
/*
two users : admin/password
& guest/password
*/
app.post('/api/login',urlencodedParser,function(req,res){
  var username=req.body.username;
  var password=req.body.password;

  if((username==="admin" && password==="password" ) || (username=="guest" && password=="password")){
    if(username=="admin")
    req.session.user={'username':username,'name':username,session:'f5ed349b7fc7c1fd16431177a6896c53dcaac8d0'};
    if(username=="guest")
    req.session.user={'username':username,'name':username,session:'03390b16a7d1ef4f469687b729cf8d8b4716f3f7'};
    res.redirect('/index');
  }
  else{
    res.status(400).send(JSON.stringify({"message":'Wrong Credentials'}));
    return;
  }
});
//logout
app.get('/api/logout',function(req,res){
  req.session.destroy();
  res.redirect('/');
})
//api to check if alread login exists 
app.get('/api/check_login',function(req,res){
  if(req.session.user)
    res.status(200).send(JSON.stringify({'success':true,'data':req.session.user}));
  else
    res.status(200).send(JSON.stringify({'success':false}));
})

/*
View Collection
*/

app.get("/recently-released", function(req, res) {
  functions.genres(function(items){
    res.render('recently-released',{
    genre:items,
    sort:functions.sort(),
  });
  });
});

app.get("/my-watch-list", function(req, res) {
    if(!req.session.user){
      res.redirect('/');
      return;
    }
    res.render('my-watch-list',{
  });
});

//top rated
app.get("/top-rated", function(req, res) {
  functions.genres(function(items){
    res.render('top-rated',{
    genre:items,
    sort:functions.sort(),
  });
  });
});

//404 page
app.get("*", function(req, res) {
  res.render("404page");
});

app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("Server is running");
});
