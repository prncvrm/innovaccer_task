function top_rated(page){
  $.ajax({
      type:'POST',
      url:'/api/top_rated',
      data: {
        "page":page,
      },
      success:function(response){
        $('#api_response').html(response);
      }
      });
}
function watch_list(page){
  $.ajax({
      type:'POST',
      url:'/api/my_watch_list',
      data: {
        "page":page,
      },
      success:function(response){
        if(!response.length)
          $('#api_response').html("<div class='ui message'><div class='header'>No Movies</div><p>Keep Adding Movies, None found.</p></div>");  
        $('#api_response').html(response);
      }
      });
}
function recently_released(page){
  var genres=$('.ui.dropdown.genre').dropdown('get value').join(',');
  var sort=$('.ui.dropdown.sort').dropdown('get value');
  $.ajax({
      type:'POST',
      url:'/api/recently_released',
      data: {
        'page':page,
        'genre':genres,
        'sort':sort,
      },
      success:function(response){
        $('#api_response').html(response);
      }
      });
}
function change(page){
  if(window.location.href.indexOf("recently-released")!=-1)
    recently_released(page);
  if(window.location.href.indexOf("top-rated")!=-1)
    top_rated(page);
  if(window.location.href.indexOf('my-watch-list')!=-1)
    watch_list(page);
}
$(document).bind("ajaxStart.mine", function() {
    $('#loading').show();
});

$(document).bind("ajaxStop.mine", function() {
    $('#loading').hide();
});

$('.ui.dropdown.genre')
  .dropdown({
  	placeholder:'Genre',
  	clearable:true,
    onChange:function(value, text, $selectedItem) {
      change(1);
    },
    
  })
;
$('.ui.dropdown.sort')
  .dropdown({
  	placeholder:'Sort',
  	clearable:true,
    onChange:function(value, text, $selectedItem) {
      change(1);
    },
  });
$('.ui.search.anything')
  .search({
    type : 'category',
    minCharacters :3,
    apiSettings: {
      onResponse:function(res){
        var response = {
          results :{}
        };
        $.each(res, function(idx,item){
          var max_items=12;
          if(idx>=max_items)
            return response;
          var type = item.media_type;
          var url_type=type;
          if (type=='tv')
            type="TV Show"
          if(type=='movie')
            type='Movies'
          if(response.results[type]===undefined){
            response.results[type]={
              name : type,
              results:[]
            };
          }
          //add result to cateogry/type
          response.results[type].results.push({
            title :item.original_name || item.title,
            description : item.overview.substring(0,100)+"..",
            url : "https://www.themoviedb.org/"+url_type+"/"+item.id,
          });
        });
        return response;
      },
      url: '/api/search/{query}',
    },
  });
  
$('.ui.modal.login').modal({
  onApprove:function(){
    var username=document.getElementById("username").value;
    var password=document.getElementById("password").value;
    $.ajax({
      type:'POST',
      url:'/api/login',
      data: {
        'username':username,
        'password':password,
      },
      success:function(response){
        document.location.href="/";
      },
      error:function(err){
        alert("Wrong Credentials");
      }
      });  
    return false;
  }
});
function check_login(){
  $.ajax({
    type:'GET',
    url:'/api/check_login',
    data:{},
    success:function(response){
      response=(JSON.parse(response));
      console.log(response.success);
      if(response.success==true){
        $('.item.login_logout').remove();
        if(!$('.item.logout').length){
          $('.ui.container.navbar').append('<a href="/my-watch-list" class="item">My Watch List</a>');
          $('.ui.container.navbar').append('<a href="/api/logout" class="item logout">Logout</a>');
        }
        return true;
      }
      else
        return false;
    },
  });
  return;
}
function watch_later(id){
  if(check_login()===false){
    alert("Please Login first");
    return;
  }
  $.ajax({
    type:'GET',
    url:'/api/watch_later/'+id,
    data:{},
    success:function(response){
      response=(JSON.parse(response));
      console.log(response);
      if(response.success==true){
        alert("Added to watch later");
      }
      else
        alert("Unable to add, Try again");
    },
  });
}

function like_video(id){
  if(check_login()==false){
    alert("Please Login first");
    return;
  }
  console.log(id);
  alert("Liked the Video");
}
/*$('.ui.dropdown.keyword')
  .dropdown({
    placeholder:'Keyword',
    clearable:true,
    onNoResults(searchValue){
      console.log(searchValue);
      ;
    }
  });
function keyword_search(){
  console.log("chanegd");
  $.ajax({
    type:'GET',
    url:'/api/keyword/'+text,
    data: {

    },
    success:keyword_populate
  });
};


function keyword_populate(){
$('.ui.dropdown.keyword')
  .dropdown({
    values: [
      {
        name: 'Male',
        value: 'male'
      },
      {
        name     : 'Female',
        value    : 'female',
        selected : true
      }
    ]
  })
;
}
*/
check_login();