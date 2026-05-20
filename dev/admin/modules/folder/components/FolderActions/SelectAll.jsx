import React, { useCallback } from "react";
import { useFolderActions, useFolderState } from "../../store/FolderContext";

const SelectAll = () => {
  const state = useFolderState();
  const actions = useFolderActions();

  /**
   * Handle folder select toggle
   */
  const handleToggleSelect = useCallback(() => {
    actions.handleToggleFolderSelect();
  }, [actions]);

  return (
    <span>
      <input type="checkbox" checked={state.folderSelectToggle} onChange={handleToggleSelect} />
    </span>
  );
};

export default SelectAll;
