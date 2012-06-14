
$(document).ready(function(){

  var UPDATE_INTERVAL = 5000;
  
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
    $.ajax({
      url: API_BASE + "status",
      dataType: "json",
      success: function(data){
        data = data.data;  
        if(data && data.songid){
          $.ajax({
            url: API_BASE + "playlistid?args=" + data.songid,
            success: function(songinfo){
              if(!songinfo.error && songinfo.data && songinfo.data.length > 0){
                $("#juke #nowplaying p").html(buildSongElement(songinfo.data[0]));
              }
            }
          });
        }
        if(data && data.nextsongid){
          $.ajax({
            url: API_BASE + "playlistid?args=" + data.nextsongid,
            success: function(songinfo){
              if(!songinfo.error && songinfo.data && songinfo.data.length > 0){
                $("#juke #nextsong p").html(buildSongElement(songinfo.data[0]));
              }
            }
          });
        }
        setTimeout(updateNowPlaying, UPDATE_INTERVAL);
      },
      error: function(xhr, status, err){
      }
    });
  }
  setTimeout(updateNowPlaying, UPDATE_INTERVAL);
});
