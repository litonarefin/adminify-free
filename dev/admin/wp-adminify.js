// JS codes by WP Adminify

(function ($) {
    "use strict";

    // $('.auto-fold .interface-interface-skeleton').css('left', '244px');
    // $('.wp-adminify.block-editor-page .interface-interface-skeleton').css('top', '90px');
    // $('.wp-adminify .editor-document-tools__left button.editor-document-tools__inserter-toggle').css('padding', '0px');
    // $('.wp-adminify.is-fullscreen-mode #wpadminbar').css('display', 'none');

    // var $body = $('body'),
    //     isFullScreen = $body.hasClass('is-fullscreen-mode');
    // if (isFullScreen) {
    //     console.log("yes its it");
    //     // $step5.css({
    //     //     'top': '93px',
    //     //     'left': '0',
    //     // });
    //     // $step5Arrow.css('left', '91px');
    // }

    // $(document).ready(function () {
    //     if ($("body.js.wp-adminify").hasClass("is-fullscreen-mode")) {
    //     //   console.log("yes its it");
    //         $(".wp-adminify.adminify-top_bar").css('display', 'none');
    //         $(".wp-adminify.block-editor-page .interface-interface-skeleton").css('left', '0px !important');
    //     } else {
    //       console.log("non ono ");
    //     }
    //     // console.log("ready!");
    // });

    // pro code start
    var isPro = WP_ADMINIFY_ADMIN.is_pro;
    var isAdminifyUI = WP_ADMINIFY_ADMIN.settings.adminify_ui;

    // pro code end

    // adminbar sticky class add/remove
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 1) {
            $(".adminify-top_bar").addClass("is-sticky");
        } else {
            $(".adminify-top_bar").removeClass("is-sticky");
        }
    });

    // wp adminify adminbar menu displaying issue fixed START
    if (!$("#wp-admin-bar-top-secondary").length) {
        $("#wp-toolbar.quicklinks").append(
            ` <ul id = "wp-adminify-default-top-secondary" > </ul> `
        );
    }
    // wp adminify adminbar menu displaying issue fixed END

    // Icon Class replaced when adminify_ui is disabled
    $("body:not(.adminify-ui) div[class*=' dashicons-adminify']").each(function () {
        var el_class = $(this)
            .attr("class")
            .replace("dashicons-before dashicons-adminify-", "adminify-menu-icon ");
        $(this).attr("class", el_class);
    });

    $('body:not(.adminify-ui) #adminmenuwrap #adminmenu a').each(function() {
        $(this).find('img').each(function() {
            var imgSrc = $(this).attr('src');
            // var parent = $(this).parent();
    
            if (imgSrc) {
                // Match FontAwesome (fas fa-)
                var faMatch = imgSrc.match(/http:\/\/fas%20fa-([a-zA-Z0-9-]+)/);
                // Match Simple Line Icon (icon-)
                var lineIconMatch = imgSrc.match(/http:\/\/icon-([a-zA-Z0-9-]+)/);
    
                if (faMatch && faMatch[1]) {
                    var faClass = 'fas fa-' + faMatch[1];
                    $(this).parent().addClass(faClass).removeClass('dashicons-before');
                    $(this).remove();
                } else if (lineIconMatch && lineIconMatch[1]) {
                    var lineIconClass = 'icon-' + lineIconMatch[1];
                    $(this).parent().addClass(lineIconClass).removeClass('dashicons-before');
                    $(this).remove();
                }else if($(this).parent().is('.wp-menu-image.dashicons-before') && $(this).parent().attr('class').split(' ').length === 2) {
                    $(this).parent().removeClass('dashicons-before').addClass('custom-icon');
                    $(this).css({
                        'width': '20px',
                        'height': '20px',
                        'padding': '0'
                    });
                }
            }
        });
    });
    

    // scroll to top class added to body / its currently working for gravity form header
    window.addEventListener("scroll", function (e) {
        var distanceY = window.pageYOffset || document.documentElement.scrollTop,
            scrollTo = 40,
            header = document.querySelector("body");
        if (distanceY > scrollTo) {
            header.classList.add("adminify-scrollto-sticky");
        } else {
            if (header.classList.contains("adminify-scrollto-sticky")) {
                header.classList.remove("adminify-scrollto-sticky");
            }
        }
    });

    // Folder div made full width and content placed to bottom
    if (window.matchMedia("(max-width: 500px)").matches) {
        setTimeout(() => {
            var folder_height = $(".wp-adminify--folder-app").height();
            $("#wpbody-content").css("margin-top", folder_height + 180);
        }, 1500);
    }

    var adminHeight = $(".wp-adminify.adminify-top_bar").height();
    $(".wp-adminify-admin-bar.position-bottom").css("padding-bottom", adminHeight * 1.25);

    // Widget #dashboard_right_now count style

    jQuery("#dashboard_right_now li a").html(function () {
        var text = jQuery(this).text().trim().split(" ");
        var first = text.shift();
        return (
            (text.length > 0 ? "<span class='counter'>" + first + "</span> " : first) +
            text.join(" ")
        );
    });

    // Accordion

    jQuery(".accordion .accordion-body").css("display", "none");

    jQuery("body").on(
        "click",
        ".accordion-button, .accordion-opener",
        function (
            e // jQuery(".accordion-button, .accordion-opener").on('click', function (e)
        ) {
            e.preventDefault();
            jQuery(this).toggleClass("show");

            var jQuerythis = jQuery(this);

            if (jQuerythis.next().hasClass("show")) {
                jQuerythis.next().removeClass("show");
                jQuerythis.next().slideUp(100);
            } else {
                jQuerythis.parent().parent().find(".accordion-body").removeClass("show");
                jQuerythis.parent().parent().find(".accordion-body").slideUp(100);
                jQuerythis.prev(".accordion-title").toggleClass("show");
                jQuerythis.next().toggleClass("show");
                jQuerythis.next().slideToggle(100);
            }
        }
    );

    // Admin Columns Accordions

    $(".accordion-opener").on("click", function (e) {
        e.preventDefault();

        let $this = $(this);

        if ($this.next().hasClass("show")) {
            $this.next().removeClass("show");
            $this.next().slideUp(100);
        } else {
            $this.parent().parent().find(".accordion-body").removeClass("show");
            $this.parent().parent().find(".accordion-body").slideUp(100);
            $this.prev(".accordion-title").toggleClass("show");
            $this.next().toggleClass("show");
            $this.next().slideToggle(100);
        }
    });

    $(window).on("load", function () {
        // WP_Adminify.animateCSS('body.wp-adminify', 'fadeIn');
        // WP_Adminify.animateCSS('.my-element', 'fadeIn').then((message) => {
        // // Do something after the animation
        // });

        $(".wp-adminify-loader").delay(300).fadeOut("slow");

        // Adminbar Loader
        $(".wp-adminify-topbar-loader").delay(100).fadeOut("fast");
        setTimeout(function () {
            $(".wp-adminify.adminify-top_bar").fadeIn("fast");
        }, 100);

        // Menu Editor Preloader
        setTimeout(function () {
            $(".wp-adminify-menu-editor-loader").css({ display: "none" });
        }, 700);
        setTimeout(function () {
            $(".wp-adminify--menu--editor--settings").addClass("loaded");
        }, 700);
    });

    // Google page speed origin on / off

    jQuery(".origin-summery-trigger button").on("click", function () {
        alert("clicked!");
        jQuery(".result-body").toggleClass("show-origin");
    });

    // Wrap content get extra margin if folder options exist
    jQuery("body").has("#wp-adminify--folder-app").addClass("has-folder-options");

    // tippy('[data-tippy-content]');

    // Admin Topbar Search
    function admin_top_search_hide_result() {
        $("#top-header-search-results").hide();
    }

    function admin_top_search_show_result() {
        $("#top-header-search-results").show();
    }

    $("#top-header-search-input").on("input", function () {
        var search_val = $("#top-header-search-input").val();
        admin_top_bar_search(search_val);
        if (!search_val.length) {
            admin_top_search_hide_result();
        }
    });

    var cansearch;

    function admin_top_bar_search(searchTerm) {
        // Admin Bar Search
        if (cansearch == false) {
            return;
        }

        if (searchTerm == "") {
            return;
        }

        // var count_rows = $('#top-header-search-results .top-header-result-table > tbody > tr').length;
        // console.log(count_rows);
        // $("#top-header-search-results").css('display','block');

        $.ajax({
            url: WPAdminify.ajax_url,
            type: "post",
            data: {
                action: "adminify_all_search",
                security: WPAdminify.security_nonce,
                search: searchTerm,
            },
            beforeSend: function (xhr) {
                cansearch = false;
            },
            success: function (response) {
                if (response) {
                    var data = JSON.parse(response);

                    // if (data.error) {
                    // Toastr Code here
                    // } else {
                    admin_top_search_show_result();

                    $("#top-header-search-results .top-header-results-wrapper").html(data);

                    // $("#top-header-search-results").show();
                    cansearch = true;
                    // }
                }
            },
        });
    }

    var WP_Adminify = {
        // Pro Notice
        ProNotice: function () {
            // Notice Hide to Outside overlay
            $(".wp-adminify-popup-overlay").on("click", function (evt) {
                evt.preventDefault();
                $(this).closest(".wp-adminify-upgrade-popup").fadeOut(200);
            });

            // Notice Hide to close button
            $("body").on("click", ".wp-adminify-upgrade-popup .popup-dismiss", function (evt) {
                evt.preventDefault();
                $(this).closest(".wp-adminify-upgrade-popup").fadeOut(200);
            });

            // Notice Show
            $("body").on("click", ".adminify-pro-notice", function (evt) {
                evt.preventDefault();
                $(".wp-adminify-upgrade-popup").fadeIn(200);
            });

            /**
             * Fields Notice Class Add
             */
            // Checkbox
            const checkboxLabel = $(".adminify-pro-checkbox").parent().parent();
            checkboxLabel.addClass("adminify-pro-notice");

            // Color Picker
            const colorPickerLabel = $(
                ".adminify-field-color_group.adminify-pro-fieldset > .adminify-fieldset"
            );
            colorPickerLabel.addClass("adminify-pro-notice");

            // Gradient Color Picker
            const gradientLolorPickerLabel = $(
                ".adminify-field-background[data-value='gradient|true'].adminify-pro-feature > .adminify-fieldset"
            );
            gradientLolorPickerLabel.css("pointer-events", "none");
        },

        // Pro Notice With Iframe
        ProNoticeWithIframe: function (__iFrameDOM) {
            // Notice Hide to Outside overlay
            __iFrameDOM.find("body").on("click", ".wp-adminify-popup-overlay", function (evt) {
                evt.preventDefault();
                $(this).closest(".wp-adminify-upgrade-popup").fadeOut(200);
            });

            // Notice Hide to close button
            __iFrameDOM
                .find("body")
                .on("click", ".wp-adminify-upgrade-popup .popup-dismiss", function (evt) {
                    evt.preventDefault();
                    $(this).closest(".wp-adminify-upgrade-popup").fadeOut(200);
                });

            // Notice Show
            __iFrameDOM.find("body").on("click", ".adminify-pro-notice", function (evt) {
                evt.preventDefault();
                __iFrameDOM.find(".wp-adminify-upgrade-popup").fadeIn(200);
            });

            /**
             * Fields Notice Class Add
             */
            // Checkbox
            const checkboxLabel = __iFrameDOM.find(".adminify-pro-checkbox").parent().parent();
            checkboxLabel.addClass("adminify-pro-notice");

            // Color Picker
            const colorPickerLabel = __iFrameDOM.find(
                ".adminify-field-color_group.adminify-pro-fieldset > .adminify-fieldset"
            );
            colorPickerLabel.addClass("adminify-pro-notice");

            // Gradient Color Picker
            const gradientLolorPickerLabel = __iFrameDOM.find(
                ".adminify-field-background[data-value='gradient|true'].adminify-pro-feature > .adminify-fieldset"
            );
            gradientLolorPickerLabel.css("pointer-events", "none");
        },

        // Preset Pro Notice
        PresetProNotice: function (presets) {
            // Presets
            presets.forEach((item) => {
                const preset_item = document.querySelector(
                    `.adminify--image-group .adminify--image figure input[value="${item}"]`
                );

                if (!preset_item) return;

                const preset = preset_item.parentNode.parentNode;
                preset.classList.add("adminify-pro-notice");
                const proBatch = document.createElement("span");
                proBatch.classList.add("adminify-pro-tag");
                const proText = document.createTextNode("Pro");
                proBatch.appendChild(proText);

                preset.appendChild(proBatch);
            });
        },

        // Preset Pro Notice With Iframe
        PresetProNoticeWithIframe: function (__iFrameDOM, presets) {
            // Presets
            presets.forEach((item) => {
                // With Iframe
                const iframe_preset_item = __iFrameDOM.find(
                    `.adminify--image-group .adminify--image figure input[value="${item}"]`
                );

                const iframe_preset = iframe_preset_item.parent().parent();
                iframe_preset.addClass("adminify-pro-notice");
                const iframe_proBatch = document.createElement("span");
                iframe_proBatch.classList.add("adminify-pro-tag");
                const iframe_proText = document.createTextNode("Pro");
                iframe_proBatch.appendChild(iframe_proText);

                iframe_preset.append(iframe_proBatch);
            });
        },

        ToggleSwitcher: function (key, value) {
            if (key == "") {
                return;
            }
            jQuery.ajax({
                url: WPAdminify.ajax_url,
                type: "post",
                data: {
                    action: "wp_adminify_color_mode",
                    security: WPAdminify.security_nonce,
                    key: key,
                    value: value,
                },
            });
        },

        SetColorMode: function (color_mode) {
            WP_Adminify.ToggleSwitcher("color_mode", color_mode);

            if (color_mode === "dark") {
                window.AdminifyDarkMode.enable({ brightness: 120 });
                $("body").removeClass("adminify-light-mode");
                $("body").addClass("adminify-dark-mode");
            } else if (color_mode === "light") {
                window.AdminifyDarkMode.disable();
                $("body").removeClass("adminify-dark-mode");
                $("body").addClass("adminify-light-mode");
            } else if (color_mode === "system") {
                const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

                if (!!isDark) {
                    window.AdminifyDarkMode.enable({ brightness: 120 });
                    $("body").removeClass("adminify-light-mode");
                    $("body").addClass("adminify-dark-mode");
                } else {
                    window.AdminifyDarkMode.disable();
                    $("body").removeClass("adminify-dark-mode");
                    $("body").addClass("adminify-light-mode");
                }
            }
        },

        // Light/Dark Mode
        Color_Mode_Switcher: function () {
            const lightBtn = document.querySelector(".light-dark-dropdown .light");
            const darkBtn = document.querySelector(".light-dark-dropdown .dark");
            const systemBtn = document.querySelector(".light-dark-dropdown .system");

            const dropdown = document.querySelector(".light-dark-dropdown");
            const modeIcon = document.querySelector(".mode-icon");

            const lightIcon = document.querySelector(".mode-icon .lightIcon");
            const darkIcon = document.querySelector(".mode-icon .darkIcon");
            const systemIcon = document.querySelector(".mode-icon .systemIcon");

            if (!lightBtn || !darkBtn || !systemBtn) return;

            document.addEventListener("click", (event) => {
                const isVisible = getComputedStyle(dropdown).visibility === "visible";

                if (!dropdown.contains(event.target)) {
                    if (!!isVisible) {
                        dropdown.removeAttribute("style");
                    }
                }
            });

            handleClick(modeIcon, () => {
                setTimeout(() => {
                    dropdown.style.visibility = "visible";
                    dropdown.style.opacity = "0.9999";
                    dropdown.style.transform = "none";
                }, 10);
            });

            handleClick(lightBtn, () => {
                WP_Adminify.SetColorMode("light");
                lightIcon.style.display = "block";
                darkIcon.style.display = "none";
                systemIcon.style.display = "none";
            });

            handleClick(darkBtn, () => {
                WP_Adminify.SetColorMode("dark");
                lightIcon.style.display = "none";
                systemIcon.style.display = "none";
                darkIcon.style.display = "block";
            });

            handleClick(systemBtn, () => {
                WP_Adminify.SetColorMode("system");
                systemIcon.style.display = "block";
                lightIcon.style.display = "none";
                darkIcon.style.display = "none";
            });

            /**
             * Handle click
             * @param {css selector} el
             * @param {function} callback
             * @returns
             */
            function handleClick(el, callback) {
                return el.addEventListener("click", callback);
            }
        },

        // Screens Tab
        Screen_Option_Switcher: function () {
            $("#screen-option-switcher-btn").on("click", function () {
                var screen_options_tab = $("#screen-option-switcher-btn").is(":checked") ? 1 : 0;
                WP_Adminify.ToggleSwitcher("screen_options_tab", screen_options_tab);
                if (screen_options_tab) {
                    $("#screen-options-link-wrap").css("display", "none");
                }
            });
        },

        // Help Tab
        Help_Tab: function () {
            $("#help-option-switcher-btn").on("click", function () {
                var adminify_help_tab = $("#help-option-switcher-btn").is(":checked") ? 1 : 0;
                WP_Adminify.ToggleSwitcher("adminify_help_tab", adminify_help_tab);
                if (adminify_help_tab) {
                    $("#contextual-help-link-wrap").css("display", "none");
                }
            });
        },

        // Hide WP Links
        Hide_WP_Links: function () {
            $("#hide-wp-links-switcher-btn").on("click", function () {
                var hide_wp_links = $("#hide-wp-links-switcher-btn").is(":checked") ? 1 : 0;
                WP_Adminify.ToggleSwitcher("hide_wp_links", hide_wp_links);
            });
        },

        // Copy Active Plugins
        Copy_Active_Plugins: function (e) {
            e.preventDefault();
            $(".adminify-copy-btn").copyToClipboard({
                parent: ".adminify-server-info",
                content: ".adminify-active-plugins-data",
                onSuccess: function ($element, source, selection) {
                    $("span", $element).text($element.attr("data-text-copied"));
                    setTimeout(function () {
                        $("span", $element).text($element.attr("data-text"));
                    }, 200000);
                },
            });
        },

        Dismiss_Notice: function () {
            $(
                "div[data-dismissible] .notice-dismiss,div[data-dismissible] .adminify-notice-dismiss, div[data-dismissible] .dismiss-this"
            ).on("click", function (event) {
                event.preventDefault();
                var $this = $(this);
                var attr_value, option_name, dismissible_length, data;

                attr_value = $this
                    .closest("div[data-dismissible]")
                    .attr("data-dismissible")
                    .split("-");

                // remove the dismissible length from the attribute value and rejoin the array.
                dismissible_length = attr_value.pop();
                option_name = attr_value.join("-");
                data = {
                    action: "adminify_dismiss_admin_notice",
                    option_name: option_name,
                    dismissible_length: dismissible_length,
                    notice_nonce: WPAdminify.notice_nonce,
                };

                // We can also pass the url value separately from ajaxurl for front end AJAX implementations
                $.post(WPAdminify.ajax_url, data);
                $this.closest("div[data-dismissible]").hide("slow");
            });
        },

        animateCSS: function (element, animation, prefix = "animate__") {
            // We create a Promise and return it
            new Promise((resolve, reject) => {
                var animationName = `${prefix}${animation}`;
                var node = document.querySelector(element);

                node.classList.add(`${prefix}animated`, animationName);

                // When the animation ends, we clean the classes and resolve the Promise
                function handleAnimationEnd(event) {
                    event.stopPropagation();
                    node.classList.remove(`${prefix}animated`, animationName);
                    resolve("Animation ended");
                }

                node.addEventListener("animationend", handleAnimationEnd, { once: true });
            });
        },

        VersionRollback: function () {
            $("select.wp-adminify-rollback-select")
                .on("change", function () {
                    var $this = $(this),
                        $rollbackButton = $this.next(".wp-adminify-rollback-button"),
                        placeholderText = $rollbackButton.data("placeholder-text"),
                        placeholderUrl = $rollbackButton.data("placeholder-url");
                    $rollbackButton.html(placeholderText.replace("{VERSION}", $this.val()));
                    $rollbackButton.attr("href", placeholderUrl.replace("VERSION", $this.val()));
                })
                .trigger("change");

            $("body").removeClass("wp-adminify--popup-show");

            $(".wp-adminify-rollback-button").on("click", function (event) {
                event.preventDefault();
                var $this = $(this);
                $("body").addClass("wp-adminify--popup-show");
                $(".wp-adminify-dialog-ok").on("click", function (event) {
                    event.preventDefault();
                    location.href = $this.attr("href");
                });
            });
        },
    };

    // Documents Loaded
    $(function () {
        // Extra space appears on Folder Widget in Horizontal Menu mode
        var hmenuHeight = $(".wp-adminify-horizontal-menu").height();
        $(".wp-adminify.horizontal-menu.has-folder-options .wp-adminify--folder-widget").css(
            "top",
            hmenuHeight * 1.05
        );

        function fixClasses() {
            var width = $(window).innerWidth();
            if (width <= 767) {
                if($("body").hasClass("adminify-ui")) {
                    $("body").removeClass("folded auto-fold");
                }else{
                    $("body").removeClass("folded");
                }
            }
            if (width <= 1023 && width > 767) {
                $("body").addClass("folded");
            }
        }

        fixClasses();

        $(window).on("resize", function () {
            fixClasses();
        });

        // Presets
        const presets = [
            "preset3",
            "preset4",
            "preset5",
            "preset6",
            "preset7",
            "preset8",
            "preset9",
            "custom",
        ];

        // Not PRO and With Adminify UI
        if (!isPro && !!isAdminifyUI) {
            waitForElm("#frame-adminify-app--iframe").then((elm) => {
                elm.contentWindow.onload = (event) => {
                    const __iFrameDOM = $("#frame-adminify-app--iframe").contents();

                    WP_Adminify.PresetProNoticeWithIframe(__iFrameDOM, presets);
                    WP_Adminify.ProNoticeWithIframe(__iFrameDOM);
                };
            });
        }

        // Not PRO and Without Adminify UI
        if (!isPro && !isAdminifyUI) {
            WP_Adminify.PresetProNotice(presets);
            WP_Adminify.ProNotice();
        }

        // Without Adminify UI
        if (!isAdminifyUI) {
            WP_Adminify.Color_Mode_Switcher();
        }

        // Menu Search for standard WP admin sidebar (without Adminify UI) - Pro only
        if (isPro && !isAdminifyUI && WP_ADMINIFY_ADMIN.settings.menu_search) {
            var $adminMenu = $("#adminmenu");
            if ($adminMenu.length) {
                var searchHtml =
                    '<li id="adminify-wp-menu-search" class="adminify-wp-menu-search">' +
                        '<div class="adminify-wp-menu-search-wrap">' +
                            '<input type="text" class="adminify-wp-menu-search-input" placeholder="Search tools..." />' +
                            '<svg class="adminify-wp-menu-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
                        '</div>' +
                    '</li>';
                $adminMenu.prepend(searchHtml);

                $adminMenu.on("input", ".adminify-wp-menu-search-input", function () {
                    var query = $(this).val().toLowerCase().trim();
                    $adminMenu.find("> li").not("#adminify-wp-menu-search").each(function () {
                        var $item = $(this);
                        if (!query) {
                            $item.show();
                            return;
                        }
                        var menuText = $item.find(".wp-menu-name").first().text().toLowerCase();
                        var submenuMatch = false;
                        $item.find(".wp-submenu li a").each(function () {
                            if ($(this).text().toLowerCase().indexOf(query) !== -1) {
                                submenuMatch = true;
                                return false;
                            }
                        });
                        if (menuText.indexOf(query) !== -1 || submenuMatch) {
                            $item.show();
                        } else {
                            $item.hide();
                        }
                    });
                });
            }
        }

        // WP_Adminify.ToggleSwitcher();

        WP_Adminify.Screen_Option_Switcher();
        WP_Adminify.Help_Tab();
        WP_Adminify.Hide_WP_Links();
        WP_Adminify.Dismiss_Notice();
        WP_Adminify.VersionRollback();
        // WP_Adminify.Copy_Active_Plugins();

        // Copy to Clipboard Section
        (function (n) {
            n.fn.copyToClipboard = function (e) {
                var t = n.extend(
                    {
                        parent: "body",
                        content: "",
                        onSuccess: function () {},
                        onError: function () {},
                    },
                    e
                );
                return this.each(function () {
                    var e = n(this);
                    e.on("click", function () {
                        var n = e.parents(t.parent).find(t.content);
                        var o = document.createRange();
                        var c = window.getSelection();
                        o.selectNodeContents(n[0]);
                        c.removeAllRanges();
                        c.addRange(o);
                        try {
                            var r = document.execCommand("copy");
                            var a = r ? "onSuccess" : "onError";
                            t[a](e, n, c.toString());
                        } catch (i) {}
                        c.removeAllRanges();
                    });
                });
            };
        })(jQuery);

        // $(".adminify-copy-btn").on("click", function (e) {
        //     e.preventDefault();
        //     $(".adminify-copy-btn").copyToClipboard({
        //         parent: ".adminify-server-info",
        //         content: ".adminify-active-plugins-data",
        //         onSuccess: function ($element, source, selection) {
        //             $("span", $element).text($element.attr("data-text-copied"));
        //             setTimeout(function () {
        //                 $("span", $element).text($element.attr("data-text"));
        //             }, 2000);
        //         },
        //     });
        // });

        if ($(window).innerWidth() <= 1200) {
            $(".adminify-search-expand").on("click", function () {
                $(".top-header--search--form").toggleClass("adminify-form-expand");
            });
        }

        if (WPAdminify_ThirdParty !== undefined || WPAdminify_ThirdParty != null) {
            // betterlinks menu settings
            if (WPAdminify_ThirdParty.better_links.active === true) {
                var { menu_name, submenu_manage, submenu_name, submenu_settings } =
                    WPAdminify_ThirdParty.better_links;

                if ($("body").hasClass("toplevel_page_betterlinks")) {
                    if (menu_name) {
                        $(
                            ".toplevel_page_betterlinks #toplevel_page_betterlinks .wp-menu-name"
                        ).text(menu_name);
                    }
                    setTimeout(() => {
                        if (menu_name) {
                            $(
                                ".toplevel_page_betterlinks #toplevel_page_betterlinks .wp-submenu .wp-submenu-head"
                            ).text(menu_name);
                        }
                        if (submenu_manage) {
                            $(
                                ".toplevel_page_betterlinks #toplevel_page_betterlinks .wp-submenu li:nth-child(2) a"
                            ).text(submenu_manage);
                        }
                        if (submenu_name) {
                            $(
                                ".toplevel_page_betterlinks #toplevel_page_betterlinks .wp-submenu li:nth-child(3) a"
                            ).text(submenu_name);
                        }
                        if (submenu_settings) {
                            $(
                                ".toplevel_page_betterlinks #toplevel_page_betterlinks .wp-submenu li:nth-child(4) a"
                            ).text(submenu_settings);
                        }
                    }, 500);
                }
            }
        }
    });

    // Click with Reload
    $(".adminify-toolbar .adminify-top-menu-my-sites a").on("click", function (event) {
        setTimeout(() => {
            window.location.reload();
        }, 100);
    });
})(jQuery);

