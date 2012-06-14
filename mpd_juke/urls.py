from django.conf.urls.defaults import patterns, include, url
from django.http import HttpResponseNotFound

import mpd_api.urls

urlpatterns = patterns('',
  url(r'api/$',
    view=lambda req: HttpResponseNotFound("404"),
    name='mpd_api_base'
  ),
  (r'api/', include(mpd_api.urls)),
)

urlpatterns += patterns('mpd_juke.views',
  (r'query$', 'query'),
  (r'add$', 'add'),
  url(r'$', 
    view='index',
    name='mpd_juke'
  ),
)
