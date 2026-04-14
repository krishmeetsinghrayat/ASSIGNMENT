// Configuration for the Elite Experience
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. LENIS SMOOTH SCROLLING (THE PHYSICS)
// ==========================================
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Synchronize Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// ==========================================
// 2. BOOT SEQUENCE (PRELOADER)
// ==========================================
window.onload = () => {
    const timerElem = document.getElementById('preloader-timer');
    const barElem = document.querySelector('.preloader-progress-bar');
    
    let progress = { val: 0 };
    
    gsap.to(progress, {
        val: 100,
        duration: 2.2,
        ease: "power3.inOut",
        onUpdate: function() {
            let p = Math.floor(progress.val);
            timerElem.textContent = p < 10 ? '0' + p : p;
            gsap.set(barElem, { width: p + '%' });
        },
        onComplete: function() {
            const tl = gsap.timeline();
            tl.to('.preloader-info, .preloader-progress-container', { opacity: 0, duration: 0.5, ease: "power2.inOut" })
              .to('.preloader-timer', { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.3")
              .to('#preloader', { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.5")
              .call(() => {
                  document.body.classList.remove('loading');
                  initHeroAnimations();
                  initScrollAnimations();
              });
        }
    });
};

// ==========================================
// 3. CURSOR MECHANICS
// ==========================================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
const cursorText = follower.querySelector('.cursor-text');

// Global variables for tracking
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// High-performance light tracking
function updateLighting() {
    document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
    requestAnimationFrame(updateLighting);
}
updateLighting();

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0, ease: 'none' });
    gsap.to(follower, { x: mouseX - 15, y: mouseY - 15, duration: 0.2, ease: 'power2.out' });
    
    // 3D Hero Parallax Tilt
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const xDist = (mouseX / window.innerWidth - 0.5) * 20; // max 10 deg
        const yDist = (mouseY / window.innerHeight - 0.5) * -20;
        gsap.to(heroContent, {
            rotationY: xDist,
            rotationX: yDist,
            duration: 1,
            ease: "power2.out"
        });
    }
});

document.querySelectorAll('a, button, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(follower, { width: 60, height: 60, x: '-=15', y: '-=15', duration: 0.3, ease: 'power2.out' });
        if(el.classList.contains('product-card')) {
            cursorText.textContent = "VIEW";
            gsap.to(cursorText, { opacity: 1, duration: 0.2 });
        } else {
            cursorText.textContent = "";
            gsap.to(cursorText, { opacity: 0, duration: 0.2 });
        }
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(follower, { width: 30, height: 30, x: '+=15', y: '+=15', duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorText, { opacity: 0, duration: 0.2 });
    });
    
    // Local Bloom for products
    if(el.classList.contains('product-card')) {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--mouse-local-x', `${e.clientX - rect.left}px`);
            el.style.setProperty('--mouse-local-y', `${e.clientY - rect.top}px`);
        });
    }
});

// Magnetic Buttons
document.querySelectorAll('.magnet-btn').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
        const bound = el.getBoundingClientRect();
        const x = e.clientX - bound.left - bound.width / 2;
        const y = e.clientY - bound.top - bound.height / 2;
        gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.5, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
});

// ==========================================
// 4. SPLIT TYPE & GSAP TEXT REVEALS
// ==========================================
// Pre-split the text elements
const splitElements = document.querySelectorAll('.split-me');
splitElements.forEach(el => {
    // Keep it block so words wrap properly if needed, but inner lines handle the overflow
    new SplitType(el, { types: 'lines, words, chars', tagName: 'span' });
    
    // Wrap lines for clipping mask effect
    const lines = el.querySelectorAll('.line');
    lines.forEach(line => {
        const wrapper = document.createElement('div');
        wrapper.style.overflow = 'hidden';
        wrapper.style.display = 'block';
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
    });
});

