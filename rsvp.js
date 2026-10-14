/* RSVP pop-up para sa details page.
   Nagse-save sa Google Sheet "Guest List" gamit ang Apps Script (Web app URL sa RSVP_URL).
   May ID bawat device: kapag nagbago ang sagot o pangalan, ia-update ang parehong row at hindi magdadagdag ng bago. */
(function () {
    var RSVP_URL = 'https://script.google.com/macros/s/AKfycby8xHofspSymk2mwuUxdeiD4IH5J5OW2ZIRvShS-OurMuk-Tcu_kb79utoKdOwSG8s/exec';   // Web app URL ng Apps Script (kapag nagpalit ng deployment, palitan dito)

    var $ = function (id) { return document.getElementById(id); };
    var modal = $('rsvpModal');
    var formView = $('rsvpFormView');
    var thanksView = $('rsvpThanks');
    var nameInput = $('rsvpName');
    var msgInput = $('rsvpMsg');
    var errorEl = $('rsvpError');
    var guestsRow = $('guestsRow');
    var guestsNum = $('guestsNum');
    var sendBtn = $('rsvpSend');
    var openBtn = $('rsvpBtn');

    var attending = '';   // 'yes' | 'no'
    var guests = 1;

    // Sino ang bisita (galing sa link na ipinadala sa kanila)
    var role = 'guest';
    try {
        var m = window.location.search.match(/[?&]from=([a-z]+)/);
        role = (m && m[1]) || sessionStorage.getItem('entry') || 'guest';
    } catch (e) {}
    var roleLabel = { ninong: 'Ninong', ninang: 'Ninang', guest: 'Guest' }[role] || 'Guest';

    $('rsvpSub').textContent = (role === 'ninong' || role === 'ninang')
        ? roleLabel + ', will you join Austin\'s 1st birthday?'
        : 'Will you join Austin\'s 1st birthday?';

    // Tandaan sa phone kung nag-RSVP na
    function saved() {
        try { return JSON.parse(localStorage.getItem('austin_rsvp') || 'null'); } catch (e) { return null; }
    }
    function save(data) {
        try { localStorage.setItem('austin_rsvp', JSON.stringify(data)); } catch (e) {}
    }
    // ID ng device: ginagawa bago mag-send, kaya kung mag-retry dahil walang signal, pareho pa rin ang ID (walang doble)
    var memId = '';
    function makeId() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // walang 0/O at 1/I para madaling basahin
        var out = '', i;
        try {
            var arr = new Uint8Array(6);
            (window.crypto || window.msCrypto).getRandomValues(arr);
            for (i = 0; i < arr.length; i++) { out += chars.charAt(arr[i] % chars.length); }
        } catch (e) {
            out = '';
            for (i = 0; i < 6; i++) { out += chars.charAt(Math.floor(Math.random() * chars.length)); }
        }
        return out;
    }
    function getId() {
        if (memId) return memId;
        var s = saved();
        if (s && s.id) { memId = s.id; return memId; }
        try { memId = localStorage.getItem('austin_rsvp_id') || ''; } catch (e) {}
        if (!memId) {
            memId = makeId();
            try { localStorage.setItem('austin_rsvp_id', memId); } catch (e) {}
        }
        return memId;
    }

    function refreshOpenBtn() {
        openBtn.innerHTML = saved() ? '&#10003; RSVP sent (tap to view)' : '&#128140; RSVP';
    }

    function setAttending(val) {
        attending = val;
        var btns = modal.querySelectorAll('.choice');
        for (var i = 0; i < btns.length; i++) {
            var on = btns[i].getAttribute('data-val') === val;
            btns[i].className = 'choice' + (on ? ' on' : '');
            btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
        }
        guestsRow.className = (val === 'yes') ? '' : 'hidden';
        errorEl.textContent = '';
    }

    function setGuests(n) {
        guests = Math.max(1, Math.min(10, n));
        guestsNum.textContent = guests;
    }

    function showForm(prefill) {
        thanksView.className = 'hidden';
        formView.className = '';
        if (prefill) {
            nameInput.value = prefill.name || '';
            msgInput.value = prefill.message || '';
            setAttending(prefill.attending || '');
            setGuests(prefill.guests || 1);
        }
    }

    function showThanks(data, updated) {
        var yes = data.attending === 'yes';
        $('thanksTitle').textContent = yes ? ('Yay, ' + data.name + '! \uD83C\uDF89') : ('We\'ll miss you, ' + data.name + '! \uD83D\uDC9B');
        $('thanksText').textContent = updated
            ? 'Your RSVP has been updated.'
            : (yes ? 'We can\'t wait to celebrate with you.' : 'Thank you for letting us know.');
        $('thanksRecap').className = yes ? 'rsvp-recap' : 'rsvp-recap hidden';
        $('thanksParty').textContent = 'Party of ' + data.guests;
        formView.className = 'hidden';
        thanksView.className = '';
    }

    function openModal() {
        modal.className = 'rsvp-overlay';
        document.body.style.overflow = 'hidden';
        var s = saved();
        if (s) { showThanks(s); } else { showForm(null); setTimeout(function () { nameInput.focus(); }, 350); }
    }
    function closeModal() {
        modal.className = 'rsvp-overlay hidden';
        document.body.style.overflow = '';
    }

    // Padala sa Apps Script. Success lang kapag kinumpirma ng Sheet na na-save ito.
    function send(payload, done, fail) {
        if (!RSVP_URL) {
            if (window.console) { console.warn('RSVP_URL is empty: walang kinokonektang Sheet.'); }
            fail('not-configured');
            return;
        }
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', RSVP_URL, true);
            xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');
            xhr.timeout = 20000;
            xhr.onload = function () {
                var r = null;
                try { r = JSON.parse(xhr.responseText); } catch (e) {}
                if (xhr.status >= 200 && xhr.status < 400 && r && r.ok === true) { done(r); } else { fail('server'); }
            };
            xhr.onerror = function () { fail('network'); };
            xhr.ontimeout = function () { fail('timeout'); };
            xhr.send(JSON.stringify(payload));
        } catch (e) { fail('error'); }
    }

    // ---- Mga event ----
    openBtn.addEventListener('click', openModal);
    $('rsvpClose').addEventListener('click', closeModal);
    $('rsvpDone').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.className.indexOf('hidden') === -1) closeModal();
    });

    var choices = modal.querySelectorAll('.choice');
    for (var i = 0; i < choices.length; i++) {
        choices[i].addEventListener('click', function () { setAttending(this.getAttribute('data-val')); });
    }
    $('guestsMinus').addEventListener('click', function () { setGuests(guests - 1); });
    $('guestsPlus').addEventListener('click', function () { setGuests(guests + 1); });

    $('rsvpEdit').addEventListener('click', function () { showForm(saved()); });

    sendBtn.addEventListener('click', function () {
        var name = nameInput.value.replace(/\s+/g, ' ').trim();
        if ($('rsvpWebsite').value) return;                 // honeypot (bot)
        if (name.length < 2) { errorEl.textContent = 'Please type your name.'; nameInput.focus(); return; }
        if (!attending) { errorEl.textContent = 'Please choose if you\'re coming.'; return; }
        errorEl.textContent = '';

        var payload = {
            id: getId(),
            name: name,
            attending: attending,
            guests: attending === 'yes' ? guests : 0,
            message: msgInput.value.trim(),
            role: role,
            sentAt: new Date().toISOString()
        };

        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        send(payload, function (r) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send RSVP';
            if (r && r.id) { payload.id = r.id; memId = r.id; }   // ID ng row sa Sheet (maaaring iba kung nahanap sa pangalan)
            save(payload);
            try { localStorage.setItem('austin_rsvp_id', payload.id); } catch (e) {}
            refreshOpenBtn();
            showThanks(payload, r && r.updated);
            if (payload.attending === 'yes' && typeof confettiFromEl === 'function') { confettiFromEl(sendBtn, 28); }
        }, function (why) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send RSVP';
            errorEl.textContent = (why === 'not-configured')
                ? 'RSVP isn\'t available yet. Please try again later.'
                : 'Oops, it didn\'t send. Please check your connection and try again.';
        });
    });

    setGuests(1);
    refreshOpenBtn();
})();
