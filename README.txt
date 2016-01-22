-------------------------------------------------------------------------------
-----------------------Files Included In This Package--------------------------
-------------------------------------------------------------------------------

- README.txt (this file)
- whitelabel.js
- search.htm
- event.htm
- css
-- default.css
-- event-details.css
-- search-results.css
- images
-- btn-bg.jpg
-- cal-next.jpg
-- cal-prev.jpg
-- cross.gif
-- filterCross.gif
-- no-image-large.jpg
-- no-image-small.jpg
-- noorientation.png
-- placeholder.png

-------------------------------------------------------------------------------
--------------------------------License----------------------------------------
-------------------------------------------------------------------------------

A files included in this package are licensed under a 
Creative Commons Attribution-NoDerivs 3.0 Unported License.
http://creativecommons.org/licenses/by-nd/3.0/

-------------------------------------------------------------------------------
--------------------------------Installation-----------------------------------
-------------------------------------------------------------------------------

To install the white label site, copy all files in the zip package (except this
file) to the target directory. (There is a separate detailed instructions
section directly below this one.)

The whitelabel.js file is used for initialisation of the site. It connects to a
central web service to retrieve data, and enables a significant amount of
configuration. All configuration and customisation is done in the
CONFIGURATION AND CUSTOMISATION section of the whitelabel.js file.

Please do not rename the whitelabel.js file.

Unless otherwise noted, in examples below the default configuration for any
particular variable is shown. If you do not provide that variable, the default
value shown will be used. Most configuration options below are contained
within "settings" objects; make sure you declare these objects before writing
settings to them. For example, if the documentation section mentions:

var fooSettings = {};

Then you should make this call before writing any "foo" settings. Once you have
finished writing "foo" settings, your whitelabel.js might look like:

var fooSettings = {};
fooSettings.bar = 'blah';
fooSettings.foobar = 'blahblah';

As long as the naming conventions declared in this file are followed precisely,
the whitelabel.js will do the rest.

You do not need to place the whitelabel.js file in the same folder as the
search.htm and event.htm pages. In fact, you can place it anywhere you like,
as long as the <script> references on those htm pages are updated. Similarly,
the css files in the css folder can be placed anywhere, as long as all the
files are in the same folder.

You may wish to embed the search and event pages within a larger site, or a
master template. Doing so is easy: just remove all the content outside of the
<div class="atdw-wls-page"></div> container on either page. You should still 
include any <link> and <script> tags, pointing to the appropriate location.

-------------------------------------------------------------------------------
------------------------Step by Step Installation------------------------------
-------------------------------------------------------------------------------

This steps you through setting up the white label site files. It assumes you are
using a Windows computer and have Internet Information Services (IIS) installed.
If you do not, you can follow the instructions at
http://learn.iis.net/page.aspx/28/installing-iis-on-windows-vista-and-windows-7/
to do so.

If you're using another web server, such as Apache, you should find that most
of the steps will be similar.

1. Create a folder on your local machine. Copy the contents of the zip package
you were given into that folder.

2. Open the "search.htm" page in a web browser. You should see the search page
in all its glory � but the links to events won�t work (they will point to
an external site instead of your local setup).

3. Open IIS and create a new web site. Call it something like "myevents.local"
(for site name and host name). Point the "physical path" to the folder where
your search.htm file lives.

4. Open your hosts file. It lives in this folder: \
C:\Windows\System32\drivers\etc (it�s the file called hosts, NOT hosts.msn).
Add a line to the hosts file that reads 127.0.0.1 myevents.local
(replace myevents.local with whatever you called your site in step 3).

5. In your web browser, navigate to the newly created site.
Eg. http://myevents.local/search.htm
Note that the while label site does not include an "index.html" file, so
navigating to http://myevents.local will return an IIS error. If you don't plan
on integrating the provided files into a larger site, you should set
"search.htm" as your default document.
See http://learn.iis.net/page.aspx/203/default-documents/ for more information.

6. You should see the search page again. The links still won�t be correct.

