(function($){
  $.fn.animateFloat = function(props, speed, cb){
    if(typeof(speed) == "function")
      cb = speed, speed = 500;
    if(typeof(cb) != "function")
      cb = function(){};
    return $.each(this, function(i, el){
      el = $(el);
      var oldMargin = el.css("marginLeft");
      if(props.float && props.float != el.css("float")){
        var elem = el.clone().css(props).insertBefore(el),
          temp = (props.float == el.css("float")) ? elem.position().left : el.position().left;
        props.marginLeft = elem.position().left;
        elem.remove();
        el.css({float:"left", marginLeft:temp});
      }
      $(this).animate(props, speed, function(){
        $(this).css(props);
        el.css("marginLeft", oldMargin);
        cb();
      });
    });
  }

})(jQuery);
