import React from "react";
import Rename from "./Rename";
import SelectAll from "./SelectAll";
import Delete from "./Delete";
import Sort from "./Sort";
import Expand from "./Expand";

const FolderActions = () => {
  return (
    <div className="folder--actions">
      <SelectAll />
      <div className="folder--actions-triggers">
        <Rename />
        <Delete/>

        <ul className="folder-sort--list">
          <li className="folder--sort has--sub-menu">
            <Expand />
          </li>
          <li className="folder--sort has--sub-menu">
            <Sort />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FolderActions;
