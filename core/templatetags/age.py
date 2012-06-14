from datetime import datetime, timedelta
from django import template
from django.utils.timesince import timesince

register = template.Library()

@register.filter
def age(value):
    now = datetime.now()
    try:
        difference = now - value
    except:
        return value

    if difference <= timedelta(minutes=1):
        return 'just now'
    return '%(time)s ago' % {'time': timesince(value).split(', ')[0]}
