/**
 * FolderSearch Component
 * Search input for filtering folders
 */

import { memo, useCallback } from 'react';
import { useFolderState, useFolderActions } from '../store/FolderContext';

const FolderSearch = () => {
    const state = useFolderState();
    const actions = useFolderActions();

    const handleChange = useCallback((e) => {
        actions.handleFilterChange(e.target.value);
    }, [actions]);

    return (
        <div className="folder--search">
            <input
                type="text"
                placeholder="Search folder"
                value={state.filterText}
                onChange={handleChange}
            />
        </div>
    );
};

export default memo(FolderSearch);
