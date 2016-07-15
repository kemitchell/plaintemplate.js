module.exports = plaintemplate

var asap = require('asap')
var map = require('map-async')
var merge = require('merge')
var parse = require('plaintemplate-parse')

function plaintemplate (tagHandler, parserOptions) {
  return function (input, context, callback) {
    if (tagHandler === undefined) tagHandler = defaultTagHandler
    var tokens = parse(input, parserOptions)
    stringify(tokens, context, tagHandler, callback)
  }
}

function stringify (tokens, context, tagHandler, callback) {
  map(
    tokens,
    function (token, next) {
      if ('text' in token) {
        asap(function () { next(null, token.text) })
      } else {
        asap(function () {
          tagHandler(token, context, stringify, next)
        })
      }
    },
    function (error, strings) {
      if (error) callback(error)
      else callback(null, strings.join(''))
    }
  )
}

function defaultTagHandler (token, context, stringify, callback) {
  var key, elements
  var tag = token.tag

  function addPosition (error, message) {
    error.message = (
      message + ' at ' +
      'line ' + token.position.line + ', ' +
      'column ' + token.position.column
    )
    error.position = token.position
    return error
  }

  if (startsWith('insert ', tag)) {
    key = tag.substring(7)
    if (context.hasOwnProperty(key)) {
      asap(function () { callback(null, context[key]) })
    } else {
      asap(function () {
        callback(
          addPosition(
            new Error(),
            'No variable "' + key + '"'
          )
        )
      })
    }
  } else if (startsWith('if ', tag)) {
    key = tag.substring(3)
    if (context.hasOwnProperty(key)) {
      if (!context[key]) {
        asap(function () { callback(null, '') })
      } else {
        asap(function () {
          stringify(
            token.content,
            context,
            defaultTagHandler,
            callback
          )
        })
      }
    } else {
      asap(function () {
        callback(
          addPosition(
            new Error(),
            'No variable "' + key + '"'
          )
        )
      })
    }
  } else if (startsWith('unless ', tag)) {
    key = tag.substring(7)
    if (context.hasOwnProperty(key)) {
      if (!context[key]) {
        asap(function () {
          stringify(
            token.content,
            context,
            defaultTagHandler,
            callback
          )
        })
      } else {
        asap(function () { callback(null, '') })
      }
    } else {
      asap(function () {
        callback(
          addPosition(
            new Error(),
            'No variable "' + key + '"'
          )
        )
      })
    }
  } else if (startsWith('each ', tag)) {
    key = tag.substring(5)
    if (context.hasOwnProperty(key)) {
      elements = context[key]
      if (Array.isArray(elements)) {
        var elementCount = elements.length
        map(
          elements,
          function (element, index, next) {
            index = parseInt(index)
            var odd = isOdd(index + 1)
            var inSubcontext = {
              element: element,
              odd: odd,
              even: !odd,
              first: index === 0,
              last: index === (elementCount - 1)
            }
            var subcontext = merge(true, context, inSubcontext)
            stringify(
              token.content,
              subcontext,
              defaultTagHandler,
              next
            )
          },
          function (error, results) {
            if (error) callback(error)
            else callback(null, results.join(''))
          })
      } else {
        asap(function () {
          callback(
            addPosition(
              new Error(),
              'Variable "' + key + '" is not an Array'
            )
          )
        })
      }
    } else {
      asap(function () {
        callback(
          addPosition(
            new Error(),
            'No variable "' + key + '"'
          )
        )
      })
    }
  } else {
    asap(function () {
      callback(
        addPosition(
          new Error(),
          'Unknown directive "' + tag + '"'
        )
      )
    })
  }
}

function isOdd (number) { return number % 2 === 1 }

function startsWith (prefix, string) {
  return string.indexOf(prefix) === 0
}
