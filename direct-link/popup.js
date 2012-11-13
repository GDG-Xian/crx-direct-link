var app = chrome.extension.getBackgroundPage();

$(function() {
    var $show_enabled = $('#show-enabled-only');
    var $skip_safe_check = $('#skip-safe-check');

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
    
    $skip_safe_check.click(function() {
        var flag = $skip_safe_check.prop('checked');
        app.toggle_safe_check(flag); 
    });

    $skip_safe_check.prop('checked', app.get_option('skip-safe-check') === 'true');
});

