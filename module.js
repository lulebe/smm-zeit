const $ = require('jquery')
const dot = require('dot')
const jsdom = require('jsdom')

module.exports = function (data) {

  const QUERY_URL = 'http://api.zeit.de/content?q=politik'

  const feedTemplate = dot.template(`
    <h2>{{=it.title}}</h2>
    <p>{{=it.text}}</p>
  `)

  function fillWindow (domEl, input, renderButtons, article) {
    renderButtons({three: './res/btn-none.png', four: './res/btn-none.png'})
    input.setPressListener(1, function () {
      domEl.animate({scrollTop: domEl.scrollTop()+200}, 150)
    })
    input.setPressListener(2, function () {
      domEl.animate({scrollTop: domEl.scrollTop()-200}, 150)
    })
    domEl.append('<h1>' + article.title + '</h1>')
    domEl.append('<p style="font-weight: bold">' + article.subtitle + '</p>')
    jsdom.env(
      article.href,
      function (err, window) {
        if (err) {
          tapHandlers[0]()
          window.close()
          return
        }
        const paragraphs = window.document.querySelectorAll('.article-body > .article-page > p')
        for (let i = 0; i < paragraphs.length; i++) {
          domEl.append('<p>' + paragraphs[i].innerHTML + '</p>')
        }
        console.log(paragraphs)
        window.close()
      }
    );
  }

  return {
    renderFeed: function (requestFeedItem) {
      $.ajax({
        method: 'get',
        url: QUERY_URL,
        dataType: 'json',
        headers: {
          'X-Authorization': data.API_Key
        }
      })
      .done(function (data) {
        for (let i = 0; i < data.matches.length; i++) {
          const match = data.matches[i]
          const feedItemEl = requestFeedItem({
            canClick: true,
            fillWindow: (domEl, tapHandlers, renderButtons) => {fillWindow(domEl, tapHandlers, renderButtons, match)}
          })
          feedItemEl.append(feedTemplate({title: match.teaser_title, text: match.teaser_text}))
        }
      })
    }
  }
}
