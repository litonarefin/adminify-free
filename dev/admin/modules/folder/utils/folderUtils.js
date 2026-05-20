/**
 * Folder Utilities
 * Helper functions for folder operations
 */

import Cookies from 'js-cookie';

/**
 * Parse URL parameters from a query string
 * @param {string} querystring - Full URL or query string
 * @param {string} sParam - Specific parameter to retrieve (optional)
 * @returns {Object|string} All params or specific param value
 */
export const getUrlParameter = (querystring, sParam = null) => {
    const queryPart = querystring.includes('?')
        ? querystring.substring(querystring.indexOf('?') + 1)
        : querystring;

    const params = new URLSearchParams(queryPart);
    const obj = {};

    for (const key of params.keys()) {
        const values = params.getAll(key);
        obj[key] = values.length > 1 ? values : params.get(key);
    }

    if (sParam) {
        return obj[sParam] || '';
    }

    return obj;
};

/**
 * Generate folder URL for navigation
 * @param {Object|string} folder - Folder object or 'all'/'uncategorized'
 * @param {string} postTypeTax - Post type taxonomy slug
 * @returns {string} Folder URL
 */
export const getFolderUrl = (folder, postTypeTax) => {
    const queryStrings = window.location.search;
    const searchParams = new URLSearchParams(queryStrings);
    const postType = searchParams.get('post_type');
    const baseURL = new URL(
        window.location.protocol + '//' + window.location.host + window.location.pathname
    );

    if (postType) {
        baseURL.searchParams.set('post_type', postType);
    }

    if (folder !== 'all') {
        const folderSlug = folder === 'uncategorized' ? '-1' : folder.slug;
        baseURL.searchParams.set(postTypeTax, folderSlug);
    }

    for (const [key, value] of searchParams.entries()) {
        if (key === 'post_type' || key === postTypeTax) continue;
        baseURL.searchParams.set(key, value);
    }

    return baseURL.toString();
};

/**
 * Find a folder by its term ID
 * @param {Array} folders - Array of folder objects
 * @param {number} id - Folder term ID
 * @returns {Object|undefined} Found folder or undefined
 */
export const getFolderById = (folders, id) => {
    return folders.find((folder) => folder.term_id === id);
};

/**
 * Get folder IDs associated with a post
 * @param {Object} posts - Posts to folders mapping
 * @param {number} postId - Post ID
 * @returns {number[]} Array of folder IDs
 */
export const getFolderIdsByPostId = (posts, postId) => {
    return posts[postId] || [];
};

/**
 * Filter folders by search text
 * @param {Array} folders - Array of folder objects
 * @param {string} searchText - Search string
 * @returns {Array} Filtered folders
 */
export const filterFolders = (folders, searchText) => {
    if (!searchText || !searchText.trim()) {
        return folders;
    }

    const search = searchText.trim().toLowerCase();
    return folders.filter((folder) =>
        folder.name.toLowerCase().includes(search)
    );
};

/**
 * Sort folders alphabetically
 * @param {Array} folders - Array of folder objects
 * @param {string} direction - 'a-z' or 'z-a'
 * @returns {Array} Sorted folders
 */
export const sortFolders = (folders, direction = 'a-z') => {
    return [...folders].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (direction === 'a-z') {
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        }

        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
    });
};

/**
 * Build folder hierarchy with children
 * @param {Array} folders - Flat array of folders
 * @param {Object} hierarchy - Folder hierarchy mapping (parent_id -> [child_ids])
 * @returns {Array} Folders with nested children
 */
export const buildFolderHierarchy = (folders, hierarchy) => {
    // Clone folders and reset children (preserve selected state)
    const foldersCopy = folders.map((folder) => ({
        ...folder,
        selected: folder.selected || false,
        contexted: false,
        children: []
    }));

    // Create a map for quick lookup
    const folderMap = {};
    foldersCopy.forEach((folder) => {
        folderMap[folder.term_id] = folder;
    });

    // Build hierarchy
    const rootFolders = [];
    const childIds = new Set();

    // Collect all child IDs
    Object.values(hierarchy).forEach((children) => {
        children.forEach((childId) => childIds.add(childId));
    });

    // Add children to their parents
    Object.entries(hierarchy).forEach(([parentId, childIds]) => {
        const parent = folderMap[parentId];
        if (parent) {
            childIds.forEach((childId) => {
                const child = folderMap[childId];
                if (child && !parent.children.find((c) => c.term_id === child.term_id)) {
                    parent.children.push(child);
                }
            });
        }
    });

    // Get root folders (not children of any folder)
    foldersCopy.forEach((folder) => {
        if (!childIds.has(folder.term_id)) {
            rootFolders.push(folder);
        }
    });

    return rootFolders;
};

/**
 * Get sort preference from cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @returns {string} Sort direction ('a-z' or 'z-a')
 */
export const getSortPreference = (taxName) => {
    return Cookies.get(`${taxName}__sort`) || 'a-z';
};

/**
 * Cookie options for persistence
 */
const COOKIE_OPTIONS = { expires: 365, path: '/' };

/**
 * Get sidebar visibility preference from cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @returns {boolean} True if sidebar is visible
 */
export const getSidebarVisibility = (taxName) => {
    const stored = Cookies.get(`${taxName}__sidebar_visible`);
    return stored !== 'false'; // Default to visible (true)
};

/**
 * Save sidebar visibility preference to cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @param {boolean} visible - Visibility state
 */
export const setSidebarVisibility = (taxName, visible) => {
    Cookies.set(`${taxName}__sidebar_visible`, String(visible), COOKIE_OPTIONS);
};

