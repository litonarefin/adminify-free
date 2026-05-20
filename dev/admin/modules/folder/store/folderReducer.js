/**
 * Folder Reducer
 * Manages all state transitions for the folder module
 */

import { ActionTypes } from './folderActions';
import { DEFAULT_COLOR_TAGS, getExpandPreference, getSortPreference } from '../utils/folderUtils';

/**
 * Initial state for the folder module
 */
export const createInitialState = (initialData = {}) => ({
    // Data
    folders: initialData.folders || [],
    folderHierarchy: initialData.folder_hierarchy || {},
    posts: {},
    totalPosts: initialData.total_posts || {
        'auto-draft': 0,
        draft: 0,
        future: 0,
        inherit: 0,
        pending: 0,
        private: 0,
        publish: 0,
        'request-completed': 0,
        'request-confirmed': 0,
        'request-failed': 0,
        'request-pending': 0,
        trash: 0
    },
    totalUncatPosts: initialData.total_uncat_posts || 0,

    // Config
    postType: initialData.post_type || '',
    postTypeTax: initialData.post_type_tax || '',
    adminUrl: initialData.adminurl || '',
    isPro: !!initialData.is_pro,
    proNotice: initialData.pro_notice || '',

    // UI State
    filterText: '',
    sort: getSortPreference(initialData.post_type_tax || ''),
    expand: getExpandPreference(initialData.post_type_tax || ''),
    currentView: 'all',
    folderSelectToggle: false,
    foldersToEdit: [],

    // Modal State
    modals: {
        create: { open: false, parentFolder: null },
        rename: { open: false, folder: null },
        delete: { open: false, folders: [] },
        moveTo: { open: false, postIds: [], targetFolder: null }
    },

    // Form State
    newFolderName: '',
    renameFolderName: '',
    activeColorTag: DEFAULT_COLOR_TAGS[0],
    originalColorTag: DEFAULT_COLOR_TAGS[0],
    originalFolderName: '',

    // Errors
    errors: {
        create: null,
        rename: null,
        delete: null
    },

    // Loading
    loading: false,

    // Color options
    colorTags: DEFAULT_COLOR_TAGS
});

