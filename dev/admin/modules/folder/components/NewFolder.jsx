import React, { useCallback } from "react";
import { useFolderActions } from "../store/FolderContext";

const NewFolder = () => {
    const actions = useFolderActions();

  /**
   * Handle create new folder
   */
  const handleCreateNew = useCallback(
    (e) => {
      e.preventDefault();
      actions.handleShowCreateModal();
    },
    [actions],
  );

  return (
    <a href="#" onClick={handleCreateNew}>
      New Folder
    </a>
  );
};

export default NewFolder;
