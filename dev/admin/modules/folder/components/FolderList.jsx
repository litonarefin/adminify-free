/**
 * FolderList Component
 * Recursive folder list that renders folder items and their children
 */

import React, { memo } from 'react';
import FolderItem from './FolderItem';
import { useFolderState, useFolderActions } from '../store/FolderContext';
import { isActiveFolder } from '../utils/folderUtils';

const FolderList = ({ folders, folderSelectToggle, className = '', postTypeTax: propPostTypeTax }) => {
    // Get postTypeTax from state if not passed as prop (for top-level list)
    const state = useFolderState();
    const postTypeTax = propPostTypeTax || state.postTypeTax;

    if (!folders || !folders.length) {
        return null;
    }

    return (
        <ul className={className}>
            {folders.map((folder) => (
                <FolderItem
                    key={folder.term_id}
                    folder={folder}
                    folderSelectToggle={folderSelectToggle}
                    isActive={isActiveFolder(folder, postTypeTax)}
                    postTypeTax={postTypeTax}
                />
            ))}
        </ul>
    );
};

// Memoize to prevent unnecessary re-renders
export default memo(FolderList);
