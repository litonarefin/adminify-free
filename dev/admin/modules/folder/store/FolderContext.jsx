/**
 * Folder Context Provider
 * Split into separate contexts to prevent unnecessary re-renders
 */

import React, { createContext, useContext, useReducer, useMemo, useRef, useEffect } from 'react';
import { folderReducer, createInitialState } from './folderReducer';
import {
    setFilter,
    setSort,
    setExpand,
    toggleFolderSelect,
    openCreateModal,
    closeCreateModal,
    openRenameModal,
    closeRenameModal,
    openDeleteModal,
    closeDeleteModal,
    openMoveToModal,
    closeMoveToModal,
    setNewFolderName,
    setRenameFolderName,
    setActiveColor,
    setCreateError,
    setRenameError,
    refreshData,
    setPosts,
    toggleFolderSelection,
    setFoldersToEdit
} from './folderActions';
import * as folderApi from '../api/folderApi';
import {
    filterFolders,
    sortFolders,
    buildFolderHierarchy,
    setSortPreference,
    setExpandPreference,
    clearExpandedFolderIds,
    calculateTotalPosts,
    isActiveFolder,
    getColorTags
} from '../utils/folderUtils';

// Separate contexts to prevent unnecessary re-renders
const FolderStateContext = createContext(null);
const FolderActionsContext = createContext(null);
const FolderComputedContext = createContext(null);

/**
 * Folder Provider Component
 */