7. Go to the folder where you put the myEvents files. Open the �whitelabel.js�
file (right click -> open in Notepad++, or similar � don�t double click!).

8. Find the line that starts with "var urlBase = 'http://www.eventsvictoria.com/';

9.  Change the URL in quotation marks so that it matches your local environment.
For example, http://myevents.local (basically the URL for the search page,minus
the "search.htm". Don�t delete the quotation marks or the semi colon at the end
of the line.

10. Do a forced refresh of the search page you have open (ctrl + F5 in Chrome).
Click on one of the event links. It should now navigate to a local event page,
eg. http://myevents.local/event.htm?....

Congratulations - the site is installed on your computer!

-------------------------------------------------------------------------------
------------------------------Global Configuration-----------------------------
-------------------------------------------------------------------------------

These settings apply to the entire site.

-------------------------------------------------------------------------------

apiKey: this should be provided to you along with the white label site code.
It is not recommended this be changed.
Example:
	var apiKey = '123456';
	Note: this example is not a default value. If your whitelabel.js is
	displaying this value for the api key, you should contact support.
	
-------------------------------------------------------------------------------

urlBase: set the base URL for your search and event pages. This should end in
a forward slash.
Example:
	var urlBase = 'http://www.eventsvictoria.com/';
	
searchURL, eventURL: set the URLs of your search and event page. These should be
relative paths. They'll be used for links back and forth between the search box
and search results.

Examples:
	Standard HTML pages:
		var searchURL = 'search.htm';
		var eventURL = 'event.htm';

    MVC application - you can define routes for the search page and event page
	in your MVC application. Then you can copy the html for the search/event
	pages into the appropriate views in your app.
	eg.
		var searchURL = 'Calendar/Search';
		var eventURL = 'Calendar/Event';
	eg.
		var searchURL = 'index';
		var eventURL = 'event';

It's important that these paths are correct. Make sure you test them!

-------------------------------------------------------------------------------

locations: configure the locations from which the white label site will return
events. Events from across the state are returned unless filters are specified.
Note: 
To get the list or regions use the following url:
http://www.eventsvictoria.com/DistributionService/MyEventsService/Regions?apiKey={{YourApiKey}}
&referrer={{YourRegisterdDomain}}

Sample data returned for regions:
[ 
	{
		Name: �Region 1�,
		Code: �REG1�
	},
	{
		Name: �Another Region�,
		Code: �AREG�
	}
]


To get a list or councils use the following url:
http://www.eventsvictoria.com/DistributionService/MyEventsService/Councils?apiKey={{YourApiKey}}
&referrer={{YourRegisterdDomain}}

[
	{
		Name: "Council 1",
		Code: "COU1"
	},
	{
		Name: "Another Council",
		Code: "ANOC"
	}
]

To get a list or locations use the following url:
http://www.eventsvictoria.com/DistributionService/MyEventsService/Locations?apiKey={{YourApiKey}}
&referrer={{YourRegisterdDomain}}

[
	{
		value: "Location 1",
		label: "Locaiton 1, 1111",
		postcode: "1111"
	},
	{
		value: "Another Location",
		label: "Another Location, 2222",
		postcode: "2222"
	}
]


Replace {{apiKey}} with the API Key you were sent in this package; 
and {{YourRegisterdDomain}} with one you used to request the white label.

You should use the council IDs and/or region names from data sets returned from 
the above urls exactly as they are returned.
Restricting locations by town is not currently supported. The finest level of
filtering available is by postcode.

Examples:
	- first, declare the locations object if locations are to be set
		var locations = {};

    - return events which take place in postcodes 1111 or 2222
		locations.postcodes = [1111, 2222];
    
	- return events that occur in the bounds of Council 1 or Another Council
		locations.councils = ["COU1", "ANOC"];

	- return events that occur in Region 1 or Another Region
		locations.regions = ["Region 1", "Another Region"];

	- multiple filters can be supplied. For example this one will return events 
	in Council 1, or Another Council, or postcodes 1111/2222, or Region 1,
	or Another Region
		locations.postcodes = [1111, 2222];
		locations.councils = ["COU1", "ANOC"];
		locations.regions = ["Region 1", "Another Region"];