function initHeroAnimations() {
    gsap.from('.hero-subtitle', { y: 20, opacity: 0, duration: 1.5, ease: 'power4.out', delay: 0.2 });
    
    // Multi-stage 50 Lakh Reveal
    // Step 1: Initialize values
    gsap.set('.hero-title .char', {
        filter: 'blur(30px)',
        opacity: 0,
        scale: 1.5,
        fontVariationSettings: "'wght' 900"
    });

    // Step 2: Atmospheric resolve
    gsap.to('.hero-title .char', {
        filter: 'blur(0px)',
        opacity: 1,
        scale: 1,
        fontVariationSettings: "'wght' 400",
        duration: 2.5,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2
    });

    gsap.from('.hero-meta p', { y: 20, opacity: 0, duration: 1.5, stagger: 0.2, ease: 'power4.out', delay: 1.5 });
}

function initScrollAnimations() {
    // Hero Parallax Background
    gsap.to('.hero-bg', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // Philosophy Text Reveal
    const philLines = document.querySelectorAll('#philosophy .line .word');
    gsap.from(philLines, {
        yPercent: 120,
        duration: 1.2,
        stagger: 0.02,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: '.brand-story',
            start: 'top 70%',
        }
    });

    // Showroom Item Reveals (Images)
    gsap.utils.toArray('.product-card').forEach(card => {
        const wrapper = card.querySelector('.img-wrapper');
        const imgInner = card.querySelector('.img-inner');
        
        // Massive Mask Pull
        gsap.from(wrapper, {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.5,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: card, start: 'top 85%' }
        });
        
        // Slight image pre-scale down
        gsap.from(imgInner, {
            scale: 1.3,
            duration: 1.5,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: card, start: 'top 85%' }
        });
    });

    // Vision Studio Parallax Bridge
    gsap.to('.vision-bg', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: '.vision-hero', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    const visionLines = document.querySelectorAll('.vision-manifesto .line .word');
    gsap.from(visionLines, {
        yPercent: 120,
        duration: 1.2,
        stagger: 0.02,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: '.vision-manifesto',
            start: 'top 75%'
        }
    });

    const visionTitle = document.querySelectorAll('.vision-title .char');
    gsap.from(visionTitle, {
        yPercent: 120,
        rotationZ: 5,
        duration: 1.5,
        stagger: 0.04,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.vision-hero', start: 'top 60%' }
    });

    // Footer Text Reveal
    gsap.from('.footer-massive-logo .char', {
        yPercent: 120,
        duration: 1.5,
        stagger: 0.03,
        ease: 'expo.out',
        scrollTrigger: { trigger: 'footer', start: 'top 80%' }
    });
}

// ==========================================
// 5. COMMERCE & LEDGER LOGIC
// ==========================================
let cart = JSON.parse(localStorage.getItem('avenue_cart')) || [];
let activeCoupon = null;

const formatINR = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, amt));

const saveCart = () => {
    localStorage.setItem('avenue_cart', JSON.stringify(cart));
    updateCartDrawUI();
};

const calculateLedger = () => {
    const itemTotal = cart.reduce((acc, obj) => acc + (obj.price * obj.quantity), 0);
    // Luxury brand logic: massive carts get free shipping. Small carts get penalized.
    let logicFee = itemTotal > 0 && itemTotal < 70000 ? 500 : 0;
    
    let handling = itemTotal > 0 ? 250 : 0; // "Verification fee"
    let discount = 0;

    if (activeCoupon === 'ESSENTIAL500' && itemTotal >= 3000) discount = 500;
    else if (activeCoupon === 'SEOUL10' && itemTotal >= 15000) discount = Math.floor(itemTotal * 0.10);
    else if (activeCoupon === 'VIP2500' && itemTotal >= 40000) discount = 2500;
    else if (activeCoupon === 'BLACKCARD' && itemTotal >= 100000) discount = 15000;
    else activeCoupon = null; 

    // Abstract out the GST for UI simplicity in the drawer, show fully in checkout
    let total = itemTotal + logicFee + handling - discount;
    return { itemTotal, logicFee, handling, discount, total };
};

