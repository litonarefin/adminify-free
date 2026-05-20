/**
 * FolderApp Component
 * Main container component for the folder module
 */

import React, { useEffect, useCallback, Fragment, useRef, useState } from "react";
import { useFolderState, useFolderActions, useFolderComputed } from "./store/FolderContext";
import { useFolderDragDrop } from "./hooks/useFolderDragDrop";
import { getSortPreference, getSidebarVisibility, setSidebarVisibility } from "./utils/folderUtils";

// Components
import FolderSearch from "./components/FolderSearch";
import FolderStats from "./components/FolderStats";
import FolderList from "./components/FolderList";
import {
  CreateFolderModal,
  RenameFolderModal,
  DeleteFolderModal,
  MoveToFolderModal,
} from "./components/modals";
import FolderActions from "./components/FolderActions";
import NewFolder from "./components/NewFolder";

const $ = window.jQuery;

const FolderApp = () => {
  const state = useFolderState();
  const actions = useFolderActions();
  const { filteredFolders } = useFolderComputed();
  const dragDrop = useFolderDragDrop();

  // Sidebar visibility state
  const [isSidebarVisible, setIsSidebarVisible] = useState(() =>
    getSidebarVisibility(state.postTypeTax)
  );

  // Refs to prevent re-initialization
  const initializedRef = useRef(false);
  const actionsRef = useRef(actions);
  const dragDropRef = useRef(dragDrop);

  // Update refs on each render
  actionsRef.current = actions;
  dragDropRef.current = dragDrop;

  // Toggle sidebar visibility
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => {
      const newValue = !prev;
      setSidebarVisibility(state.postTypeTax, newValue);
      return newValue;
    });
  }, [state.postTypeTax]);

  // Sync modal collapsed state with sidebar visibility
  useEffect(() => {
    const modal = document.getElementById('wp-media-modal');
    if (modal) {
      if (!isSidebarVisible) {
        modal.classList.add('adminify-folder-collapsed');
      } else {
        modal.classList.remove('adminify-folder-collapsed');
      }
    }
  }, [isSidebarVisible]);

  // Initialize on mount (only once)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Load sort preference from cookie
    const savedSort = getSortPreference(state.postTypeTax);
    if (savedSort && savedSort !== state.sort) {
      actionsRef.current.handleSortChange(savedSort);
    }

    // Initialize folder click events for WordPress media library
    initFolderEvents();

    // Initialize drag and drop
    $(function () {
      dragDropRef.current.initialize();
      initSubmenuEvents();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-initialize droppables when filter changes
  useEffect(() => {
    // Skip if not initialized yet
    if (!initializedRef.current) return;

    const timer = setTimeout(() => {
      dragDropRef.current.initDraggableEvents();
      dragDropRef.current.initDroppableEvents();
    }, 50);

    return () => clearTimeout(timer);
  }, [state.filterText]);

  /**
   * Initialize folder click events for WordPress integration
   */
  const initFolderEvents = useCallback(() => {
    // Check if we're on the media library page (grid view)
    const isMediaLibraryPage = $("body").hasClass("upload-php");
    // Check if we're in a modal context
    const isInModal = $(".media-modal").length > 0;

    /**
     * Setup click handler for filtering attachments via AJAX
     */
    const setupFolderClickHandler = () => {
      $(".folder--lists, .folder--stats")
        .off("click.adminifyFolder", "li a")
        .on("click.adminifyFolder", "li a", function (event) {
          event.preventDefault();
          event.stopPropagation();

          const url = $(this).attr("href");
          const searchParams = new URLSearchParams(url.split("?")[1] || "");
          const mediaFolder = searchParams.get("media_folder") || "";

          // Update active state
          $(".folder--lists, .folder--stats").find("li").removeClass("active");
          $(this).closest("li").addClass("active");

          // Filter attachments via wp.media
          // Try to get the library from current frame or modal frame
          let library = null;

          if (window.wp?.media?.frame?.content) {
            // For media library page
            library = window.wp.media.frame.content.get("library");
          } else if ($(".media-modal").length) {
            // For modal context - find the frame through wp.media.frames
            // Try to access through wp.media.frames
            if (window.wp?.media?.frames) {
              Object.values(window.wp.media.frames).forEach((frame) => {
                if (frame && frame.content) {
                  const lib = frame.content.get("library");
                  if (lib && lib.collection) {
                    library = lib;
                  }
                }
              });
            }

            // Alternative: access through attachments browser
            if (!library) {
              const attachmentsBrowser = $(".attachments-browser");
              if (attachmentsBrowser.length && attachmentsBrowser.data("backboneView")) {
                const view = attachmentsBrowser.data("backboneView");
                if (view && view.collection) {
                  view.collection.props.set("media_folder", mediaFolder);
                  return; // Exit early, we've set the filter
                }
              }
            }
          }

          if (library && library.collection) {
            library.collection.props.set("media_folder", mediaFolder);
          }

          // Only update URL if not in modal (modal has its own URL handling)
          if (!isInModal) {
            window.history.pushState({}, "", url);
          }
        });
    };

    if (window.wp?.media) {
      // For media library grid view page or modal - handle folder clicks via AJAX
      if (isMediaLibraryPage || isInModal) {
        // Setup immediately if frame is ready
        if (window.wp.media.frame || isInModal) {
          setupFolderClickHandler();
        } else {
          // Wait for wp.media.frame to be ready
          const checkFrame = setInterval(() => {
            if (window.wp?.media?.frame) {
              clearInterval(checkFrame);
              setupFolderClickHandler();
            }
          }, 100);

          // Clear interval after 5 seconds to prevent infinite loop
          setTimeout(() => clearInterval(checkFrame), 5000);
        }
      } else {
        // For future modal context - extend AttachmentsView
        const AttachmentsView = window.wp.media.view.Attachments;

        window.wp.media.view.Attachments = AttachmentsView.extend({
          initialize: function () {
            AttachmentsView.prototype.initialize.apply(this, arguments);

            // Setup click handler when view initializes
            setupFolderClickHandler();
          },
        });
      }
    } else {
      // Fallback for list view
      $(".folder--lists, .folder--stats")
        .off("click.adminifyFolder", "li a")
        .on("click.adminifyFolder", "li a", function (event) {
          event.preventDefault();

          const url = $(this).attr("href");

          $(".folder--lists, .folder--stats").find("li").removeClass("active");
          $(this).closest("li").addClass("active");

          if ($("#the-list").length) {
            $("#the-list").load(`${url} #the-list > tr`);
            window.history.pushState({}, "", url);
          }
        });
    }
  }, []);

  /**
   * Initialize submenu toggle events
   */
  const initSubmenuEvents = useCallback(() => {
    $(".folder--actions .has--sub-menu > a").on("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      $(this).parent().toggleClass("sub-menu--open");
    });

    $("body").on("click", function () {
      $(".has--sub-menu.sub-menu--open").removeClass("sub-menu--open");
    });
  }, []);

  return (
    <Fragment>
      <div className={`wp-adminify--folder-widget ${!isSidebarVisible ? 'is-collapsed' : ''}`}>
        {/* Sidebar Toggle Button */}
        <button
          type="button"
          className="wp-adminify--sidebar-toggle"
          onClick={handleToggleSidebar}
          title={isSidebarVisible ? 'Hide Folders' : 'Show Folders'}
        >
          <span className={`dashicons ${isSidebarVisible ? 'dashicons-arrow-left-alt2' : 'dashicons-category'}`} />
        </button>
        <div className="wp-adminify--folder-app">
          <div className="wp-adminify--folder-app--inner">
            {/* Header */}
            <div className="folder--header">
              <span>Folders</span>
              <NewFolder />
            </div>

            {/* Actions Bar */}
            <FolderActions />

            {/* Stats (All / Uncategorized) */}
            <FolderStats />

            {/* Search */}
            <FolderSearch />

            {/* Folder List */}
            {state.folders.length > 0 && (
              <FolderList
                folders={filteredFolders}
                folderSelectToggle={state.folderSelectToggle}
                className="folder--lists"
              />
            )}
          </div>
        </div>
      </div>

      {/* Popup Area */}
      <div className="wp-adminify--popup-area">
        <div className="wp-adminify--popup-container">
          <div className="wp-adminify--popup-container_inner">
            <CreateFolderModal />
            <RenameFolderModal />
            <DeleteFolderModal />
            <MoveToFolderModal />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default FolderApp;
