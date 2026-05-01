(function($) {
    $(document).ready(function() {
        const $roleSelect = $('#id_role');
        
        function toggleTabs() {
            const role = $roleSelect.val();
            
            $('.nav-tabs .nav-item, .nav-tabs li').each(function() {
                const $tab = $(this);
                const text = $tab.text().trim().toLowerCase();
                
                if (text.includes('owner profile')) {
                    if (role === 'Owner') {
                        $tab.attr('style', 'display: block !important');
                    } else {
                        $tab.attr('style', 'display: none !important');
                    }
                } else if (text.includes('manager profile')) {
                    if (role === 'Manager') {
                        $tab.attr('style', 'display: block !important');
                    } else {
                        $tab.attr('style', 'display: none !important');
                    }
                }
            });

            // If the active tab is now hidden, switch to the first visible one
            const $activeTab = $('.nav-tabs .nav-link.active').parent();
            if ($activeTab.is(':hidden')) {
                $('.nav-tabs .nav-link:visible').first().tab('show');
            }
        }

        if ($roleSelect.length) {
            $roleSelect.on('change', toggleTabs);
            // Run immediately and also after a delay for Jazzmin's initialization
            toggleTabs();
            setTimeout(toggleTabs, 500);
            setTimeout(toggleTabs, 1500);
        }
    });
})(django.jQuery || jQuery);
