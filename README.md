# geisterbahn
*web testing atomation utility for Puppeteer*

## What Is This?
`geisterbahn` is a utility which allows you to run headless browser automation tests using [GoogleChrome/puppeteer](https://github.com/GoogleChrome/puppeteer).

## Why Does It Exist?
> On n'est jamais servi si bien que par soi-même

\- *Charles-Guillaume Étienne, [1807](https://en.wikipedia.org/wiki/Charles-Guillaume_%C3%89tienne)*

## How Does It Work?

### Installation
`yarn add geisterbahn`
or
`npm i geisterbahn`
or clone and install packages manually and go nuts?

### CLI Usage
After installing, run `./node_modules/.bin/geisterbahn help`; that should help. In case it doesn't help enough, I'll go over some of the options in more detail here.

| Option  | Detailed Description |
| - | - |
| `-b, --breakpoint` | Specify one or more numbers here (comma separated) and geisterbahn will halt execution after running the specified test(s) |
| `-d, --device`  | The device you want Puppeteer to emulate during the test run, ex. `-d 'Galaxy Note II'`; see [puppeteer/DeviceDescriptors](https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js) for a full list of device types |
| `-D, --devtools` | Launches all Chromium instances with DevTools tab enabled |
| `-e, --environment` | The environment you want geisterbahn to run your tests under. See [geisterbahnfile.js](#geisterbahnfilejs) for more information |
| `-g, --geisterbahnfile` | **Very important option** The directory containing your `geisterbahnfile`. Specify this in case your `geisterbahnfile` does not sit in the same directory you're calling `geisterbahn` from. See [geisterbahnfile.js](#geisterbahnfilejs) for more information |
| `-l, --loop-point` | Repeat all tests after hitting the test case specified by this option |
| `-s, --show` | Despite Puppeteer being a headless Chrome, you can give it its head back and show the browser running your tests using this option |
| `-S, --slow-mo` | Delay browser actions by the amount (in ms) passed to this option |
| `-T, --test-source` | The directory containing your test files. Use this if you want to run tests from a directory other than the one specified in your `geisterbahnfile`. See [Tests](#tests) for more information |
| `-t, --tests` | If you don't want to run all of your tests at once, specify a list of tests using this option and only those will be run. Comma separated |

### geisterbahnfile.js
The `geisterbahnfile` is a configuration map you can use to store stage-specific settings, such as the stage's Base URL and basic auth credentials. In order to get started quickly, copy [geisterbahnfile.js](geisterbahnfile.js) from this repository and adjust the values in there to your needs.

The `-e, --environment` parameter used in the CLI documentation up there references the keys used in your `geisterbahnfile`. If not specified, geisterbahn will look for the default environment to use in `geisterbahnfile.js` and yell at you if it doesn't find one there, either.

Another neat thing to know is that you can run any (synchronous) JavaScript code in your `geisterbahnfile`, such as reading environment variables, making blocking HTTP requests and all that jazz.

### Tests
Let's get to the meat of things. Place your test packages in a directory, pass the `-T, --test-source` parameter to the CLI and fire away. But what does a test look like, tho?

```javascript
module.exports = {
  title: "Home Page",
  definition: test => {
    test("headline is correct", async page => {
      await page.goto("/");
      const pageTitle = await page.getHtml("h1");
      if(pageTitle !== "Best Website Ever") {
        throw new Error("this is the worst day ever");
      }
    });
    test("headline is really correct", async page => {
      const pageTitle = await page.getHtml("h1");
      if(pageTitle !== "Super Best Website Ever") {
        throw new Error("oh no, not again!");
      }
    });
  }
}
```
Like this.

So, a test file is just a PO**JS**O (plain old JS-object) with two important keys: `title` is a human readable title for your package o' tests, whereas `definition` is a function containing the tests themselves.

`definition` is passed two arguments: An object named `page` and a function named `test`.

If you export an array of objects formatted like this, geisterbahn will treat each entry as a separate test package.

#### Page Object

`page` is basically just an instance of Puppeteer's [Page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page), however slightly modified in a small number of ways, which I'll go into a bit of detail about right now.

| Page function | Description |
| - | - |
| `.goto(url, options)` | Same as Puppeteer's Page.goto - except the URL parameter is relative to the Base URL specified in your `geisterbahnfile` |
| `.getHtml(selector)` | Utility function that returns a `Promise<String>` containing the innerHTML for the DOM node matching `selector` |
| `.getText(selector)` | Utility function that returns a `Promise<String>` containing the innerText for the DOM node matching `selector` |
| `.getAttribute(selector, attributeName)` | Utility function that returns a `Promise<String>` containing the attribute named `attributeName` for the DOM node matching `selector` |
| `.getElementCount(selector)` | Utility function that returns a `Promise<int>` containing the number of DOM nodes matching `selector` |
| `.clickAndWait(selector)` | Clicks on `selector` and waits for navigation - useful for links and such |
| `.mockResponse(method, url, response)` | Returns `response` whenever `method` and `url` match the specified parameters. See [Puppeteer Docs](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestrespondresponse). |
| `.hitBackButton()` | Same as Puppeteer's Page.goBack() except it doesn't wait for navigation to occur at all - use this for testing single page applications |

#### Test Function
`test` is a function that takes two parameters: A human readable string description of the second parameter, which is an async function containing test logic.

Write all your tests and page movements wrapped inside of one of those functions, and please, do not write them like I did in that example. Use an assertion library instead.

#### Partial Tests
geisterbahn sports a recursive partial test system, meaning that tests can be entirely or partially comprised of partials, which in turn can also be comprised of partials, and so on and so forth. Provided you don't abuse this power and compose evil circle dependencies, this can be used as a powerful tool in order to prevent copy-pasting test definitions over and over again for complex test cases.

Long story short, let's have an example! If you have a test like this:

```javascript
//homepage.js
const assert = require('assert');
module.exports = {
  title: "Home Page",
  definition: test => {
    test("headline is correct", async page => {
      await page.goto("/");
      const pageTitle = await page.getHtml("h1");
      assert(pageTitle === "Best Website Ever");
    });
  }
}
```

And you want to write a test that also takes place on your home page, but you don't feel like repeating yourself, you could write a test that looks a little something like this:

```javascript
//homepage_subheadline.js
const assert = require('assert');
module.exports = {
  title: "Home Page and Subheadline",
  partials: ['homepage'],
  definition: test => {
    test("subheadline is correct", async page => {
      await page.goto("/");
      const pageSubheadline = await page.getHtml("h2");
      assert(pageSubheadline === "It really is the Best Website Ever");
    });
  }
}
```

The above definition would execute the definition of `homepage.js` first, as if it were part of `homepage_subheadline.js`. Coupled with the fact that geisterbahn only autoloads tests that don't start with an underscore, you can see where I might be going with this.

## Development / Contributing
What? Oh. Open Source Software. I get it. Yeah. Well, `geisterbahn` is still very much in active development right now, and there's tons I need to figure out before even trying to get into that whole scene. There's probably gonna be some sort of documentation on how to develop / contribute to this project. It's relatively straightforward to get into. I'm not gonna make any promises regarding issues and/or pull requests yet, tho. I'll *try* to be good about those.

## Version History

#### 2.4.2
- actually fixed CTRL+C behavior

#### 2.4.1
- fixed CTRL+C behavior

#### 2.4.0
- bumped puppeteer version to 1.2.0
- added more flexible mocking capabilities
- better handling of interrupts (CTRL+C, closing the browser window)

#### 2.3.1
- disable automatic clearing of response mocks

#### 2.3.0
- added option to export test definitions as array

#### 2.2.0
- added -S, --slow-mo option
- added page.hitBackButton() augmentation for single page application testing

#### 2.1.0
- added response mocking page augmentation

#### 2.0.0
- changed defintion and test function signature: this update will break all of your tests, hooray!
- browser now closes and re-opens after every test package has run, making tests much more consistent
- require-cached versions of tests and partials are now discarded, making tests EVEN MORE consistent
- introduced --devtools option

#### 1.4.1
- addded possibility to inject arguments into test partials

#### 1.4.0
- discarded simple test dependency management
- introduced more complex partial system

#### 1.3.0
- introduced simple test dependency management (undocumented for the time being)
- rewrote lots of loader code
- fixed attempts to autoload non-readable test files

#### 1.2.0
- introduced cli option -l

#### 1.1.1
- fixed a feature-breaking typo. woe is me.

#### 1.1.0
- removed unnecessary (in hindsight) interactive option that was broken by 1.0.0 anyways
- added much more useful -b option

#### 1.0.0
- bumped puppeteer version to 1.0.0
- changed definition function from async to sync
- changed test function from async to stack-based
- introduced clickAndWait helper function

#### 0.5.0
- removed basic auth configuration from geisterbahnfile
- instead added additional header configuration to geisterbahnfile, which is much more handy
- added test directory and default environment config parameters to geisterbahnfile
- made a few error messages a bit more verbose
- fixed a very annoying grammatical error in README.md

#### 0.4.0
- Initial release
