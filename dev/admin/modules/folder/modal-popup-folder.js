const $ = window.jQuery;

// Track React roots for cleanup - exposed globally for cross-module access
window.wpAdminifyModalRoots = window.wpAdminifyModalRoots || new Map();

// Initialize when DOM is ready
$(function () {
    initMediaModalSidebar();
});

/**
 * Get the currently visible/active .media-modal element.
 * Elementor can leave old hidden modals in the DOM while creating new ones,
 * so we must always target the visible one.
 */
function getActiveMediaModal() {
    const modals = document.querySelectorAll('.media-modal');
    for (let i = modals.length - 1; i >= 0; i--) {
        const style = window.getComputedStyle(modals[i]);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            return modals[i];
        }
    }
    return null;
}

/**
 * Clean up folder containers and React roots from stale/hidden modals.
 * This prevents old containers in hidden modals from blocking injection
 * into the current visible modal.
 */
function cleanupStaleModalContainers() {
    const activeModal = getActiveMediaModal();
    const roots = window.wpAdminifyModalRoots;

    // Remove folder containers from ALL modals that are NOT the active one
    $('.media-modal').each(function () {
        if (this !== activeModal) {
            const staleContainer = $(this).find('.wp-adminify--modal-folder-container');
            const staleNotice = $(this).find('.wp-adminify--modal-pro-notice');

            if (staleContainer.length || staleNotice.length) {
                // Unmount any React roots in stale containers
                if (roots && roots.size > 0) {
                    roots.forEach((root, id) => {
                        const el = document.getElementById(id);
                        if (el && !activeModal?.contains(el)) {
                            try { root.unmount(); } catch (e) {}
                            roots.delete(id);
                        }
                    });
                }
                staleContainer.remove();
                staleNotice.remove();
            }

            $(this).closest('.wp-core-ui').removeClass('wp-adminify-has-folders');
        }
    });
}

/**
 * Add pro upsell notice to media modal menu (when license is inactive)
 */
function addProUpsellNotice() {
    const activeModal = getActiveMediaModal();
    if (!activeModal) return;

    if ($(activeModal).find('.wp-adminify--modal-pro-notice').length) {
        return;
    }

    const initialData = window.wp_adminify__folder_data;
    if (!initialData) return;

    const proNotice = $('<div>', { class: 'wp-adminify--modal-pro-notice' });

    proNotice.html(
        '<button class="wp-adminify--modal-pro-notice-close" type="button">' +
            '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="wp-adminify--modal-pro-notice-icon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown-icon lucide-crown"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>' +
        '</div>' +
        '<h4>Unlock Pro Features</h4>' +
        '<p>Use WP Adminify folders with page builders by upgrading to PRO.</p>' +
        '<div class="wp-adminify--modal-pro-notice-actions">' +
            '<a href="https://wpadminify.com/pricing" class="wp-adminify--modal-pro-btn" target="_blank">Upgrade to Pro</a>' +
        '</div>'
    );

    proNotice.on('click', '.wp-adminify--modal-pro-notice-close', function() {
        proNotice.slideUp(200);
    });

    const mediaMenu = $(activeModal).find('.media-frame-menu .media-menu');
    if (!mediaMenu.length) return;

    $(activeModal).closest('.wp-core-ui').addClass('wp-adminify-has-folders');

    const isElementor = document.body.classList.contains('elementor-editor-active');
    const menuItemEmbed = mediaMenu.find('#menu-item-embed');
    if (isElementor && menuItemEmbed.length) {
        menuItemEmbed.after(proNotice);
    } else {
        mediaMenu.append(proNotice);
    }
}

/**
 * Add folder container to the active/visible media modal menu
 */
function addCustomDivToMediaModal() {
    // Clean up containers stuck in old/hidden modals first
    cleanupStaleModalContainers();

    const activeModal = getActiveMediaModal();
    if (!activeModal) return;

    // Skip if already injected in the ACTIVE modal
    if ($(activeModal).find('.wp-adminify--modal-folder-container').length) {
        return;
    }

    const initialData = window.wp_adminify__folder_data;
    const isPro = initialData && initialData.is_pro;
    const isGutenberg = document.body.classList.contains('block-editor-page');

    // Gutenberg editor: always show folder module (free feature)
    // Other editors (Elementor, Customizer, etc.): show upsell notice if not pro
    if (!isPro && !isGutenberg) {
        addProUpsellNotice();
        return;
    }

    const uniqueId = 'wp-adminify--modal-folder-container';
    const appId = 'wp-adminify--folder-app-modal';

    // Remove any leftover elements with these IDs (from destroyed modals)
    $('#' + uniqueId).remove();
    $('#' + appId).remove();

    const newDiv = $('<div>', {
        id: uniqueId,
        class: 'wp-adminify--modal-folder-container'
    });

    const appDivEle = $('<div>', {
        id: appId
    });

    newDiv.append(appDivEle);

    const mediaMenu = $(activeModal).find('.media-frame-menu .media-menu');
    if (!mediaMenu.length) {
        return;
    }

    // Mark modal as having folder widget so CSS only targets this modal
    $(activeModal).closest('.wp-core-ui').addClass('wp-adminify-has-folders');

    // In Elementor: insert after "Insert from URL" (#menu-item-embed)
    const isElementor = document.body.classList.contains('elementor-editor-active');
    const menuItemEmbed = mediaMenu.find('#menu-item-embed');
    if (isElementor && menuItemEmbed.length) {
        menuItemEmbed.after(newDiv);
    } else {
        // Gutenberg / Customizer / other: append to end of menu
        mediaMenu.append(newDiv);
    }

    // Initialize React folder module after DOM is added
    setTimeout(function() {
        if (typeof window.wpAdminifyInitFolderModule === 'function') {
            window.wpAdminifyInitFolderModule(true, appId);
        }
        // Adjust folder list height to fit within modal
        setTimeout(adjustModalFolderListHeight, 200);
    }, 50);
}

