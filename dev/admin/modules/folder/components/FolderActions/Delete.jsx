import React, { useCallback } from "react";
import { useFolderActions, useFolderState } from "../../store/FolderContext";

const Delete = () => {
    const state = useFolderState();
    const actions = useFolderActions();


  /**
   * Handle bulk delete from header
   */
  const handleHeaderDelete = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      let foldersToEdit = [];

      if (state.folderSelectToggle) {
        foldersToEdit = state.folders.filter((folder) => folder.selected);
      } else {
        foldersToEdit = actions.getActiveFolders();
      }

      if (foldersToEdit.length > 0) {
        actions.handleShowDeleteModal(foldersToEdit);
      }
    },
    [state.folderSelectToggle, state.folders, actions],
  );

  return (
    <a href="#" className="btn--folder-delete" onClick={handleHeaderDelete}>
      Delete
    </a>
  );
};

export default Delete;
