/**
 * DeleteFolderModal Component
 * Confirmation modal for deleting folders
 */

import React from 'react';
import { useFolderContext } from '../../store/FolderContext';

const DeleteFolderModal = () => {
    const { state, actions } = useFolderContext();
    const { modals } = state;

    if (!modals.delete.open) {
        return null;
    }

    const handleDelete = (e) => {
        e.preventDefault();
        actions.handleDeleteFolders();
    };

    const handleClose = (e) => {
        e.preventDefault();
        actions.handleHideDeleteModal();
    };

    return (
        <div className="popup--delete-folder">
            <a
                className="wp-adminify--popup-close"
                href="#"
                onClick={handleClose}
            >
                <span className="dashicons dashicons-no-alt" />
            </a>

            <h3>Are you sure you want to delete the selected folder?</h3>

            <p>Items in the folder will not be deleted.</p>

            <div>
                <a
                    href="#"
                    className="button"
                    onClick={handleClose}
                >
                    No, Keep it
                </a>
                <a
                    href="#"
                    className="button button-primary"
                    onClick={handleDelete}
                >
                    Yes, Delete it!
                </a>
            </div>
        </div>
    );
};

export default DeleteFolderModal;
