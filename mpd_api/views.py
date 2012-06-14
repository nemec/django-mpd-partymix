from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from django.conf import settings
import json
import mpd

client = mpd.MPDClient(use_unicode=True)

whitelist = getattr(settings, "MPD_API_WHITELIST", [])
host = getattr(settings, "MPD_HOST", "localhost")
port = getattr(settings, "MPD_PORT", 6600)
client.connect(host, port)


def api(req, endpoint):
  args = []
  
  if req.method == "GET" and "args" in req.GET:
    args = req.GET.getlist("args")
  elif req.method == "POST" and "args" in req.POST:
    args = req.POST.getlist("args")
  data = {}
  
  if endpoint in whitelist or "*" in whitelist:
    try:
      data["data"] = getattr(client, endpoint)(*args)
    except AttributeError:
      data["error"] = "Unknown endpoint {0}. Is it whitelisted?".format(endpoint)
    except mpd.CommandError as err:
      data["error"] = str(err)
    return HttpResponse(json.dumps(data), mimetype="application/json")
  else:
    raise PermissionDenied

def idle(req):
  raise PermissionDenied  # TODO implement idling (long poll?)
