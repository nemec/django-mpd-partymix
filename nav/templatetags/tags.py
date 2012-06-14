from django import template

register = template.Library()

@register.simple_tag
def active(request, pattern):
  import re
  
  activeclass = 'active'
  
  # Since / matches everything...
  if pattern == '/':
    if pattern == request.path:
      return activeclass
  # lets blog/sdlksf match the Blog active link
  elif re.match(pattern, request.path):
    return activeclass
  return ''

