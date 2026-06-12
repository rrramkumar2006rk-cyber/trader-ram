/*
  Cyber-Deck Interactive System
  Theme: Anti-Gravity Hacker Console
  Author: Antigravity for Ramkumar
*/

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------
    // 1. Audio Synthesizer (Web Audio API)
    // --------------------------------------------------
    class CyberSynth {
        constructor() {
            this.ctx = null;
            this.isMuted = true;
        }

        init() {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggleMute() {
            this.isMuted = !this.isMuted;
            this.init();
            return this.isMuted;
        }

        playClick() {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            
            // Fast transient click
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1000 + Math.random() * 500, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
            
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.05);
        }

        playBeep(freq = 600, duration = 0.08, type = 'sine') {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + duration + 0.01);
        }

        playAccessGranted() {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(880, now + 0.1);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(220, now);
            osc2.frequency.setValueAtTime(440, now + 0.1);
            
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.setValueAtTime(0.03, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc2.start(now);
            osc.stop(now + 0.4);
            osc2.stop(now + 0.4);
        }

        playError() {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.25);
            
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            
            // Simple lowpass filter to make it rough and cybernetic
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.3);
        }

        playAlarm() {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const duration = 1.5;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            // Siren sweeps
            for (let i = 0; i < duration; i += 0.25) {
                osc.frequency.linearRampToValueAtTime(400, now + i + 0.12);
                osc.frequency.linearRampToValueAtTime(150, now + i + 0.25);
            }
            
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.linearRampToValueAtTime(0.03, now + duration - 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + duration + 0.1);
        }
    }

    const synth = new CyberSynth();

    // --------------------------------------------------
    // Audio / HUD Control Click Listener
    // --------------------------------------------------
    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const soundStatus = document.getElementById('sound-status');

    soundToggleBtn.addEventListener('click', () => {
        const isMuted = synth.toggleMute();
        if (isMuted) {
            soundIcon.className = 'fa-solid fa-volume-xmark';
            soundStatus.textContent = 'AUDIO: MUTED';
        } else {
            soundIcon.className = 'fa-solid fa-volume-high';
            soundStatus.textContent = 'AUDIO: ACTIVE';
            synth.playBeep(880, 0.1, 'sine');
        }
    });

    // Proactively initialize audio contexts on body interactions
    const initializeAudioOnFirstTouch = () => {
        synth.init();
        document.body.removeEventListener('click', initializeAudioOnFirstTouch);
        document.body.removeEventListener('touchstart', initializeAudioOnFirstTouch);
    };
    document.body.addEventListener('click', initializeAudioOnFirstTouch);
    document.body.addEventListener('touchstart', initializeAudioOnFirstTouch);

    // --------------------------------------------------
    // 2. Anti-Gravity Particle Background Canvas
    // --------------------------------------------------
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const maxParticles = 90;
    const debrisChars = ['0', '1', '_', '$', '[', ']', '{', '}', '/', '<', '>', '&', '*'];

    let mouse = { x: null, y: null, radius: 140 };

    // Setup Canvas Sizes
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track Cursor for Anti-Gravity Field
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Structure
    class DebrisParticle {
        constructor() {
            this.reset(true);
        }

        reset(fullRandom = false) {
            this.x = Math.random() * window.innerWidth;
            this.y = fullRandom ? Math.random() * window.innerHeight : window.innerHeight + 20;
            this.size = Math.random() * 8 + 10; // Font size 10 to 18
            this.char = debrisChars[Math.floor(Math.random() * debrisChars.length)];
            this.speedY = -(Math.random() * 0.4 + 0.2); // Slow upward float
            this.speedX = Math.random() * 0.2 - 0.1;
            this.baseOpacity = Math.random() * 0.2 + 0.15; // Semi-transparent
            this.opacity = this.baseOpacity;
            this.angle = Math.random() * Math.PI * 2;
            this.angularSpeed = Math.random() * 0.005 - 0.0025;
            this.waveFrequency = Math.random() * 0.02 + 0.005;
            this.waveAmplitude = Math.random() * 0.3 + 0.1;
            this.isNode = Math.random() < 0.15; // 15% are structural node dots
        }

        update() {
            // Apply floating vectors
            this.y += this.speedY;
            this.angle += this.angularSpeed;
            // Float wave drift
            this.x += this.speedX + Math.sin(this.y * this.waveFrequency) * this.waveAmplitude;

            // Anti-gravity cursor deflection
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Deflection angle pushing away
                    const angle = Math.atan2(dy, dx);
                    
                    // Displace particle away from gravity source
                    this.x += Math.cos(angle) * force * 3;
                    this.y += Math.sin(angle) * force * 3;

                    // Light up particle under cursor influence
                    this.opacity = Math.min(0.8, this.opacity + 0.05);
                } else {
                    // Gradual reset of opacity
                    if (this.opacity > this.baseOpacity) {
                        this.opacity -= 0.01;
                    }
                }
            }

            // Recycle off top edge
            if (this.y < -20 || this.x < -20 || this.x > window.innerWidth + 20) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            if (this.isNode) {
                // Render small floating cyber-node dots
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
                ctx.fill();
                
                // Add soft outer aura glow
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
            } else {
                // Render code fragments
                ctx.font = `${this.size}px 'Fira Code', monospace`;
                // Accent colors: Cyan/Green/Purple
                if (this.char === '0' || this.char === '1') {
                    ctx.fillStyle = `rgba(0, 255, 102, ${this.opacity})`; // Green
                } else if (this.char === '$' || this.char === '_') {
                    ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`; // Cyan
                } else {
                    ctx.fillStyle = `rgba(189, 0, 255, ${this.opacity})`; // Purple
                }
                ctx.fillText(this.char, 0, 0);
            }
            ctx.restore();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new DebrisParticle());
    }

    // Connect floating nodes together
    function drawNodeConnections() {
        for (let i = 0; i < particles.length; i++) {
            if (!particles[i].isNode) continue;
            for (let j = i + 1; j < particles.length; j++) {
                if (!particles[j].isNode) continue;

                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                // Connect nodes with thin wireframes
                if (dist < 150) {
                    const alpha = (1 - dist / 150) * 0.12 * Math.min(particles[i].opacity, particles[j].opacity);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Core Particle Loop
    function animateParticles() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Update and Draw Debris
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw structural lines
        drawNodeConnections();

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --------------------------------------------------
    // 3. Typist Subtitle Effect (Hero Section)
    // --------------------------------------------------
    const subtitleEl = document.getElementById('typed-subtitle');
    const textsToType = [
        "Securing the digital frontier...",
        "Penetration Tester // Red Teamer",
        "Vulnerability Research & Exploits",
        "Investigating threat vectors...",
        "Access: Granted."
    ];
    let activeTextIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typeEffect() {
        const currentFullText = textsToType[activeTextIndex];
        
        if (isDeleting) {
            // Remove letters
            subtitleEl.textContent = currentFullText.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40; // Faster delete speed
        } else {
            // Add letters
            subtitleEl.textContent = currentFullText.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
            
            // Synthesize short keypress tick
            synth.playClick();
        }

        // If typing finishes word
        if (!isDeleting && charIndex === currentFullText.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } 
        // If deleting finishes word
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            activeTextIndex = (activeTextIndex + 1) % textsToType.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(typeEffect, typeSpeed);
    }
    // Start typing after initial load
    setTimeout(typeEffect, 1200);

    // --------------------------------------------------
    // 4. Glitch Decryption Hover Effects
    // --------------------------------------------------
    const glitchTitle = document.getElementById('glitch-title');
    const originalText = glitchTitle.textContent;
    let glitchInterval = null;

    function triggerGlitchEffect() {
        let iterations = 0;
        clearInterval(glitchInterval);
        synth.playBeep(700, 0.08, 'triangle');

        glitchInterval = setInterval(() => {
            glitchTitle.textContent = originalText.split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    // Select a cyber character randomly
                    return debrisChars[Math.floor(Math.random() * debrisChars.length)];
                })
                .join('');
            
            if (iterations >= originalText.length) {
                clearInterval(glitchInterval);
                glitchTitle.textContent = originalText;
            }
            
            iterations += 1/3;
        }, 30);
    }

    glitchTitle.addEventListener('mouseenter', triggerGlitchEffect);

    // --------------------------------------------------
    // 5. Skills Badges Cursor Proximity (Weightless Bobbing)
    // --------------------------------------------------
    const skillBadges = document.querySelectorAll('.skill-badge');
    const skillsContainer = document.querySelector('.skills-container');

    skillsContainer.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        skillBadges.forEach(badge => {
            const rect = badge.getBoundingClientRect();
            const badgeCenterX = rect.left + rect.width / 2;
            const badgeCenterY = rect.top + rect.height / 2;

            const dx = badgeCenterX - mouseX;
            const dy = badgeCenterY - mouseY;
            const distance = Math.hypot(dx, dy);

            // Within magnetic interactive threshold
            if (distance < 200) {
                const maxDisplacement = 25; // max displacement in pixels
                const strength = (200 - distance) / 200; // 0 (far) to 1 (near)
                
                // Displace badges weightlessly away from cursor
                const pushX = (dx / distance) * strength * maxDisplacement;
                const pushY = (dy / distance) * strength * maxDisplacement;

                badge.style.transform = `translate(${pushX}px, ${pushY}px) scale(1.05)`;
                badge.style.zIndex = "10";
            } else {
                // Clear inline style so CSS floating-bob transitions back
                badge.style.transform = '';
                badge.style.zIndex = '';
            }
        });
    });

    skillsContainer.addEventListener('mouseleave', () => {
        skillBadges.forEach(badge => {
            badge.style.transform = '';
            badge.style.zIndex = '';
        });
    });

    // --------------------------------------------------
    // 6. Interactive Terminal Command Line Simulator
    // --------------------------------------------------
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalBody = document.getElementById('terminal-body');

    // Focus terminal input when clicking inside the console body
    terminalBody.addEventListener('click', () => {
        terminalInput.focus();
    });

    // Focus terminal input when navigating to the terminal via link
    const terminalLinks = document.querySelectorAll('a[href="#terminal"]');
    terminalLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(() => {
                terminalInput.focus();
            }, 800);
        });
    });

    // Terminal Commands List
    const commandsList = {
        'help': [
            'System instructions available:',
            '  about     - Output dossier of Ramkumar',
            '  skills    - List threat analyst specialties',
            '  contact   - Secure contact routing gateways',
            '  hack      - Execute simulated server intrusion test',
            '  clear     - Cleanse the console buffer screen',
            '  sudo      - Execute instruction with administrative root privileges'
        ],
        'about': [
            'Dossier Details: RAMKUMAR',
            '==================================================',
            'Role: White Hat Ethical Hacker & Threat Specialist',
            'Focus: Infrastructure Auditing, Vulnerability Hunting',
            'Certifications: OSCP, Certified Ethical Hacker (CEH)',
            'Profile: Experienced in conducting automated security audits,',
            'building systems defenses, and manual penetration trials.'
        ],
        'skills': [
            'Capabilities Metrics:',
            '==================================================',
            '  - OS & Kernels       : Linux (Kali, Arch, RedHat)',
            '  - Coding & Shell     : Python, Bash scripts, Golang',
            '  - Network Audits     : Wireshark, Nmap, Packet Inspection',
            '  - Intrusion Kits     : Metasploit, Burp Suite, SQLMap',
            '  - Web Application    : OWASP Top-10 Audit, API Protection',
            '  - Cryptography       : Symmetric / Asymmetric Cryptosystems'
        ],
        'contact': [
            'Secure Gateways:',
            '==================================================',
            '  - Email     : ramkumar@cybersecurity.local',
            '  - GitHub    : https://github.com (Sec-Research)',
            '  - LinkedIn  : https://linkedin.com/in/ramkumar-sec',
            '  - PGP Fingerprint: 8F2A E711 0CB9 4A21 DDF6 E9C0 BD31 CFF8'
        ],
        'sudo': [
            'guest is not in the sudoers file. This incident will be reported.'
        ]
    };

    terminalInput.addEventListener('keydown', (e) => {
        // Play click sfx for every keystroke
        synth.playClick();

        if (e.key === 'Enter') {
            const rawCommand = terminalInput.value;
            const command = rawCommand.trim().toLowerCase();
            
            // Echo entered command
            createTerminalRow(`guest@cyberdeck:~$ ${rawCommand}`, 'command-echo');
            
            // Execute command
            if (command.length > 0) {
                executeTerminalCommand(command);
            }

            // Clear input buffer
            terminalInput.value = '';
            // Auto scroll console to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });

    function createTerminalRow(text, className = '') {
        const row = document.createElement('div');
        row.className = `terminal-row ${className}`;
        row.innerHTML = text;
        terminalOutput.appendChild(row);
    }

    function executeTerminalCommand(cmd) {
        if (cmd === 'clear') {
            terminalOutput.innerHTML = '';
            synth.playBeep(900, 0.05);
            return;
        }

        if (cmd === 'hack') {
            triggerMatrixHack();
            return;
        }

        if (commandsList.hasOwnProperty(cmd)) {
            synth.playBeep(800, 0.06);
            commandsList[cmd].forEach(line => {
                createTerminalRow(line);
            });
        } else {
            // Command Error Sfx and Output
            synth.playError();
            createTerminalRow(`bash: command not found: ${cmd}`, 'error-msg');
            createTerminalRow(`Type 'help' to audit accessible functions.`);
        }
    }

    // Cyber 'Hack' Script Animation
    function triggerMatrixHack() {
        synth.playAlarm();
        createTerminalRow('WARNING: RUNNING SECURITY INTRUSION EXPERIMENT...', 'error-msg');
        
        let logs = [
            'INITIATING SOCKET SCAN ON 127.0.0.1...',
            'PORT 80 (HTTP) [OPEN]',
            'PORT 443 (HTTPS) [OPEN]',
            'PORT 22 (SSH) [FILTERED]',
            'OVERFLOWING STACK BUFFER RANGE (0x7FFF)...',
            'INJECTING SHELLCODE...',
            'BYPASSING INTRUSION DETECTION SYSTEM...',
            'ACCESS LEVEL ELEVATION DETECTED...',
            'ROOT ACCESS SECURED.',
            'SYSTEM INTRUSION DEMONSTRATION SUCCESSFUL.'
        ];

        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < logs.length) {
                const isSuccess = logs[logIndex].includes('SECURED') || logs[logIndex].includes('SUCCESSFUL');
                const isWarning = logs[logIndex].includes('WARNING') || logs[logIndex].includes('INJECTING');
                
                let logClass = '';
                if (isSuccess) logClass = 'success-msg';
                else if (isWarning) logClass = 'error-msg';

                createTerminalRow(`[+] ${logs[logIndex]}`, logClass);
                synth.playBeep(400 + logIndex * 80, 0.04, 'sawtooth');
                terminalBody.scrollTop = terminalBody.scrollHeight;
                logIndex++;
            } else {
                clearInterval(logInterval);
                synth.playAccessGranted();
                createTerminalRow('// SHELL SESSION TERMINATED - CLEAN CONSOLE DISPATCHED.', 'success-msg');
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        }, 150);
    }

    // --------------------------------------------------
    // 7. Contact Form Security Encrypted Submission
    // --------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formScanOverlay = document.getElementById('form-scan');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        synth.playBeep(900, 0.1, 'sine');
        
        // Show simulated scan encryption panel
        formScanOverlay.classList.add('active');
        synth.playAlarm(); // sweeps pitch

        setTimeout(() => {
            // Access granted sound and form resets
            formScanOverlay.classList.remove('active');
            synth.playAccessGranted();
            alert('Security Transmission Broadcasted! Ramkumar will decode your message shortly.');
            contactForm.reset();
        }, 3200);
    });

    // --------------------------------------------------
    // 8. Mobile Navigation Dropdown Controls
    // --------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        synth.playBeep(800, 0.05);
    }

    mobileToggle.addEventListener('click', toggleMenu);

    // Close menu when links are clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // --------------------------------------------------
    // 9. Interactive Beeps on Cyber Button & Link Hover
    // --------------------------------------------------
    const interactiveElements = document.querySelectorAll('.btn, .nav-link, .social-btn, .hud-panel');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            synth.playBeep(1200, 0.02, 'sine');
        });
        el.addEventListener('click', () => {
            synth.playBeep(950, 0.05, 'triangle');
        });
    });
});
