var tape = require('tape')
var plaintemplate = require('./')

tape(function(test) {
  test.deepEqual(
    plaintemplate('Just text. No templating.'),
    'Just text. No templating.')

  test.deepEqual(
    plaintemplate(
      'Hello, <% insert name %>!',
      { name: 'John' }),
    'Hello, John!')

  test.deepEqual(
    plaintemplate(
      'Hello, <% insert first %> <%insert last%>.',
      { first: 'John', last: 'Doe' }),
    'Hello, John Doe.')

  test.deepEqual(
    plaintemplate(
      'Hello, <% insert name%>!\nHow is <% insert state %>?',
      { name: 'John', state: 'Kentucky' }),
    'Hello, John!\nHow is Kentucky?')

  test.deepEqual(
    plaintemplate(
      '<% if onsale { %>Price: $<% insert price %><% } %>',
      { onsale: true, price: '100' }),
    'Price: $100')

  test.deepEqual(
    plaintemplate(
      '<% unless onsale { %>Price: $<% insert price %><% } %>',
      { onsale: true, price: '100' }),
    '')

  test.deepEqual(
    plaintemplate(
      '{{ if onsale start }}Price: ${{ insert price }}{{ end }}',
      { onsale: true, price: '100' },
      undefined,
      { open: '{{',
        close: '}}',
        start: 'start',
        end: 'end' }),
    'Price: $100')

  test.deepEqual(
    plaintemplate(
      ( '<% each people { %>' +
          '<% insert element %>' +
          '<% unless last { %>, <% } %>' +
        '<% } %>' ),
      { people: [ 'John', 'Paul', 'George', 'Ringo' ] }),
    'John, Paul, George, Ringo')

  test.end() })
