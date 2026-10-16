/* Shared helpers: confetti + lumilipad na balloons.
   Gumagamit ng pixel values at -webkit- prefixes para gumana sa in-app browsers tulad ng Messenger. */

function confettiBurst(count) {
    var layer = document.getElementById('confettiLayer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'confettiLayer';
        document.body.appendChild(layer);
    }
    var w = window.innerWidth || document.documentElement.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight;
    var pieces = ['\uD83C\uDF89', '\uD83C\uDF88', '\u2B50', '\uD83C\uDF54', '\uD83C\uDF5F'];
    var colors = ['#E51B24', '#F9A72B', '#ffd54f', '#ffffff'];
    count = Math.min(count, 30); // mas magaan para sa phone

    for (var i = 0; i < count; i++) {
        (function () {
            var el = document.createElement('span');
            el.className = 'confetti';
            if (Math.random() < 0.3) {
                el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
                el.style.fontSize = '22px';
            } else {
                el.className += ' confetti-dot';
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            }
            var dur = 2 + Math.random() * 1.5;
            el.style.left = Math.floor(Math.random() * (w - 24)) + 'px';
            el.style.setProperty('--fall', (h + 60) + 'px');
            el.style.webkitAnimationDuration = el.style.animationDuration = dur + 's';
            el.style.webkitAnimationDelay = el.style.animationDelay = (Math.random() * 0.5) + 's';
            layer.appendChild(el);
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (dur + 0.7) * 1000);
        })();
    }
}

/* Confetti na sumasabog mula sa isang puwesto (halimbawa, mula mismo sa button) */
function confettiAt(x, y, count) {
    var layer = document.getElementById('confettiLayer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'confettiLayer';
        document.body.appendChild(layer);
    }
    var pieces = ['\uD83C\uDF89', '\uD83C\uDF88', '\u2B50', '\uD83C\uDF54', '\uD83C\uDF5F'];
    var colors = ['#E51B24', '#F9A72B', '#ffd54f', '#ffffff'];
    count = Math.min(count || 26, 30);

    for (var i = 0; i < count; i++) {
        (function () {
            var el = document.createElement('span');
            el.className = 'burst';
            if (Math.random() < 0.3) {
                el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
                el.style.fontSize = '22px';
            } else {
                el.className += ' confetti-dot';
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            }
            var angle = Math.random() * Math.PI * 2;
            var dist = 70 + Math.random() * 140;
            var dx = Math.cos(angle) * dist;
            var dy = Math.sin(angle) * dist - 50;   // bahagyang pataas muna
            var dur = 0.9 + Math.random() * 0.5;
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.setProperty('--dx', dx.toFixed(0) + 'px');
            el.style.setProperty('--dy', dy.toFixed(0) + 'px');
            el.style.setProperty('--dy2', (dy + 120).toFixed(0) + 'px');
            el.style.webkitAnimationDuration = el.style.animationDuration = dur + 's';
            layer.appendChild(el);
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (dur + 0.2) * 1000);
        })();
    }
}

function confettiFromEl(el, count) {
    var r = el.getBoundingClientRect();
    confettiAt(r.left + r.width / 2, r.top + r.height / 2, count);
}

