// JS codes by WP Adminify

jQuery(function ($) {
    "use strict";

    var MenuEditonIconsLibrary = {
        "Simple Line Icons": {
            "": {
                prefix: "icon-",
                "list-icon": "icon-heart",
                "icon-style": "simple-line-icons",
                icons: [
                    "icon-user",
                    "icon-people",
                    "icon-user-female",
                    "icon-user-follow",
                    "icon-user-following",
                    "icon-user-unfollow",
                    "icon-login",
                    "icon-logout",
                    "icon-emotsmile",
                    "icon-phone",
                    "icon-call-end",
                    "icon-call-in",
                    "icon-call-out",
                    "icon-map",
                    "icon-location-pin",
                    "icon-direction",
                    "icon-directions",
                    "icon-compass",
                    "icon-layers",
                    "icon-menu",
                    "icon-list",
                    "icon-options-vertical",
                    "icon-options",
                    "icon-arrow-down",
                    "icon-arrow-left",
                    "icon-arrow-right",
                    "icon-arrow-up",
                    "icon-arrow-up-circle",
                    "icon-arrow-left-circle",
                    "icon-arrow-right-circle",
                    "icon-arrow-down-circle",
                    "icon-check",
                    "icon-clock",
                    "icon-plus",
                    "icon-minus",
                    "icon-close",
                    "icon-event",
                    "icon-exclamation",
                    "icon-organization",
                    "icon-trophy",
                    "icon-screen-smartphone",
                    "icon-screen-desktop",
                    "icon-plane",
                    "icon-notebook",
                    "icon-mustache",
                    "icon-mouse",
                    "icon-magnet",
                    "icon-energy",
                    "icon-disc",
                    "icon-cursor",
                    "icon-cursor-move",
                    "icon-crop",
                    "icon-chemistry",
                    "icon-speedometer",
                    "icon-shield",
                    "icon-screen-tablet",
                    "icon-magic-wand",
                    "icon-hourglass",
                    "icon-graduation",
                    "icon-ghost",
                    "icon-game-controller",
                    "icon-fire",
                    "icon-eyeglass",
                    "icon-envelope-open",
                    "icon-envelope-letter",
                    "icon-bell",
                    "icon-badge",
                    "icon-anchor",
                    "icon-wallet",
                    "icon-vector",
                    "icon-speech",
                    "icon-puzzle",
                    "icon-printer",
                    "icon-present",
                    "icon-playlist",
                    "icon-pin",
                    "icon-picture",
                    "icon-handbag",
                    "icon-globe-alt",
                    "icon-globe",
                    "icon-folder-alt",
                    "icon-folder",
                    "icon-film",
                    "icon-feed",
                    "icon-drop",
                    "icon-drawer",
                    "icon-docs",
                    "icon-doc",
                    "icon-diamond",
                    "icon-cup",
                    "icon-calculator",
                    "icon-bubbles",
                    "icon-briefcase",
                    "icon-book-open",
                    "icon-basket-loaded",
                    "icon-basket",
                    "icon-bag",
                    "icon-action-undo",
                    "icon-action-redo",
                    "icon-wrench",
                    "icon-umbrella",
                    "icon-trash",
                    "icon-tag",
                    "icon-support",
                    "icon-frame",
                    "icon-size-fullscreen",
                    "icon-size-actual",
                    "icon-shuffle",
                    "icon-share-alt",
                    "icon-share",
                    "icon-rocket",
                    "icon-question",
                    "icon-pie-chart",
                    "icon-pencil",
                    "icon-note",
                    "icon-loop",
                    "icon-home",
                    "icon-grid",
                    "icon-graph",
                    "icon-microphone",
                    "icon-music-tone-alt",
                    "icon-music-tone",
                    "icon-earphones-alt",
                    "icon-earphones",
                    "icon-equalizer",
                    "icon-like",
                    "icon-dislike",
                    "icon-control-start",
                    "icon-control-rewind",
                    "icon-control-play",
                    "icon-control-pause",
                    "icon-control-forward",
                    "icon-control-end",
                    "icon-volume-1",
                    "icon-volume-2",
                    "icon-volume-off",
                    "icon-calendar",
                    "icon-bulb",
                    "icon-chart",
                    "icon-ban",
                    "icon-bubble",
                    "icon-camrecorder",
                    "icon-camera",
                    "icon-cloud-download",
                    "icon-cloud-upload",
                    "icon-envelope",
                    "icon-eye",
                    "icon-flag",
                    "icon-heart",
                    "icon-info",
                    "icon-key",
                    "icon-link",
                    "icon-lock",
                    "icon-lock-open",
                    "icon-magnifier",
                    "icon-magnifier-add",
                    "icon-magnifier-remove",
                    "icon-paper-clip",
                    "icon-paper-plane",
                    "icon-power",
                    "icon-refresh",
                    "icon-reload",
                    "icon-settings",
                    "icon-star",
                    "icon-symbol-female",
                    "icon-symbol-male",
                    "icon-target",
                    "icon-credit-card",
                    "icon-paypal",
                    "icon-social-tumblr",
                    "icon-social-twitter",
                    "icon-social-facebook",
                    "icon-social-instagram",
                    "icon-social-linkedin",
                    "icon-social-pinterest",
                    "icon-social-github",
                    "icon-social-google",
                    "icon-social-reddit",
                    "icon-social-skype",
                    "icon-social-dribbble",
                    "icon-social-behance",
                    "icon-social-foursqare",
                    "icon-social-soundcloud",
                    "icon-social-spotify",
                    "icon-social-stumbleupon",
                    "icon-social-youtube",
                    "icon-social-dropbox",
                    "icon-social-vkontakte",
                    "icon-social-steam",
                ],
            },
        },
    };

    var icons_libraries = {
        "wp-adminify-simple-line-icons": "Simple Line Icons",
    };

    Object.entries(icons_libraries).forEach(([key, value]) => {
        if (WPAdminifyMenuEditor.assets_manager.includes(key)) {
            delete MenuEditonIconsLibrary[value];
        }
    });

    $(".icon-picker-wrap").ai_icon_picker({
        iconLibrary: MenuEditonIconsLibrary,
    });

    // Store global roles data (loaded once from first select)
    var globalRolesData = [];
    $('select[name="hidden_for"]').first().find('optgroup:first option').each(function() {
        var val = $(this).val();
        var txt = $(this).text();
        if (val && txt) {
            globalRolesData.push({
                id: val,
                text: txt
            });
        }
    });

    // Initialize Select2 for role/user multiselect with AJAX user search
    function initSelect2($elements) {
        var $selects = $elements || $('select[name="hidden_for"]');

        $selects.each(function() {
            var $select = $(this);

            // Skip if already initialized
            if ($select.hasClass('select2-hidden-accessible')) {
                return;
            }

            // Use global roles data for all selects
            var rolesData = globalRolesData.length > 0 ? globalRolesData : [];

            // If globalRolesData is empty, try to get from this select
            if (rolesData.length === 0) {
                $select.find('optgroup:first option').each(function() {
                    var val = $(this).val();
                    var txt = $(this).text();
                    if (val && txt) {
                        rolesData.push({
                            id: val,
                            text: txt
                        });
                    }
                });
            }

            $select.select2({
                placeholder: 'Select roles or users...',
                allowClear: true,
                width: '100%',
                dropdownParent: $select.closest('.column, .adminify_sub_menu_item, .adminify_menu_item').length ? $select.closest('.column, .adminify_sub_menu_item, .adminify_menu_item') : $(document.body),
                ajax: {
                    url: WPAdminifyMenuEditor.ajax_url,
                    dataType: 'json',
                    delay: 300,
                    data: function(params) {
                        return {
                            action: 'adminify_search_users',
                            security: WPAdminifyMenuEditor.security,
                            search: params.term || ''
                        };
                    },
                    processResults: function(data, params) {
                        var searchTerm = (params.term || '').toLowerCase();
                        var results = [];

                        // Get currently selected values
                        var selectedValues = $select.val() || [];

                        // Always filter and show matching roles from loaded data
                        var matchedRoles = rolesData.filter(function(role) {
                            return searchTerm === '' || role.text.toLowerCase().indexOf(searchTerm) !== -1;
                        }).map(function(role) {
                            return {
                                id: role.id,
                                text: role.text,
                                disabled: selectedValues.indexOf(role.id) !== -1
                            };
                        });

                        if (matchedRoles.length > 0) {
                            results.push({
                                text: 'Roles',
                                children: matchedRoles
                            });
                        }

                        // Add users from AJAX response (only returned when 3+ characters typed)
                        if (data.results && data.results.length > 0) {
                            var usersWithDisabled = data.results.map(function(user) {
                                return {
                                    id: user.id,
                                    text: user.text,
                                    disabled: selectedValues.indexOf(user.id) !== -1
                                };
                            });
                            results.push({
                                text: `Users (${data?.total_users || 1})`,
                                children: usersWithDisabled
                            });
                        }

                        // Show hint if 1-2 characters typed (to search more users)
                        if (searchTerm.length > 0 && searchTerm.length < 3) {
                            results.push({
                                text: 'Type ' + (3 - searchTerm.length) + ' more character(s) to search more users...',
                                children: [],
                                disabled: true,
                                isHint: true
                            });
                        }

                        return {
                            results: results
                        };
                    },
                    cache: false // Disable cache to always check selected state
                },
                minimumInputLength: 0,
                templateResult: function(item) {
                    if (item.loading) {
                        return 'Searching...';
                    }
                    // Check if this is a hint message
                    if (item.isHint) {
                        return $('<span class="select2-search-hint">' + item.text + '</span>');
                    }
                    // Disabled selected items with 50% opacity
                    if (item.disabled) {
                        return $('<span class="select2-option-disabled">' + item.text + '</span>');
                    }
                    return item.text;
                },
                templateSelection: function(item) {
                    return item.text || item.id;
                }
            });
        });
    }
    initSelect2();

    // Reset Menu Settings
    $(".adminify_reset_menu_settings").on("click", function (e) {
        e.preventDefault();
        $.ajax({
            url: WPAdminifyMenuEditor.ajax_url,
            type: "post",
            data: {
                action: "adminify_reset_menu_settings",
                security: WPAdminifyMenuEditor.security,
            },
            success: function (response) {
                if (response) {
                    var data = JSON.parse(response);
                    if (data.error) {
                        $("#adminify-data-saved-message").addClass("notification is-warning");
                        $("#adminify-data-saved-message").css("display", "block");
                        $("#adminify-data-saved-message").text(data.message);

                        setTimeout(function () {
                            $("#adminify-data-saved-message").fadeOut("fast");
                            $("#adminify-data-saved-message").removeClass(
                                "notification is-warning"
                            );
                            $("#adminify-data-saved-message").css("display", "none");
                        }, 1500);
                    } else {
                        $("#adminify-data-saved-message").addClass("notification is-primary");
                        $("#adminify-data-saved-message").css("display", "block");
                        $("#adminify-data-saved-message").text(data.message);

                        setTimeout(function () {
                            $("#adminify-data-saved-message").fadeOut("fast");
                            $("#adminify-data-saved-message").removeClass(
                                "notification is-primary"
                            );
                            $("#adminify-data-saved-message").css("display", "none");
                            location.reload();
                        }, 1500);
                    }
                }
            },
        });
    });

    // Export Menu Settings
    $(".adminify_export_menu_settings").on("click", function (e) {
        $.ajax({
            url: WPAdminifyMenuEditor.ajax_url,
            type: "post",
            data: {
                action: "adminify_export_menu_settings",
                security: WPAdminifyMenuEditor.security,
            },
            success: function (response) {
                var data = response;
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, "0");
                var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
                var yyyy = today.getFullYear();

                var date_today = mm + "_" + dd + "_" + yyyy;
                var filename = "wpadminify_menu_settings_" + date_today + ".json";

                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
                var dlAnchorElem = document.getElementById("adminify_download_settings");
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", filename);
                dlAnchorElem.click();
            },
        });
    });

    $(".adminify_import_menu_settings").on("click", function (e) {
        e.preventDefault();
        $("#adminify_import_menu").trigger("click");
    });

    // Import Menu Settings
    $("#adminify_import_menu").on("change", function (e) {
        e.preventDefault();

        var thefile = $("#adminify_import_menu")[0].files[0];

        if (thefile.type != "application/json") {
            window.alert("Please select a valid JSON file.");
            return;
        }

        if (thefile.size > 100000) {
            window.alert("File is to big.");
            return;
        }

        var file = document.getElementById("adminify_import_menu").files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = function (evt) {
            var json_settings = evt.target.result,
                parsed = JSON.parse(json_settings);

            if (parsed != null) {
                $.ajax({
                    url: WPAdminifyMenuEditor.ajax_url,
                    type: "post",
                    data: {
                        action: "adminify_import_menu_settings",
                        security: WPAdminifyMenuEditor.security,
                        settings: parsed,
                    },
                    success: function (response) {
                        // var message = response;
                        if (response) {
                            var data = JSON.parse(response);
                            if (data.error) {
                                $("#adminify-data-saved-message").addClass(
                                    "notification is-warning"
                                );
                                $("#adminify-data-saved-message").css("display", "block");
                                $("#adminify-data-saved-message").text(data.message);

                                setTimeout(function () {
                                    $("#adminify-data-saved-message").fadeOut("fast");
                                    $("#adminify-data-saved-message").removeClass(
                                        "notification is-warning"
                                    );
                                    $("#adminify-data-saved-message").css("display", "none");
                                }, 1500);
                            } else {
                                $("#adminify-data-saved-message").addClass(
                                    "notification is-primary"
                                );
                                $("#adminify-data-saved-message").css("display", "block");
                                $("#adminify-data-saved-message").text(data.message);

                                setTimeout(function () {
                                    $("#adminify-data-saved-message").fadeOut("fast");
                                    $("#adminify-data-saved-message").removeClass(
                                        "notification is-primary"
                                    );
                                    $("#adminify-data-saved-message").css("display", "none");
                                    location.reload();
                                }, 1500);
                            }
                        }
                    },
                });
            }
        };
    });

    // menu editor accordin title design conflict by third plugin (instagram-feed)) issue fixed
    $(".adminify_menu_item, .adminify_sub_menu_item").each(function (index, element) {
        if (!$(element).find("> a").is(".menu-editor-title, .accordion-button, .p-4")) {
            $(element).find("> a").attr({ class: "menu-editor-title accordion-button p-4" });
        }
    });
    

    var menuSettings = {};
    var removed_items = [];

    function adminify_menu_items_object() {
        // Menu Items
        $(".adminify_menu_item").each(function (index, element) {
            var menu_name = $(element).attr("name");
            var menu_object = (menuSettings[menu_name] = {});
            menuSettings[menu_name]["order"] = $(element).index();
            // menu_object["order"] = $(element).index();
            $(element)
                .find(".adminify_top_level_settings .menu_setting")
                .each(function (index, item) {
                    var setting_name = $(item).attr("name"),
                        value = "";
                    if (setting_name === "separator") {
                        if ($(item).prop("checked") == true) {
                            value = 1;
                        } else {
                            value = 0;
                        }
                    }else if(setting_name === "external_link"){
                        if ($(item).prop("checked") == true) {
                            value = 1;
                        } else {
                            value = 0;
                        }
                    } else {
                        value = $(item).val();
                    }
                    menu_object[setting_name] = value;
                });

            if (menu_name.includes("adminify-custom-menu-")) {
                if (menu_object.link === "") {
                    menu_object.link = `#${menu_name}`;
                }
            }

            // pro code start
            // Top Level Live Text Changes
            var menu_id = $(element).attr("id");
            $("#" + menu_id + ' input[name="name"]').on("keyup", function () {
                var data_menu_id = $(this).data("top-menu-id");
                $("#adminify-main-topmenu-" + data_menu_id).text($(this).val());
            });
            // pro code end

            // Sub Level Menu Items
            if ($(element).find(".adminify_sub_menu_item").length > 0) {
                var submenu_object = (menu_object["submenu"] = {});
                $(element)
                    .find(".adminify_sub_menu_item")
                    .each(function (index, subitem) {
                        var sub_menu_name = $(subitem).attr("name");
                        var submenu_item = (submenu_object[sub_menu_name] = {});
                        submenu_item["order"] = $(subitem).index();

                        $(subitem)
                            .find(".sub_menu_setting")
                            .each(function (index, subsubitem) {
                                var sub_setting_name = $(subsubitem).attr("name");
                                var sub_value = $(subsubitem).val();
                                if(sub_setting_name === "external_link"){
                                    if ($(subsubitem).prop("checked") == true) {
                                        sub_value = 1;
                                    } else {
                                        sub_value = 0;
                                    }
                                }
                                submenu_item[sub_setting_name] = sub_value;
                            });

                        if (sub_menu_name.includes("adminify-custom-submenu-")) {
                            if (submenu_item.link === "") {
                                submenu_item.link = `#${sub_menu_name}`;
                            }
                        }
                    });

                // pro code start
                // Sub Menu Level Live Text Changes
                var sub_menu_id = $(element).attr("id");
                $("#" + sub_menu_id + ' input[name="name"]').on("keyup", function () {
                    var data_sub_menu_id = $(this).data("sub-menu-id");
                    $("#adminify-main-submenu-" + data_sub_menu_id).text($(this).val());
                });
                // pro code end
            }
        });

        // removed parent menu items, `parent.remove()` actually doesn't remove item from this menuSettings object.
        if (removed_items.length) {
            removed_items.forEach((item) => {
                if (item in menuSettings) {
                    delete menuSettings[item];
                }
            });
        }
    }

    // Live Changes
    adminify_menu_items_object();

    // Save Settings
    $(".adminify_menu_save_settings, .adminify-save-ajax").on("click", function (e) {
        e.preventDefault();

        adminify_menu_items_object();

        $.ajax({
            url: WPAdminifyMenuEditor.ajax_url,
            type: "POST",
            dataType: "json",
            data: {
                action: "adminify_save_menu_settings",
                security: WPAdminifyMenuEditor.security,
                options: menuSettings,
            },
            success: function (response) {
                if (response) {
                    var data = response;
                    if (data.error) {
                        $("#adminify-data-saved-message").addClass("notification is-warning");
                        $("#adminify-data-saved-message").css("display", "block");
                        $("#adminify-data-saved-message").text(data.message);

                        setTimeout(function () {
                            $("#adminify-data-saved-message").fadeOut("fast");
                            $("#adminify-data-saved-message").removeClass(
                                "notification is-warning"
                            );
                            $("#adminify-data-saved-message").css("display", "none");
                        }, 1500);
                    } else {
                        $("#adminify-data-saved-message").addClass("notification is-primary");
                        $("#adminify-data-saved-message").css("display", "block");
                        $("#adminify-data-saved-message").text(data.message);

                        setTimeout(function () {
                            $("#adminify-data-saved-message").fadeOut("fast");
                            $("#adminify-data-saved-message").removeClass(
                                "notification is-primary"
                            );
                            $("#adminify-data-saved-message").css("display", "none");
                        }, 1500);
                    }
                }
            },
        });
    });

    // Menu Item Sort
    $(".wp-adminify--menu--editor--settings").sortable({
        handle: ".menu-editor-title svg",
    });

    // Menu Item Submenu Sort
    $(
        ".wp-adminify--menu--editor--settings > .adminify_menu_item > .accordion-body > .tab-content > .tab-pane--submenu"
    ).sortable({
        handle: ".menu-editor-title svg",
    });

    // Submenu Item Tabs
    $(".tab-content > div:not(.wp-adminify-page-speed-wrapper > div,.remove-add-new-menu)").hide();
    $(".tab-content > div:first-of-type").show();

    $("body").on(
        "click",
        ".nav-tabs a:not(.wp-adminify-page-speed-wrapper a)",
        function (
            e // $('.nav-tabs a:not(.wp-adminify-page-speed-wrapper a)').click(function (e)
        ) {
            e.preventDefault();
            var $this = $(this),
                tabgroup = "#" + $this.parents(".nav-tabs").data("tab-content"),
                others = $this.closest("li").siblings().children("a"),
                target = $this.attr("href");
            others.removeClass("active");
            $this.addClass("active");
            $(tabgroup).children("div").hide();
            $(target).show();
            $(target).siblings().hide();

            // Reinitialize Select2 on visible tab if not already initialized
            setTimeout(function() {
                $(target).find('select[name="hidden_for"]').each(function() {
                    var $sel = $(this);
                    if (!$sel.hasClass('select2-hidden-accessible')) {
                        initSelect2($sel);
                    }
                });
            }, 50);
        }
    );

    /**
     * Add New Menu Item to Menu Editor
     */
    if (WPAdminifyMenuEditor.can_use_premium) {
        $(".wp-adminify--menu--editor--settings").on(
            "click",
            ".adminify-add-new-menu-editor-item",
            function (e) {
                e.preventDefault();

                var $this = $(this),
                    $submenu = $(this).hasClass("submenu") || false,
                    $repeater = $this
                        .closest(".wp-adminify--menu--editor--settings")
                        .find(".adminify_menu_item"),
                    count = $repeater.length,
                    $clone = $repeater.first().clone();

                // var randomNumber = Math.floor(Math.random() * 26) + Date.now();
                var randomNumber = Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(2);

                // Set name, id attribute for newly created custom menu item
                var uniqueId = "adminify-custom-menu-" + randomNumber;

                var menuNewId = $clone.attr("id").slice(0, 25) + uniqueId;

                if ($submenu) {
                    $clone.attr("class", "adminify-accordion adminify_sub_menu_item");
                    $clone.find(".accordion-body").attr("class", "accordion-body");
                    $clone.find(".menu_setting").attr("class", "sub_menu_setting");
                    $clone.find(".tabs.tabbable,.tab-pane--submenu").remove();
                    $clone.find(".tab-content .tab-pane:nth-child(1)").show();
                    $clone.find("select.sub_menu_setting").addClass("adminify-menu-settings");
                    $clone
                        .find(".icon-picker-wrap")
                        .siblings("label")
                        .html("Set Custom Icon <i>(Not available for Submenu.)</i>");
                    $clone
                        .find(".icon-picker-wrap")
                        .removeClass("is-clickable")
                        .addClass("is-clickable-no");
                    $clone.find(".menu-editor-form .columns:nth-child(3)").remove();
                    count += $(this).siblings().length + 2;
                    uniqueId = "adminify-custom-submenu-" + randomNumber;
                    menuNewId = "wp-adminify-sub-menu-menu" + uniqueId;
                }

                $this.siblings().find(".menu-editor-title").removeClass("show");
                $this.siblings().find(".accordion-body").removeClass("show").hide();

                var newTitle = "Custom Menu";
                $clone.attr({ id: menuNewId, name: uniqueId });
                var svg_drag_icon =
                    $(`<svg class = "drag-icon is-pulled-left mr-2 ui-sortable-handle" width = "24" height = "24" viewBox = "0 0 24 24" fill = "none" xmlns = "http://www.w3.org/2000/svg" >
					<path d          = "M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M12 21C13.1046 21 14 20.1046 14 19C14 17.8954 13.1046 17 12 17C10.8954 17 10 17.8954 10 19C10 20.1046 10.8954 21 12 21Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M5 21C6.10457 21 7 20.1046 7 19C7 17.8954 6.10457 17 5 17C3.89543 17 3 17.8954 3 19C3 20.1046 3.89543 21 5 21Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M19 7C20.1046 7 21 6.10457 21 5C21 3.89543 20.1046 3 19 3C17.8954 3 17 3.89543 17 5C17 6.10457 17.8954 7 19 7Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					<path d          = "M19 21C20.1046 21 21 20.1046 21 19C21 17.8954 20.1046 17 19 17C17.8954 17 17 17.8954 17 19C17 20.1046 17.8954 21 19 21Z" fill = "#4E4B66" fill - opacity = "0.72" > </path>
					</svg >`);
                $clone.find("> .menu-editor-title").html(svg_drag_icon).append(newTitle);

                $clone.find(".nav-tabs li").each(function (index) {
                    var id = "#tab-" + uniqueId + "-" + index;
                    $(this).find(".nav-link").attr("href", id);
                });

                let default_icon = $(` <img width="24" height="24" src = "${WPAdminifyMenuEditor.icon_picker_logo}"/> `);
                $clone.find(".icon-picker .select-icon").addClass("custom-icon");
                $clone.find(".icon-picker .select-icon i").attr("class", "").html(default_icon);

                $clone.find(".tab-content .tab-pane").each(function (index) {
                    if ($(this).attr("id") !== undefined) {
                        var id = "tab-" + uniqueId + "-" + index;
                        $(this).attr("id", id);
                    }
                    if ($(this).hasClass("tab-pane--submenu") == true) {
                        $(this)
                            .find(".adminify_sub_menu_item")
                            .each(function () {
                                $(this).remove();
                            });
                        $(this).prepend($(`<span>No submenu items are left.</span>`));
                    }
                });

                $clone.find(".menu-editor-form .column").each(function () {
                    $(this).find("label").attr("for", uniqueId);
                    $(this).find('[name="name"]').attr({
                        "data-top-menu-id": uniqueId,
                        placeholder: newTitle,
                        value: newTitle,
                    });
                    $(this).find('[name="separator"]').attr({ id: uniqueId });
                });

                $clone.find('[name="separator"]').prop("checked", false).val(0);
                $clone.find(".adminify-menu-settings.menu_setting").prop('selectedIndex', -1);

                // Reinitialize Select2 for the cloned element with AJAX
                var $clonedSelect = $clone.find('select[name="hidden_for"]');

                // Remove ALL Select2 related elements and attributes from the clone
                // This prevents conflicts with the original Select2 instances
                $clone.find('.select2-container').remove();
                $clone.find('[data-select2-id]').removeAttr('data-select2-id');
                $clone.find('.select2').removeClass('select2');

                // Clean up the select element specifically
                $clonedSelect.removeClass('select2-hidden-accessible');
                $clonedSelect.removeAttr('data-select2-id');
                $clonedSelect.removeAttr('aria-hidden');
                $clonedSelect.removeAttr('tabindex');
                $clonedSelect.css('display', ''); // Reset display

                // Clear selections and options in Users optgroup
                $clonedSelect.find('option:selected').prop('selected', false);
                $clonedSelect.find('.adminify-users-optgroup').empty();

                // Small delay to ensure DOM is ready before initializing Select2
                setTimeout(function() {
                    initSelect2($clonedSelect);
                }, 10);

                var remove_icon = $(
                    `<div class = "remove-add-new-menu" > <span data-id = "${uniqueId}"> <i class="icon-close"> </i> Delete </span > </div>`
                );
                $clone.find(".tab-content .tab-pane:nth-child(1)").append(remove_icon);
                $clone.find(".menu-editor-title").addClass("show");
                $clone.find(".accordion-body").addClass("show").css("display", "block");

                $this.prev("span").remove();
                $clone.insertBefore($this);

                // Refresh all existing Select2 instances to prevent corruption
                // This ensures original Select2 instances still work after cloning
                $('select[name="hidden_for"].select2-hidden-accessible').each(function() {
                    var $existingSelect = $(this);
                    // Check if Select2 container exists and is visible
                    var $container = $existingSelect.next('.select2-container');
                    if ($container.length === 0) {
                        // Container missing, reinitialize
                        $existingSelect.removeClass('select2-hidden-accessible');
                        $existingSelect.removeAttr('data-select2-id');
                        initSelect2($existingSelect);
                    }
                });
            }
        );

        // remove add new icon
        $("body").on("click", ".remove-add-new-menu span", function (e) {
            var $this = $(this);
            let id = $this.data("id");
            let parent = $this
                .parent(".remove-add-new-menu")
                .parent(".tab-pane")
                .parent(".tab-content")
                .parent(".accordion-body")
                .parent(".accordion");
            if (parent.hasClass("adminify_sub_menu_item")) {
                let num_of_element = parent.siblings(".adminify_sub_menu_item").length;
                if (num_of_element < 1) {
                    parent
                        .parent(".tab-pane--submenu")
                        .prepend($(`<span> No submenu items are left.</span>`));
                }
            }
            if (parent.attr("name") === id) {
                parent.remove(); // this doesn't atually remove the items from menuSettings object  L276
                removed_items = [...removed_items, id];
            }
        });
    }

    /**
     * Drag & Drop Custom Icon Uploader for Menu Editor START
     */

    var displayIconsWrapper = $("#display-custom-icons ul");

    // Click functionality START
    $("body").on("click", "#adminify-browse-button", function (e) {
        e.preventDefault();
        $("#file").trigger("click");
    });

    $("body").on("change", "#file", function (e) {
        var $this = $(this);
        // var file_obj = $this.prop('files');
        var file_obj = e.target.files;
        var form_data = new FormData();
        for (var i = 0; i < file_obj.length; i++) {
            form_data.append("my_file_upload[]", file_obj[i]);
        }
        form_data.append("action", "adminify_file_upload");
        form_data.append("security", WPAdminifyMenuEditor.security);

        uploadImage(form_data, WPAdminifyMenuEditor.ajax_url, $this);
    });

    // Drag & Drop functinality START
    $("#adminify-drag-drop-area").on("dragover", function (e) {
        // preventing page from redirecting
        e.preventDefault();
        e.stopPropagation();
        $(this).css("border-color", "#0347ff");
    });

    $("#adminify-drag-drop-area").on("dragleave", function (e) {
        $(this).css("border-color", "#c3c4c7");
    });

    $("#adminify-drag-drop-area").on("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("border-color", "#0347ff");
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this).find("#file");
        var file_obj = e.originalEvent.dataTransfer.files;

        var form_data = new FormData();

        for (var i = 0; i < file_obj.length; i++) {
            form_data.append("my_file_upload[]", file_obj[i]);
        }

        form_data.append("action", "adminify_file_upload");
        form_data.append("security", WPAdminifyMenuEditor.security);

        uploadImage(form_data, WPAdminifyMenuEditor.ajax_url, $this);
    });

    function uploadImage(form_data, ajax_url, _this) {
        $.ajax({
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener(
                    "progress",
                    function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = parseInt((evt.loaded / evt.total) * 100);
                            $("#icon-upload-bar")
                                .addClass("show")
                                .width(percentComplete + "%");
                        }
                    },
                    false
                );
                return xhr;
            },
            url: ajax_url,
            type: "POST",
            contentType: false,
            processData: false,
            data: form_data,
            success: function (response) {
                _this.val("");
                let data = JSON.parse(response);
                if (data.status != false) {
                    let images = data.images;
                    for (var key in images) {
                        if (images.hasOwnProperty(key)) {
                            let basename = images[key].split("/").reverse()[0];
                            let image_url =
                                WPAdminifyMenuEditor.baseurl + "/adminify-custom-icons/" + basename;
                            let item = ` <li data - id = "${key}" > <img width="24" height="24" src = "${image_url}" / > </li> `;
                            displayIconsWrapper.prepend(item);
                        }
                    }
                    setTimeout(() => {
                        $("#icon-upload-bar").width(0).removeClass("show");
                        $("#adminify-drag-drop-area").css("border-color", "#c3c4c7");
                    }, 100);
                }
            },
        });
    }
    /**
     * Drag & Drop Custom Icon Uploader for Menu Editor END
     */
});
