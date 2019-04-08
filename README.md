# JavaScript Test Environment

## Installation Instructions

Run the following commands
	1. `` npm install ``
	2. Run `` npm start:dev `` to start a webpack development server
	3. When you're done coding, run `` npm start `` to build the production .js file.

## Usage

Code all your javascript in **/src/index.js**, and webpack will compile and export this to **/dist/main-client.js** in a IE11 friendly format.

Code all supporting HTML for development and testing into **/dist/index.html**

## Using SASS for testing

You can also add SASS into the src folder, and import it into index.js by adding `` import "path-to-file.scss" `` to the top of index.js. Webpack will build this for you and output it to /dist/ as main-client.css, which you can then reference in test index.html file.

I suggest only using this SASS aspect for testing, as SASS is generally managed with ruby as part of the Drupal build.

## Using multiple JS files

You can split your code into multiple folders and js files to keep your code neat. Just put the relevant code in a separate file, then import the relevant functions into your index.js using es2016 import and export statements.

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Examples

Webpack will handle the rest.

## Referencing the outputted JS functions

The functions you export from index.js can be accessed in your HTML using **exports.[exported-function-name]**.

You can change the name of the exported library object from exports to something more meaningful in line 39 of **/webpack.config.js**