/**
 * Attempt to inject the folder container with retries.
 */
function addCustomDivToMediaModalWithRetry(maxAttempts) {
    maxAttempts = maxAttempts || 6;
    var attempt = 0;

    function tryInject() {
        var activeModal = getActiveMediaModal();
        if (activeModal) {
            var hasContainer = $(activeModal).find('.wp-adminify--modal-folder-container').length > 0;
            var hasNotice = $(activeModal).find('.wp-adminify--modal-pro-notice').length > 0;
            if (hasContainer || hasNotice) return;
        }

        attempt++;
        addCustomDivToMediaModal();

        // Check again on the active modal after injection attempt
        activeModal = getActiveMediaModal();
        var injected = activeModal && (
            $(activeModal).find('.wp-adminify--modal-folder-container').length > 0 ||
            $(activeModal).find('.wp-adminify--modal-pro-notice').length > 0
        );

        if (!injected && attempt < maxAttempts) {
            setTimeout(tryInject, 300);
        }
    }

    tryInject();
}

/**
 * Calculate and set dynamic max-height for folder list inside media modal
 */
function adjustModalFolderListHeight() {
    const modal = getActiveMediaModal();
    if (!modal) return;

    const container = modal.querySelector('.wp-adminify--modal-folder-container');
    if (!container) return;

    const folderList = container.querySelector('ul.folder--lists');
    if (!folderList) return;

    const menuFrame = modal.querySelector('.media-frame-menu');
    if (!menuFrame) return;

    const menuHeight = menuFrame.getBoundingClientRect().height;

    const folderWidget = container.querySelector('.wp-adminify--folder-widget');
    if (!folderWidget) return;

    const menuTop = menuFrame.getBoundingClientRect().top;
    const listTop = folderList.getBoundingClientRect().top;
    const usedAbove = listTop - menuTop;

    const bottomPadding = 44;
    const availableHeight = menuHeight - usedAbove - bottomPadding;

    if (availableHeight > 100) {
        folderList.style.maxHeight = availableHeight + 'px';
    }
}

/**
 * Initialize media modal folder sidebar
 * Extends wp.media.view.AttachmentsBrowser and Modal to inject folder sidebar
 */
const initMediaModalSidebar = () => {
    if (typeof wp === 'undefined' || !wp.media || !wp.media.view) {
        return;
    }

    const initialData = window.wp_adminify__folder_data;
    if (!initialData || !initialData.folders) {
        return;
    }

    // Store reference to original AttachmentsBrowser
    const AttachmentsBrowser = wp.media.view.AttachmentsBrowser;

    // Extend AttachmentsBrowser to add folder sidebar
    wp.media.view.AttachmentsBrowser = AttachmentsBrowser.extend({
        createSidebar: function () {
            AttachmentsBrowser.prototype.createSidebar.apply(this, arguments);

            const isInModal = this.controller && this.controller.$el && this.controller.$el.hasClass('wp-core-ui');
            if (!isInModal) return;

            setTimeout(function() {
                addCustomDivToMediaModal();
            }, 300);
        },
    });

    // Patch Modal.prototype.open to detect every modal open (including reopens)
    const originalModalOpen = wp.media.view.Modal.prototype.open;
    wp.media.view.Modal.prototype.open = function () {
        const result = originalModalOpen.apply(this, arguments);

        // Use retry logic — DOM may not be fully ready on reopen (especially in Elementor)
        setTimeout(function() {
            addCustomDivToMediaModalWithRetry(6);
        }, 200);

        return result;
    };

    // Fallback: periodically check for visible modals missing the folder container
    setInterval(function() {
        const activeModal = getActiveMediaModal();
        if (activeModal && !activeModal.querySelector('.wp-adminify--modal-folder-container') && !activeModal.querySelector('.wp-adminify--modal-pro-notice')) {
            addCustomDivToMediaModal();
        }
    }, 1000);

    // Recalculate folder list height on window resize
    $(window).on('resize', adjustModalFolderListHeight);
};