/**
 * Folder reducer
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
export const folderReducer = (state, action) => {
    switch (action.type) {
        // Data actions
        case ActionTypes.SET_FOLDERS:
            return {
                ...state,
                folders: action.payload
            };

        case ActionTypes.SET_POSTS:
            return {
                ...state,
                posts: action.payload
            };

        case ActionTypes.REFRESH_DATA:
            return {
                ...state,
                folders: action.payload.folders || state.folders,
                totalPosts: action.payload.total_posts || state.totalPosts,
                totalUncatPosts: action.payload.total_uncat_posts ?? state.totalUncatPosts,
                folderHierarchy: action.payload.folder_hierarchy || state.folderHierarchy
            };

        // UI State actions
        case ActionTypes.SET_FILTER:
            return {
                ...state,
                filterText: action.payload
            };

        case ActionTypes.SET_SORT:
            return {
                ...state,
                sort: action.payload
            };

        case ActionTypes.SET_EXPAND:
            return {
                ...state,
                expand: action.payload
            };

        case ActionTypes.SET_CURRENT_VIEW:
            return {
                ...state,
                currentView: action.payload
            };

        case ActionTypes.TOGGLE_FOLDER_SELECT:
            return {
                ...state,
                folderSelectToggle: !state.folderSelectToggle,
                // Reset selections when toggling off
                folders: state.folderSelectToggle
                    ? state.folders.map((f) => ({ ...f, selected: false }))
                    : state.folders
            };

        // Folder selection actions
        case ActionTypes.ADD_FOLDER_TO_EDIT:
            return {
                ...state,
                foldersToEdit: [...state.foldersToEdit, action.payload]
            };

        case ActionTypes.REMOVE_FOLDER_TO_EDIT:
            return {
                ...state,
                foldersToEdit: state.foldersToEdit.filter(
                    (f) => f.term_id !== action.payload
                )
            };

        case ActionTypes.SET_FOLDERS_TO_EDIT:
            return {
                ...state,
                foldersToEdit: action.payload
            };

        case ActionTypes.CLEAR_FOLDERS_TO_EDIT:
            return {
                ...state,
                foldersToEdit: []
            };

        case ActionTypes.TOGGLE_FOLDER_SELECTION:
            return {
                ...state,
                folders: state.folders.map((folder) =>
                    folder.term_id === action.payload
                        ? { ...folder, selected: !folder.selected }
                        : folder
                )
            };

        // Modal actions
        case ActionTypes.OPEN_CREATE_MODAL:
            return {
                ...state,
                modals: {
                    ...state.modals,
                    create: {
                        open: true,
                        parentFolder: action.payload.parentFolder
                    }
                },
                newFolderName: '',
                activeColorTag: DEFAULT_COLOR_TAGS[0],
                originalColorTag: DEFAULT_COLOR_TAGS[0],
                errors: { ...state.errors, create: null }
            };

        case ActionTypes.CLOSE_CREATE_MODAL:
            return {
                ...state,
                modals: {
                    ...state.modals,
                    create: { open: false, parentFolder: null }
                },
                newFolderName: '',
                errors: { ...state.errors, create: null }
            };

        case ActionTypes.OPEN_RENAME_MODAL:
            const folderToRename = action.payload.folder;
            return {
                ...state,
                modals: {
                    ...state.modals,
                    rename: {
                        open: true,
                        folder: folderToRename
                    }
                },
                foldersToEdit: [folderToRename],
                renameFolderName: folderToRename?.name || '',
                originalFolderName: folderToRename?.name || '',
                activeColorTag: folderToRename?.color || DEFAULT_COLOR_TAGS[0],
                originalColorTag: folderToRename?.color || DEFAULT_COLOR_TAGS[0],
                errors: { ...state.errors, rename: null }
            };

        case ActionTypes.CLOSE_RENAME_MODAL:
            return {
                ...state,
                modals: {
                    ...state.modals,
                    rename: { open: false, folder: null }
                },
                renameFolderName: '',
                errors: { ...state.errors, rename: null }
            };

        case ActionTypes.OPEN_DELETE_MODAL:
            return {
                ...state,
                modals: {
                    ...state.modals,
                    delete: {
                        open: true,
                        folders: action.payload.folders
                    }
                },
                foldersToEdit: action.payload.folders,
                errors: { ...state.errors, delete: null }
            };

        case ActionTypes.CLOSE_DELETE_MODAL:
            return {
                ...state,
                modals: {
                    ...state.modals,
                    delete: { open: false, folders: [] }
                },
                errors: { ...state.errors, delete: null }
            };

        case ActionTypes.OPEN_MOVE_TO_MODAL:
            return {
                ...state,
                modals: {
                    ...state.modals,
                    moveTo: {
                        open: true,
                        postIds: action.payload.postIds,
                        targetFolder: action.payload.targetFolder
                    }
                }
            };

        case ActionTypes.CLOSE_MOVE_TO_MODAL:
            return {
                ...state,
                modals: {
                    ...state.modals,
                    moveTo: { open: false, postIds: [], targetFolder: null }
                }
            };

        // Form state actions
        case ActionTypes.SET_NEW_FOLDER_NAME:
            return {
                ...state,
                newFolderName: action.payload,
                errors: { ...state.errors, create: null }
            };

        case ActionTypes.SET_RENAME_FOLDER_NAME:
            return {
                ...state,
                renameFolderName: action.payload,
                errors: { ...state.errors, rename: null }
            };

        case ActionTypes.SET_ACTIVE_COLOR:
            return {
                ...state,
                activeColorTag: action.payload
            };

        // Error actions
        case ActionTypes.SET_CREATE_ERROR:
            return {
                ...state,
                errors: { ...state.errors, create: action.payload }
            };

        case ActionTypes.SET_RENAME_ERROR:
            return {
                ...state,
                errors: { ...state.errors, rename: action.payload }
            };

        case ActionTypes.SET_DELETE_ERROR:
            return {
                ...state,
                errors: { ...state.errors, delete: action.payload }
            };

        case ActionTypes.CLEAR_ERRORS:
            return {
                ...state,
                errors: { create: null, rename: null, delete: null }
            };

        // Loading state
        case ActionTypes.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        default:
            return state;
    }
};

export default folderReducer;