export const FolderProvider = ({ initialData, children }) => {
    const [state, dispatch] = useReducer(
        folderReducer,
        initialData,
        createInitialState
    );

    // Use ref to access current state in callbacks without triggering re-renders
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Memoized computed values
    const computed = useMemo(() => {
        const filteredFolders = (() => {
            let folders = state.folders;
            folders = sortFolders(folders, state.sort);
            if (state.filterText.trim()) {
                return filterFolders(folders, state.filterText);
            }
            return buildFolderHierarchy(folders, state.folderHierarchy);
        })();

        const totalPostsCount = calculateTotalPosts(state.totalPosts);
        const isReachedLimit = state.isPro ? false : state.folders.length >= 3;
        const folderToEdit = state.foldersToEdit[0] || null;
        const availableColorTags = getColorTags(folderToEdit, state.colorTags);

        return {
            filteredFolders,
            totalPostsCount,
            isReachedLimit,
            availableColorTags
        };
    }, [state.folders, state.sort, state.filterText, state.folderHierarchy, state.totalPosts, state.isPro, state.foldersToEdit, state.colorTags]);

    // Actions - NEVER changes after initial creation (uses stateRef)
    const actions = useMemo(() => ({
        // Filter and sort
        handleFilterChange: (text) => dispatch(setFilter(text)),

        handleSortChange: (sort) => {
            setSortPreference(stateRef.current.postTypeTax, sort);
            dispatch(setSort(sort));
        },

        handleExpandChange: (expand) => {
            setExpandPreference(stateRef.current.postTypeTax, expand);
            // Clear individual expanded folder IDs when using global expand/collapse
            clearExpandedFolderIds(stateRef.current.postTypeTax);
            dispatch(setExpand(expand));
        },

        handleToggleFolderSelect: () => dispatch(toggleFolderSelect()),

        handleToggleFolderSelection: (folderId) => dispatch(toggleFolderSelection(folderId)),

        // Modal handlers
        handleShowCreateModal: (parentFolder = null) => {
            document.body.classList.add('wp-adminify--popup-show');
            dispatch(openCreateModal(parentFolder));
        },

        handleHideCreateModal: () => {
            document.body.classList.remove('wp-adminify--popup-show');
            dispatch(closeCreateModal());
        },

        handleShowRenameModal: (folder) => {
            document.body.classList.add('wp-adminify--popup-show');
            dispatch(openRenameModal(folder));
        },

        handleHideRenameModal: () => {
            document.body.classList.remove('wp-adminify--popup-show');
            dispatch(closeRenameModal());
        },

        handleShowDeleteModal: (folders) => {
            const foldersArray = Array.isArray(folders) ? folders : [folders];
            document.body.classList.add('wp-adminify--popup-show');
            dispatch(openDeleteModal(foldersArray));
        },

        handleHideDeleteModal: () => {
            document.body.classList.remove('wp-adminify--popup-show');
            dispatch(closeDeleteModal());
        },

        handleShowMoveToModal: (postIds, targetFolder) => {
            document.body.classList.add('wp-adminify--popup-show');
            dispatch(openMoveToModal(postIds, targetFolder));
        },

        handleHideMoveToModal: () => {
            document.body.classList.remove('wp-adminify--popup-show');
            dispatch(closeMoveToModal());
        },

        // Form handlers
        handleNewFolderNameChange: (name) => dispatch(setNewFolderName(name)),
        handleRenameFolderNameChange: (name) => dispatch(setRenameFolderName(name)),
        handleColorChange: (color) => dispatch(setActiveColor(color)),

        // API actions
        handleCreateFolder: async () => {
            const { newFolderName, activeColorTag, modals, isPro } = stateRef.current;
            const parentFolder = isPro ? modals.create.parentFolder : null;

            try {
                const response = await folderApi.createFolder(
                    newFolderName,
                    activeColorTag,
                    parentFolder
                );

                if (response.success) {
                    dispatch(refreshData(response.data));
                    document.body.classList.remove('wp-adminify--popup-show');
                    dispatch(closeCreateModal());
                } else {
                    dispatch(setCreateError(response.data?.message || 'Failed to create folder'));
                }
            } catch (error) {
                dispatch(setCreateError('An error occurred while creating the folder'));
            }
        },

        handleRenameFolder: async () => {
            const { renameFolderName, activeColorTag, originalFolderName, originalColorTag, foldersToEdit } = stateRef.current;

            const hasNameChange = renameFolderName.trim() !== originalFolderName.trim();
            const hasColorChange = activeColorTag !== originalColorTag;

            if (!hasNameChange && !hasColorChange) {
                document.body.classList.remove('wp-adminify--popup-show');
                dispatch(closeRenameModal());
                return;
            }

            const folder = foldersToEdit[0];
            if (!folder) return;

            try {
                const response = await folderApi.renameFolder(
                    folder.term_id,
                    renameFolderName,
                    activeColorTag
                );

                if (response.success) {
                    dispatch(refreshData(response.data));
                    document.body.classList.remove('wp-adminify--popup-show');
                    dispatch(closeRenameModal());
                } else {
                    dispatch(setRenameError(response.data?.message || 'Failed to rename folder'));
                }
            } catch (error) {
                dispatch(setRenameError('An error occurred while renaming the folder'));
            }
        },

        handleDeleteFolders: async () => {
            const { foldersToEdit } = stateRef.current;

            if (!foldersToEdit.length) {
                document.body.classList.remove('wp-adminify--popup-show');
                dispatch(closeDeleteModal());
                return;
            }

            const termIds = foldersToEdit.map((folder) => folder.term_id);

            try {
                const response = await folderApi.deleteFolders(termIds);

                if (response.success) {
                    dispatch(refreshData(response.data));
                    document.body.classList.remove('wp-adminify--popup-show');
                    dispatch(closeDeleteModal());
                }
            } catch (error) {
                console.error('Error deleting folders:', error);
            }
        },

        handleMoveToFolder: async (postIds, folderId, shouldMove, mode = 'list') => {
            try {
                const screen = window.pagenow || '';
                const response = await folderApi.moveToFolder(
                    postIds,
                    folderId,
                    shouldMove,
                    screen,
                    mode
                );

                if (response.success) {
                    dispatch(refreshData(response.data));
                }

                return response;
            } catch (error) {
                console.error('Error moving to folder:', error);
                return { success: false };
            }
        },

        handleRefreshFolders: async () => {
            try {
                const response = await folderApi.refreshFolders();
                if (response.success) {
                    dispatch(refreshData(response.data));
                }
            } catch (error) {
                console.error('Error refreshing folders:', error);
            }
        },

        handleSetPosts: (posts) => dispatch(setPosts(posts)),

        isFolderActive: (folder) => isActiveFolder(folder, stateRef.current.postTypeTax),

        setFoldersToEdit: (folders) => dispatch(setFoldersToEdit(folders)),

        getActiveFolders: () => {
            const activeLi = document.querySelector('.folder--lists li.active');
            if (activeLi) {
                const folderId = activeLi.dataset.folder;
                return stateRef.current.folders.filter((f) => f.term_id === Number(folderId));
            }
            return [];
        },

        getStateRef: () => stateRef
    }), [dispatch]); // Only depends on dispatch which never changes

    return (
        <FolderActionsContext.Provider value={actions}>
            <FolderStateContext.Provider value={state}>
                <FolderComputedContext.Provider value={computed}>
                    {children}
                </FolderComputedContext.Provider>
            </FolderStateContext.Provider>
        </FolderActionsContext.Provider>
    );
};

/**
 * Hook to get ONLY actions (never causes re-render)
 */
export const useFolderActions = () => {
    const context = useContext(FolderActionsContext);
    if (!context) {
        throw new Error('useFolderActions must be used within a FolderProvider');
    }
    return context;
};

/**
 * Hook to get state (re-renders when state changes)
 */
export const useFolderState = () => {
    const context = useContext(FolderStateContext);
    if (!context) {
        throw new Error('useFolderState must be used within a FolderProvider');
    }
    return context;
};

/**
 * Hook to get computed values (re-renders when computed changes)
 */
export const useFolderComputed = () => {
    const context = useContext(FolderComputedContext);
    if (!context) {
        throw new Error('useFolderComputed must be used within a FolderProvider');
    }
    return context;
};

/**
 * Combined hook for backward compatibility
 */
export const useFolderContext = () => {
    const state = useFolderState();
    const actions = useFolderActions();
    const computed = useFolderComputed();

    return { state, actions, computed };
};

export default FolderStateContext;
