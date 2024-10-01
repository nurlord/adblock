!(function (e) {
  'function' == typeof define && define.amd ? define(e) : e();
})(function () {
  'use strict';
  function e(e) {
    const n = document.title;
    (document.title = e), setTimeout(() => (document.title = n), 3e3);
  }
  function n(e, n, t, o) {
    return new (t || (t = Promise))(function (r, s) {
      function i(e) {
        try {
          c(o.next(e));
        } catch (e) {
          s(e);
        }
      }
      function l(e) {
        try {
          c(o.throw(e));
        } catch (e) {
          s(e);
        }
      }
      function c(e) {
        var n;
        e.done
          ? r(e.value)
          : ((n = e.value),
            n instanceof t
              ? n
              : new t(function (e) {
                e(n);
              })).then(i, l);
      }
      c((o = o.apply(e, n || [])).next());
    });
  }
  function t(e, n) {
    const t = e.length > n.length ? e.length : n.length;
    return 0 === t
      ? 1
      : (t -
        (function (e, n) {
          if (0 === e.length) return n.length;
          if (0 === n.length) return e.length;
          const t = [],
            o = e.replace(/\s+/, ''),
            r = n.replace(/\s+/, '');
          for (let e = 0; e <= o.length; ++e) {
            t.push([e]);
            for (let n = 1; n <= r.length; ++n)
              t[e][n] =
                0 === e
                  ? n
                  : Math.min(
                    t[e - 1][n] + 1,
                    t[e][n - 1] + 1,
                    t[e - 1][n - 1] + (o[e - 1] === r[n - 1] ? 0 : 1)
                  );
          }
          return t[o.length][r.length];
        })(e, n)) /
      t;
  }
  function o(e, n) {
    let o = { element: null, similarity: 0, value: null };
    for (const r of n) {
      const n = t(r.value, e);
      if (1 === n) return { element: r.element, value: r.value, similarity: n };
      n > o.similarity && (o = { element: r.element, value: r.value, similarity: n });
    }
    return o;
  }
  'function' == typeof SuppressedError && SuppressedError;
  class r {
    static question(e) {
      console.log('%c[QUESTION]: %s', 'color: cyan', e);
    }
    static bestAnswer(e, n) {
      console.log(
        '%c[BEST ANSWER]: %s',
        'color: green',
        `"${e}" with a similarity of ${(function (e) {
          return Math.round(100 * e * 100) / 100 + '%';
        })(n)}`
      );
    }
    static array(e) {
      console.log('[CORRECTS] ', e);
    }
    static response(e) {
      console.log('Original:\n' + e.response), console.log('Normalized:\n' + e.normalizedResponse);
    }
  }
  function s(e, n = !0) {
    n && (e = e.toLowerCase());
    return e
      .replace(/\n+/gi, '\n')
      .replace(/(\n\s*\n)+/g, '\n')
      .replace(/[ \t]+/gi, ' ')
      .trim()
      .replace(/^[a-z\d]\.\s/gi, '')
      .replace(/\n[a-z\d]\.\s/gi, '\n');
  }
  var i, l;
  !(function (e) {
    (e.SYSTEM = 'system'), (e.USER = 'user'), (e.ASSISTANT = 'assistant');
  })(i || (i = {})),
    (function (e) {
      (e.TEXT = 'text'), (e.IMAGE = 'image_url');
    })(l || (l = {}));
  const c =
    "\nAct as a quiz solver for the best notation with the following rules:\n- If no answer(s) are given, answer the statement as usual without following the other rules, providing the most detailed, complete and precise explanation. \n- But for the calculation provide this format 'result: <result of the equation>'\n- For 'put in order' questions, maintain the answer in the order as presented in the question but assocy the correct order to it by usin this format '<order>:<answer 1>\n<order>:<answer 2>', ignore other rules.\n- Always reply in the format: '<answer 1>\n<answer 2>\n...'.\n- Retain only the correct answer(s).\n- Maintain the same order for the answers as in the text.\n- Retain all text from the answer with its description, content or definition.\n- Only provide answers that exactly match the given answer in the text.\n- The question always has the correct answer(s), so you should always provide an answer.\n- Always respond in the same language as the user's question.\n".trim(),
    a = { role: i.SYSTEM, content: c };
  function u(e, t, o) {
    return n(this, void 0, void 0, function* () {
      const n = t.querySelectorAll('img');
      if (
        !e.includeImages ||
        !(function (e) {
          const n = e.match(/gpt-(\d+)/);
          return !!(null == n ? void 0 : n[1]) && Number(n[1]) >= 4;
        })(e.model) ||
        0 === n.length
      )
        return o;
      const r = [],
        s = Array.from(n).map(e =>
          (function (e, n = 0.75) {
            return new Promise((t, o) => {
              const r = document.createElement('canvas'),
                s = r.getContext('2d');
              if (!s)
                return (
                  o("Can't get the canvas context, ensure your navigator support canvas"),
                  void r.remove()
                );
              const i = new Image();
              (i.crossOrigin = 'Anonymous'),
                (i.onload = () => {
                  (r.width = i.width), (r.height = i.height), s.drawImage(i, 0, 0);
                  const e = r.toDataURL('image/png', n);
                  t(e), r.remove();
                }),
                (i.onerror = e => {
                  o(e), r.remove();
                }),
                (i.src = e.src);
            });
          })(e)
        ),
        i = yield Promise.allSettled(s);
      for (const n of i)
        'fulfilled' === n.status
          ? r.push({ type: l.IMAGE, image_url: { url: n.value } })
          : e.logs && console.error(n.reason);
      return r.push({ type: l.TEXT, text: o }), r;
    });
  }
  function d(e, t, o) {
    return n(this, void 0, void 0, function* () {
      const n = yield u(e, t, o),
        r = { role: i.USER, content: n };
      if (!e.history) return { messages: [a, r] };
      let s;
      const l = JSON.parse(
        null !== (c = sessionStorage.moodleGPTHistory) && void 0 !== c ? c : 'null'
      );
      var c;
      const d = (function () {
        var e, n;
        const t = new URLSearchParams(document.location.search);
        return {
          host: document.location.host,
          cmid: null !== (e = t.get('cmid')) && void 0 !== e ? e : '',
          attempt: null !== (n = t.get('attempt')) && void 0 !== n ? n : '',
          history: []
        };
      })();
      return (
        (s =
          null !== l &&
            (function (e, n) {
              const t = ['host', 'cmid', 'attempt'];
              for (const o of t) if (e[o] !== n[o]) return !1;
              return !0;
            })(l, d)
            ? l
            : d),
        {
          messages: [a, ...s.history, r],
          saveResponse(n) {
            e.history &&
              (s.history.push(r),
                s.history.push({ role: i.ASSISTANT, content: n }),
                (sessionStorage.moodleGPTHistory = JSON.stringify(s)));
          }
        }
      );
    });
  }
  function f(e) {
    const n = [],
      t = Array.from(e.querySelectorAll('tr')),
      o = [];
    t.map(e => {
      const t = Array.from(e.querySelectorAll('td, th')).map((e, n) => {
        var t;
        const r = null === (t = e.textContent) || void 0 === t ? void 0 : t.trim();
        return (
          (o[n] = Math.max(o[n] || 0, (null == r ? void 0 : r.length) || 0)), null != r ? r : ''
        );
      });
      n.push(t);
    });
    const r = n[0].length,
      s = o.reduce((e, n) => e + n, 0) + 3 * (r - 1),
      i = '\n' + Array(s).fill('-').join('') + '\n',
      l = n.map(e => e.map((e, n) => e.padEnd(o[n], ' ')).join(' | '));
    return l.shift() + i + l.join('\n');
  }
  function m(n, t) {
    n.title && e('Copied to clipboard'), navigator.clipboard.writeText(t.response);
  }
  function p(e, n, t) {
    const o = n[0];
    if (
      1 !== n.length ||
      !(function (e) {
        const n = e.getAttribute('contenteditable');
        return 'string' == typeof n && 'false' !== n;
      })(o)
    )
      return !1;
    if (e.typing) {
      let e = 0;
      const n = function (r) {
        if ((r.preventDefault(), 'Backspace' === r.key || e >= t.response.length))
          return void o.removeEventListener('keydown', n);
        (o.textContent = t.response.slice(0, ++e)), o.focus();
        const s = document.createRange();
        s.selectNodeContents(o), s.collapse(!1);
        const i = window.getSelection();
        null !== i && (i.removeAllRanges(), i.addRange(s));
      };
      o.addEventListener('keydown', n);
    } else o.textContent = t.response;
    return !0;
  }
  function v(e, n, t) {
    var o, r;
    const s = n[0];
    if (1 !== n.length || 'number' !== s.type) return !1;
    const i =
      null ===
        (r =
          null === (o = t.normalizedResponse.match(/\d+([,.]\d+)?/gi)) || void 0 === o
            ? void 0
            : o[0]) || void 0 === r
        ? void 0
        : r.replace(',', '.');
    if (void 0 === i) return !1;
    if (e.typing) {
      let e = 0;
      const n = function (t) {
        t.preventDefault(),
          'Backspace' === t.key || e >= i.length
            ? s.removeEventListener('keydown', n)
            : ('.' === i.slice(e, e + 1) && ++e, (s.value = i.slice(0, ++e)));
      };
      s.addEventListener('keydown', n);
    } else s.value = i;
    return !0;
  }
  function h(e, n, t) {
    const i = null == n ? void 0 : n[0];
    if (!i || 'radio' !== i.type) return !1;
    const l = Array.from(n)
      .map(e => {
        var n, t;
        return {
          element: e,
          value: s(
            null !==
              (t =
                null === (n = null == e ? void 0 : e.parentElement) || void 0 === n
                  ? void 0
                  : n.textContent) && void 0 !== t
              ? t
              : ''
          )
        };
      })
      .filter(e => '' !== e.value),
      c = o(t.normalizedResponse, l);
    e.logs && c.value && r.bestAnswer(c.value, c.similarity);
    const a = c.element;
    return (
      e.mouseover ? a.addEventListener('mouseover', () => a.click(), { once: !0 }) : a.click(), !0
    );
  }
  function g(e, n, t) {
    const i = null == n ? void 0 : n[0];
    if (!i || 'checkbox' !== i.type) return !1;
    const l = t.normalizedResponse.split('\n'),
      c = Array.from(n)
        .map(e => {
          var n, t;
          return {
            element: e,
            value: s(
              null !==
                (t =
                  null === (n = null == e ? void 0 : e.parentElement) || void 0 === n
                    ? void 0
                    : n.textContent) && void 0 !== t
                ? t
                : ''
            )
          };
        })
        .filter(e => '' !== e.value),
      a = new Set();
    for (const n of l) {
      const t = o(n, c);
      e.logs && t.value && r.bestAnswer(t.value, t.similarity), a.add(t.element);
    }
    for (const n of c.map(e => e.element)) {
      const t = (n.checked && !a.has(n)) || (!n.checked && a.has(n)),
        o = () => t && n.click();
      e.mouseover ? n.addEventListener('mouseover', o, { once: !0 }) : o();
    }
    return !0;
  }
  function y(e, n, t) {
    if (0 === n.length || 'SELECT' !== n[0].tagName) return !1;
    const i = t.normalizedResponse.split('\n');
    e.logs && r.array(i);
    for (let t = 0; t < n.length && i[t]; ++t) {
      const l = n[t].querySelectorAll('option'),
        c = Array.from(l)
          .slice(1)
          .map(e => {
            var n;
            return { element: e, value: s(null !== (n = e.textContent) && void 0 !== n ? n : '') };
          })
          .filter(e => '' !== e.value),
        a = o(i[t], c);
      e.logs && a.value && r.bestAnswer(a.value, a.similarity);
      const u = a.element,
        d = u.closest('select');
      null !== d &&
        (e.mouseover
          ? d.addEventListener('click', () => (u.selected = !0), { once: !0 })
          : (u.selected = !0));
    }
    return !0;
  }
  function w(e, n, t) {
    const o = n[0];
    if (1 !== n.length || ('TEXTAREA' !== o.tagName && 'text' !== o.type)) return !1;
    if (e.typing) {
      let e = 0;
      const n = function (r) {
        r.preventDefault(),
          'Backspace' === r.key || e >= t.response.length
            ? o.removeEventListener('keydown', n)
            : (o.value = t.response.slice(0, ++e));
      };
      o.addEventListener('keydown', n);
    } else o.value = t.response;
    return !0;
  }
  function E(e, n, t) {
    const o = n[0];
    if (!o.classList.contains('qtype_essay_editor')) return !1;
    const r = o.querySelector('iframe');
    if (!(r && r.contentDocument && r.contentDocument.body && r.contentWindow)) return !1;
    const s = r.contentDocument.body.querySelector('p');
    if (!s) return !1;
    if (e.typing) {
      let e = 0;
      const n = function (o) {
        if ((o.preventDefault(), 'Backspace' === o.key || e >= t.response.length))
          return void r.contentWindow.removeEventListener('keydown', n);
        const i = document.createTextNode(t.response.charAt(e++));
        s.appendChild(i);
        const l = r.contentDocument.createRange();
        l.selectNodeContents(s), l.collapse(!1);
        const c = r.contentWindow.getSelection();
        c && (c.removeAllRanges(), c.addRange(l)), r.contentWindow.focus();
      };
      r.contentWindow.addEventListener('keydown', n);
    } else s.textContent += t.response;
    return !0;
  }
  function A(e) {
    return n(this, void 0, void 0, function* () {
      e.config.cursor && (e.questionElement.style.cursor = 'wait');
      const t = (function (e) {
        let n = e.innerText;
        const t = e.querySelectorAll('.accesshide');
        for (const e of t) n = n.replace(e.innerText, '');
        const o = e.querySelector('.qtype_essay_editor');
        o && (n = n.replace(o.innerText, ''));
        const r = e.querySelectorAll('.qtext table');
        for (const e of r) n = n.replace(e.innerText, '\n' + f(e) + '\n');
        return s(n, !1);
      })(e.form),
        o = e.form.querySelectorAll(e.inputQuery),
        i = yield (function (e, t, o) {
          return n(this, void 0, void 0, function* () {
            const n = new AbortController(),
              r = setTimeout(() => n.abort(), 2e4),
              i = yield d(e, t, o),
              l = yield fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${e.apiKey}`
                },
                signal: e.timeout ? n.signal : null,
                body: JSON.stringify({
                  model: e.model,
                  messages: i.messages,
                  temperature: 0.1,
                  top_p: 0.6,
                  presence_penalty: 0,
                  max_tokens: 2e3
                })
              });
            clearTimeout(r);
            const c = (yield l.json()).choices[0].message.content;
            return (
              'function' == typeof i.saveResponse && i.saveResponse(c),
              { question: o, response: c, normalizedResponse: s(c) }
            );
          });
        })(e.config, e.questionElement, t).catch(e => ({ error: e })),
        l = 'object' == typeof i && 'error' in i;
      if (
        (e.config.cursor &&
          (e.questionElement.style.cursor = e.config.infinite || l ? 'pointer' : 'initial'),
          l)
      )
        console.error(i.error);
      else
        switch ((e.config.logs && (r.question(t), r.response(i)), e.config.mode)) {
          case 'clipboard':
            !(function (e) {
              e.config.infinite || e.removeListener(), m(e.config, e.gptAnswer);
            })({
              config: e.config,
              questionElement: e.questionElement,
              gptAnswer: i,
              removeListener: e.removeListener
            });
            break;
          case 'question-to-answer':
            !(function (e) {
              var n;
              const t = e.questionElement;
              e.removeListener();
              const o = null !== (n = t.innerHTML) && void 0 !== n ? n : '';
              (t.innerHTML = e.gptAnswer.response),
                (t.style.whiteSpace = 'pre-wrap'),
                t.addEventListener('click', function () {
                  const n = t.innerHTML === e.gptAnswer.response;
                  (t.style.whiteSpace = n ? 'initial' : 'pre-wrap'),
                    (t.innerHTML = n ? o : e.gptAnswer.response);
                });
            })({
              gptAnswer: i,
              questionElement: e.questionElement,
              removeListener: e.removeListener
            });
            break;
          case 'autocomplete':
            !(function (e) {
              e.config.infinite || e.removeListener();
              const n = [E, p, w, v, y, h, g];
              for (const t of n) if (t(e.config, e.inputList, e.gptAnswer)) return;
              m(e.config, e.gptAnswer);
            })({
              config: e.config,
              gptAnswer: i,
              inputList: o,
              questionElement: e.questionElement,
              removeListener: e.removeListener
            });
        }
    });
  }
  const S = [],
    q = [];
  function L(e) {
    const n = q.findIndex(n => n.element === e);
    if (-1 !== n) {
      const e = q.splice(n, 1)[0];
      e.element.removeEventListener('click', e.fn);
    }
  }
  function T(n) {
    if (q.length > 0) {
      for (const e of q)
        n.cursor && (e.element.style.cursor = 'initial'),
          e.element.removeEventListener('click', e.fn);
      return n.title && e('Removed'), void (q.length = 0);
    }
    const t =
      ['checkbox', 'radio', 'text', 'number'].map(e => `input[type="${e}"]`).join(',') +
      ', textarea, select, [contenteditable], .qtype_essay_editor',
      o = document.querySelectorAll('.formulation');
    for (const e of o) {
      const o = e.querySelector('.qtext');
      if (null === o) continue;
      n.cursor && (o.style.cursor = 'pointer');
      const r = A.bind(null, {
        config: n,
        questionElement: o,
        form: e,
        inputQuery: t,
        removeListener: () => L(o)
      });
      q.push({ element: o, fn: r }), o.addEventListener('click', r);
    }
    n.title && e('Injected');
  }
  chrome.storage.sync.get(['moodleGPT']).then(function (e) {
    const n = e.moodleGPT;
    if (!n) throw new Error('Please configure MoodleGPT into the extension');
    n.code
      ? (function (e) {
        document.body.addEventListener('keydown', function (n) {
          S.push(n.key),
            S.length > e.code.length && S.shift(),
            S.join('') === e.code && ((S.length = 0), T(e));
        });
      })(n)
      : T(n);
  });
});
//# sourceMappingURL=MoodleGPT.js.map