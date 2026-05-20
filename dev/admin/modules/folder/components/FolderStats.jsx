/**
 * FolderStats Component
 * Displays "All" and "Uncategorized" folder statistics
 */

import { memo, useMemo } from 'react';
import { useFolderState, useFolderComputed, useFolderActions } from '../store/FolderContext';
import { getFolderUrl, isActiveFolder } from '../utils/folderUtils';

const FolderStats = () => {
    const state = useFolderState();
    const { totalPostsCount } = useFolderComputed();
    const actions = useFolderActions();

    const isAllActive = isActiveFolder('all', state.postTypeTax);
    const isUncategorizedActive = isActiveFolder('uncategorized', state.postTypeTax);

    const allUrl = useMemo(() => getFolderUrl('all', state.postTypeTax), [state.postTypeTax]);
    const uncategorizedUrl = useMemo(() => getFolderUrl('uncategorized', state.postTypeTax), [state.postTypeTax]);

    return (
        <ul className="folder--stats">
            <li
                className={`folder--single-all ${isAllActive ? 'active' : ''}`}
                data-folder="all"
            >
                <a href={allUrl}>
                    <span>All</span>
                    <span className="wp-adminify--count">{totalPostsCount}</span>
                </a>
            </li>
            <li
                className={`folder--single-uncategorized ${isUncategorizedActive ? 'active' : ''}`}
                data-folder="uncategorized"
            >
                <a href={uncategorizedUrl}>
                    <span>Uncategorized</span>
                    <span className="wp-adminify--count">{state.totalUncatPosts}</span>
                </a>
            </li>
        </ul>
    );
};

export default memo(FolderStats);
