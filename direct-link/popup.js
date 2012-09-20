var app = chrome.extension.getBackgroundPage();

$(function() {
    var $show_enabled = $('#show-enabled-only');
    // 选中已经启用的域名
    app.iter_enabled_domains(function(domain_name) {
        $('.domain[value="' + domain_name + '"]').prop('checked', true); 
    });

    $('.domain-list .domain').click(function() {
        var $this = $(this);
        app.toggle_domain($this.val(), $this.prop('checked'));
        if ($show_enabled.prop('checked')) {
            $this.parents('li').hide(); 
        }
    });
    
    // 启用域名过滤 
    $show_enabled.click(function() {
        var flag = $show_enabled.prop('checked');
        $('.domain-list li .domain').not(':checked').parents('li').toggle(!flag);
    });
});

