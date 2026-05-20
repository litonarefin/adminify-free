/**
 * RenameFolderModal Component
 * Modal for renaming folders and changing colors
 */

import React from 'react';
import { useFolderContext } from '../../store/FolderContext';
import ColorPicker from './ColorPicker';

const RenameFolderModal = () => {
    const { state, actions, computed } = useFolderContext();
    const { modals, renameFolderName, activeColorTag, errors } = state;
    const { availableColorTags } = computed;

    if (!modals.rename.open) {
        return null;
    }

    const handleNameChange = (e) => {
        actions.handleRenameFolderNameChange(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        actions.handleRenameFolder();
    };

    const handleClose = (e) => {
        e.preventDefault();
        actions.handleHideRenameModal();
    };

    return (
        <div className="popup--rename-folder">
            <a
                className="wp-adminify--popup-close"
                href="#"
                onClick={handleClose}
            >
                <span className="dashicons dashicons-no-alt" />
            </a>

            <h3>Rename Folder</h3>

            <div className="popup--new-folder__name">
                <div>Rename Folder</div>
                <div>
                    <input
                        type="text"
                        value={renameFolderName || ''}
                        onChange={handleNameChange}
                        placeholder="Write here"
                    />
                </div>
            </div>

            <br />

            <ColorPicker
                colors={availableColorTags}
                activeColor={activeColorTag}
                onColorSelect={actions.handleColorChange}
                label="Change Color"
            />

            <div className="adminify-save-folder">
                <a
                    href="#"
                    className="button button-primary"
                    onClick={handleSubmit}
                >
                    Save Folder
                </a>
            </div>


            {errors.rename && (
                <div className="popup--new-folder-error">
                    {errors.rename}
                </div>
            )}
        </div>
    );
};

export default RenameFolderModal;
