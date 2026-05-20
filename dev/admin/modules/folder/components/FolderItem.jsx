/**
 * FolderItem Component
 * Renders a single folder item with context menu
 * Uses only useFolderActions to prevent unnecessary re-renders
 */

import React, { useCallback, useRef, useEffect, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { useFolderActions, useFolderState } from '../store/FolderContext';
import { getFolderUrl, isActiveFolder, getExpandedFolderIds, addExpandedFolderId, removeExpandedFolderId } from '../utils/folderUtils';

/**
 * Convert hex color to a solid light tint (blended with white)
 */
const hexToLightTint = (hex, tintAmount = 0.15) => {
    let r = 92, g = 57, b = 242;

    if (hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    const blendedR = Math.round(255 + (r - 255) * tintAmount);
    const blendedG = Math.round(255 + (g - 255) * tintAmount);
    const blendedB = Math.round(255 + (b - 255) * tintAmount);

    return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
};

const FolderItem = ({ folder, folderSelectToggle, isActive, postTypeTax }) => {
    const actions = useFolderActions();
    const { expand: globalExpand } = useFolderState();
    const liRef = useRef(null);
    const [menuState, setMenuState] = useState({ isOpen: false, x: 0, y: 0 });

    // Check if folder has children
    const hasChildren = folder.children && folder.children.length > 0;

    // Initialize expand state from stored preference
    const [isExpanded, setIsExpanded] = useState(() => {
        // First check individual folder preference (overrides global)
        const expandedIds = getExpandedFolderIds(postTypeTax);
        if (expandedIds.includes(Number(folder.term_id))) {
            return true;
        }
        // Then check global preference
        return globalExpand === 'expanded';
    });

    // Track previous global expand state to detect changes
    const prevGlobalExpand = useRef(globalExpand);

    // Sync local state with global expand state changes
    useEffect(() => {
        if (prevGlobalExpand.current !== globalExpand) {
            prevGlobalExpand.current = globalExpand;
            setIsExpanded(globalExpand === 'expanded');
        }
    }, [globalExpand]);

    // Toggle individual folder expand/collapse with persistence
    const handleToggleExpand = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(prev => {
            const newState = !prev;
            // Save to cookie
            if (newState) {
                addExpandedFolderId(postTypeTax, folder.term_id);
            } else {
                removeExpandedFolderId(postTypeTax, folder.term_id);
            }
            return newState;
        });
    }, [postTypeTax, folder.term_id]);

    const folderUrl = getFolderUrl(folder, postTypeTax);

    // Close menu when clicking outside, scrolling, or another menu opens
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuState.isOpen && !e.target.closest('.adminify--context-menu-portal')) {
                setMenuState({ isOpen: false, x: 0, y: 0 });
            }
        };

        const handleScroll = () => {
            if (menuState.isOpen) {
                setMenuState({ isOpen: false, x: 0, y: 0 });
            }
        };

        const handleCloseAllMenus = (e) => {
            if (e.detail !== folder.term_id && menuState.isOpen) {
                setMenuState({ isOpen: false, x: 0, y: 0 });
            }
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('scroll', handleScroll, true);
        document.addEventListener('adminify-close-context-menus', handleCloseAllMenus);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('adminify-close-context-menus', handleCloseAllMenus);
        };
    }, [menuState.isOpen, folder.term_id]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        document.dispatchEvent(new CustomEvent('adminify-close-context-menus', {
            detail: folder.term_id
        }));

        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const menuWidth = 170;
        const menuHeight = 130;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let posX = mouseX;
        let posY = mouseY;

        if (mouseX + menuWidth > viewportWidth - 10) {
            posX = mouseX - menuWidth;
        }
        if (mouseY + menuHeight > viewportHeight - 10) {
            posY = mouseY - menuHeight;
        }

        posX = Math.max(10, posX);
        posY = Math.max(10, posY);

        setMenuState({ isOpen: true, x: posX, y: posY });
    }, [folder.term_id]);

    const handleCheckboxClick = useCallback((e) => {
        e.stopPropagation();
        actions.handleToggleFolderSelection(folder.term_id);
    }, [folder.term_id, actions]);

    const handleMenuNewSubFolder = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.handleShowCreateModal(folder.term_id);
        setMenuState({ isOpen: false, x: 0, y: 0 });
    }, [folder.term_id, actions]);

    const handleMenuRename = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.handleShowRenameModal(folder);
        setMenuState({ isOpen: false, x: 0, y: 0 });
    }, [folder, actions]);

    const handleMenuDelete = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.handleShowDeleteModal([folder]);
        setMenuState({ isOpen: false, x: 0, y: 0 });
    }, [folder, actions]);

    // Context menu portal
    const contextMenu = menuState.isOpen ? createPortal(
        <ul
            className="adminify--context-menu-portal"
            style={{
                position: 'fixed',
                left: `${menuState.x}px`,
                top: `${menuState.y}px`,
                zIndex: 999999
            }}
        >
            <li>
                <a href="#" onClick={handleMenuNewSubFolder}>
                    <span className="adminify-menu-icon dashicons dashicons-category"></span>
                    <span className="adminify-menu-text">New Sub-folder</span>
                </a>
            </li>
            <li>
                <a href="#" onClick={handleMenuRename}>
                    <span className="adminify-menu-icon dashicons dashicons-edit"></span>
                    <span className="adminify-menu-text">Rename</span>
                </a>
            </li>
            <li className="adminify-menu-separator"></li>
            <li>
                <a href="#" onClick={handleMenuDelete} className="adminify-menu-delete">
                    <span className="adminify-menu-icon dashicons dashicons-trash"></span>
                    <span className="adminify-menu-text">Delete</span>
                </a>
            </li>
        </ul>,
        document.body
    ) : null;

    return (
        <>
            <li
                ref={liRef}
                className={`folder--single-root has--sub-menu ${isActive ? 'active' : ''} ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                data-folder={folder.term_id}
            >
                <div className="wp-adminify--folder-row">
                    {/* Folder icon with +/- badge for expandable folders */}
                    <span className="wp-adminify--icon-control">
                        {!folderSelectToggle ? (
                            hasChildren ? (
                                <button
                                    type="button"
                                    className={`wp-adminify--folder-toggle ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                                    onClick={handleToggleExpand}
                                    style={{ color: folder.color }}
                                >
                                    <span className={`wp-adminify--icon dashicons ${isExpanded ? 'dashicons-open-folder' : 'dashicons-category'}`} />
                                    <span className={`wp-adminify--badge dashicons ${isExpanded ? 'dashicons-minus' : 'dashicons-plus-alt2'}`} />
                                </button>
                            ) : (
                                <span
                                    className="wp-adminify--icon dashicons dashicons-category"
                                    style={{ color: folder.color }}
                                />
                            )
                        ) : (
                            <input
                                className="wp-adminify--control"
                                type="checkbox"
                                checked={folder.selected || false}
                                onClick={handleCheckboxClick}
                                onChange={() => {}}
                            />
                        )}
                    </span>

                    <a
                        href={folderUrl}
                        onContextMenu={handleContextMenu}
                        style={{
                            backgroundColor: isActive ? hexToLightTint(folder.color, 0.15) : undefined
                        }}
                    >
                        <span className="wp-adminify--name" style={{ color: folder.color }}>{folder.name}</span>
                        <span className="wp-adminify--count">{folder.count}</span>
                    </a>
                </div>

                {/* Render children recursively */}
                {isExpanded && hasChildren && (
                    <FolderList
                        folders={folder.children}
                        folderSelectToggle={folderSelectToggle}
                        postTypeTax={postTypeTax}
                        className="folder--sub-lists"
                    />
                )}
            </li>
            {contextMenu}
        </>
    );
};

// Import FolderList for recursive rendering
import FolderList from './FolderList';

// Don't use custom memo comparison since we're using useFolderState for expand
// The component will re-render when expand state changes
export default FolderItem;
