/**
 * MoveToFolderModal Component
 * Modal for choosing between copy or move when post is already in a folder
 */

import React from 'react';
import { useFolderContext } from '../../store/FolderContext';

const MoveToFolderModal = () => {
    const { state } = useFolderContext();
    const { modals } = state;

    if (!modals.moveTo.open) {
        return null;
    }

    // Note: The actual click handling is done via jQuery event delegation
    // in useFolderDragDrop hook for Promise-based resolution

    return (
        <div className="popup--move-to-folder">
            <h3>Few posts are already in another Folder</h3>

            <p>Please choose a option whether you want to copy or move to new Folder.</p>

            <div>
                <a href="#" className="button button-copy">
                    Copy To Folder
                </a>
                <a href="#" className="button button-primary button-move">
                    Move To Folder
                </a>
            </div>
        </div>
    );
};

export default MoveToFolderModal;