const updateCartDrawUI = () => {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalQty;
    
    const itemsEl = document.getElementById('drawer-items');
    itemsEl.innerHTML = '';
    const ledgerWrap = document.getElementById('drawer-ledger-wrapper');

    if (cart.length === 0) {
        itemsEl.innerHTML = '<p style="color:var(--muted-color); text-align:center; font-size:0.7rem;">NO ASSETS IN INDEX.</p>';
        ledgerWrap.style.display = 'none';
        activeCoupon = null;
    } else {
        cart.forEach((item, idx) => {
            // Highly minimal cart items
            itemsEl.innerHTML += `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p class="meta">SPEC: ${item.size} / QTY: ${item.quantity}</p>
                    <p class="cart-price">${formatINR(item.price * item.quantity)}</p>
                </div>
                <button onclick="window.remItem(${idx})" style="background:transparent; border:none; color:#888; font-size:0.6rem; cursor:pointer!important;">[X]</button>
            </div>`;
        });
        const state = calculateLedger();
        document.getElementById('drawer-total-content').textContent = formatINR(state.itemTotal);
        document.getElementById('drawer-total-logistics').textContent = state.logicFee === 0 ? 'COMPLIMENTARY' : formatINR(state.logicFee);
        document.getElementById('drawer-subtotal').textContent = formatINR(state.total);
        ledgerWrap.style.display = 'block';
    }
};

window.remItem = (idx) => {
    cart.splice(idx, 1);
    saveCart();
    if(document.getElementById('checkout-modal-overlay').classList.contains('active')) renderCheckoutLedger();
};

document.querySelectorAll('.add-to-bag').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const item = {
            id: card.dataset.id,
            name: card.dataset.name,
            price: parseInt(card.dataset.price),
            size: card.querySelector('.size-select').value
        };
        const exist = cart.find(x => x.id === item.id && x.size === item.size);
        if(exist) exist.quantity += 1; else { item.quantity = 1; cart.push(item); }
        saveCart();
        
        // Minimal confirmation blink
        const count = document.getElementById('cart-count');
        count.style.color = '#fff';
        setTimeout(() => { count.style.color = 'inherit'; }, 300);
        toggleCart(true);
    });
});

const toggleCart = (show) => {
    const wrap = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (show) {
        lenis.stop(); // Pause smooth scrolling while drawer is open
        wrap.classList.add('active');
        overlay.classList.add('active');
        setBotVisibility(true);
    } else {
        lenis.start();
        wrap.classList.remove('active');
        overlay.classList.remove('active');
        if(!document.getElementById('checkout-modal-overlay').classList.contains('active')) {
            setBotVisibility(false);
        }
    }
};

document.getElementById('cart-toggle-btn').addEventListener('click', () => toggleCart(true));
document.getElementById('close-drawer-btn').addEventListener('click', () => toggleCart(false));
document.getElementById('cart-drawer-overlay').addEventListener('click', () => toggleCart(false));

updateCartDrawUI();

// ==========================================
// 6. CHECKOUT HUD LOGIC
// ==========================================
const coOverlay = document.getElementById('checkout-modal-overlay');
const coSteps = document.querySelectorAll('.wizard-step');

const switchStep = (id) => {
    coSteps.forEach(s => s.classList.remove('active'));
    setTimeout(() => { document.getElementById(id).classList.add('active'); }, 50);
};

const renderCheckoutLedger = () => {
    const uiList = document.getElementById('checkout-review-items');
    uiList.innerHTML = '';
    cart.forEach(c => {
        uiList.innerHTML += `<div class="checkout-item-row"><span>${c.name} [${c.size}] <span style="color:var(--muted-color);">×${c.quantity}</span></span> <span>${formatINR(c.price * c.quantity)}</span></div>`;
    });

    const state = calculateLedger();
    const uiLedger = document.getElementById('checkout-detailed-ledger');
    let html = ``;
    html += `<div class="cl-row"><span>ASSET VALUE</span> <span>${formatINR(state.itemTotal)}</span></div>`;
    html += `<div class="cl-row"><span>AUTHENTICATION FEE</span> <span>${formatINR(state.handling)}</span></div>`;
    
    let lStr = state.logicFee === 0 ? 'COMPLIMENTARY' : formatINR(state.logicFee);
    html += `<div class="cl-row"><span>AERIAL LOGISTICS</span> <span>${lStr}</span></div>`;
    
    if (activeCoupon) {
        html += `<div class="cl-row" style="color:white;"><span>PROTOCOL: [${activeCoupon}]</span> <span>-${formatINR(state.discount)}</span></div>`;
    }
    
    html += `<div class="cl-row final"><span>NET ACQUISITION</span> <span>${formatINR(state.total)}</span></div>`;
    uiLedger.innerHTML = html;
};

