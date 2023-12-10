This project is an exploration of top marathon finishers from 5 of the World Major Marathons with an extra emphasis placed on the 2019 rendition of the Boston Marathon. It is primarily focused on the demographics of these athletes with additional focus placed on the history of these incredibly important events. While most of these visualizations will display correctly for any screen size, slides 3 and 10 may display incorrectly for smaller screens. If this issue is encountered, please reduce your browser zoom to 75%.

### IMPORTANT URLS ###
TODO

### DATA SOURCES ###
Data used for this project came from the following sources before being cleaned and preprocessed for certain visualizations.

Pre-Existing Datasets:
Boston Marathon (1897-2019): https://github.com/adrian3/Boston-Marathon-Data-Project
Berlin Marathon (Longer Record without Names): https://github.com/moralescastillo/datasets/blob/main/1974_2023_results.csv
London Marathon: https://www.kaggle.com/datasets/kevinegan/london-marathon-results
Boston Marathon Course GeoJSON: https://gist.github.com/jwass/11119254?short_path=07dfe3d
World Map GeoJSON: https://github.com/datasets/geo-countries/blob/master/data/countries.geojson

Data Obtained Through Scraping:
Berlin Marathon (Truncated Version with Names): https://www.bmw-berlin-marathon.com/en/impressions/statistics-and-history/results-archive/
Boston Marathon (2021-2023): https://www.marathonguide.com/results/browse.cfm?MIDD=15230417
Chicago Marathon: https://www.chicagomarathon.com/runners/race-results/
New York Marathon: https://results.nyrr.org/event/M2023/finishers
Conversion of IOC to ISO-3 Country Codes: https://en.wikipedia.org/wiki/Comparison_of_alphabetic_country_codes

Due to the unusual format and language discrepancy present in the Tokyo results they were unfortunately unable to be obtained and used for this project.

### LIBRARIES ###
This project primarily made use of D3 and Bootstrap across almost all visualizations but the following aspects were sourced from other libraries:
Leaflet - Creation of the Boston Marathon course map
	- The code for the drawing animation for this visualization was also external and can be found here: https://github.com/IvanSanchez/Leaflet.Polyline.SnakeAnim
NoUISlider - Creation of the various sliders across the project

### CODE RESPONSIBILITIES ###
While there was collaboration throughout every aspect of the project, the following members was primarily responsible for the following files
Collaborative: index.html, main.js, styles.css
Ben: mapVis.js, pieChart.js, stackedBar.js, checkboxListeners.js
Sang: factVis.js, marathonMapVis.js, networkVis.js, popularityVis.js, scroll.js
Julian: dotVis.js, winnersTable.js

### OVERVIEW ###
Slide 1: A title slide to introduce the project and show the user how to move throughout the visualization. The user can proceed from this slide by scrolling or clicking one of the bubbles on the right side of the page.

Slide 2: An introduction to the Boston Marathon including a leaflet visualization of its course. Notable locations are highlighted using markers. Upon entering this slide, the map will display starting from the beginning of the course and ending at the finish to mirror the direction the marathon follows.

Slide 3: Two linked visualizations highlighting the changes in the Boston Marathon over time. The first is a line chart demonstrating the number of male and female athletes from 1897 to 2019. There is a slider at the top that allows the user to narrow the scope of time shown on the chart. Additionally, the user can interact with this visualization using a tooltip that appears when they hover over a point. Below this visualization is a timeline with bubbles corresponding to years from 1990 to 2020. Upon clicking one of these bubbles, the user will be prompted with a fact about the Boston Marathon from that specific year. Clicking a bubble will also cause the line chart above it to filter and focus on the year selected. 

Slide 4: Two linked visualizations exploring the demographics of finishers from the Boston Marathon in 2019. The larger visualization is a world map that encodes the number of finishers from a given country using intensity of color (specifically blue). This visualization can be filtered using two dropdown menus on the right side of the page. The first of these allows the user to select the "finish criteria" displayed on the map. In other words, if all finishers is selected, the map will display the home countries of all finishers. However, if top three finishers is selected, only the home countries of the men/women who finished in the top 3 of their respective races will be shown on the map. The second menu is a dropdown that allows the user to select and deselect which sexes to display on the map. If only male is unchecked, only data from female finishers will be displayed. Upon hovering over a country, the user can see both the country name and the number of finishes that match the criteria specified in the dropdown. Additionally, there is a marker to indicate the location of Boston, MA to highlight the location of the Boston Marathon. The second visualization on this slide is a donut chart. If the user clicks on a country, this donut chart will display the name of the country and the number of finishes in text. The content of the donut chart itself displays the breakdown of sex by finishers from a given country. This visualization also has a tooltip. The donut chart is responsive to changes in "finish criteria" but not sex as allowing for this would mean that this visualization would lose functionality if a sex was selected.

