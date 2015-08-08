# CrossCompare.js
CrossCompare is a JavaScript library for quickly comparing charts built using [dc.js](https://dc-js.github.io/dc.js/). Bundled with [crossfilter](http://square.github.io/crossfilter/), dc.js provides fantastic in-browser dimenional filtering and charting. CrossCompare now adds the ability to quickly compare different filter states in a separate chart.

CrossCompare started as a Master of Science project for Software Development at the [University of Glasgow](http://www.gla.ac.uk/schools/computing/). This project is meant to evaluate the marketablility of open-source, web-based dashboard tools and seeks to advance its status quo.

Please feel free to utilise, explore, enhance, or give feedback. Special thank's to the authors of [jQuery](https://jquery.com/), [d3.js](http://d3js.org/), [crossfilter](http://square.github.io/crossfilter/), [dc.js](https://dc-js.github.io/dc.js/), [c3.js](http://c3js.org/), [AdminLTE](https://almsaeedstudio.com/AdminLTE), [bootstrap](http://getbootstrap.com/), [smoothscroll](https://github.com/cferdinandi/smooth-scroll), and [popup overlay](http://dev.vast.com/jquery-popup-overlay/)!

# CrossCompare Usage
[Download](http://rrothfeld.github.io/CrossCompare-js/download/crosscompare.zip) the crosscompare zip-file and extract it into your web page folder. Include the JavaScript-file within your webpage. Set up and customize CrossCompare for your usage according to the [API](http://rrothfeld.github.io/CrossCompare-js/docs.html) or the [tutorial](http://rrothfeld.github.io/CrossCompare-js/tutorial.html) - a great starting place for a new CrossCompare application.

# Installation (replica web site)
This repository holds all code for the web site shown under: http://rrothfeld.github.io/CrossCompare-js/. 

 1. Have [Node.js](https://nodejs.org/) and [git](https://git-scm.com/) installed
 2. Clone this repository: `git clone https://github.com/RRothfeld/CrossCompare-js.git` 
 3. Cd into the created folder: `cd CrossCompare-js`
 4. Install node modules: `npm install`
 5. Run the application: `npm start`
 6. Open [http://localhost:3000/](http://localhost:3000/) in your web browser

A possible error upon executing `npm start` may be the result of the default port `3000` being occupied by another service. If so, simply change line 11 in app.js to another port number and run `npm start` again.

# CrossCompare Testing
Unit testing of CrossCompare's functions is done using [mocha](http://mochajs.org/) with the help of [chai assertion library](http://chaijs.com/).

To run the testing code, simply run execute  `./node_modules/.bin/mocha` from within the CrossCompare-js folder.

# CrossCompare Experiment Set-up
The experiment access is not shown on the main page, yet can be accessed via opening [http://localhost:3000/experiment](http://localhost:3000/experiment) in your web browser when the CrossCompare-js Node.js server is running (see 'Installation').