document.getElementById('start-checkout-btn').addEventListener('click', () => {
    toggleCart(false);
    lenis.stop(); // Stop scroll when checkout opens
    coOverlay.classList.add('active');
    setBotVisibility(true);
    switchStep('wizard-1');
    renderCheckoutLedger();
});

document.getElementById('abandon-checkout-btn').addEventListener('click', () => {
    coOverlay.classList.remove('active');
    lenis.start();
    setBotVisibility(false);
});

// Coupons Configuration
document.getElementById('toggle-offers-btn').addEventListener('click', () => {
    const p = document.getElementById('offers-panel');
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.apply-offer').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const code = e.target.dataset.code;
        const total = cart.reduce((acc, obj) => acc + (obj.price * obj.quantity), 0);
        const errNode = document.getElementById('offer-error');
        errNode.textContent = '';
        
        let valid = false;
        if(code === 'ESSENTIAL500' && total >= 3000) valid = true;
        else if(code === 'SEOUL10' && total >= 15000) valid = true;
        else if(code === 'VIP2500' && total >= 40000) valid = true;
        else if(code === 'BLACKCARD' && total >= 100000) valid = true;
        
        if(valid) {
            activeCoupon = code;
            document.getElementById('offers-panel').style.display = 'none';
            renderCheckoutLedger();
        } else {
            // Blink Error
            errNode.textContent = 'PROTOCOL DENIED: CRITERIA UNMET.';
            setTimeout(() => errNode.textContent = '', 2000);
        }
    });
});

// Payment Method Switcher
document.querySelectorAll('input[name="payment_mode"]').forEach(r => {
    r.addEventListener('change', (e) => {
        const cWrap = document.getElementById('cc-form-wrapper');
        const cCod = document.getElementById('cod-wrapper');
        const labels = document.querySelectorAll('.pay-radio');
        
        labels.forEach(l => l.classList.remove('active'));
        e.target.parentElement.classList.add('active');

        if(e.target.value === 'cod') {
            cWrap.style.display = 'none';
            cCod.style.display = 'block';
            cWrap.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
        } else {
            cWrap.style.display = 'block';
            cCod.style.display = 'none';
            cWrap.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
        }
    });
});

document.querySelectorAll('.wizard-btn.next').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const f = e.target.closest('form');
        if(f && !f.checkValidity()) { f.reportValidity(); return; }
        e.preventDefault();
        switchStep(e.target.dataset.target);
    });
});

document.querySelectorAll('.wizard-btn.prev').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchStep(e.target.dataset.target);
    });
});

document.getElementById('final-confirm-btn').addEventListener('click', () => {
    const isCard = document.querySelector('input[name="payment_mode"]:checked').value === 'card';
    if(isCard) {
        if(!document.getElementById('cc-num').value || !document.getElementById('cc-cvv').value) {
            alert('SYSTEM HALT: INVALID DATA.');
            return;
        }
    }
    document.getElementById('track-id').textContent = 'AWB-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    cart = [];
    saveCart();
    activeCoupon = null;
    switchStep('wizard-4');
});

document.getElementById('finish-btn').addEventListener('click', () => {
    coOverlay.classList.remove('active');
    lenis.start();
    setBotVisibility(false);
});


// ==========================================
// 7. MULTIMILLION DOLLAR AI CONCIERGE HUD
// ==========================================
const botOrb = document.getElementById('chatbot-orb');
const botUI = document.getElementById('chatbot-ui');
const botBody = document.getElementById('cb-body');
const botInput = document.getElementById('cb-input');
const botSend = document.getElementById('cb-send');
const botStatus = document.getElementById('cb-status');

