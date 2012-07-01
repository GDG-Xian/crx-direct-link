$(function() {
     $('body').on('mousedown', '#rso a', function(evt) {
        try {
            var $target = $(evt.target);
            var urlPattern = /url=([^&]+)/ig;
            var url = $target.attr('href').match(urlPattern) && decodeURIComponent(RegExp.$1);
            $target.attr('href', 'http://www.baidu.com/');
            return false;
        } catch (e) {
            return true;
        }
     });
});