-------------------------------------------------------------------------------

usernames: configure the username from which the white labe site will return 
events. Events from all users are returned if left no username/s are specified.
Note: To find the usernames who's events you want to display to go 
http://www.eventsvictoria.com/Distribution/RSS download the RSS feed, and search 
for username

	- return only products you have created
		var username = ['YOUR USERNAME'];
	
	- return products you or a friend has created
		var username = ['YOUR USERNAME', 'YOUR FRIENDS USERNAME'];

-------------------------------------------------------------------------------

categories: Adding a category configuration to the will force the whitelabel to 
only display the configured categories. All events with the configured 
categories will be selected if no category is select in the interface.

Note: By default all second level categories are tagged with the top level (1) 
category.  
eg: If you only want to return Visual Arts events, DO NOT pass in ARTCULTURE


To get a list or Leisure Categories use the following url:
http://www.eventsvictoria.com/DistributionService/MyEventsService/Tags?apiKey={{YourApiKey}}
&referrer={{YourRegisterdDomain}}

[
	{
		Name: "Level1 Tag",
		Code: "LV1T"
	},
	{
		Name: "Another Level1 Tag",
		Code: "AL1T",
		Children: [
			{
				Name: "Level2 Tag",
				Code: "LV2T"
			},
			{
				Name: "Another Level2 Tag",
				Code: "AL2T"
			}
		]
	}
]

Replace {{apiKey}} with the API Key you were sent in this package; 
and {{YourRegisterdDomain}} with one you used to request the white label.


	- retrurn only products tagged with "Another Level1 Tag" (Includes all its sub categories)
		var categories = ['AL1T'];

	- return only products tagged with Level2 Tag (No other "Another Level1 Tag" events will be returned)
		var categories = ['LV2T'];
	
	- return only products tagged with "Level1 Tag" or "Level2 Tag"
		var categories = ['LV1T','LV2T'];


-------------------------------------------------------------------------------

defaultDateRange: dictates the default date range applied to searches.
This is applied if a user does not explicitly choose a default range.

As well as setting this, you should also set the appropriate HTML in your
search.html page. The date ranges are in a <ul> (selector is
searchIOSettings.dateRanges - '#atdwSearchDateRanges' by default). Add the 
"selected" attribute to the appropriate <li> to have it show as selected by
default.

The value of defaultDateRange should match one of the date ranges in the
aforementioned <ul>. These ranges are:
All, Today, This Weekend, This Week, Next Week, and This Month.

Example:
	defaultDateRange = 'All';

-------------------------------------------------------------------------------

autoUpdateFilters: determines whether user interaction with the search filters 
will automatically update the search results.

Default value: true

True: The user does not need to click any buttons after changing filters in 
order to update search results, update and reset buttons are hidden.

False: The user needs to click 'update search' button in order to update the
search results. Update and reset buttons are shown at the bottom of the filters.

Example:
	autoUpdateFilters = true;

-------------------------------------------------------------------------------
locationsType : this parameter configures the 'location' field.

Default value: postcodes

postcodes: The location field will be rendered as an auto-complete field. That is,
the user starts typing and a list of suggested values are displayed. This list is
populated with a list of all suburbs and postcodes for your given state. When a 
user of the page enters a postcode or suburb, the site will filter all results 
that appear in this postcode. By selecting this location type - you should consider
ensuring your locations.regions object (described above in this Readme) is empty to
avoid location conflicts occurring during search.

regions: The location field will be rendered asa drop down list. The list will 
be populated with a list of all the regions for your given state. When a user of 
the page enters a region, the site will display all the results that appear in 
that region. By selecting this location type - you should consider
ensuring your locations.regions object (described above in this Readme) is empty to
avoid location conflicts occurring during search.

-------------------------------------------------------------------------------
---------------------Theming, Styling, and Branding----------------------------
-------------------------------------------------------------------------------

The white label site can easily be branded to any desired colour scheme.

