(function () {
    'use strict';

    if (!poof.utils || !poof.format || !poof.passageNames || !poof.config) {
        // something went horribly wrong
        console.error('LOAD ORDER ERROR!');
        return;
    }

    if (poof.config.parse) {
        poof.passages.forEach( function (passage) {
            if (poof.utils.stringNotEmpty(passage.source)) {
                // get the parsers
                var parsers = poof.utils.getParsers(poof.format.name);
                // get a list of passages linked/referred to by this passage
                passage.links.to = poof.utils.filterPassages(poof.utils.parse(passage.source, parsers));
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

}());