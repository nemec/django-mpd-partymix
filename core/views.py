from django.http import Http404
from django.template import RequestContext
from django.shortcuts import render_to_response

def index(req):
  return render_to_response("index.html",
                            context_instance=RequestContext(req))