The search page has this layout:
<div class="atdw-wls-page">
	<div class="page-container">
		<div class="header">...</div>
		<div class="search">...</div>
		<div class="content">...</div>
		<div class="footer">...</div>
	</div>
</div>

The event page has this layout:
<div class="atdw-wls-page">
	<div class="page event-page">
		<div class="page-container">
			<div class="header">...</div>
			<div class="search">...</div>
			<div class="content">...</div>
			<div class="footer">...</div>
		</div>
	</div>
</div>

The header is a good place to show a banner and some navigation links. The
footer is a good place for additional navigation.

Alternatively, you can embed the search and event pages into a larger web 
application, using a master page or similar templating system. In this case 
you may wish to remove the header and footer. You should keep the search and
content divs, as well as the parent containers, if you wish to keep the default
page structure.

All styling for the white label site is contained in the /css folder.
default.css contains @import statements for search-results.css and 
event-details.css. If you prefer you can remove the @import statements and
reference the appropriate css file from the search/event pages directly.

Every selector in the css files begins with the .atdw-wls-page prefix, to
prevent clashes with master pages.

Styling for the jQuery UI calendar and autocomplete list is included in the
default.css. The autocomplete list is the only exception to the .atdw-wls-page
rule in that the list of locations that appears when the location box is typed
into is written to the DOM at the bottom of the <body> tag, outside any other
containers.

-------------------------------------------------------------------------------
---------------------------Event Page------------------------------------------
-------------------------------------------------------------------------------

These settings only have an impact on how the event page displays.

var eventSettings = {}; 

----------------------Event Details Labels and Titles--------------------------

pageTitlePrefix: the prefix that will appear before the event's name in the page's
<title> tag. the event's name is written directly after the end of the string.
Example:
	eventSettings.pageTitlePrefix = 'Event Details - ';
	this will set the <title> to something like 
	<title>Event Details - Australian Open</title>

eventDateOrder: the order of date elements in the "calendar"-style box next to
the event's image. This should be an array of strings, where the possible string
values are "weekday", "date", "month", and "year".
Example:
	myevents.eventDateOrder = ['weekday', 'date', 'month', 'year'];

venuesTitle: the text label for the event's venue
Example:
	eventSettings.venuesTitle = 'Where: ';
	
typeTitle: the text label for the event's type
Example:
	eventSettings.typeTitle = 'Type: ';
	
descriptionTitle: the text label for the event's description
Example:
	eventSettings.descriptionTitle = 'Event Description';
	
contactTitle: the text label for the event's contact details
Example:
	eventSettings.contactTitle = 'Contact: ';
	
otherDatesTitle: the text label for the event's last date
Example:
	eventSettings.otherDatesTitle = 'Event runs until: ';
	
freeEntryTitle: the text label for a free entry event
Example:
	eventSettings.freeEntryTitle = 'FREE ENTRY';
	
contactWebsiteLabel: the text label for an event's website
Example:
	eventSettings.contactWebsiteLabel = 'Website: ';
	
contactEmailLabel: the text label for an event's email address
Example:
	eventSettings.contactEmailLabel = 'Email: ';
	
contactPhoneLabel: the text label for an event's phone number
Example:
	eventSettings.contactPhoneLabel = 'Phone: ';
	
----------------------------Selectors------------------------------------------

Unless otherwise specified, these are CSS/jQuery selectors.

searchBoxSelector: the selector for the main search box at the top of the site.
If this is changed from the default, it's recommended you do so on the search 
page and the event page, and that you use the same selector on both.
Example:
	eventSettings.searchBoxSelector = '#atdwSearchText';

loadingIndicator: The class applied to the loading indicator.
Note: this is not a selector; there is no preceeding "."
Example:
	eventSettings.loadingIndicator = 'atdw-loading-spinner';

displayContainer: the container in which the event details page will render
itself.
Example:
	eventSettings.displayContainer = '#atdwSearchText';

-------------------------------------------------------------------------------
---------------------------Search Page-----------------------------------------
-------------------------------------------------------------------------------

