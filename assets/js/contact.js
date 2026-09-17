/* Contact form.

   GitHub Pages cannot receive form posts, so the form works in two modes:
   - data-endpoint empty: compose the message in the visitor's email app.
   - data-endpoint set to a Formspree URL (https://formspree.io/f/xxxxxxx):
     send it directly and show the result inline.
   Without JS, the form's mailto: action still hands off to an email app. */
(function () {
  var form = document.querySelector('[data-contact]');
  if (!form) return;

  var status = form.querySelector('[data-status]');
  var button = form.querySelector('button[type="submit"]');
  var endpoint = (form.getAttribute('data-endpoint') || '').trim();
  var recipient = form.getAttribute('data-to');

  function say(message, kind) {
    status.textContent = message;
    status.setAttribute('data-kind', kind || '');
  }

  function field(data, name) {
    return String(data.get(name) || '').trim();
  }

  function openEmailApp(name, email, message) {
    var subject = 'Message from ' + name + ' via siyangni.com';
    var body = message + '\n\n' + name + '\n' + email;
    window.location.href = 'mailto:' + recipient +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    say('Your email app should open with the message filled in. If it does not, write to ' +
      recipient + '.', 'ok');
  }

  function sendToEndpoint(data) {
    button.disabled = true;
    say('Sending…');
    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        say('Thanks, your message was sent. I will reply by email.', 'ok');
      })
      .catch(function () {
        say('The message could not be sent. Please email ' + recipient + ' directly.', 'error');
      })
      .then(function () {
        button.disabled = false;
      });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var data = new FormData(form);
    // Honeypot: people never see this field, simple bots fill it in.
    if (field(data, '_gotcha')) return;

    var name = field(data, 'name');
    var email = field(data, 'email');
    var message = field(data, 'message');
    if (!name || !email || !message) {
      say('Please fill in your name, email, and message.', 'error');
      return;
    }

    if (endpoint) {
      sendToEndpoint(data);
    } else {
      openEmailApp(name, email, message);
    }
  });
})();
