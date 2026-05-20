/**
 * Folder Drag & Drop Hook
 * Handles drag and drop functionality for posts/attachments to folders
 */

import { useEffect, useCallback, useRef } from 'react';
import { useFolderActions, useFolderState } from '../store/FolderContext';
import { getFolderIdsByPostId } from '../utils/folderUtils';

const $ = window.jQuery;

/**
 * Create drag helper element with item count
 * @param {number} count - Number of items being dragged
 * @returns {jQuery} Helper element
 */
const createDragHelper = (count) => {
    const text = count === 1 ? 'Move 1 item' : `Move ${count} items`;
    return $(`
        <div class="adminify-drag-helper" style="position: fixed !important;">
            <span class="adminify-drag-helper__icon dashicons dashicons-move"></span>
            <span class="adminify-drag-helper__text">${text}</span>
        </div>
    `);
};

/**
 * Get count of selected items for dragging
 * @param {jQuery} draggable - The draggable element
 * @returns {number} Count of items
 */
const getSelectedItemsCount = (draggable) => {
    // Multiple selection from list view
    if (draggable.hasClass('adminify-move-multiple')) {
        return $('#the-list .check-column input[type=checkbox]:checked').length;
    }

    // Grid view - check if bulk select mode
    if (draggable.hasClass('attachment')) {
        if ($('.media-toolbar.wp-filter').hasClass('media-toolbar-mode-select')) {
            const selectedCount = $('.attachments-browser li.attachment.selected').length;
            return selectedCount > 0 ? selectedCount : 1;
        }
    }

    // Single item
    return 1;
};

/**
 * Custom hook for folder drag and drop functionality
 * Uses jQuery UI for WordPress compatibility with post/attachment dragging
 */
