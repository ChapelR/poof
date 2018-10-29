# Poof Developer Docs

This is some developer documentation to get you started if you want to hack on poof.

## Installation

To set up poof, clone the repo and run `npm install`.

To build the format, run `gulp build` or `npm run build`. You can use, but do not need, a local version of gulp. The built format is deposited in the `dist` folder. Do not create or use a folder named `staging` in the poof directory, it will get deleted during the build process because I am not super good at writing complex gulp tasks.

## Structure

The easiest way to understand how poof is put together is to look at `gulpfile.js`, particularly the `buildScripts` and `buildStyles` functions; the order of the files is important. I didn't use webpack or uglify, and poof is a rather large project, so it's split into files that are concatenated rather than into proper modules. I am unlikely to "fix" this as it doesn't bother me all that much, but YMMV.

The `template.html` file contains poof's menu, modals, overlays, and general html structure. The parts that look `/% like this %/` are replaced by the build process to make the format's source code.  Normal html comments `<!-- like this -->` are preserved during the build process, while html comments that look `<!--! like this -->` (note the immediate exclamation point in the comment) are removed.

The `format.js` file is the skeleton of the story format, and again, `/% these %/` are replaced with the indicated things during the build.

## Contributing

If you have a cool idea and the know how to implement it, I'm definitely into a pull request. If you don't know how to implement it, you can suggest features via an issue.

## Using the Code

You can use poof or any of its code, with or without attribution, in whole or in part, to do whatever you please, including building your own, better proofing format.