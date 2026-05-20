import React, { useCallback, useState } from "react";
import { useFolderActions, useFolderState } from "../../store/FolderContext";

const Expand = () => {
  const state = useFolderState();
  const actions = useFolderActions();

  /**
   * Handle expand change
   */
  const handleExpand = useCallback(
    (expand) => {
      if (expand) {
        actions.handleExpandChange(expand);
      }
    },
    [actions],
  );

  return (
    <button
      className="btn--folder-expand"
      onClick={(e) => {
        e.preventDefault();
        state.expand === "collapsed" ? handleExpand("expanded") : handleExpand("collapsed");
      }}
    >
      {state.expand === "expanded" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-unfold-vertical-icon lucide-unfold-vertical"
        >
          <path d="M12 22v-6" />
          <path d="M12 8V2" />
          <path d="M4 12H2" />
          <path d="M10 12H8" />
          <path d="M16 12h-2" />
          <path d="M22 12h-2" />
          <path d="m15 5-3 3-3-3" />
          <path d="m15 19-3-3-3 3" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-unfold-vertical-icon lucide-unfold-vertical"
        >
          <path d="M12 22v-6" />
          <path d="M12 8V2" />
          <path d="M4 12H2" />
          <path d="M10 12H8" />
          <path d="M16 12h-2" />
          <path d="M22 12h-2" />
          <path d="m15 19-3 3-3-3" />
          <path d="m15 5-3-3-3 3" />
        </svg>
      )}
    </button>
  );
};

export default Expand;