/* Kusang lumalabas na balloons (may tali). Pindutin ang lobo para pumutok! */
function startBalloons() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var layer = document.getElementById('balloonLayer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'balloonLayer';
        document.body.appendChild(layer);
    }

    var colors = ['#E51B24', '#F9A72B', '#ffffff', '#ffd54f'];
    var active = 0;

    // Gabay: ang unang 2 lobo ay may maliit na "Tap to pop me!" na sumasama sa lobo (hindi nakatigil, kaya hindi sagabal).
    // Isang beses lang bawat session, at titigil kapag may nakapag-pop na.
    var tipsLeft = 2;
    var popped = false;
    try {
        if (sessionStorage.getItem('balloonTip')) { tipsLeft = 0; } else { sessionStorage.setItem('balloonTip', '1'); }
        if (sessionStorage.getItem('balloonPopped')) { popped = true; }
    } catch (e) {}

    var SVG = '<svg viewBox="0 0 40 80" aria-hidden="true">'
        + '<path class="hit" d="M20 2 C31 2 38 11 38 22 C38 34 29 43 20 46 C11 43 2 34 2 22 C2 11 9 2 20 2 Z" fill="currentColor" stroke="rgba(0,0,0,0.22)" stroke-width="1.5"/>'
        + '<path d="M20 46 C29 43 38 34 38 22 C37 33 29 40 20 42 Z" fill="#000" opacity="0.12"/>'
        + '<ellipse cx="12" cy="14" rx="3.5" ry="6.5" fill="#fff" opacity="0.55" transform="rotate(25 12 14)"/>'
        + '<polygon class="hit" points="20,45 16.5,51.5 23.5,51.5" fill="currentColor" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>'
        + '<path d="M20 51.5 C14 58 26 64 20 70 C16 75 23 78 20 80" fill="none" stroke="#555" stroke-width="1.4" stroke-linecap="round"/>'
        + '</svg>';

    function pop(b, color) {
        if (b._gone) return;
        b._gone = true;
        active--;
        popped = true;
        layer.className = 'tips-off';
        try { sessionStorage.setItem('balloonPopped', '1'); } catch (e) {}
        var r = b.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.width * 0.55;

        var ring = document.createElement('span');
        ring.className = 'pop-ring';
        ring.style.left = cx + 'px';
        ring.style.top = cy + 'px';
        layer.appendChild(ring);
        setTimeout(function () { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 400);

        for (var i = 0; i < 10; i++) {
            (function (i) {
                var bit = document.createElement('span');
                bit.className = 'pop-bit';
                var a = (Math.PI * 2 / 10) * i + Math.random() * 0.5;
                var d = 40 + Math.random() * 50;
                bit.style.left = cx + 'px';
                bit.style.top = cy + 'px';
                bit.style.backgroundColor = color;
                bit.style.setProperty('--px', (Math.cos(a) * d).toFixed(0) + 'px');
                bit.style.setProperty('--py', (Math.sin(a) * d).toFixed(0) + 'px');
                layer.appendChild(bit);
                setTimeout(function () { if (bit.parentNode) bit.parentNode.removeChild(bit); }, 700);
            })(i);
        }
        if (b.parentNode) b.parentNode.removeChild(b);
    }

    function spawn() {
        if (document.hidden || active >= 6) return;
        var w = window.innerWidth || document.documentElement.clientWidth;
        var h = window.innerHeight || document.documentElement.clientHeight;
        var size = 44 + Math.floor(Math.random() * 20);
        var dur = 8 + Math.random() * 4;
        var color = colors[Math.floor(Math.random() * colors.length)];

        var b = document.createElement('div');
        b.className = 'fly-balloon';
        var withTip = !popped && tipsLeft > 0;
        if (withTip) { tipsLeft--; }
        var left = Math.floor(Math.random() * (w - size));
        if (withTip) {
            // ilayo sa gilid para hindi maputol ang tip
            var center = 70 + Math.random() * Math.max(0, w - 140);
            left = Math.round(center - size / 2);
        }
        b.style.left = left + 'px';
        b.style.width = size + 'px';
        b.style.setProperty('--rise', '-' + (h + 180) + 'px'); // negatibo = pataas
        b.style.webkitAnimationDuration = b.style.animationDuration = dur + 's';

        var sway = document.createElement('span');
        sway.className = 'fly-balloon-sway';
        sway.style.color = color;
        sway.innerHTML = SVG;
        if (withTip) {
            var tip = document.createElement('span');
            tip.className = 'pop-tip';
            tip.textContent = 'Tap to pop me! \uD83D\uDC47';
            sway.appendChild(tip);
        }
        b.appendChild(sway);

        var hits = sway.querySelectorAll('.hit');
        for (var i = 0; i < hits.length; i++) {
            hits[i].addEventListener('click', function (ev) {
                // Kung may button/link sa ilalim ng daliri, ang button ang uunahin (hindi sagabal ang lobo sa pangunahing laman)
                if (document.elementsFromPoint) {
                    var under = document.elementsFromPoint(ev.clientX, ev.clientY);
                    for (var u = 0; u < under.length; u++) {
                        var el = under[u];
                        if (layer.contains(el)) { continue; }
                        var target = el.closest ? el.closest('button, a, [role="button"]') : null;
                        if (target) { target.click(); return; }
                    }
                }
                pop(b, color);
            });
        }

        layer.appendChild(b);
        active++;
        setTimeout(function () {
            if (!b._gone) {
                b._gone = true;
                active--;
                if (b.parentNode) b.parentNode.removeChild(b);
            }
        }, dur * 1000 + 300);
    }

    spawn();
    setInterval(spawn, 1200);
}


