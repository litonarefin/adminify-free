/**
 * Folder Module Entry Point
 * Initializes the React folder application
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FolderProvider } from './store/FolderContext';
import FolderApp from './FolderApp';
import ModalFolderSidebar from './components/ModalFolderSidebar';
import './folder.scss';

const $ = window.jQuery;

/**
 * Initialize the folder module
 * @param {boolean} isModal - Whether this is being rendered inside a modal
 */
const initFolderModule = (isModal = false, containerId = 'wp-adminify--folder-app') => {
    const container = document.getElementById(containerId);

    const initialData = window.wp_adminify__folder_data;

    if (!container || !initialData) {
        return;
    }

    // Prevent multiple React root creations on the same container
    if (container.dataset.reactRootInitialized === 'true') {
        return;
    }

    // Mark container as initialized
    container.dataset.reactRootInitialized = 'true';

    // Modify attachment template to include folder data attribute
    const attachmentTemplate = $('#tmpl-attachment');
    if (attachmentTemplate.length) {
        const template = attachmentTemplate.html().replace(
            'data.orientation }}">',
            'data.orientation }}" data-folders="{{ data.media_folder }}">'
        );
        attachmentTemplate.html(template);
    }

    // Create React root and render
    const root = createRoot(container);
    root.render(
        <FolderProvider initialData={initialData}>
            <FolderApp />
        </FolderProvider>
    );

    // Store root in global Map for cleanup (especially important for modals)
    if (isModal && window.wpAdminifyModalRoots) {
        const mapKey = container.closest('.wp-adminify--modal-folder-container')?.id || container.id;
        window.wpAdminifyModalRoots.set(mapKey, root);
    }

    return root;
};

/**
 * Initialize media folder filter (for grid view dropdown)
 */
const initMediaFolderFilter = () => {
    $(document).ready(function () {
        $('#wp-adminify-media-folder-filter').on('change', function (e) {
            e.preventDefault();
            const folderSlug = $(this).val();
            const url = new URL(window.location.href);
            const params = url.searchParams;

            if (folderSlug && folderSlug !== '0' && folderSlug !== 'all') {
                params.set('media_folder', encodeURIComponent(folderSlug));
            } else {
                params.delete('media_folder');
            }

            url.search = params.toString();
            history.pushState(null, '', url.toString());
            window.location.reload();
        });

        // Handle upload with folder assignment
        if ($('body.wp-admin').hasClass('media-new-php') && typeof window.uploader === 'object') {
            window.uploader.bind('BeforeUpload', function (up) {
                const settings = up.settings.multipart_params;
                settings.folder_id = $('#folders').val();
            });
        }
    });
};

// Initialize when DOM is ready
$(function () {
    // Check if we're in a modal context
    const isInModal = () => {
        const container = document.getElementById('wp-adminify--folder-app');
        return container && container.closest('.media-modal') !== null;
    };

    waitForElm("#wp-adminify--folder-app").then((elm) => {
        try {
            initFolderModule(isInModal());
        } catch (e) {
            console.log('Cannot access contentDocument (cross-origin or error):', e.message);
        }
    });
    initFolderModule(isInModal());
    initMediaFolderFilter();
});

// Expose initFolderModule globally for modal-popup-folder.js to use
window.wpAdminifyInitFolderModule = initFolderModule;

// Export for potential external use
export { FolderProvider, FolderApp, ModalFolderSidebar };
export default initFolderModule;


/**
 *
 * @param {CSS} selector
 * @returns exits DOM
 */
export function waitForElm(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}