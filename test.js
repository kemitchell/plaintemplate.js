var tape = require('tape')
var plaintemplate = require('./')

tape('without tags', function (test) {
  plaintemplate()(
    'Just text. No templating.',
    {},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, 'Just text. No templating.')
      test.end()
    }
  )
})

tape('one insert', function (test) {
  plaintemplate()(
    'Hello, <% insert name %>!',
    {name: 'John'},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, 'Hello, John!')
      test.end()
    }
  )
})

tape('error on insert nonexistent', function (test) {
  plaintemplate()(
    'Hello, <% insert name %>!',
    {},
    function (error) {
      test.assert(
        /No variable "name" at line 1, column 8/
        .test(error.message),
        'yields error'
      )
      test.end()
    }
  )
})

tape('two inserts', function (test) {
  plaintemplate()(
    'Hello, <% insert first %> <%insert last%>.',
    {first: 'John', last: 'Doe'},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, 'Hello, John Doe.')
      test.end()
    }
  )
})

tape('two inserts across lines', function (test) {
  plaintemplate()(
    'Hello, <% insert name%>!\nHow is <% insert state %>?',
    {name: 'John', state: 'Kentucky'},
    function (error, result) {
      test.error(error, 'no error')
      test.error(error, 'no error')
      test.equal(result, 'Hello, John!\nHow is Kentucky?')
      test.end()
    }
  )
})

tape('if then insert', function (test) {
  plaintemplate()(
    '<% if onsale { %>Price: $<% insert price %><% } %>',
    {onsale: true, price: '100'},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, 'Price: $100')
      test.end()
    }
  )
})

tape('if nonexistent error', function (test) {
  plaintemplate()(
    '<% if onsale { %>x<% } %>',
    {},
    function (error) {
      test.assert(
        /No variable "onsale" at line 1, column 1/
        .test(error.message),
        'yields error')
      test.end()
    }
  )
})

tape('unless then insert', function (test) {
  plaintemplate()(
    '<% unless onsale { %>Price: $<% insert price %><% } %>',
    {onsale: true, price: '100'},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, '')
      test.end()
    }
  )
})

tape('unless nonexistent error', function (test) {
  plaintemplate()(
    '<% unless onsale { %>x<% } %>',
    {},
    function (error) {
      test.assert(
        /No variable "onsale" at line 1, column 1/
        .test(error.message),
        'yields error')
      test.end()
    }
  )
})

tape('custom parser delimiters', function (test) {
  var processor = plaintemplate(
    undefined,
    {
      open: '{{',
      close: '}}',
      start: 'start',
      end: 'end'
    }
  )
  processor(
    '{{ if onsale start }}Price: ${{ insert price }}{{ end }}',
    {onsale: true, price: '100'},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, 'Price: $100')
      test.end()
    }
  )
})

tape('each', function (test) {
  plaintemplate()(
    (
      '<% each people { %>' +
        '<% unless first { %>' +
          '<% if last { %>, and <% } %>' +
          '<% unless last { %>, <% } %>' +
        '<% } %>' +
        '<% insert element %>' +
      '<% } %>'
    ),
    {people: ['John', 'Paul', 'George', 'Ringo']},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, 'John, Paul, George, and Ringo')
      test.end()
    }
  )
})

tape('each nonexistent error', function (test) {
  plaintemplate()(
    '<% each items { %>x<% } %>',
    {},
    function (error) {
      test.assert(
        /No variable "items" at line 1, column 1/
        .test(error.message),
        'yields error'
      )
      test.end()
    }
  )
})

tape('each non-Array errors', function (test) {
  plaintemplate()(
    '<% each items { %>x<% } %>',
    {items: false},
    function (error) {
      test.assert(
        /Variable "items" is not an Array at line 1, column 1/
        .test(error.message),
        'yields error'
      )
      test.end()
    }
  )
})

tape('nested if nonexistent error', function (test) {
  plaintemplate()(
    '<% each items { %><% if second { %>x<% } %><% } %>',
    {items: [true]},
    function (error) {
      test.assert(
        /No variable "second" at line 1, column 19/
        .test(error.message),
        'yields error'
      )
      test.end()
    }
  )
})

tape('unknown directive', function (test) {
  plaintemplate()(
    '<% blah %>',
    {},
    function (error) {
      test.assert(
        /Unknown directive "blah" at line 1, column 1/
        .test(error.message), 'yields error'
      )
      test.end()
    }
  )
})

tape('custom tag handler', function (test) {
  var processor = plaintemplate(
    function (token, context, stringify, callback) {
      callback(null, context.happy)
    }
  )
  processor(
    '<% super %> <% duper %>',
    {happy: 'Happy!'},
    function (error, result) {
      test.error(error, 'no error')
      test.equal(result, 'Happy! Happy!')
      test.end()
    }
  )
})
