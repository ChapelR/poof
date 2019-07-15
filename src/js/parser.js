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
                // normal link markup
                name : 'markup',
                regex : /\[{2,}(.*?)](\[.*?])?]{1,}/gi,
                group : 1
            }
        ],
        sugarcube : [
            // parse SugarCube macros that refer to passages
            {
                // <<link 'link' 'passage'>> -or- <<button 'link' 'passage'>>
                name : 'linkMacro',
                regex : /<<(link|button)\s*["'](.*?)["']\s*['"](.*?)['"]\s*?>>/gi,
                group : 3
            },
            {
                // <<goto 'passage'>>
                name : 'gotoMacro',
                regex : /<<goto\s*["'](.*?)["']\s*?>>/gi,
                group : 1
            },
            {
                // <<include 'passage'>> -or- <<display 'passage'>>
                name : 'includeMacro',
                regex : /<<(include|display)\s*["'](.*?)["']\s*?.*?>>/gi,
                group : 2
            }
        ],
        harlowe : [
            {
                // (link-goto: 'link', 'passage') -or- (click-goto: 'hook/string', 'passage')
                name : 'linkMacro',
                regex : /\((link|click)-?go-?to:\s*?["'](.*?)['"],\s*?['"](.*?)['"]\s*?\)/gi,
                group : 3
            },
            {
                // (link-reveal-goto: 'link', 'passage')
                name : 'linkRevealMacro',
                regex : /\((link|click)-?reveal-?go-?to:\s*?["'](.*?)['"],\s*?['"](.*?)['"]\s*?\)/gi,
                group : 3
            },
            {
                // (goto: 'passage')
                name : 'gotoMacro',
                regex : /\(go-?to:\s*?["'](.*?)['"]\s*?\)/gi,
                group : 1
            },
            {
                // (display: 'passage')
                name : 'includeMacro',
                regex : /\(display:\s*?["'](.*?)['"]\s*?\)/gi,
                group : 1
            }
        ],
        chapbook : [
            {
                // {link to 'passage' ... }
                name : 'linkInsert',
                regex : /{\s*?link\s+to\s+["'](.*?)["'].*?}/gi,
                group : 1
            },
            {
                // {embed passage: 'passage'} -or- {embed passage named: 'passage'}
                name : 'embedInsert',
                regex: /{\s*?embed\s+passage(\s+named)?:\s+["'](.*?)["']\s*?}/gi,
                group : 2
            },
            {
                // {reveal link: 'text', passage: 'passage' ... }
                name : 'revealInsert',
                regex: /{\s*?reveal\s+link:.*?passage:\s+?['"](.*?)["'].*?}/gi,
                group : 1
            }
        ]
    };

    function handleMarkupLink (string) {
        if (string[0] === '[' && string[1] === '[') {
            // trim markup if necessary
            string = string.substr(2, string.length - 2);
        }
        
        if (string.includes('|')) {
            // [[link|(passage)]]
            return string.split('|')[1] || string;
        }
        if (string.includes('->')) {
            // [[link->(passage)]]
            return string.split('->')[1] || string;
        }
        if (string.includes('<-')) {
            // [[(passage)<-link]]
            return string.split('<-')[0] || string;
        }
        return string;
    }

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
            console.warn('reference parser -> passage text could not be found.');
            return;
        }
        var passages = [];
        var source = poof.utils.unescape(passageText);
        parsers.forEach( function (parser) {
            var ret = [];
            // find each valid passage reference 
            var matches = source.match(parser.regex);
            if (matches) {
                matches.forEach( function (match) {
                    var parsed = parser.regex.exec(match) || parser.regex.exec(match),
                        psg;
                    if (!parsed && parser.name === 'markup') {
                        match = match.replace(/\[+/g, '[[').replace(/(]\[.*]+|]+)/g, ']]');
                        // simplified link parser
                        parsed = (/\[{2,}(.*?)]{2,}/g).exec(match);
                    }
                    if (parsed) {
                        psg = parsed[parser.group];
                        if (parser.name === 'markup') {
                            // handle generic markup links
                            psg = handleMarkupLink(psg);
                        }
                        if (!ret.includes(psg)) {
                            // only one reference needed
                            ret.push(poof.utils.unescape(psg));
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
                    var passageFrom = poof.passages[idx];
                    if (passageFrom && !passageFrom.links.from.includes(passage.name)) {
                        passageFrom.links.from.push(passage.name);
                    }
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