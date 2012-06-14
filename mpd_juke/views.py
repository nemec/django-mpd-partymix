from django.core.exceptions import PermissionDenied
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.http import HttpResponse
from django.conf import settings
import json
import mpd

client = mpd.MPDClient(use_unicode=True)

host = getattr(settings, "MPD_HOST", "localhost")
port = getattr(settings, "MPD_PORT", 6600)
client.connect(host, port)

query_limit = getattr(settings, "JUKE_QUERY_LIMIT", 20)

last_query = []


def index(req):
  data = {}
  
  data["api_base"] = reverse("mpd_api_base")
  
  try:
    status = client.status()
  except mpd.MPDError:
    status = None
  
  if status:
    try:
      nowplaying = client.playlistid(status["songid"])[0]
      data["nowplaying"] = {
        "title": nowplaying.get("title", None),
        "artist": nowplaying.get("artist", None),
        "album": nowplaying.get("album", None)
      }
    except mpd.MPDError:
      pass
    try:
      nextsong = client.playlistid(status["nextsongid"])[0]
      data["nextsong"] = {
        "title": nextsong.get("title", None),
        "artist": nextsong.get("artist", None),
        "album": nextsong.get("album", None)
      }
    except mpd.MPDError:
      pass
  
  return render_to_response("mpd_juke.html", data,
                            context_instance=RequestContext(req))

def query(req):
  global last_query
  if req.method == "POST" and req.is_ajax():
    q = req.POST.get("data", '')
    data = []
    
    if len(q) > 0:
      last_query = []
      songs = []
      try:
        songs = client.search("any", q)[:query_limit]
      except mpd.MPDError as err:
        print err
      for song in songs:
        dat = {}
        if u"title" in song:
          dat["title"] = song[u"title"]
        else:
          fil = song[u"file"]
          dat["file"] = fil[fil.rfind("/"):]
        if u"artist" in song:
          dat["artist"] = song[u"artist"]
        if u"album" in song:
          dat["album"] =  song[u"album"]
        data.append(dat)
        last_query.append(song[u"file"])
    return HttpResponse(json.dumps(data), mimetype="application/json")
  else:
    raise PermissionDenied

def add(req):
  if req.method == "POST" and req.is_ajax():
    q = -1
    try:
      q = int(req.POST.get("index", -1))
    except ValueError:
      pass
    data = []
    
    if q >= 0 and len(last_query) > q:
      client.add(last_query[q])

    return HttpResponse(json.dumps(data), mimetype="application/json")
  else:
    raise PermissionDenied