export const useFolderDragDrop = () => {
    const actions = useFolderActions();
    const state = useFolderState();

    // Use ref to access current state without causing re-renders
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const moveResolverRef = useRef(null);
    const initializedRef = useRef(false);

    /**
     * Set up post/folder mapping from DOM elements
     */
    const setPostsFolders = useCallback(() => {
        const posts = {};

        // List view posts
        $('#the-list .adminify-move-file').each(function () {
            const id = $(this).data('id');
            const folders = $(this).data('folders');
            posts[id] = folders
                ? String(folders).split(',').map((f) => Number(f))
                : [];
        });

        // Grid view attachments
        $('.attachments-browser .attachments .attachment').each(function () {
            const id = $(this).data('id');
            const folders = $(this).find('.attachment-preview').data('folders');
            posts[id] = folders
                ? String(folders).split(',').map((f) => Number(f))
                : [];
        });

        actions.handleSetPosts(posts);
    }, [actions]);

    /**
     * Initialize draggable elements (posts/attachments)
     */
    const initDraggableEvents = useCallback(() => {
        // List view items - single file
        $('.adminify-move-file:not(.ui-draggable)').draggable({
            revert: 'invalid',
            containment: 'document',
            cursor: 'move',
            appendTo: 'body',
            cursorAt: { left: 5, top: -25 },
            helper: function () {
                return createDragHelper(1);
            },
            start: function () {
                $(this).closest('td').addClass('adminify-draggable');
                $('body').addClass('adminify--items-dragging');
            },
            stop: function () {
                $(this).closest('td').removeClass('adminify-draggable');
                $('body').removeClass('adminify--items-dragging');
            }
        });

        // List view items - multiple selection
        $('.adminify-move-multiple:not(.ui-draggable)').draggable({
            revert: 'invalid',
            containment: 'document',
            cursor: 'move',
            appendTo: 'body',
            cursorAt: { left: 5, top: -25 },
            helper: function () {
                const count = $('#the-list .check-column input[type=checkbox]:checked').length;
                return createDragHelper(count > 0 ? count : 1);
            },
            start: function () {
                $(this).closest('td').addClass('adminify-draggable');
                $('body').addClass('adminify--items-dragging');
            },
            stop: function () {
                $(this).closest('td').removeClass('adminify-draggable');
                $('body').removeClass('adminify--items-dragging');
            }
        });

        // Grid view attachments
        $('.attachments-browser li.attachment:not(.ui-draggable)').draggable({
            revert: 'invalid',
            containment: 'document',
            cursor: 'move',
            appendTo: 'body',
            cursorAt: { left: 5, top: -25 },
            helper: function () {
                const count = getSelectedItemsCount($(this));
                return createDragHelper(count);
            },
            start: function () {
                $('body').addClass('adminify--items-dragging');
            },
            stop: function () {
                $('body').removeClass('adminify--items-dragging');
            }
        });
    }, []);

    /**
     * Show move/copy prompt and return user choice
     */
    const shouldWeMoveToFolder = useCallback(() => {
        actions.handleShowMoveToModal([], null);

        return new Promise((resolve) => {
            moveResolverRef.current = resolve;

            const handleClick = (e) => {
                e.preventDefault();
                const shouldMove = $(e.target).hasClass('button-move');
                resolve(shouldMove);
                cleanup();
            };

            const cleanup = () => {
                $('body').off('click.promptDialog', '.button-move, .button-copy');
                actions.handleHideMoveToModal();
                moveResolverRef.current = null;
            };

            $('body').on('click.promptDialog', '.button-move, .button-copy', handleClick);
        });
    }, [actions]);

    /**
     * Initialize droppable folder targets
     */
    const initDroppableEvents = useCallback(() => {
        $(
            '.folder--lists li .wp-adminify--folder-row > a:not(.ui-droppable), .folder--stats li.folder--single-uncategorized > a:not(.ui-droppable)'
        ).droppable({
            accept: '.adminify-move-file, .adminify-move-multiple, .attachments-browser li.attachment',
            hoverClass: 'adminify-drop-hover',
            classes: {
                'ui-droppable-active': 'ui-state-highlight'
            },
            tolerance: 'pointer',
            drop: async function (event, ui) {
                const folderID = $(this).closest('li').data('folder');
                if (!folderID) return;

                let postIDs = [];

                // Multiple selection from list view
                if (ui.draggable.hasClass('adminify-move-multiple')) {
                    postIDs = $('#the-list .check-column input[type=checkbox]:checked')
                        .toArray()
                        .map((input) => input.value);

                    $('.wp-list-table .manage-column.check-column input').prop('checked', false);
                }
                // Single item from list view
                else if (ui.draggable.hasClass('adminify-move-file')) {
                    postIDs = [ui.draggable[0].attributes['data-id'].nodeValue];
                }
                // Attachments from grid view
                else if (ui.draggable.hasClass('attachment')) {
                    if ($('.media-toolbar.wp-filter').hasClass('media-toolbar-mode-select')) {
                        postIDs = $('.attachments-browser li.attachment.selected')
                            .toArray()
                            .map((media) => media.dataset.id);
                    } else {
                        postIDs = [ui.draggable[0].attributes['data-id'].nodeValue];
                    }
                }

                if (!postIDs.length) return;

                let shouldMove = false;

                // Check if any posts are already in a folder (use ref for current state)
                if (folderID !== 'uncategorized') {
                    const posts = stateRef.current.posts;
                    const hasExistingFolder = postIDs.some((postId) => {
                        const folderIds = getFolderIdsByPostId(posts, postId);
                        return folderIds && folderIds.length > 0;
                    });

                    if (hasExistingFolder) {
                        shouldMove = await shouldWeMoveToFolder();
                    }
                }

                // Determine mode
                const isAttachment = ui.draggable.hasClass('attachment');
                const mode = isAttachment ? 'grid' : ($('input[name=post_view]').first().val() || 'list');

                // Move to folder
                const response = await actions.handleMoveToFolder(postIDs, folderID, shouldMove, mode);

                if (response.success) {
                    refreshRows();
                }
            }
        });
    }, [actions, shouldWeMoveToFolder]);

    /**
     * Refresh current view rows
     */
    const refreshRows = useCallback(() => {
        const $currentItem = $('.folder--lists li.active, .folder--stats li.active').first();
        const $target = $currentItem.length ? $currentItem : $('.folder--stats li').first();
        $target.children('a').trigger('click');
    }, []);

    /**
     * Handle WordPress AJAX events for re-initialization
     */
    const resetOnOtherAjaxEvents = useCallback(() => {
        $(document).ajaxComplete((event, xhr, settings) => {
            if (settings.dataType === 'html') {
                initDraggableEvents();
                return;
            }

            if (!settings.data) return;

            const accepted = ['inline-save', 'query-attachments', 'delete-post'].some(
                (action) => settings.data.indexOf(`action=${action}`) !== -1
            );

            if (accepted) {
                setTimeout(() => {
                    initDraggableEvents();
                    actions.handleRefreshFolders();
                }, 100);
            }
        });

        // Handle upload completion
        if (window.wp?.Uploader?.queue) {
            window.wp.Uploader.queue.on('reset', () => {
                initDraggableEvents();
                actions.handleRefreshFolders();
            });
        }
    }, [initDraggableEvents, actions]);

    /**
     * Initialize all drag/drop events
     */
    const initialize = useCallback(() => {
        if (initializedRef.current) return; // Prevent double initialization
        initializedRef.current = true;

        setPostsFolders();
        initDraggableEvents();
        initDroppableEvents();
        resetOnOtherAjaxEvents();
    }, [setPostsFolders, initDraggableEvents, initDroppableEvents, resetOnOtherAjaxEvents]);

    /**
     * Reinitialize after data changes
     */
    const reinitialize = useCallback(() => {
        setTimeout(() => {
            initDroppableEvents();
            initDraggableEvents();
            setPostsFolders();
        }, 200);
    }, [initDroppableEvents, initDraggableEvents, setPostsFolders]);

    // Store folders length in ref to detect actual changes
    const foldersLengthRef = useRef(state.folders.length);

    // Effect to reinitialize when folders change (only on actual folder count change)
    useEffect(() => {
        // Skip initial render
        if (!initializedRef.current) {
            return;
        }

        // Only reinitialize if folder count actually changed
        if (state.folders.length !== foldersLengthRef.current && state.folders.length > 0) {
            foldersLengthRef.current = state.folders.length;
            setTimeout(() => {
                initDroppableEvents();
                initDraggableEvents();
                setPostsFolders();
            }, 200);
        }
    }, [state.folders.length, initDroppableEvents, initDraggableEvents, setPostsFolders]);

    return {
        initialize,
        reinitialize,
        setPostsFolders,
        initDraggableEvents,
        initDroppableEvents,
        refreshRows
    };
};

export default useFolderDragDrop;