const setBotVisibility = (hide) => {
    if (hide) {
        botOrb.style.opacity = '0';
        botOrb.style.pointerEvents = 'none';
        botUI.classList.add('hidden');
    } else {
        botOrb.style.opacity = '1';
        botOrb.style.pointerEvents = 'auto';
    }
};

const apMsg = (txt, usr) => {
    const el = document.createElement('div');
    el.className = 'msg ' + (usr ? 'user-msg' : 'cb-reply');
    el.textContent = txt;
    botBody.appendChild(el);
    botBody.scrollTop = botBody.scrollHeight;
    return el;
};

const showTyping = () => {
    botStatus.textContent = 'COMPUTING...';
    const indicator = document.createElement('div');
    indicator.className = 'msg cb-reply';
    indicator.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    botBody.appendChild(indicator);
    botBody.scrollTop = botBody.scrollHeight;
    return indicator;
};

// Abstract AI Logic (Monolithic/Serious tone)
const aiBrain = (text) => {
    const t = text.toLowerCase();
    
    if (t.includes('shipping') || t.includes('track') || t.includes('delivery')) {
        return "Logistics executed via BlueDart Core. Expected India deployment: 3-5 days.";
    }
    if (t.includes('cod') || t.includes('cash')) {
        return "Physical Currency (COD) is accepted across 19,000+ Indian sectors. Cash handling authorized.";
    }
    if (t.includes('size') || t.includes('fit') || t.includes('large')) {
        return "Silhouettes are architecturally oversized. Maintain standard sizing for intended structural drape.";
    }
    if (t.includes('cart') || t.includes('bag')) {
        return "You have " + cart.reduce((a,c)=>a+c.quantity,0) + " assets retained in current session memory.";
    }
    if (t.includes('code') || t.includes('discount')) {
        return "Protocol [SEOUL10] grants 10% adjustment. Protocol [BLACKCARD] grants fixed adjustment for high-tier acquisitions.";
    }
    return "Query recorded. The system is parsing your request. Stand by or rephrase for specific metric extraction.";
};

const processAIResponse = (input) => {
    const indicator = showTyping();
    const delay = 1000 + (Math.random() * 1000); // 1-2 sec processing
    
    setTimeout(() => {
        indicator.remove();
        apMsg(aiBrain(input), false);
        botStatus.textContent = 'ONLINE';
    }, delay);
};

const hSend = () => {
    const t = botInput.value.trim();
    if(!t) return;
    apMsg(t, true);
    botInput.value = '';
    processAIResponse(t);
};

botOrb.addEventListener('click', () => {
    botUI.classList.remove('hidden');
    botOrb.style.opacity = '0';
    botOrb.style.pointerEvents = 'none';
});

document.getElementById('close-cb-btn').addEventListener('click', () => {
    botUI.classList.add('hidden');
    botOrb.style.opacity = '1';
    botOrb.style.pointerEvents = 'auto';
});

botSend.addEventListener('click', hSend);
botInput.addEventListener('keypress', e => { if(e.key === 'Enter') hSend(); });

// ==========================================
// 8. 100 CRORE DEVELOPER SIGNATURE LOGIC
// ==========================================
const devSig = document.getElementById('dev-sig');
if (devSig) {
    const devMat = devSig.querySelector('.dev-name-matrix');
    const origText = devMat.dataset.original;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789$#@%";
    
    const triggerGlitch = () => {
        let iterations = 0;
        clearInterval(devSig.interval);
        devSig.interval = setInterval(() => {
            devMat.innerText = origText.split("").map((letter, index) => {
                if (index < iterations) return origText[index];
                return letters[Math.floor(Math.random() * 41)];
            }).join("");
            if (iterations >= origText.length) clearInterval(devSig.interval);
            iterations += 1/2; // Extremely fast glitch
        }, 30);
    };

    // Auto-trigger glitch every 4.5 seconds to draw attention natively
    setInterval(triggerGlitch, 4500);

    // Also trigger on manual interaction
    devSig.addEventListener('mouseenter', triggerGlitch);
}
