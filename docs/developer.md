# Poof Developer Docs

This is some developer documentation to get you started if you want to hack on poof.

## Installation

To set up poof, clone the repo and run `npm install`.

To build the format, run `npm run build` or `gulp build`. You can use, but do not need, a globally-installed version of gulp. The built format is deposited in the `dist` folder. Do not create or use a folder named `staging` in the poof directory, it will get deleted during the build process because I am not super good at writing complex gulp tasks.

You can create a zip file package of poof with the command `npm run pack`. It will bundle the most recently built version with the icon and license files in an archive.

## Structure

The easiest way to understand how poof is put together is to look at `gulpfile.js`, particularly the `buildScripts` and `buildStyles` functions; the order of the files is important. I didn't use webpack or browserfy, and poof is a rather large project, so it's split into files that are concatenated rather than into proper modules. I may fix this someday since it'd make automated testing possible with modules, but for now it is what it is.

The `template.html` file contains poof's menu, modals, overlays, and general html structure. The parts that look `/% like this %/` are replaced by the build process to make the format's source code.  Normal html comments `<!-- like this -->` are preserved during the build process, while html comments that look `<!--! like this -->` (note the immediate exclamation point in the comment) are removed.

The `format.js` file is the skeleton of the story format, and again, `/% these %/` are replaced with the indicated things during the build.

## Contributing

If you have a cool idea and the know how to implement it, I'm definitely into a pull request. If you don't know how or have the desire to implement it, you can suggest features via an issue.

## Using the Code

You can use poof or any of its code, with or without attribution, in whole or in part, to do whatever you please, including building your own, better proofing format.