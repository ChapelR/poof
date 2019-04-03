(function () {
    'use strict';

    window.poof = window.poof || {};

    function handleNotLoadedScript (name) {
        // do something here
        console.error('Script: "' + name + '" is not loaded...');
        return false;
    }

    function hasScript (gl) {
        if (!window[gl]) {
            // an external script is missing or not loaded
            return handleNotLoadedScript(gl);
        }
        return true;
    }

    function twArchive () {
        return $(document.createDocumentFragment())
            .append(document.createTextNode($('tw-storydata')[0].outerHTML)).text();
    }

    var PDFStyles = {
        styles : {
            storyTitle : {
                fontSize : 22,
                bold : true,
                alignment : 'center'
            },
            ifid : {
                fontSize : 14,
                alignment : 'center'
            },
            title : {
                fontSize : 16,
                bold : true,
                alignment : 'center'
            },
            tags : {
                fontSize : 12,
                italics : true
            },
            content : {
                fontSize : 12
            }
        }
    };

    function createPDF (name) {
        if (!pdfMake) {
            alert('Creating a PDF requires an Internet connection.');
        }
        var passages = $('div.passage-card').toArray();
        var content = [ 
            { text : 'Story: ' + poof.data.name + '\n\n', style : 'storyTitle' }, 
            { text : 'IFID: ' + poof.data.ifid + '\n\n\n\n', style : 'ifid' } 
        ];
        passages.forEach( function (psg) {
            if ($(psg).hasClass('hide')) {
                return;
            }
            var passage = poof.passages.find(function (p) { 
                return Number($(psg).attr('data-pid')) === p.id; 
            });
            if (passage && typeof passage === 'object') {
                content.push({ text : '\n\n' + passage.name, style : 'title' });
                if (passage.tags) {
                    content.push({ text : "\n\nTags: " + passage.tags, style : 'tags' });
                }
                content.push({ 
                    text : '\n\n' + poof.esc.unescape(passage.source) + '\n\n', 
                    style : 'content', 
                    preserveLeadingSpaces : true
                }); 
            }
        });
        var def = PDFStyles;
        def.content = content;
        pdfMake.createPdf(def).download(name);
    }

    function createTweeExport () {
        var passages = $('div.passage-card').toArray();
        var content = [];
        passages.forEach( function (psg) {
            if ($(psg).hasClass('hide')) {
                return;
            }
            var passage = poof.passages.find(function (p) { 
                return Number($(psg).attr('data-pid')) === p.id; 
            });
            content.push(poof.p2tw(passage));
        });
        content = content.join('\n\n');
        return poof.esc.unescape(poof.data2tw() + content);
    }

    function safeName (str) {
        return str.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .trim();
    }

    function createDownload (fileExt) {
        var loaded = hasScript('download');
        if (loaded) {
            // creates downloads for user exports
            if (!window.poof) {
                // if we can't access poof, something went horribly wrong
                console.error('Cannot find generated content output!');
                return;
            }
            var fileName = safeName(poof.data.name) + '.' + fileExt;

            if (fileExt === 'txt') {
                // download the plain text twee format
                download(createTweeExport(), fileName, 'text/plain;charset=utf-8');
            } else if (fileExt === 'html') {
                // download this single page web app
                download(document.documentElement.outerHTML, fileName, 'text/html;charset=utf-8');
            } else if (fileExt === 'pdf') {
                // download a pdf for printing and sharing
                createPDF(fileName);
            } else { // 'archive'
                fileName = fileName + '.html';
                download(twArchive(), fileName, 'text/html;charset=utf-8');
            }
        }
    }

    window.poof.hasScript = hasScript;

    window.poof.export = {
        archive : twArchive,
        PDF : createPDF
    };

    window.poof.createDownload = createDownload;

}());