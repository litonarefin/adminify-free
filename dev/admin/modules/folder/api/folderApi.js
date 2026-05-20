/**
 * Folder API - WordPress AJAX wrapper
 * Handles all server communication for folder operations
 */

const getConfig = () => window.wp_adminify__folder_data || {};

/**
 * Base WordPress AJAX helper
 * @param {string} route - The API route/action
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>} Response data
 */
const wpAjax = async (route, params = {}) => {
    const config = getConfig();
    const formData = new FormData();

    formData.append('action', 'adminify_folder');
    formData.append('route', route);
    formData.append('_ajax_nonce', config.nonce);
    formData.append('post_type', config.post_type);
    formData.append('post_type_tax', config.post_type_tax);

    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
            });
        } else {
            formData.append(key, value);
        }
    });

    const response = await fetch(config.ajaxurl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    });

    return response.json();
};

/**
 * Create a new folder
 * @param {string} name - Folder name
 * @param {string} color - Folder color (hex)
 * @param {number|null} parentId - Parent folder ID (for sub-folders, Pro only)
 */
export const createFolder = (name, color, parentId = null) => {
    const params = {
        new_folder_name: name,
        folder_color_tag: color
    };

    if (parentId) {
        params.parent_folder = parentId;
    }

    return wpAjax('create_new_folder', params);
};

/**
 * Rename an existing folder
 * @param {number} termId - Folder term ID
 * @param {string} name - New folder name
 * @param {string} color - New folder color (hex)
 */
export const renameFolder = (termId, name, color) => {
    return wpAjax('rename_folder', {
        term_id: termId,
        folder_name: name,
        folder_color_tag: color
    });
};

/**
 * Delete folders
 * @param {number[]} termIds - Array of folder term IDs to delete
 */
export const deleteFolders = (termIds) => {
    return wpAjax('delete_folders', {
        term_ids: termIds
    });
};

/**
 * Move or copy posts to a folder
 * @param {number[]} postIds - Array of post IDs
 * @param {number|string} folderId - Target folder ID or 'uncategorized'
 * @param {boolean} shouldMove - True to move, false to copy
 * @param {string} screen - Current screen (pagenow)
 * @param {string} mode - View mode ('list' or 'grid')
 */
export const moveToFolder = (postIds, folderId, shouldMove, screen, mode) => {
    return wpAjax('move_to_folder', {
        post_ids: postIds,
        folder_id: folderId,
        move_to_folder: shouldMove,
        screen: screen,
        mode: mode
    });
};

/**
 * Refresh folders data from server
 */
export const refreshFolders = () => {
    return wpAjax('refresh_folders');
};

export default {
    createFolder,
    renameFolder,
    deleteFolders,
    moveToFolder,
    refreshFolders
};
