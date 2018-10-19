## poof

Demos:  
[Example HTML output](http://twinelab.net/poof/demo/)  
[Example PDF output](http://twinelab.net/poof/demo/poof.pdf)  
[Example plain text output](http://twinelab.net/poof/demo/poof.txt)

A Twine 2 proofing format. In a prerelease state, currently.

Features:  
- Simple and readable, but more manageable than Paperthin.  
- Review you stylesheet and JavaScript code in addition to your passages.  
- Export your source code to PDF, plain text (in twee notation), html, or (planned) RTF.  
- Sortable, filterable, and searchable passage list (planned).

## Install

You can install Poof using this url: `https://twinelab.net/poof/use/format.js`. Copy and paste that URL into Twine 2 by clicking on `Formats` then `Add New Format` in the story list view (where all your stories are visible). Then go over to `Proofing Formats` and select poof. To use the proofing format, choose the `View Proofing Copy` option from the menu when editing a story. It's right above the `Publish to File` option.

For other compilers, you need to make the compiler aware of the format. How you do that will depend on the compiler, so refer to your compiler's docs. Note that poof is only compatible with Twine 2-style compilers.

## FAQ

**Why is this format so large?**

Poof is larger than Harlowe and SugarCube; it might be the largest Twine format out there. It includes [html2pdf](https://github.com/eKoopmans/html2pdf), which is 400+ KB on its own. The rest of the format is fairly small.

**Your build process is garbage.**

It is. I sort of just grabbed my normal gulp plumbing and added a few more tasks to use at different stages of development. It needs cleaned up, but that's low on my priority list.

**What's wrong with *paperthin*?**

Nothing major, but *paperthin* uses a `::before` pseudo element to show passage names, meaning they aren't really part of the doc, and therefore can't be printed or copy/pasted easily. I wanted to fix that, but also thought it'd be nice to add exporting features, sorting, filtering, etc. I also wanted to try to build a format, but I don't really feel there's anything I'd want to do that can't be done better with the existing output formats.

**Can I request a feature?**

If you have any ideas for features, please [open an issue on the github repo](https://github.com/ChapelR/poof/issues/new). Do the same if you've found a bug!

## Credits 

Open source software used:

[twinejs](http://twinery.org/) (GPL-3.0)  
[html2pdf](https://github.com/eKoopmans/html2pdf) (MIT)  
[download.js](http://danml.com/download.html) (CC BY 4.0)  
[jQuery](https://jquery.com/) (MIT)  
[normalize.css](https://necolas.github.io/normalize.css/) (MIT)  
[pure.css](https://purecss.io/) (BSD)

Built with:

[nodejs](https://nodejs.org/en/) ([License](https://raw.githubusercontent.com/nodejs/node/master/LICENSE))  
[gulp](https://gulpjs.com/) (MIT)

## Buy Me a Coffee

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/F1F8IC35)