These settings only have an impact on how the search page displays.

---------------------------------Configuration---------------------------------

var searchSettings = {};

defaultResultsPerPage: dictates how many event listings should show per page
by default. This should be one of the numbers that appears in the list with
selector searchIOSettings.resultsPerPage (by default this selector is 
'.resultCount'). By default, numbers 10, 25, and 50 are available, and 10 is 
set. You can change which numbers are available in the search page HTML.
Example:
	searchSettings.defaultResultsPerPage = 10;
	
----------------------------Selectors------------------------------------------

Unless otherwise specified, these are CSS/jQuery selectors.

var searchIOSettings = {};

searchResultsContainer: the container for all search results.
Example:
	eventSettings.searchResultsContainer = '#atdwSearchResultsOutput';
	
tagsList: the <ul> tag that contains the list of tags (categories)
Example:
	eventSettings.tagsList = '#atdwTags';
	
calendar: the class for the date picker
Example:
	eventSettings.calendar = 'div.atdw-multidatepicker';
	
calendarAltField: the hidden field that is used for calendar data storage.
It is not recommended that this be changed.
Example:
	eventSettings.calendarAltField = '#atdwEventDates';
	
dateRanges: the list of date ranges that is used to quickly choose calendar
dates. searchSettings.defaultDateRange must appear in this list.
Example:
	eventSettings.dateRanges = '#atdwSearchDateRanges';
	
dateRangeDisplaying: the text field that outputs which date ranges are showing
in the current search. (eg. "This Week")
Example:
	eventSettings.dateRangeDisplaying = '.date-title .date-range-displaying';
	
datesDisplaying: the text field that outputs which dates are showing in the
current search. (eg. "Monday April 2nd, 2012 to Friday April 6th, 2012")
Example:
	eventSettings.datesDisplaying = '.date-title .dates-displaying';
	
locationsTextBox: The class applied to every textbox used for location searches.
It is not recommended this be changed.
Example:
	eventSettings.locationsTextBox = '.atdwLocationText';
	
locationsList: The class for the <ul> that contains all the textboxes used for
location searches.
Example:
	eventSettings.locationsList = '.atdwAutocompleteList';
	
locationsListID: The ID for the <ul> that contains all the textboxes used for
location searches.
Example:
	eventSettings.locationsListID = '#atdwAutocompleteList';
	
resultsFilteredBy: The ID of the <ul> that contains a list of filters that have
been searched by (date, category, etc.)
Example:
	eventSettings.resultsFilteredBy = '#atdwResultsFilteredBy';
	
resultFilter: The class applied to each <li> in eventSettings.resultsFilteredBy.
Example:
	eventSettings.resultFilter = '.resultFilter';
	
resultsPerPage: The class applied to each available number of results per page.
See also: searchSettings.defaultResultsPerPage.
Example:
	eventSettings.resultsPerPage = '.resultCount';
	
pagingContainer: The ID applied to the <div> that contains the clickable list
of page numbers.
Example:
	eventSettings.pagingContainer = '#atdwPaging';
	
pageNumber: The class applied to every page number in the clickable list of
page numbers.
Example:
	eventSettings.pageNumber = '.pageNumber';
	
resultsDisplaying: The class for the text area that dictates which results are
currently displaying (eg. "Displaying 10 of 22 results")
Example:
	eventSettings.resultsDisplaying = '.results-displaying';
	
textSelectDisabled: The class(es) which have text selection disabled. This
prevents text from inadvertantly getting highlighted when (for example)
selecting a date range.
Example:
	eventSettings.textSelectDisabled = '.atdw-tags, .date-ranges, .types, .result-per-page, .paging';
	
loadingIndicator: The class applied to the loading indicator.
Note: this is not a selector; there is no preceeding "."
Example:
	eventSettings.loadingIndicator = 'atdw-loading-spinner';

filterGroupButtons	: The class(es) applied to the update buttons container. These buttons
can be hidden via the above parameter 'autoUpdateFilters'. Update this class 
	eventSettings.filterGroupButtons = '.filter-group.buttons';