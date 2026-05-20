/**
 * CreateFolderModal Component
 * Modal for creating new folders and sub-folders
 */

import React from 'react';
import { useFolderContext } from '../../store/FolderContext';
import ColorPicker from './ColorPicker';

const CreateFolderModal = () => {
    const { state, actions, computed } = useFolderContext();
    const { modals, newFolderName, activeColorTag, errors, isPro, proNotice, colorTags } = state;
    const { isReachedLimit } = computed;

    if (!modals.create.open) {
        return null;
    }

    const isSubFolder = modals.create.parentFolder !== null;
    const showProNotice = isSubFolder ? !isPro : isReachedLimit;

    const handleNameChange = (e) => {
        actions.handleNewFolderNameChange(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        actions.handleCreateFolder();
    };

    const handleClose = (e) => {
        e.preventDefault();
        actions.handleHideCreateModal();
    };

    return (
        <div className="popup--create-new-folder">
            <a
                className="wp-adminify--popup-close"
                href="#"
                onClick={handleClose}
            >
                <span className="dashicons dashicons-no-alt" />
            </a>

            {isSubFolder ? (
                <>
                    <h3>New Sub Folder</h3>

                    {isPro ? (
                        <>
                            <div className="popup--new-folder__name">
                                <div>Sub Folder Name</div>
                                <div>
                                    <input
                                        type="text"
                                        value={newFolderName || ''}
                                        onChange={handleNameChange}
                                        placeholder="Write here"
                                    />
                                </div>
                            </div>

                            <br />

                            <ColorPicker
                                colors={colorTags}
                                activeColor={activeColorTag}
                                onColorSelect={actions.handleColorChange}
                                label="Colour Tag"
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


                            {errors.create && (
                                <div className="popup--new-folder-error">
                                    {errors.create}
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="wp-adminify-folder--pro-notice"
                            dangerouslySetInnerHTML={{ __html: proNotice }}
                        />
                    )}
                </>
            ) : (
                <>
                    {showProNotice ? (
                        <div
                            className="wp-adminify-folder--pro-notice"
                            dangerouslySetInnerHTML={{ __html: proNotice }}
                        />
                    ) : (
                        <>
                            <div className="popup--new-folder__name">
                                <div>Folder Name</div>
                                <div>
                                    <input
                                        type="text"
                                        value={newFolderName || ''}
                                        onChange={handleNameChange}
                                        placeholder="Folder name here"
                                    />
                                </div>
                            </div>

                            <br />

                            <ColorPicker
                                colors={colorTags}
                                activeColor={activeColorTag}
                                onColorSelect={actions.handleColorChange}
                                label="Colour Tag"
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

                            {errors.create && (
                                <div className="popup--new-folder-error">
                                    {errors.create}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default CreateFolderModal;