// Pro-locked controls: server-side render handler already strips name=
// and disables inputs on Pro-only fields. This DOMContentLoaded sweep
// is defense-in-depth in case a future field type's render path
// bypasses the PHP filter.
document.addEventListener('DOMContentLoaded', function () {
    var fieldSelectors = [
        '.adminify-pro-fieldset',
        '.adminify-pro-feature',
        '.adminify-pro-notice',
        '.adminify-pro-locked'
    ];
    var optionLiSelector = 'li:has(.adminify-pro-checkbox), li:has(.adminify-pro-locked-option)';

    var fieldInputs = document.querySelectorAll(
        fieldSelectors.map(function (s) {
            return s + ' input, ' + s + ' select, ' + s + ' textarea';
        }).join(', ')
    );

    var optionInputs = [];
    try {
        optionInputs = document.querySelectorAll(
            optionLiSelector.split(',').map(function (s) {
                return s.trim() + ' input, ' + s.trim() + ' select, ' + s.trim() + ' textarea';
            }).join(', ')
        );
    } catch (e) {
        // Browsers without :has() (Safari < 15.4): server-side handler
        // already enforced the option-level lock.
        optionInputs = [];
    }

    [fieldInputs, optionInputs].forEach(function (list) {
        Array.prototype.forEach.call(list, function (el) {
            el.removeAttribute('name');
            el.disabled = true;
            el.setAttribute('tabindex', '-1');
        });
    });
});

export function waitForElm(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}
