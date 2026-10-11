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

/* Kusang lumalabas na balloons mula sa ibaba (hanggang 7 lang nang sabay) */
function startBalloons() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var layer = document.createElement('div');
    layer.id = 'balloonLayer';
    document.body.appendChild(layer);

    var colors = ['#E51B24', '#F9A72B', '#ffffff', '#ffd54f'];
    var active = 0;

    function spawn() {
        if (document.hidden || active >= 7) return;
        var w = window.innerWidth || document.documentElement.clientWidth;
        var h = window.innerHeight || document.documentElement.clientHeight;
        var size = 34 + Math.floor(Math.random() * 20);
        var dur = 7 + Math.random() * 4;

        var b = document.createElement('div');
        b.className = 'fly-balloon';
        b.style.left = Math.floor(Math.random() * (w - size)) + 'px';
        b.style.width = size + 'px';
        b.style.height = Math.round(size * 1.25) + 'px';
        b.style.setProperty('--rise', '-' + (h + 160) + 'px'); // negatibo = pataas
        b.style.webkitAnimationDuration = b.style.animationDuration = dur + 's';

        var body = document.createElement('span');
        body.className = 'fly-balloon-body';
        body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        b.appendChild(body);

        layer.appendChild(b);
        active++;
        setTimeout(function () {
            if (b.parentNode) b.parentNode.removeChild(b);
            active--;
        }, dur * 1000 + 200);
    }

    spawn();
    setInterval(spawn, 1100);
}
