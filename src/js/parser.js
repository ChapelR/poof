(function () {
    'use strict';

    if (!poof || !poof.utils || !poof.format || !poof.passageNames || !poof.config) {
        // something went horribly wrong
        console.error('BUILD ERROR!');
        return;
    }

    var parserList = {
        // a set of regexps, their ids, and the group index referring to a passage
        generic : [
            // parse generic link markup
            {  
                // [[link|passage]]
                name : 'generic-pipe',
                regex : /\[\[(.*?)\|(.*?)]]/g,
                group : 2
            },
            {
                // [[passage]]
                name : 'generic-passage',
                regex : /\[\[(.*?)]]/g,
                group : 1
            },
            {
                // [[passage<-link]]
                name : 'generic-pFirst',
                regex : /\[\[(.*?)<-(.*?)]]/g,
                group : 1
            },
            {
                // [[link->passage]]
                name : 'generic-pLast',
                regex : /\[\[(.*?)->(.*?)]]/g,
                group : 2
            }
        ],
        sugarcube : [
            // parse SugarCube macros that refer to passages
            {
                // <<link 'link' 'passage'>> -or- <<button 'link' 'passage'>>
                name : 'linkMacro',
                regex : /<<(link|button)\s*["'](.*?)["']\s*['"](.*?)['"]\s*?>>/g,
                group : 3
            },
            {
                // <<goto 'passage'>>
                name : 'gotoMacro',
                regex : /<<goto\s*["'](.*?)["']\s*?>>/g,
                group : 1
            },
            {
                // <<include 'passage'>> -or- <<display 'passage'>>
                name : 'includeMacro',
                regex : /<<(include|display)\s*["'](.*?)["']\s*?.*?>>/g,
                group : 1
            }
        ],
        harlowe : [
            {
                // (link-goto: 'link', 'passage') -or- (click-goto: 'hook/string', 'passage')
                name : 'linkMacro',
                regex : /\((link|click)-?go-?to:\s*?["'](.*?)['"],\s*?['"](.*?)['"]\s*?\)/g,
                group : 3
            },
            {
                // (link-reveal-goto: 'link', 'passage')
                name : 'linkRevealMacro',
                regex : /\((link|click)-?reveal-?go-?to:\s*?["'](.*?)['"],\s*?['"](.*?)['"]\s*?\)/g,
                group : 3
            },
            {
                // (goto: 'passage')
                name : 'gotoMacro',
                regex : /\(go-?to:\s*?["'](.*?)['"]\s*?\)/g,
                group : 1
            },
            {
                // (display: 'passage')
                name : 'includeMacro',
                regex : /\(display:\s*?["'](.*?)['"]\s*?\)/g,
                group : 1
            }
        ]
    };

    function setUpParsers (format) {
        // get the parsers we need based on the format
        if (parserList[format] && format !== 'generic') {
            return parserList.generic.concat(parserList[format]);
        } else {
            // if format is not set up with parsers, just parse markup links
            return parserList.generic;
        }
    }

    function parse (passageText, parsers) {
        if (typeof passageText === 'object' && passageText.source && typeof passageText.source === 'string') {
            // if we got a passage object, grab its source code
            passageText = passageText.source;
        }
        if (typeof passageText !== 'string') {
            // if we can't read the source, bail out with an error message in the console, but keep running the app
            console.warn('parsers -> passage text could not be found.');
            return;
        }
        var passages = [];
        parsers.forEach( function (parser) {
            var ret = [];
            // find each valid passage reference 
            var matches = passageText.match(parser.regex);
            if (matches) {
                matches.forEach( function (match) {
                    // parse each passage reference
                    var parsed = parser.regex.exec(match);
                    if (parsed) {
                        // get the passage
                        var psg = parsed[parser.group];
                        if (!ret.includes(psg)) {
                            ret.push(psg);
                        }
                    }
                });
            }
            if (ret.length) {
                passages = passages.concat(ret);
            }
        });
        return passages;
    }

    // set up the format-based parsers
    var parsers = setUpParsers(poof.format.name);

    function parseAllPassages () {
        // run each passage through the parser
        poof.passages.forEach( function (passage) {
            if (poof.utils.stringNotEmpty(passage.source)) {
                // get a list of passages linked/referred to by this passage
                passage.links.to = poof.utils.filterPassages(parse(passage.source, parsers));
                // add data to the linked-to passages
                passage.links.to.forEach( function (psg) {
                    var idx = poof.passages.findIndex( function (passage){
                        return psg === passage.name;
                    });
                    poof.passages[idx].links.from.push(passage.name);
                });
            }
        });
    }

    if (poof.config.parse) {
        // check config and parse
        parseAllPassages();
    }

    poof.parser = { // export to poof API
        getParsers : setUpParsers,
        parsers : parsers,
        parsePassageSource : parse,
        parse : parseAllPassages
    };

}());