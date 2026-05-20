/**
 * ModalFolderSidebar Component
 * Simplified folder sidebar for WordPress media upload modal
 * Used within the media modal context (post/page editors)
 */

import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { filterFolders, sortFolders, buildFolderHierarchy, calculateTotalPosts } from '../utils/folderUtils';

/**
 * Modal Folder Stats - Shows All and Uncategorized counts
 */
const ModalFolderStats = memo(({ totalPosts, uncategorizedCount, activeFolder, onFolderClick }) => {
    return (
        <ul className="folder--stats">
            <li
                className={`folder--single-all ${activeFolder === 'all' ? 'active' : ''}`}
                data-folder="all"
            >
                <a href="#" onClick={(e) => { e.preventDefault(); onFolderClick('all'); }}>
                    <span>All</span>
                    <span className="wp-adminify--count">{totalPosts}</span>
                </a>
            </li>
            <li
                className={`folder--single-uncategorized ${activeFolder === 'uncategorized' ? 'active' : ''}`}
                data-folder="uncategorized"
            >
                <a href="#" onClick={(e) => { e.preventDefault(); onFolderClick('uncategorized'); }}>
                    <span>Uncategorized</span>
                    <span className="wp-adminify--count">{uncategorizedCount}</span>
                </a>
            </li>
        </ul>
    );
});

/**
 * Modal Folder Search - Search input for filtering folders
 */
const ModalFolderSearch = memo(({ filterText, onFilterChange }) => {
    return (
        <div className="folder--search">
            <input
                type="text"
                placeholder="Search folder"
                value={filterText}
                onChange={(e) => onFilterChange(e.target.value)}
            />
        </div>
    );
});

/**
 * Modal Folder Item - Single folder item (simplified, no context menu)
 */
const ModalFolderItem = memo(({ folder, isActive, onFolderClick, children }) => {
    const handleClick = useCallback((e) => {
        e.preventDefault();
        onFolderClick(folder.slug);
    }, [folder.slug, onFolderClick]);

    return (
        <li
            className={`folder--single-root ${isActive ? 'active' : ''}`}
            data-folder={folder.term_id}
        >
            <a
                href="#"
                onClick={handleClick}
                style={{
                    color: folder.color || undefined,
                    backgroundColor: isActive && folder.color ? hexToLightTint(folder.color, 0.15) : undefined
                }}
            >
                <span className="wp-adminify--folder-left">
                    <span className="wp-adminify--icon-control">
                        <span className="wp-adminify--icon dashicons dashicons-open-folder" />
                    </span>
                    <span className="wp-adminify--name">{folder.name}</span>
                </span>
                <span className="wp-adminify--count">{folder.count}</span>
            </a>
            {children}
        </li>
    );
});

/**
 * Modal Folder List - Recursive folder list
 */
const ModalFolderList = memo(({ folders, activeFolder, onFolderClick, className = '' }) => {
    if (!folders || !folders.length) {
        return null;
    }

    return (
        <ul className={className}>
            {folders.map((folder) => (
                <ModalFolderItem
                    key={folder.term_id}
                    folder={folder}
                    isActive={activeFolder === folder.slug}
                    onFolderClick={onFolderClick}
                >
                    {folder.children && folder.children.length > 0 && (
                        <ModalFolderList
                            folders={folder.children}
                            activeFolder={activeFolder}
                            onFolderClick={onFolderClick}
                            className="folder--sub-lists"
                        />
                    )}
                </ModalFolderItem>
            ))}
        </ul>
    );
});

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

/**
 * Main ModalFolderSidebar Component
 */
const ModalFolderSidebar = ({ initialData, collection }) => {
    const [filterText, setFilterText] = useState('');
    const [activeFolder, setActiveFolder] = useState('all');

    // Extract data from initialData
    const folders = initialData?.folders || [];
    const folderHierarchy = initialData?.folder_hierarchy || {};
    const totalPosts = initialData?.total_posts || {};
    const totalUncatPosts = initialData?.total_uncat_posts || 0;

    // Compute filtered and sorted folders
    const displayFolders = useMemo(() => {
        let result = [...folders];
        result = sortFolders(result, 'a-z');

        if (filterText.trim()) {
            return filterFolders(result, filterText);
        }

        return buildFolderHierarchy(result, folderHierarchy);
    }, [folders, folderHierarchy, filterText]);

    // Calculate total posts count
    const totalPostsCount = useMemo(() => {
        return calculateTotalPosts(totalPosts);
    }, [totalPosts]);

    /**
     * Handle folder click - updates the media library filter
     */
    const handleFolderClick = useCallback((folderSlug) => {
        setActiveFolder(folderSlug);

        if (!collection) return;

        // Set the media_folder property on the collection
        if (folderSlug === 'all') {
            // Clear the filter to show all attachments
            collection.props.set({ media_folder: '' });
        } else if (folderSlug === 'uncategorized') {
            // Use -1 to indicate uncategorized (no folder assigned)
            collection.props.set({ media_folder: '-1' });
        } else {
            // Filter by specific folder slug
            collection.props.set({ media_folder: folderSlug });
        }
    }, [collection]);

    // Listen for external changes to the collection's media_folder prop
    useEffect(() => {
        if (!collection) return;

        const handleChange = () => {
            const currentFolder = collection.props.get('media_folder');
            if (currentFolder === '' || currentFolder === undefined) {
                setActiveFolder('all');
            } else if (currentFolder === '-1') {
                setActiveFolder('uncategorized');
            } else {
                setActiveFolder(currentFolder);
            }
        };

        collection.props.on('change:media_folder', handleChange);

        return () => {
            collection.props.off('change:media_folder', handleChange);
        };
    }, [collection]);

    return (
        <div className="wp-adminify--modal-folder-sidebar">
            <div className="wp-adminify--folder-app">
                <div className="wp-adminify--folder-app--inner">
                    {/* Header */}
                    <div className="folder--header">
                        <span>Folders</span>
                    </div>

                    {/* Stats (All / Uncategorized) */}
                    <ModalFolderStats
                        totalPosts={totalPostsCount}
                        uncategorizedCount={totalUncatPosts}
                        activeFolder={activeFolder}
                        onFolderClick={handleFolderClick}
                    />

                    {/* Search */}
                    <ModalFolderSearch
                        filterText={filterText}
                        onFilterChange={setFilterText}
                    />

                    {/* Folder List */}
                    {folders.length > 0 && (
                        <ModalFolderList
                            folders={displayFolders}
                            activeFolder={activeFolder}
                            onFolderClick={handleFolderClick}
                            className="folder--lists"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(ModalFolderSidebar);
