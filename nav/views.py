from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from django.conf import settings

def about(req):
  return render_to_response("about.html",
                            context_instance=RequestContext(req))
