import React, { useCallback, useState } from "react";
import { useFolderActions, useFolderState } from "../../store/FolderContext";

const Sort = () => {
  const state = useFolderState();
  const actions = useFolderActions();

  /**
   * Handle sort change
   */
  const handleSort = useCallback(
    (sort) => {
      if (sort) {
        actions.handleSortChange(sort);
      }
    },
    [actions],
  );

  return (
    <button
      className="btn--folder-sort"
      onClick={(e) => {
        e.preventDefault();
        state.sort === "a-z" ? handleSort("z-a") : handleSort("a-z");
      }}
    >
      {state.sort === "z-a" ? (
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
          className="lucide lucide-arrow-up-az-icon lucide-arrow-up-a-z"
        >
          <path d="m3 8 4-4 4 4" />
          <path d="M7 4v16" />
          <path d="M20 8h-5" />
          <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
          <path d="M15 14h5l-5 6h5" />
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
          className="lucide lucide-arrow-down-za-icon lucide-arrow-down-z-a"
        >
          <path d="m3 16 4 4 4-4" />
          <path d="M7 4v16" />
          <path d="M15 4h5l-5 6h5" />
          <path d="M15 20v-3.5a2.5 2.5 0 0 1 5 0V20" />
          <path d="M20 18h-5" />
        </svg>
      )}
    </button>
  );
};

export default Sort;
