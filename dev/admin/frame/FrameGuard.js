class FrameGuard {

    constructor() {
        
        this.notAllowedUrls = [];

        if ( 'WPAdminifyFrameNotAllowedURLs' in window ) {
            this.notAllowedUrls = WPAdminifyFrameNotAllowedURLs; // Equivalent to Admin::get_not_allowed_urls();
        }

    }

    isAllowed() {

        for (let urlObject of this.notAllowedUrls) {

            let isAllowed;

            if (typeof urlObject === 'string') {

                isAllowed = true; // Scoped default allowed
                if (urlObject === parent.location.pathname) isAllowed = false; // not allowed

            } else {

                isAllowed = false; // Scoped default not allowed

                if (urlObject.url !== '*' && urlObject.url !== parent.location.pathname) isAllowed = true; // allowed

                if (!isAllowed && 'query_params' in urlObject) {
                    if (!this.checkQueryParams(urlObject.query_params)) isAllowed = true; // allowed
                }

                if (!isAllowed && 'post_type' in urlObject) {
                    if (!this.checkPostType(urlObject.post_type)) isAllowed = true; // allowed
                }
            }

            if (!isAllowed) return false;
        }

        return true;
    }

    checkQueryParams(queryParams) {

        // Pattern 1: Check for only keys in URL, no need to check their values
        if (Array.isArray(queryParams)) {
            for (let param of queryParams) {
                if ( param.slice(-1) === '!' ) {
                    param = param.slice(0, -1);
                    if (this.hasUrlParameter(param)) return false; // The key exists in the URL
                } else {
                    if (!this.hasUrlParameter(param)) return false; // The key doesn't exist in the URL
                }
            }
            return true; // All keys exist
        }

        // Pattern 2: Both keys and their values should check in URL
        // Pattern 3: Hybrid of Pattern 1 and Pattern 2
        for (let param in queryParams) {

            if ( isNaN(param) ) { // Param with Value

                let value = queryParams[param];
                if ( !this.hasUrlParameter(param) || this.getUrlParameter(param) != value) {
                    return false; // param doesn't exist or the value doesn't match
                }

            } else { // Param without Value
                
                param = queryParams[param];

                if ( param.slice(-1) === '!' ) {
                    param = param.slice(0, -1);
                    if (this.hasUrlParameter(param)) return false; // The key exists in the URL
                } else {
                    if (!this.hasUrlParameter(param)) return false; // The key doesn't exist in the URL
                }

            }

        }

        return true; // All keys and values match
    }

    checkPostType(postTypes) {
        let postType = this.getUrlParameter('post_type')
        if ( postType ) {
            return postTypes.includes(postType);
        }
        return false;
    }

    // Helper to get URL parameters
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Helper to get URL parameters
    hasUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has(name);
    }
}

export default FrameGuard;