/**
 * Save sort preference to cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @param {string} sort - Sort direction ('a-z' or 'z-a')
 */
export const setSortPreference = (taxName, sort) => {
    Cookies.set(`${taxName}__sort`, sort, COOKIE_OPTIONS);
};

/**
 * Get expand preference from cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @returns {string} Expand state ('collapsed' or 'expanded')
 */
export const getExpandPreference = (taxName) => {
    return Cookies.get(`${taxName}__expand`) || 'collapsed';
};

/**
 * Save expand preference to cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @param {string} expand - Expand state ('collapsed' or 'expanded')
 */
export const setExpandPreference = (taxName, expand) => {
    Cookies.set(`${taxName}__expand`, expand, COOKIE_OPTIONS);
};

/**
 * Get expanded folder IDs from cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @returns {number[]} Array of expanded folder IDs
 */
export const getExpandedFolderIds = (taxName) => {
    if (!taxName) return [];
    const stored = Cookies.get(`${taxName}__expanded_folders`);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        // Ensure all IDs are numbers
        return Array.isArray(parsed) ? parsed.map(id => Number(id)) : [];
    } catch {
        return [];
    }
};

/**
 * Save expanded folder IDs to cookie
 * @param {string} taxName - Taxonomy name for cookie key
 * @param {number[]} ids - Array of expanded folder IDs
 */
export const setExpandedFolderIds = (taxName, ids) => {
    if (!taxName) return;
    Cookies.set(`${taxName}__expanded_folders`, JSON.stringify(ids), COOKIE_OPTIONS);
};

/**
 * Add a folder ID to expanded list
 * @param {string} taxName - Taxonomy name for cookie key
 * @param {number} folderId - Folder ID to add
 */
export const addExpandedFolderId = (taxName, folderId) => {
    if (!taxName) return;
    const numId = Number(folderId);
    const ids = getExpandedFolderIds(taxName);
    if (!ids.includes(numId)) {
        ids.push(numId);
        setExpandedFolderIds(taxName, ids);
    }
};

/**
 * Remove a folder ID from expanded list
 * @param {string} taxName - Taxonomy name for cookie key
 * @param {number} folderId - Folder ID to remove
 */
export const removeExpandedFolderId = (taxName, folderId) => {
    if (!taxName) return;
    const numId = Number(folderId);
    const ids = getExpandedFolderIds(taxName);
    const filtered = ids.filter(id => id !== numId);
    setExpandedFolderIds(taxName, filtered);
};

/**
 * Clear all expanded folder IDs
 * @param {string} taxName - Taxonomy name for cookie key
 */
export const clearExpandedFolderIds = (taxName) => {
    if (!taxName) return;
    Cookies.remove(`${taxName}__expanded_folders`, { path: '/' });
};

/**
 * Set all folder IDs as expanded
 * @param {string} taxName - Taxonomy name for cookie key
 * @param {number[]} allFolderIds - All folder IDs to expand
 */
export const expandAllFolderIds = (taxName, allFolderIds) => {
    setExpandedFolderIds(taxName, allFolderIds);
};

/**
 * Check if current URL matches a folder
 * @param {Object|string} folder - Folder object or 'all'/'uncategorized'
 * @param {string} postTypeTax - Post type taxonomy slug
 * @returns {boolean} True if folder is active
 */
export const isActiveFolder = (folder, postTypeTax) => {
    const currentUrl = window.location.href;
    const folderUrl = getFolderUrl(folder, postTypeTax);

    if (folder === 'all') {
        return !currentUrl.includes(postTypeTax);
    }

    return currentUrl === folderUrl;
};

/**
 * Get allowed post statuses for counting
 * @returns {string[]} Array of allowed status strings
 */
export const getAllowedStatuses = () => {
    return ['pending', 'draft', 'future', 'private', 'publish', 'inherit'];
};

/**
 * Calculate total posts count from status counts
 * @param {Object} totalPosts - Object with status counts
 * @returns {number} Total count
 */
export const calculateTotalPosts = (totalPosts) => {
    const allowedStatuses = getAllowedStatuses();
    return allowedStatuses.reduce((total, status) => {
        return total + (Number(totalPosts[status]) || 0);
    }, 0);
};

/**
 * Default color tags for folders
 */
export const DEFAULT_COLOR_TAGS = [
    '#7B61FF',
    '#0347FF',
    '#F24AE1',
    '#ED2E7E',
    '#FFC804',
    '#00BA88'
];

/**
 * Get available color tags including custom colors
 * @param {Object|null} folder - Current folder being edited
 * @param {string[]} defaultColors - Default color options
 * @returns {string[]} Available color tags
 */
export const getColorTags = (folder = null, defaultColors = DEFAULT_COLOR_TAGS) => {
    if (!folder || !folder.color) {
        return defaultColors;
    }

    if (defaultColors.includes(folder.color)) {
        return defaultColors;
    }

    return [...defaultColors, folder.color];
};

export default {
    getUrlParameter,
    getFolderUrl,
    getFolderById,
    getFolderIdsByPostId,
    filterFolders,
    sortFolders,
    buildFolderHierarchy,
    getSortPreference,
    setSortPreference,
    getExpandPreference,
    setExpandPreference,
    getExpandedFolderIds,
    setExpandedFolderIds,
    addExpandedFolderId,
    removeExpandedFolderId,
    clearExpandedFolderIds,
    expandAllFolderIds,
    getSidebarVisibility,
    setSidebarVisibility,
    isActiveFolder,
    getAllowedStatuses,
    calculateTotalPosts,
    getColorTags,
    DEFAULT_COLOR_TAGS
};
