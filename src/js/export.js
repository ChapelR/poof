(function () {
    'use strict';

    window.poof = window.poof || {};

    function handleNotLoadedScript (name) {
        // do something mroe useful here
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
        var $story = $('tw-storydata').clone();
        if (poof.configPassage && poof.stringNotEmpty(poof.configPassage.text())) {
            // add `poof.config` if it existed
            $story.append(poof.configPassage);
        }
        return $(document.createDocumentFragment())
            .append(document.createTextNode($story[0].outerHTML)).text();
    }

    // PDF JUNK (pdf.js could probably be its own thing...)

    function loadFonts () {
        return {
            'monospace': {
                normal : 'monospace.ttf'
            },
            'serif': {
                normal : 'serif.ttf'
            },
            'sans': {
                normal : 'sans.ttf'
            },
            'bold': {
                normal : 'bold.ttf'
            },
            'italic' : {
                normal : 'italic.ttf'
            }
       };

    }
    
    function PDFStyles (fSize, lHeight, fontFace) {
        return {
            styles : {
                storyTitle : {
                    fontSize : (((fSize + 10) > 22) ? 22 : fSize + 10),
                    font : 'sans',
                    alignment : 'center'
                },
                ifid : {
                    fontSize : fSize + 2,
                    alignment : 'center',
                    font : 'monospace'
                },
                title : {
                    fontSize : fSize + 4,
                    alignment : 'center',
                    font : 'sans'
                },
                tags : {
                    fontSize : fSize,
                    font : 'italic'
                },
                content : {
                    fontSize : fSize,
                    lineHeight : lHeight,
                    font : fontFace
                }
            }
        };
    }

    function getFontSize () {
        if (!poof || !poof.config || !poof.config.pdf || !poof.config.pdf.fontSize) {
            return 12;
        }
        switch (poof.config.pdf.fontSize) {
            case 'very small':
                return 8;
            case 'small':
                return 10;
            case 'large':
                return 14;
            case 'very large':
                return 16;
            default:
                return 12;
        }
    }

    function getFontFace () {
        if (!poof || !poof.config || !poof.config.pdf || !poof.config.pdf.font) {
            return 'sans';
        }
        return poof.config.pdf.font;
    }

    function createPDF (name) {
        if (!pdfMake) {
            alert('Creating a PDF requires an Internet connection. If you have a connection, please wait for a few seconds and try again.');
        }
        $(document).trigger(':pdf-export-start');
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
        var def = PDFStyles(getFontSize(), poof.config.pdf.lineHeight, getFontFace());
        def.content = content;
        console.log(loadFonts());
        pdfMake.createPdf(def, null, loadFonts(), vfs).download(name, function () {
            $(document).trigger(':pdf-export-complete');
        });
    }

    // END PDF JUNK

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
        return poof.data2tw() + content;
        // add config passage back? for #9
    }

    function safeName (str) {
        // create safe(ish) file names from story titles
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

            // set twee file extention 
            var extension = fileExt;
            if (extension === 'txt') {
                switch (poof.config.twee) {
                    case 1:
                    case 3: // i don't think there's any future in `.tw3`, but we'll see how it shakes out
                        extension = 'twee';
                        break;
                    case 2:
                        extension = 'tw2';
                        break;
                    default:
                        extention = 'txt';
                }
            }

            var fileName = safeName(poof.data.name) + '.' + extension;

            if (fileExt === 'txt') {
                // download the plain text twee format
                // the unescape may be more useful in `createTweeExport()`
                download(poof.utils.unescape(createTweeExport()), fileName, 'text/plain;charset=utf-8');
            } else if (fileExt === 'html') {
                // DEACTIVATED: with comments and such, this is a liability
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