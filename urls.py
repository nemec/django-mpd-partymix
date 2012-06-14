from django.conf import settings
from django.http import HttpResponseNotFound
from django.views.generic.simple import redirect_to
from django.conf.urls.defaults import patterns, include, url

import mpd_juke.urls

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()


# Core URLs
urlpatterns = patterns(settings.PROJECT_NAME + '.core.views',
  (r'^$', 'index')
)


urlpatterns += patterns('',
  (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes':True}),
  (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT, 'show_indexes':True}),
  (r'^admin/', include(admin.site.urls)),
  (r'^juke/', include(mpd_juke.urls)),
)