/* Pasunod-sunod na paglabas ng text (Ninong/Ninang pages):
   Hello -> bawat salita ng mensahe -> naka-highlight na Ninong?/Ninang? (may confetti) -> Yes! button.
   Pindutin ang text para laktawan at ipakita agad ang lahat. */
function startStory() {
    var root = document.documentElement;
    try {
        var story = document.getElementById('story');
        var card = document.getElementById('proposalPage');
        var btn = document.getElementById('yesBtn');
        var hint = card.querySelector('.tap-hint');
        var h1 = story.querySelector('h1');
        var ask = story.querySelector('.ask');
        var hl = story.querySelector('.hl');

        // Ipakita ang mga nakatagong elemento (hawak sila ng animation na opacity 0 hanggang sa oras nila)
        var hidden = story.querySelectorAll('h1, .msg, .ask');
        for (var i = 0; i < hidden.length; i++) hidden[i].style.visibility = 'visible';

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        function delay(el, s) {
            el.style.webkitAnimationDelay = el.style.animationDelay = s.toFixed(2) + 's';
        }

        var t = 0.6;
        h1.className += ' pop';
        delay(h1, t);
        t += 0.7;

        // Salita-por-salita
        var lines = story.querySelectorAll('.msg');
        for (var l = 0; l < lines.length; l++) {
            var p = lines[l];
            var words = p.textContent.replace(/\s+/g, ' ').trim().split(' ');
            p.innerHTML = '';
            for (var w = 0; w < words.length; w++) {
                var span = document.createElement('span');
                span.className = 'w';
                span.textContent = words[w];
                delay(span, t + w * 0.07);
                p.appendChild(span);
                p.appendChild(document.createTextNode(' '));
            }
            t += words.length * 0.07 + 0.35;
        }

        // Ang naka-highlight na salita
        ask.className += ' pop';
        delay(ask, t);
        hl.style.webkitAnimationDelay = hl.style.animationDelay = (t + 0.45).toFixed(2) + 's,' + (t + 1.4).toFixed(2) + 's';
        hl.style.setProperty('--hd', (t + 1.4).toFixed(2) + 's');
        var burstTimer = setTimeout(function () { confettiFromEl(hl, 22); }, (t + 0.5) * 1000);
        t += 1.2;

        // Button at hint
        btn.style.webkitAnimationDelay = btn.style.animationDelay = t.toFixed(2) + 's,' + (t + 1).toFixed(2) + 's';
        hint.className += ' fade-in';
        delay(hint, t + 0.8);

        // Laktawan kapag pinindot ang text
        story.addEventListener('click', function () {
            if (card.className.indexOf('skip') === -1) {
                card.className += ' skip';
                clearTimeout(burstTimer);
                confettiFromEl(hl, 22);
            }
        });
    } catch (e) {
        root.className = ''; // kung may problema, ipakita ang lahat nang walang animation
    }
}