Slide 5: A transition slide to introduce the other marathon majors and provide a bit of context about them.

Slide 6: Two linked visualizations that mirror the visualizations from slide 4 but encode information about top finishers from Boston, London, Chicago, and New York over a range of years. The functionality of this slide is very similar to slide 4 so only the differences will be mentioned here. The markers display the location of all six world major marathons rather than just Boston. The "finish criteria" dropdown only allows for exploration of top 100 and above finishers. The sex dropdown has been replaced with a dropdown that includes both sex and marathon. The user is able to check and uncheck both sexes and marathons to see responses in the display on the map. As before, this dropdown does not affect the donut chart. Below this is a year slider that allows the user to specify the range of years over which they want to see data. This slider does update the donut chart. The donut chart by default will display sex, as before, but can be toggled using the button below it to show breakdown by marathon for the selected country.

Slide 7: A slide to reinforce an observation the user may have made in the following visualziation and introduce an important idea for the next visualization if they did not make this observation. The left features text while the right features a simple visualization that displays winners from these marathons from 1994 to 2017 and highlights an athlete's name in red if they are from Ethiopia or Kenya. To the left of each name there is a unicode character representing the name of the athlete's home country. On Mac, these unicode characters should display as the flags corresponding to the specified countries. 

Slide 8: A stacked bar chart demonstrating the number of unique athletes that have won these marathons from 2014 to 2023 for each of the 5 countries with the most such athletes. The number of athletes who have won multiple times is shown in blue while the number of athletes who have only won once in this time period is shown in red. The user can further explore this information using a tooltip that appears when they hover over a bar. Percentages of finishers from each category are demonstrated numerically using text on either side of the bar. Percentage of repeat finishers is on the left while one-off winners are shown on the right. The visualization can be altered to show top three finishers rather than winners by clicking a button at the top of the page.

Slide 9: A transition slide further exploring the idea of Kenyan/Ethipoian excellence in these events. This page includes a link to an external research paper on the topic for those who are interested in learning more.

Slide 10: An innovative bubble network visualization with multiple views that display different information. In its primary form, this visualization shows which countries are shared between these marathons. Each marathon is represented using a bubble with a distinct color and label. Each country is represented using an orange bubble labeled with its ISO-3 country code. The size of these country bubbles represent the number of top 100 finishers from these countries that competed from 2014-2023. Each of these country bubbles is connected to a marthon by a thin grey line if there was at least one runner from that country in the top 100 of the given marathon within the timespan. An additional "unknown" category was added to include athletes whose country was not specified in the results. If the user clicks and drags a country bubble, they are able to move it throughout the SVG area but it will return to its cluster after being released. The user is also able to move marathon bubbles but they will stay where the user puts them. In addition, while the user is holding down a click on a marathon bubble, all country bubbles with connections to that marathon will cluster around it but return to its previous clusters upon being released. The second view of this visualization can be triggered by clicking the buttons at the bottom of the screen. Upon selecting a marathon, only that marathon and its associated country bubbles will be shown. Additionally, this will also display a button saying "Click to See Top Performers". Upon clicking on this button, the countries with the top 10 performances over the timespan will be shown. The country will be shown using a country Bubble as in the previous view. To the right of this bubble there will be a bar demonstrating the time (it increases as you move down) along with text displaying the time, name of the athlete, and year that the performance occurred. Names are not displayed for Berlin as the data was not available. The user can return to the first view by clicking the "All" button at the bottom of the screen.

Slide 11: An innovative beeswarm/raincloud plot that displays the distribution of finishing times throughout each of the marathons for a given year. Upon entering this slide, the user is prompted to "Bring in the Runners". Upon clicking this button, the dots will enter the viewable region akin to runners coming across a finish line. Each of these bubbles indicate a top 100 finisher. For each marathon (with the exception of 2020 due to many races not being run/having smaller fields) there are 200 dots present, 100 men and 100 women. The dots for a given marathon are color coded to match the colors used for the marathons throughout the project and match the text labels on the left. Upon hovering over a dot, the user can see information about that runner in a tooltip. At the bottom of the page, the user is able to select a country. Upon doing so, the runners from that country will be highlighted with a greater intensity. There are a few years where country data was not available. In this case, no highlighting will occur. While most of these options are self explanatory, the "host country" option will show athletes from the country where the marathon is being held (e.g. an American athlete will be highlighted for the Boston Marathon but a German athlete will be highlighted for Berlin). Next to this dropdown is a slider where the user is able to select a year to display.

Slide 12: A brief conclusion slide to close out the ideas presented in the project.


