rot = null;
$(document).ready(function(){

  var UPDATE_INTERVAL = 5000;
  var transitioning = false;
  
  function rotateSongs(cb){
    transitioning = true;
    $("#juke p.nowplaying").fadeOut("slow", function(){
      $(this).remove();  // Remove the old Now Playing
      $("#juke p.nextsong").animateFloat({float: "left"}, 1000, function(){  // Move Next Up to Now Playing area
        $("#juke p.nextsong").addClass("nowplaying").removeClass("nextsong");
        $("<p></p>").addClass("nextsong")
          .hide().appendTo("#juke .ticker")
          .fadeIn("slow", cb);
          transitioning = false;
      });
    });
  }
  rot = rotateSongs;
  
  function buildSongElement(song){
    var item = '<span class="title">' + song.title + '</span>';
    if(song.artist){
      item += " by " + '<span class="artist">' + song.artist + '</span>';
    }
    if(song.album){
      item += " on " + '<span class="album">' + song.album + '</span>';
    }
    return item;
  }

  function makeQuery(query){
    $.post("query", 
      {
        "data": query,
        csrfmiddlewaretoken: csrf
      },
      function(data){
        var items = [];
        $.each(data, function(i, song){
          var title = song.title;
          var item = buildSongElement(song);
          if(song.artist){
            title += " by " + song.artist;
          }
          if(song.album){
            title += " on " + song.album;
          }
          items.push('<li title="' + title + '">' + item + '</li>');
        });
        $("#search-list").empty().append(items.join(''));
        
        $.each($("#search-list").children(), function(i, item){
          $(item).click(function(){
            var index = $("#search-list").children().index($(this));
            
            $.post("add",
              {
                "index": index,
                csrfmiddlewaretoken: csrf
              },
              function(){
                // Clear info box now that song has been added?
              },
              "json");
          });
        });
      },
      "json");
  }

  var oldquery = $("#query").val();
  var timeout = null;
  
  // Poll for changes to the textbox
  setInterval(function(){
    var query = $("#query").val()
    if(query != oldquery){
      if(timeout != null){
        clearTimeout(timeout);
      }

      oldquery = query;
      // Wait for a length of time after user stops typing.
      // If no changes made, send request
      timeout = setTimeout(function(){
        makeQuery(query);
        timeout = null;
      }, 500);
    }
  }, 100);
  
  function updateNowPlaying(){
    if(transitioning) return;
    
    var nowplaying = null;
    var nextsong = null;
    
    $.ajax({
      url: API_BASE + "status",
      dataType: "json",
      success: function(data){
        data = data.data;  
        if(data && data.songid){
          $.ajax({
            url: API_BASE + "playlistid?args=" + data.songid,
            async: false,
            success: function(songinfo){
              if(songinfo.error){
                console.log(songinfo.error);
                return;
              }
              if(songinfo.data && songinfo.data.length > 0){
                //$("#juke p.nowplaying").html(buildSongElement(songinfo.data[0]));
                nowplaying = $(buildSongElement(songinfo.data[0]));
              }
            }
          });
        }
        if(data && data.nextsongid){
          $.ajax({
            url: API_BASE + "playlistid?args=" + data.nextsongid,
            async: false,
            success: function(songinfo){
              if(songinfo.error){
                console.log(songinfo.error);
                return;
              }
              if(songinfo.data && songinfo.data.length > 0){
                //$("#juke p.nextsong").html(buildSongElement(songinfo.data[0]));
                nextsong = $(buildSongElement(songinfo.data[0]));
              }
            }
          });
        }
        
        // Next Song is now the Current Song, so animate
        if($("#juke p.nextsong .title").text() == nowplaying.filter(".title").text()){
          rotateSongs(function(){
            $("#juke p.nextsong").html(nextsong);
          });
        }
        // Something else has changed
        else if($("#juke p.nowplaying .title").text() != nowplaying.filter(".title").text() ||
          $("#juke p.nextsong .title").text() != nextsong.filter(".title").text()){
          $("#juke p.nowplaying").html(nowplaying);
          $("#juke p.nextsong").html(nextsong);
        }
        
        setTimeout(updateNowPlaying, UPDATE_INTERVAL);
      },
      error: function(xhr, status, err){
      }
    });
  }
  setTimeout(updateNowPlaying, UPDATE_INTERVAL);
});
