# Release Versions

## Version 1.4.0
- Added passage tag colors to passage cards.  
- Cleaned up rendering engine.  
- Clicking passage tags on passage cards performs a quick filter operation.  
- Filtering passages now causes a `Clear Filters` button to appear on the interface.  
- Adjusted styles and layout of certain elements in certain view modes.  
- Split configs out of `View` menu, which now only handles the proofing view. Configs now have a separate menu and checkbox-like UI elements.  
- Improved accessibility.  
- Added basic support for Chapbook (beta) to reference parser and JavaScript linter. Will fine-tune as needed.  
- Other internal improvements.

## Version 1.3.1
- Fixed bug with parsing of tag metadata that could cause stories to hang indefinitely.

## Version 1.3.0 
- Added "passage references", which parses passage source code for links (and macro code, like gotos, includes/displays, etc) and displays them in the passage card as links that scroll to the indicated passages.
- Added Twee encoding options and support for the Twee 3 spec (https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md).
- Added the 'Starting Passage' tool.
- Updated SugarCube v2 globals for linter.
- Improved documentation.
- Internal improvements.

## Version 1.2.0
- Added a loading spinner to the export process to prevent reclicks and provide user feedback, as it can take several seconds.
- Created a custom VFS font file served via jsDelivr that loads over the network to provide PDF font options.
- Added `pdf.lineHeight`, `pdf.font`, and `pdf.fontSize` configuration options to `poof.config` special passage.
- Other internal improvements.

## Version 1.1.0
- The PDF generator has been rewritten. It should not choke on large story files anymore.
- The PDF output has been greatly simplified.
- The scripts for the PDF exporter are now delivered via CDN.
- The format.js file has been made much smaller (from ~580KB down to ~170KB).
- The Twee exporter has been rewritten and will now respect sort order and filtering.
- Other internal imporvements.

## Version 1.0.0
- Release version!
- Hosting for release version moved to CDN.

# Prerelease Versions

## Version 0.5.1
- Fixed a bug that prevented the tools menu from working.

## Version 0.5.0
- Added optional line numbers, toggleable via View menu or poof.config.
- Linter is now format-aware, and will report errors tailored to your selected story format.
- Added poof.config options for declaring additional globals and setting a preferred story format. 
- Complete source code refactor and cleaned up build process.
- Added some mild developer documentation.
- Lots of internal improvements.
- Poof is considered feature-complete as of this build; the next version should hopefully be 1.0.0!

## Version 0.4.1
- Fixed minor display bug in night mode.

## Version 0.4.0 
- Added syntax highlighting for JS & CSS.
- Added JSHint JavaScript linting (requires connection).
- Added JSHint and highlight.js to credits.
- Fixed Tweego comatibility bug.

## Version 0.3.3
- Fixed code font config bug.
- Added links to format data for Twine 2 app output.

## Version 0.3.2
- Fixed find tool bug with loadscreen.
- Fixed bug with JavaScript/CSS display.

## Version 0.3.1
- Fixed a bug with night mode and simplified view.
- Fixed a bug in the error reporting of comment imports.
- Other small improvements.

## Version 0.3.0
- Removed the ability to save the HTML view, as this broke comments.
- Added comment importing.
- Added comment count.
- Added loading spinners.
- Added night mode.
- Added config passage support.
- Added ignore tag.
- Filter by presence of comments.
- Improved filtering code and added invert option.

## Version 0.2.1
- Passage code to comment conversion feature.
- Enabled browser spellcheck if available.
- Fixed a number of display bugs regarding source code in comments.
- Improved about menu and added in-app credits, etc.

## Version 0.2.0
- Added comments menu, export options.
- Added find tool.
- Updated styles and layout.
- Internal improvements.
- Improved docs.

## Version 0.1.0
- Added filters and search tools.
- Added comments system, with local storage backing.
- Several internal improvements.
- Export option for Twine 2 archives.

## Version 0.0.1
- Initial Beta Release 