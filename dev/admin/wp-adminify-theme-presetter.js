jQuery(function ($) {
    class Adminify_Theme_Presetter {
        constructor() {
            this.prev_preset = $('input[data-depend-id="adminify_theme"]:checked')
                .parent()
                .parent();
            this.themes = this.get_themes();
            this.$dom = $("body.wp-adminify");
            this.set_events();
            this.set_custom_theme();
            this.get_prev_preset();
            this.set_parent_colors();

            this.pro_theme_name_remove();
        }

        pro_theme_name_remove() {
            const strip = () => {
                $('.adminify-field-image_select .adminify-pro-notice')
                    .find('input[name="_wpadminify[adminify_theme]"]')
                    .removeAttr('name');
            };

            const attempt = (tries = 0) => {
                if ($('.adminify-field-image_select .adminify-pro-notice').length) {
                    strip();
                    return;
                }
                if (tries < 30) setTimeout(() => attempt(tries + 1), 100);
            };

            attempt();
            $(window).on('load', strip);
        }

        get_prev_preset() {
            return this.prev_preset;
        }

        set_prev_preset(prev_theme) {
            this.prev_preset = prev_theme;
        }

        get_themes() {
            return adminify_preset_themes;
        }

        set_theme(theme) {
            const _theme = this.themes[theme];
            this.set_colors(_theme);
            this.set_parent_colors(_theme);
        }

        // iframe parent style change
        set_parent_colors(colors) {
            let attrs = "";
            for (let color in colors) {
                attrs += `${color}: ${colors[color]};`;
            }
            this.set_parent_color(attrs);
        }

        set_parent_color(attrs) {
            window.parent.document.body.setAttribute("style", attrs);
        }
        //End parent style

        set_colors(colors) {
            for (let color in colors) this.set_color(color, colors[color]);
        }

        set_custom_theme() {
            if ($('input[data-depend-id="adminify_theme"]:checked').val() != "custom") return;

            var $customPallete = $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-preset-background]"]'
            );
            this.set_color("--adminify-preset-background", $customPallete.val());

            var $customPallete = $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-primary]"]'
            );
            this.set_color("--adminify-primary", $customPallete.val());
            // For manage variables
            this.set_color("--adminify-menu-hover-bg", $customPallete.val());
            this.set_color("--adminify-menu-active-bg", $customPallete.val());
            this.set_color("--adminify-submenu-text-hover-color", $customPallete.val());
            this.set_color("--adminify-submenu-active-color", $customPallete.val());
            this.set_color("--adminify-notif-bg-color", $customPallete.val());
            // this.set_color("--adminify-menu-active-color", $customPallete.val());

            $customPallete = $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-menu-bg]"]'
            );
            this.set_color("--adminify-menu-bg", $customPallete.val());
            // For manage variables
            this.set_color("--adminify-submenu-wrapper-bg", $customPallete.val());

            $customPallete = $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-menu-text-color]"]'
            );
            this.set_color("--adminify-menu-text-color", $customPallete.val());
            // For manage variables
            this.set_color("--adminify-submenu-text-color", $customPallete.val());

            $customPallete = $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-notif-bg-color]"]'
            );
            this.set_color("--adminify-notif-bg-color", $customPallete.val());

            // $customPallete = $(
            //     'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-text-color]"]'
            // );
            // this.set_color("--adminify-text-color", $customPallete.val());

            // Transparent Color
            this.set_color("--adminify-submenu-hover-bg", "transparent");
            this.set_color("--adminify-submenu-active-bg", "transparent");
            // White Color
            this.set_color("--adminify-menu-text-hover-color", "#ffffff");
        }

        set_color(prop, val) {
            this.$dom.css(prop, val);
        }

        set_events() {
            const that = this;

            $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-preset-background]"]'
            ).on("change", function () {
                that.set_color("--adminify-preset-background", $(this).val());
            });

            $('input[name="_wpadminify[adminify_theme_custom_colors][--adminify-primary]"]').on(
                "change",
                function () {
                    that.set_color("--adminify-primary", $(this).val());
                    // For manage variables
                    that.set_color("--adminify-menu-hover-bg", $(this).val());
                    that.set_color("--adminify-menu-active-bg", $(this).val());
                    that.set_color("--adminify-submenu-text-hover-color", $(this).val());
                    that.set_color("--adminify-submenu-active-color", $(this).val());
                    that.set_color("--adminify-notif-bg-color", $(this).val());
                    // that.set_color("--adminify-menu-active-color", $(this).val());
                }
            );

            $('input[name="_wpadminify[adminify_theme_custom_colors][--adminify-menu-bg]"]').on(
                "change",
                function () {
                    that.set_color("--adminify-menu-bg", $(this).val());
                    // For manage variables
                    that.set_color("--adminify-submenu-wrapper-bg", $(this).val());
                }
            );

            $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-menu-text-color]"]'
            ).on("change", function () {
                that.set_color("--adminify-menu-text-color", $(this).val());
            });

            $(
                'input[name="_wpadminify[adminify_theme_custom_colors][--adminify-notif-bg-color]"]'
            ).on("change", function () {
                that.set_color("--adminify-notif-bg-color", $(this).val());
            });

            // $('input[name="_wpadminify[adminify_theme_custom_colors][--adminify-text-color]"]').on(
            //     "change",
            //     function () {
            //         that.set_color("--adminify-text-color", $(this).val());
            //     }
            // );

            $('input[data-depend-id="adminify_theme"]').on("change", function () {
                var selected_preset = $(this).filter(":checked").val();
                const preset_wrapper = $(this).parent().parent();

                if (preset_wrapper.hasClass("adminify-pro-notice")) {
                    setTimeout(() => {
                        preset_wrapper.removeClass("adminify--active");
                        that.get_prev_preset().addClass("adminify--active");
                    }, 1);
                    return;
                }

                if(!Object.keys(adminify_preset_themes).includes(selected_preset)) return;

                that.set_prev_preset(preset_wrapper);

                if (selected_preset == "custom") {
                    that.set_custom_theme();
                } else {
                    that.set_theme(selected_preset);
                }
            });
        }
    }

    new Adminify_Theme_Presetter();
});
