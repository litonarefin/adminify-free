/**
 * Folder Action Types and Action Creators
 */

// Action Types
export const ActionTypes = {
    // Data actions
    SET_FOLDERS: 'SET_FOLDERS',
    SET_POSTS: 'SET_POSTS',
    REFRESH_DATA: 'REFRESH_DATA',

    // UI State actions
    SET_FILTER: 'SET_FILTER',
    SET_SORT: 'SET_SORT',
    SET_EXPAND: 'SET_EXPAND',
    SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
    TOGGLE_FOLDER_SELECT: 'TOGGLE_FOLDER_SELECT',

    // Folder selection for bulk actions
    ADD_FOLDER_TO_EDIT: 'ADD_FOLDER_TO_EDIT',
    REMOVE_FOLDER_TO_EDIT: 'REMOVE_FOLDER_TO_EDIT',
    SET_FOLDERS_TO_EDIT: 'SET_FOLDERS_TO_EDIT',
    CLEAR_FOLDERS_TO_EDIT: 'CLEAR_FOLDERS_TO_EDIT',
    TOGGLE_FOLDER_SELECTION: 'TOGGLE_FOLDER_SELECTION',

    // Modal actions
    OPEN_CREATE_MODAL: 'OPEN_CREATE_MODAL',
    CLOSE_CREATE_MODAL: 'CLOSE_CREATE_MODAL',
    OPEN_RENAME_MODAL: 'OPEN_RENAME_MODAL',
    CLOSE_RENAME_MODAL: 'CLOSE_RENAME_MODAL',
    OPEN_DELETE_MODAL: 'OPEN_DELETE_MODAL',
    CLOSE_DELETE_MODAL: 'CLOSE_DELETE_MODAL',
    OPEN_MOVE_TO_MODAL: 'OPEN_MOVE_TO_MODAL',
    CLOSE_MOVE_TO_MODAL: 'CLOSE_MOVE_TO_MODAL',

    // Form state actions
    SET_NEW_FOLDER_NAME: 'SET_NEW_FOLDER_NAME',
    SET_RENAME_FOLDER_NAME: 'SET_RENAME_FOLDER_NAME',
    SET_ACTIVE_COLOR: 'SET_ACTIVE_COLOR',

    // Error actions
    SET_CREATE_ERROR: 'SET_CREATE_ERROR',
    SET_RENAME_ERROR: 'SET_RENAME_ERROR',
    SET_DELETE_ERROR: 'SET_DELETE_ERROR',
    CLEAR_ERRORS: 'CLEAR_ERRORS',

    // Loading state
    SET_LOADING: 'SET_LOADING'
};

// Action Creators

// Data actions
export const setFolders = (folders) => ({
    type: ActionTypes.SET_FOLDERS,
    payload: folders
});

export const setPosts = (posts) => ({
    type: ActionTypes.SET_POSTS,
    payload: posts
});

export const refreshData = (data) => ({
    type: ActionTypes.REFRESH_DATA,
    payload: data
});

// UI State actions
export const setFilter = (filterText) => ({
    type: ActionTypes.SET_FILTER,
    payload: filterText
});

export const setSort = (sort) => ({
    type: ActionTypes.SET_SORT,
    payload: sort
});

export const setExpand = (expand) => ({
    type: ActionTypes.SET_EXPAND,
    payload: expand
});

export const setCurrentView = (view) => ({
    type: ActionTypes.SET_CURRENT_VIEW,
    payload: view
});

export const toggleFolderSelect = () => ({
    type: ActionTypes.TOGGLE_FOLDER_SELECT
});

// Folder selection actions
export const addFolderToEdit = (folder) => ({
    type: ActionTypes.ADD_FOLDER_TO_EDIT,
    payload: folder
});

export const removeFolderToEdit = (folderId) => ({
    type: ActionTypes.REMOVE_FOLDER_TO_EDIT,
    payload: folderId
});

export const setFoldersToEdit = (folders) => ({
    type: ActionTypes.SET_FOLDERS_TO_EDIT,
    payload: folders
});

export const clearFoldersToEdit = () => ({
    type: ActionTypes.CLEAR_FOLDERS_TO_EDIT
});

export const toggleFolderSelection = (folderId) => ({
    type: ActionTypes.TOGGLE_FOLDER_SELECTION,
    payload: folderId
});

// Modal actions
export const openCreateModal = (parentFolder = null) => ({
    type: ActionTypes.OPEN_CREATE_MODAL,
    payload: { parentFolder }
});

export const closeCreateModal = () => ({
    type: ActionTypes.CLOSE_CREATE_MODAL
});

export const openRenameModal = (folder) => ({
    type: ActionTypes.OPEN_RENAME_MODAL,
    payload: { folder }
});

export const closeRenameModal = () => ({
    type: ActionTypes.CLOSE_RENAME_MODAL
});

export const openDeleteModal = (folders) => ({
    type: ActionTypes.OPEN_DELETE_MODAL,
    payload: { folders }
});

export const closeDeleteModal = () => ({
    type: ActionTypes.CLOSE_DELETE_MODAL
});

export const openMoveToModal = (postIds, targetFolder) => ({
    type: ActionTypes.OPEN_MOVE_TO_MODAL,
    payload: { postIds, targetFolder }
});

export const closeMoveToModal = () => ({
    type: ActionTypes.CLOSE_MOVE_TO_MODAL
});

// Form state actions
export const setNewFolderName = (name) => ({
    type: ActionTypes.SET_NEW_FOLDER_NAME,
    payload: name
});

export const setRenameFolderName = (name) => ({
    type: ActionTypes.SET_RENAME_FOLDER_NAME,
    payload: name
});

export const setActiveColor = (color) => ({
    type: ActionTypes.SET_ACTIVE_COLOR,
    payload: color
});

// Error actions
export const setCreateError = (error) => ({
    type: ActionTypes.SET_CREATE_ERROR,
    payload: error
});

export const setRenameError = (error) => ({
    type: ActionTypes.SET_RENAME_ERROR,
    payload: error
});

export const setDeleteError = (error) => ({
    type: ActionTypes.SET_DELETE_ERROR,
    payload: error
});

export const clearErrors = () => ({
    type: ActionTypes.CLEAR_ERRORS
});

// Loading state
export const setLoading = (isLoading) => ({
    type: ActionTypes.SET_LOADING,
    payload: isLoading
});

export default ActionTypes;
