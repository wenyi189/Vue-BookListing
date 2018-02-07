const fs = require('fs');
const path = require('path');
const assert = require('chai').assert;
const parse5 = require('parse5');
const esquery = require('esquery');
const esprima = require('esprima');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;


describe('App.vue contains BookList', () => {
  it('should contain booklist in App.vue @app-vue-will-contain-book-list', () => {
    let file;
    try {
      file = fs.readFileSync(path.join(process.cwd(), 'src/App.vue'), 'utf8');
    } catch (e) {
      assert(false, 'The App.vue file does not exist');
    }

    // Parse document and retrieve the script section
    const doc = parse5.parseFragment(file.replace(/\n/g, ''), { locationInfo: true });
    const nodes = doc.childNodes;
    const script = nodes.filter(node => node.nodeName === 'script');

    // Test for correct import statement
    const ast = esprima.parse(script[0].childNodes[0].value, { sourceType: 'module' });
    let results = esquery(ast, 'ImportDeclaration[source.value="./components/BookList"]');
    assert(results.length > 0, './components/BookList was not imported');

    // Test for bookList definition in the component key
    results = esquery(ast, 'Property[key.name=components] > ObjectExpression > Property[key.name=BookList]');
    assert(results.length > 0, 'BookList is not defined under components property in object');

    // Parse for HTML in template
    const template = nodes.filter(node => node.nodeName === 'template');
    const content = parse5.serialize(template[0].content);
    const dom = new JSDOM(content, { includeNodeLocations: true });
    const document = dom.window.document;

    // Test for booklist in the app div
    results = document.querySelector('div#app book-list');
    assert(results, 'BookList is not defined inside of a div with the id of app');
  });
});