/**
 * Wiki tool.
 */


/**
 *
 * @returns {boolean}
 */
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    var streetStr = $('#street').val();
    var cityStr = $('#city').val();
    var address = streetStr + ', ' + cityStr;

    // $greeting.text('So, you want to live at ' + address + '?');


    //// load nytimes
    //var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + cityStr + '&sort=newest&api-key=3abc9a3d23e60b38c21b4ab9b0a91c07:17:69911633'
    //$.getJSON(nytimesUrl, function(data){
    //
    //    $nytHeaderElem.text('New York Times Articles About ' + cityStr);
    //
    //    articles = data.response.docs;
    //    for (var i = 0; i < articles.length; i++) {
    //        var article = articles[i];
    //        $nytElem.append('<li class="article">'+
    //            '<a href="'+article.web_url+'">'+article.headline.main+'</a>'+
    //            '<p>' + article.snippet + '</p>'+
    //        '</li>');
    //    };
    //
    //}).error(function(e){
    //    $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
    //});



    //// load wikipedia data
    //var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityStr + '&format=json&callback=wikiCallback';
    //var wikiRequestTimeout = setTimeout(function(){
    //    $wikiElem.text("failed to get wikipedia resources");
    //}, 8000);
    //
    //$.ajax({
    //    url: wikiUrl,
    //    dataType: "jsonp",
    //    jsonp: "callback",
    //    success: function( response ) {
    //        console.log(response);
    //        var articleList = response[1];
    //
    //        for (var i = 0; i < articleList.length; i++) {
    //            articleStr = articleList[i];
    //            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
    //            $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
    //        };
    //
    //        clearTimeout(wikiRequestTimeout);
    //    }
    //});

    return false;
}

$('#form-container').submit(loadData);

// loadData();

var Times = function() {

};

/**
 * @description Object to hold the wikipedia URL and String
 * @param article {string} Article Name
 * @constructor
 */
var Wiki = function(article) {
    // A "`ko.observable`" object to hold the wiki URL
    self.wikiUrl = ko.observable('http://en.wikipedia.org/wiki/' + article);
    self.wikiString = ko.observable(article);
};

/**
 * @description A `"ko.viewModel"`
 * @constructor
 */
var ViewModel = function() {
    // Create a copy of `"this"`.
    var self = this;

    /**
     * @description Define normal "`ko.observable`" variables.
     */
    self.greeting = ko.observable("Where do you want to live?");
    self.street = ko.observable('');
    self.city = ko.observable();
    self.address = ko.observable();
    self.streetViewUrl = ko.observable();

    self.nyTimesHeader = ko.observable('');
    self.articles = ko.observableArray([]);

    self.wikiHeader = ko.observable('Relevant Wikipedia Links');
    self.wikiError = ko.observable('Type in an address above and find relevant Wikipedia articles here!');
    self.articleList = ko.observableArray([]);


    /**
     * Define "`ko.computed`" variables.
     */
    self.nytimesUrl = ko.pureComputed(function() {
        return 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + self.city() + '&sort=newest&api-key=3abc9a3d23e60b38c21b4ab9b0a91c07:17:69911633';
    }, this);

    self.wikipediaApiUrl = ko.pureComputed(function() {
        return 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.city() + '&format=json&callback=wikiCallback';
    });

    /**
     * Set the "`address`" observable
     *
     * @returns {boolean}
     */
    self.setAddress = function() {
        self.address(self.street() + ", " + self.city());
        return true;
    };

    /**
     * Set the "`streetViewUrl`" based on submitted data.
     * Depends on the setAddress function being called first.
     */
    self.setStreetViewUrl = function() {
        self.streetViewUrl('http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' +
            self.address() + '');
    };

    /**
     *  Get "`articles`" from the NY Times articlesearch API
     */
    self.getNewYorkTimesArticles = function() {
        $.getJSON(self.nytimesUrl(), function(data){

            console.log(data);
            self.nyTimesHeader('New York Times Articles About ' + self.city());

            self.articles(data.response.docs);
        }).error(function(e){
            self.nyTimesHeader('New York Times Articles Could Not Be Loaded');
        });
    };

    /**
     * @description Retrieve all of the articles from wikipedia.
     */
    self.getWikipediaArticles = function() {
        /**
         * @description create object for wiki API issues.
         * @type {number}
         */
        var wikiRequestTimeout = setTimeout(function(){
            self.wikiError("failed to get wikipedia resources");
        }, 8000);

        self.wikiError('');
        $.ajax({
            url: self.wikipediaApiUrl(),
            dataType: "jsonp",
            jsonp: "callback",
            success: function( response ) {
                console.log(response);
                var articleLists = response[1];

                for (var i = 0; i < articleLists.length; i++) {
                    self.articleList.push(new Wiki(articleLists[i]));
                }

                clearTimeout(wikiRequestTimeout);
            }
        });

    };

    /**
     * Handle updating information when the form is submitted.
     *
     * @param formElement
     * @returns {boolean}
     */
    self.loadData = function(formElement) {
        self.setAddress();
        self.greeting('So, you want to live at ' + self.address() + '?');
        self.setStreetViewUrl();
        self.getNewYorkTimesArticles();
        self.getWikipediaArticles();
        return true;
    };

};
ko.applyBindings(new ViewModel());