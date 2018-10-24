# Introduction

Demos:  
- [Example HTML output](http://twinelab.net/poof/demo/)  
- [Example PDF output](http://twinelab.net/poof/demo/poof.pdf)  
- [Example plain text output](http://twinelab.net/poof/demo/poof.txt)

A Twine 2 proofing format. In a prerelease state, currently.

If you have any ideas for features, please [open an issue on the github repo](https://github.com/ChapelR/poof/issues/new). Do the same if you've found a bug!

Features:  
- Simple and readable, but more manageable than Paperthin.  
- Review your stylesheet and JavaScript code in addition to your passages.  
- Export your passages to PDF, plain text (in twee notation), an html file, or a Twine 2 archive file.  
- Sortable, filterable, and search-able passage list.  
- Create comments and notes that can be exported, imported, and shared with others.

## Installation

You can install poof using this URL: `https://twinelab.net/poof/use/format.js`. Copy and paste that URL into Twine 2 by clicking on `Formats` then `Add New Format` in the story list view (where all your stories are visible). Then go over to `Proofing Formats` and select poof. To use the proofing format, choose the `View Proofing Copy` option from the menu when editing a story. It's right above the `Publish to File` option.

For other compilers, you need to make the compiler aware of the format. How you do that will depend on the compiler, so refer to your compiler's docs. Note that poof is only compatible with Twine 2-style compilers.

### Other Versions

Older versions of poof can be found in the [`use` directory of the repo](https://github.com/ChapelR/poof/tree/master/docs/use); they're named after their version numbers. There's also a development version: `dev.js` that you should almost certainly not use.

[Changelog](http://twinelab.net/poof/changelog.txt)

## Credits 

Open source software used:

- [twinejs](http://twinery.org/) (GPL-3.0)  
- [html2pdf](https://github.com/eKoopmans/html2pdf) (MIT)  
- [download.js](http://danml.com/download.html) (CC-BY-4.0)  
- [jQuery](https://jquery.com/) (MIT)  
- [normalize.css](https://necolas.github.io/normalize.css/) (MIT)  
- [pure.css](https://purecss.io/) (BSD)

Built with:

- [nodejs](https://nodejs.org/en/) ([License](https://raw.githubusercontent.com/nodejs/node/master/LICENSE))  
- [gulp](https://gulpjs.com/) (MIT)

## Buy Me a Coffee

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/F1F8IC35)

---

# Usage Guide

This is a quick guide to help you get acclimated to poof and some suggestions about how to best use the format. Poof should, hopefully, be self-explanatory on a basic level.

## Overview

To get started after installing poof, open your story in the Twine 2 app, open the menu (bottom left of the screen, near the story's name, is an up arrow that opens the menu), and click `View Proofing Copy`.  If you're using another compiler, like Tweego, you'll need to set the format option to poof--the CLI compilers treat proofing formats the same as all other formats. For example, `tweego -f poof -o my-poof-story.html src`.

### View Options

You'll likely immediately notice your story's vital information on display, including story and passage data. Across the top of the window is several menus, the first of which is `View`. Hover over or click / tap on it to access your viewing options.

- `Night Mode`: This option toggles the page between the standard light-on-dark theme and a dark-on-light theme that may be easier on some eyeballs.
- `Simplified View`: This option removes some of the boxes, borders, and shadows that separate passages and other elements. You may prefer reading without my dead-sexy CSS skills getting all up in your eyes. I promise I'm not offended. Click to toggle.  
- `Code Text Height`: I'm open to a better name for this option. To keep things somewhat sane when dealing with massive passages, poof will by default limit the height of code boxes and slap scrollbars on them after about 15 or so lines. If you'd rather not have that happen, you can toggle this option to see everything.  
- `View Passages`: This is the default view; click it to see your story data and all your passages and their code and tags.  
- `View JavaScript`: This view shows your Story JavaScript area or equivalent.  
- `View Stylesheet`: This view shows your Story Stylesheet or equivalent.  

### Tools

If you have a lot of passages, you'll likely want a way to sort, filter, and find them.

- `Filter`: This option allows you do determine what passages you want to see. For example, you can set poof to only show you `widget`-tagged passages, only passages with `castle` in the name, or even only show passages with [comments](#comments). You can also filter by the text of your passages, but be aware that this is somewhat slow to resolve based on the number of passages and their length. You can use the `Invert` check-box to instead filter **out** the passages that meet the specified criteria. To get all your passages back again, come back here and click the `Clear` button.  
- `Sort`: You can sort your passages based on a few different metrics, and can get those results in ascending or descending order by using the `Reverse` check-box. You can sort by passage name (alphanumeric), the length of the passage's text, or by *Passage ID*. Passage IDs are numbers that start at 0 and count up as you create passaged, meaning this order is largely in the order you created your passages (though this ordering isn't guaranteed, necessarily), and is poof's default order.  
- `Find`: Finally, you can come here to find a specific passage by name. The text input also functions as a drop down list, and will make suggestions as you type. If you try to find a passage that you've previously filtered out, it will magically pop back into existence none the worse for wear.

## Exporting Your Story

Poof comes with a few options for exporting your story to help you get the most out of your proofreading time. Note that when you export your story to any of the following formats, the comments you make won't go with it.

### Twee

The first way you can export is to [Twee notation](https://twinery.org/cookbook/terms/terms_twee.html), in a plain text format. This is useful both for editing, and for transitioning your story to a different compiler, like Twee2 or Tweego.

### HTML

 Poof can also export to HTML; this saves a copy of poof's output (what you see when you click `View Proofing Copy`) to your hard drive for later use, sharing, emailing, etc. Note, however, that any comments aren't sent with this export, so you'll need to export and re-import the comments if you want them on this new copy. Read [the section about comments below for more](#comments).

### PDF

Exporting to PDF is useful if you want a printable copy of your story, or something very easy to share and send around, regardless of device. This is probably mostly useful for authors working with non-Twine-using editors.

### Archive

As you (hopefully) know, you can make a back-up of all of your stories by creating an archive from the story list in Twine 2. You should do this a lot. This option does exactly the same thing, but only creates an archive of the current story. This archive can be used to back-up your story (though really, look into version control) and can also be used with certain compilers like Entwine and Tweego.

**NOTE**: When you import an archive, it usually won't work at first. Try changing your story format and reselecting your start passage to fix this.

## Comments

Comments can be added to any passage. The blue comment button under every passage shows you how many comments each passage has and allows you to create, view, edit, and delete them. Click this button, then `+ Add a comment...` to get started. You can also click the pencil icon (&#9998;) in the upper right corner of a passage card to create a new comment that is pre-filled with the text of the passage, to make notes about edits or changes you want to make.

A comment must have either a body or a title, or both. After you make a comment, it will appear in a list where `+ Add a comment...` used to be, along with a `New Comment` button. To read, edit, or delete a comment, click on any part of it in the list.

### Local Storage

Poof saves your comments to your browser's local storage anytime they are changed in anyway. This means that some care must be taken to preserve them, just like your Twine stories. Note that each story you open with poof will have it's own little place to hang out in local storage, so don't worry about overwriting one project's comments with another.

### Comment Files

You can export and import comments. Imported comments are added to whatever comments are already there, so you don't generally need to worry about overwrites here, but you may also wind up with duplicates from time to time. To export your comments, go to the `Comments` menu and click `Export`. This will create a file and download it for you. To import a file, click `Import` in the `Comments` menu and select a valid file to upload.

Poof will warn you if it has reservations about the file you're trying to upload, like if the comments come from a story with a different IFID than the one you're importing comments into, if there don't appear to be any comments, or if the file has unexpected data. You can try to import the comments anyway, if you want.

If the story you import the comments into doesn't have a passage that the comment file has comment data for, you'll be told about it, but these stateless comments will be ignored.

## Configuration

You can configure your poof experience with a special passage in your story. This passage must be written in JSON format and called `poof.config`.  You have a number of options you can use to set things up for your viewing pleasure.

### The `poof.config` Passage

A `poof.config` passage may look like this:

```
{
    "nightMode": true,
    "fonts": {
        "main": "Arial",
        "code": "Courier New"
    }
}
```

The above settings tell poof that want the proofing copy to default to night mode (saving you a click every time you view the proofing copy) and that you want the main font used by most text to be Arial and the font used for passage text and code to be Courier New.

The following options can be used:

- `nightMode`: Set this option to `true` or `false`. If true, poof will default to night mode. The default setting is `false`.  
- `simplified`: Set this option to `true` or `false`. If true, poof will default to the simplified view mode. The default setting is `false`.  
- `codeHeightLimit`: Set this option to `true` or `false`. If true, poof will default to showing about 15 lines of code before using scrollbars. The default setting is `true`.  
- `ignoreTag`: Set this option to a string that represents a valid Twine tag (i.e. no spaces). Passages with this tag will not be imported by poof. The default is `poof.ignore`.  
- `fonts`: A sub-object with two properties, `main` and `code`. You can set custom fonts / font stacks for poof using this option. Note that if your browser doesn't support the indicated font(s), the browser will use its (ugly) default font. The default font stacks are `Verdana, Geneva, sans-serif` for `main` and `Consolas, monaco, monospace` for `code`.  

*(Note: More configuration options will likely be made available in the future as poof's feature set stabilizes.)*

Writing valid JSON can be a bit tricky. Here's a validator to help you: https://jsonlint.com/. Plug your JSON in there, and the validator will tell you what, if anything, is wrong with it.

### Ignore Tag

Sometimes you just want to see the major, writing-heavy passages, not all your `startup`-tagged passages with their variable declarations or all your `widget`-tagged passages with their lengthy widget definitions. You can use the ignore tag (`poof.ignore`, by default) to keep these out of your hair. Poof won't even load any passages with the ignore tag, meaning they will be completely unavailable to you from within poof.

You can also change the tag to make your life a little easier. For example, if you need to ignore all your widget-definition passages, instead of adding the `poof.ignore` tag to each one, you can use the above `poof.config` special passage to change the ignore tag to `widget`.