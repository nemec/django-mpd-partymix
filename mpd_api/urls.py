from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('mpd_api.views',
  url(r'idle$',
    view='idle',
    name='mpd_idle'
  ),
  url(r'^(\w+)$',
    view='api',
    name='mpd_api'
  ),
)
