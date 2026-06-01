// GPS-style route under the navbar.
(function () {
    const SECTION_ORDER = ['home', 'research', 'experience', 'projects', 'education', 'cv'];
    const TRACK_HEIGHT = 26;
    const ANIMATION_MS = 700;

    let svg, bgPath, trailPath, marker;
    let routePathEl;
    let stopLengths = [];
    let totalLength = 0;
    let currentIndex = 0;
    let currentLength = 0;
    let animFrame = null;
    let reducedMotion = false;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function getNavLinks() {
        return Array.from(document.querySelectorAll('.nav-link[data-section]'));
    }

    function sectionIndex(sectionId) {
        const i = SECTION_ORDER.indexOf(sectionId);
        return i >= 0 ? i : 0;
    }

    function buildRoutePath(points) {
        if (points.length === 0) return '';
        if (points.length === 1) {
            return `M ${points[0].x} ${points[0].y}`;
        }

        let d = `M ${points[0].x} ${points[0].y}`;
        const midY = TRACK_HEIGHT / 2;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cx = (prev.x + curr.x) / 2;
            const wobble = (i % 2 === 0 ? 1 : -1) * 3;
            d += ` Q ${cx} ${midY + wobble}, ${curr.x} ${curr.y}`;
        }

        return d;
    }

    function measureWaypoints() {
        const layer = document.querySelector('.nav-gps-layer');
        const links = getNavLinks();
        if (!layer || !links.length) return [];

        const layerRect = layer.getBoundingClientRect();
        const y = TRACK_HEIGHT / 2;

        return links.map((link) => {
            const rect = link.getBoundingClientRect();
            return {
                section: link.getAttribute('data-section'),
                x: rect.left + rect.width / 2 - layerRect.left,
                y,
            };
        });
    }

    function updateLayout() {
        const layer = document.querySelector('.nav-gps-layer');
        if (!svg || !layer) return;

        const width = layer.clientWidth;
        if (width < 1) return;

        svg.setAttribute('viewBox', `0 0 ${width} ${TRACK_HEIGHT}`);

        const waypoints = measureWaypoints();
        const d = buildRoutePath(waypoints);

        bgPath.setAttribute('d', d);
        trailPath.setAttribute('d', d);

        totalLength = bgPath.getTotalLength();
        stopLengths = waypoints.map((wp) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            const len = path.getTotalLength();
            let best = 0;
            let bestDist = Infinity;
            const steps = 80;
            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * len;
                const pt = path.getPointAtLength(t);
                const dist = Math.hypot(pt.x - wp.x, pt.y - wp.y);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = t;
                }
            }
            return best;
        });

        routePathEl = bgPath;
        currentLength = stopLengths[currentIndex] || 0;
        placeMarkerAtLength(currentLength, false);
        updateTrail(currentLength);
    }

    function placeMarkerAtLength(length, animatePulse) {
        if (!routePathEl || !marker) return;

        const pt = routePathEl.getPointAtLength(length);
        const next = routePathEl.getPointAtLength(Math.min(length + 1, totalLength));
        const angle = (Math.atan2(next.y - pt.y, next.x - pt.x) * 180) / Math.PI;

        marker.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle + 90})`);

        if (animatePulse) {
            marker.classList.remove('gps-marker--arrived');
            void marker.offsetWidth;
            marker.classList.add('gps-marker--arrived');
        }
    }

    function updateTrail(lengthTo) {
        if (!trailPath || totalLength <= 0) return;
        trailPath.style.strokeDasharray = `${lengthTo} ${totalLength}`;
    }

    function cancelAnimation() {
        if (animFrame) {
            cancelAnimationFrame(animFrame);
            animFrame = null;
        }
    }

    function animateToIndex(targetIndex) {
        cancelAnimation();

        const fromLen = currentLength;
        const toLen = stopLengths[targetIndex] ?? 0;
        currentIndex = targetIndex;

        if (reducedMotion || Math.abs(fromLen - toLen) < 0.5) {
            currentLength = toLen;
            placeMarkerAtLength(toLen, true);
            updateTrail(toLen);
            return;
        }

        const start = performance.now();

        function tick(now) {
            const t = Math.min((now - start) / ANIMATION_MS, 1);
            const eased = easeOutCubic(t);
            const len = fromLen + (toLen - fromLen) * eased;
            currentLength = len;

            placeMarkerAtLength(len, false);
            updateTrail(len);

            if (t < 1) {
                animFrame = requestAnimationFrame(tick);
            } else {
                animFrame = null;
                currentLength = toLen;
                placeMarkerAtLength(toLen, true);
                updateTrail(toLen);
            }
        }

        animFrame = requestAnimationFrame(tick);
    }

    function navigateTo(sectionId) {
        const targetIndex = sectionIndex(sectionId);
        if (targetIndex === currentIndex && !animFrame) return;
        animateToIndex(targetIndex);
    }

    function init() {
        svg = document.querySelector('.nav-gps-svg');
        bgPath = document.querySelector('.gps-route-bg');
        trailPath = document.querySelector('.gps-route-trail');
        marker = document.querySelector('.gps-marker');

        if (!svg || !bgPath || !trailPath || !marker) return;

        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const initialHash = window.location.hash.substring(1) || 'home';
        currentIndex = sectionIndex(initialHash);

        updateLayout();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const savedIndex = currentIndex;
                updateLayout();
                currentIndex = savedIndex;
                currentLength = stopLengths[currentIndex] || 0;
                placeMarkerAtLength(currentLength, false);
                updateTrail(currentLength);
            }, 120);
        });

        window.NavGpsTrack = { navigateTo, updateLayout };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
