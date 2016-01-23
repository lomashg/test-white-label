(function () {

    /**********************************
    CONFIGURATION AND CUSTOMISATION
    YOU SHOULD READ THE README.txt FILE BEFORE CONFIGURING YOUR WHITE LABEL SITE
    **********************************/

    // TODO: Update with your apiKey
    //var apiKey = '41b0389d-7461-44d4-ae1b-e49ac3f53b53';
    var apiKey = 'ac523192c43e44909e1a7594affa51e0';

    // TODO: Update with your url base
    var urlBase = 'http://snagi.github.io/test-white-label/';
    var searchURL = 'search.htm';
    var eventURL = 'event.htm';

    // TODO: Customise below settings if necessary - see readme
    var locations = {};
    locations.state = '';
    locations.postcodes = [];
    locations.councils = [];
    locations.regions = [];

    var usernames = [];

    var categories = [];

    var defaultDateRange = "All";

    var eventSettings = {};

    var searchIOSettings = {};

    var searchSettings = {};

    var autoUpdateFilters = true;

    /**********************************
    END OF CONFIGURATION SECTION
    ********************************** /

    /**********************************
    ADVANCED USERS ONLY BELOW THIS LINE
    **********************************/

    var web_service_url = 'http://atlas.atdw-online.com.au/api/';
    var assets_url = 'http://snagi.github.io/test-white-label';
    var wlsDir = assets_url + '/wls/';

    function main() {

        var s = document.createElement('script');
        s.setAttribute("type", "text/javascript");
        s.setAttribute("src", wlsDir + 'wls.js');
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(s);

        if (s.readyState) {
            s.onreadystatechange = function () { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    configure();
                }
            };
        } else { // Other browsers
            s.onload = configure;
        }
    };

    function configure() {
        window.atdw.myevents.distribution.setBaseUrl(web_service_url);
        window.atdw.myevents.distribution.setAssetsUrl(assets_url);

        if (isSearchPage()) {
            if (!validateMarkup()) {
                alert('Page markup is invalid - please consult the README.txt');
                return;
            }
            window.atdw.myevents.search.settings.apiKey = apiKey;
            window.atdw.myevents.search.setBaseUrl(assets_url);
            window.atdw.myevents.search.settings.locations = locations;
            window.atdw.myevents.search.settings.eventPageURL = urlBase + eventURL;
            window.atdw.myevents.search.settings.autoUpdateFilters = autoUpdateFilters;
            searchSettings.defaultDateRange = defaultDateRange;
            searchSettings.username = usernames;
            searchSettings.categories = categories;

            // call toggle buttons
            window.atdw.myevents.search.toggleUpdateButtons();

            window.atdw.myevents.search.start(searchIOSettings, searchSettings);
        } else if (isEventPage()) {

            window.atdw.myevents.event.apiKey = apiKey;
            window.atdw.myevents.event.setBaseUrl(assets_url);
            window.atdw.myevents.event.searchPageURL = urlBase + searchURL;
            eventSettings.defaultDateRange = defaultDateRange;
            window.atdw.myevents.event.start(eventSettings);
        }

        // remove this script from the head
        $('script').filter(function () { return $(this).attr('src').indexOf('whitelabel.js') > -1; }).remove();
    };

    // checks that the required elements are on the page (make sure distributor hasn't modified element ID's)
    function validateMarkup() {
        var searchResultsContainer = $(window.atdw.myevents.search.io.searchResultsContainer);

        return (searchResultsContainer.length > 0);
    }

    function isEventPage() {
        return window.location.pathname.indexOf(eventURL) > -1;
    };

    function isSearchPage() {
        return !isEventPage();
    };

    main();

})();
