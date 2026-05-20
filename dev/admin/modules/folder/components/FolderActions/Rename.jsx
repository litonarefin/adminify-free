import React, { useCallback } from "react";
import { useFolderActions, useFolderState } from "../../store/FolderContext";

const Rename = () => {
  const state = useFolderState();
  const actions = useFolderActions();

  /**
   * Handle bulk rename from header
   */
  const handleHeaderRename = useCallback(
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
        actions.handleShowRenameModal(foldersToEdit[0]);
      }
    },
    [state.folderSelectToggle, state.folders, actions],
  );

  return (
    <a href="#" className="btn--folder-rename" onClick={handleHeaderRename}>
      Rename
    </a>
  );
};

export default Rename;
