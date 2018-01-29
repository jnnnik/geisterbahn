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
| `-d, --device`  | The device you want Puppeteer to emulate during the test run, ex. `-d 'Galaxy Note II'`; see [puppeteer/DeviceDescriptors](https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js) for a full list of device types |
| `-e, --environment` | The environment you want geisterbahn to run your tests under. See [geisterbahnfile.js](#geisterbahnfilejs) for more information |
| `-g, --geisterbahnfile` | **Very important option** The directory containing your `geisterbahnfile`. Specify this in case your `geisterbahnfile` does not sit in the same directory you're calling `geisterbahn` from. See [geisterbahnfile.js](#geisterbahnfilejs) for more information |
| `-i, --interactive` | Run geisterbahn in interactive mode: This will pause test execution before every test and wait for you to hit the Enter key |
| `-s, --show` | Despite Puppeteer being a headless Chrome, you can give it its head back and show the browser running your tests using this option |
| `-T, --test-source` | The directory containing your test files. Use this if you want to run tests from a directory other than the one specified in your `geisterbahnfile`. See [Tests](#tests) for more information |
| `-t, --tests` | If you don't want to run all of your tests at once, specify a list of tests using this option and only those will be run. Comma separated |

### geisterbahnfile.js
The `geisterbahnfile` is a configuration map you can use to store stage-specific settings, such as the stage's Base URL and basic auth credentials. In order to get started quickly, copy [geisterbahnfile.js](geisterbahnfile.js) from this repository and adjust the values in there to your needs.

The `-e, --environment` parameter used in the CLI documentation up there references the keys used in your `geisterbahnfile`. If not specified, geisterbahn will look for the default environment to use in `geisterbahnfile.js` and yell at you if it doesn't find one there, either.

Another neat thing to know is that you can run any (synchronous) JavaScript code in your `geisterbahnfile`, such as reading environment variables, making blocking HTTP requests and all that jazz.

### Tests
Let's get to the meat of things. Place your test packages in a directory, pass the `-T, --test-source` parameter to the CLI and fire away. But what does a test look like, tho?

```
module.exports = {
  title: "Home Page",
  definition: (page, test) => {
    test("headline is correct", async () => {
      await page.goto("/");
      const pageTitle = await page.getHtml("h1");
      if(pageTitle !== "Best Website Ever") {
        throw new Error("this is the worst day ever");
      }
    });
    test("headline is really correct", async () => {
      const pageTitle = await page.getHtml("h1");
      if(pageTitle !== "Super Best Website Ever") {
        throw new Error("oh no, not again!");
      }
    });
  }
}
```
Like this.

So, a test file is just a PO**JS**O (plain old JS-object) with two important keys: `title` is a human readable title for your package o' tests, whereas `definition` is an async function containing the tests themselves.

`definition` is passed two arguments: An object named `page` and an async function named `test`.

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

#### Test Function
`test` is a function that takes two parameters: A human readable string description of the second parameter, which is an async function containing test logic.

Write all your tests and page movements wrapped inside of one of those functions, and please, do not write them like I did in that example. Use an assertion library instead.

## Development / Contributing
What? Oh. Open Source Software. I get it. Yeah. Well, `geisterbahn` is still very much in active development right now, and there's tons I need to figure out before even trying to get into that whole scene. There's probably gonna be some sort of documentation on how to develop / contribute to this project. It's relatively straightforward to get into. I'm not gonna make any promises regarding issues and/or pull requests yet, tho. I'll *try* to be good about those.

## Version History

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
