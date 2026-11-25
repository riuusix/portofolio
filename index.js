/* ==========================================================================
   DOODLEVERSE — Interactive Portfolio Engine (Vanilla ES6+)
   Preserves: Theme & Lang toggles, Greeting, Typing, Scroll Reveal, Mobile Nav,
   Projects Modal + Schema, Formspree Contact, GitHub API, Gaming/Music Folders.
   Adds: Theme persistence fix, full ID/EN parity, Mascot state machine,
   Scroll Progress, Active Nav Spy, Keyboard & Reduced-Motion accessibility.
   ========================================================================== */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    // -----------------------------------------------------------------------
    // 0. PHASE 7 — BOUNDED 4-NODE COMIC SFX POOL + OPTIONAL MUTED WEB AUDIO SYNTH
    // -----------------------------------------------------------------------
    const ComicAudio = (() => {
        let enabled = false;
        let ctx = null;

        function ensureCtx() {
            if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
                const Ctor = window.AudioContext || window.webkitAudioContext;
                ctx = new Ctor();
            }
            if (ctx && ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            return ctx;
        }

        function play(kind) {
            if (!enabled || prefersReducedMotion.matches) return;
            const ac = ensureCtx();
            if (!ac) return;
            try {
                const now = ac.currentTime;
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.connect(gain);
                gain.connect(ac.destination);

                if (kind === 'open') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(260, now);
                    osc.frequency.exponentialRampToValueAtTime(520, now + 0.085);
                    gain.gain.setValueAtTime(0.055, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                    osc.start(now);
                    osc.stop(now + 0.095);
                } else {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(420, now);
                    osc.frequency.exponentialRampToValueAtTime(190, now + 0.05);
                    gain.gain.setValueAtTime(0.035, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
                    osc.start(now);
                    osc.stop(now + 0.06);
                }
            } catch (_) {}
        }

        function toggle() {
            enabled = !enabled;
            const btn = document.getElementById('sound-toggle-btn');
            if (btn) {
                btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
                const iconOn = btn.querySelector('.sound-icon-on');
                const iconOff = btn.querySelector('.sound-icon-off');
                if (iconOn) iconOn.classList.toggle('hidden', !enabled);
                if (iconOff) iconOff.classList.toggle('hidden', enabled);
            }
            if (enabled) play('open');
        }

        return { play, toggle, isEnabled: () => enabled };
    })();

    const sfxLayer = document.getElementById('sfx-layer');
    const sfxStarburstSvg = `
        <svg viewBox="0 0 120 84" class="absolute inset-0 w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polygon points="60,3 73,20 98,10 92,31 117,38 97,52 108,73 82,66 72,82 56,67 35,80 34,59 9,62 23,44 4,29 29,27 25,8 48,19"
                fill="var(--paper)" stroke="var(--border-ink)" stroke-width="3" stroke-linejoin="round"/>
        </svg>
    `;

    // Bounded 4-node pool prevents unbounded DOM creation during rapid clicks
    const SFX_POOL_SIZE = 4;
    const sfxPool = [];
    let sfxCursor = 0;

    if (sfxLayer) {
        for (let i = 0; i < SFX_POOL_SIZE; i++) {
            const node = document.createElement('div');
            node.style.display = 'none';
            node.innerHTML = `${sfxStarburstSvg}<span class="sfx-popup-text"></span>`;
            sfxLayer.appendChild(node);
            sfxPool.push({ el: node, timer: null });
        }
    }

    function spawnSfx(word, targetEl, options) {
        if (!sfxLayer || !word || !sfxPool.length) return;
        const opts = options || {};
        const small = Boolean(opts.small);

        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        if (targetEl && typeof targetEl.getBoundingClientRect === 'function') {
            const rect = targetEl.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + Math.min(rect.height * 0.35, 36);
        }

        const pad = small ? 54 : 74;
        x = Math.max(pad, Math.min(window.innerWidth - pad, x));
        y = Math.max(pad, Math.min(window.innerHeight - pad, y));

        const slot = sfxPool[sfxCursor];
        sfxCursor = (sfxCursor + 1) % sfxPool.length;
        clearTimeout(slot.timer);

        const el = slot.el;
        el.className = '';
        el.style.display = 'flex';
        void el.offsetWidth; // restart keyframe on recycled node
        el.className = `sfx-popup${small ? ' sfx-popup-sm' : ''}`;
        el.style.left = `${Math.round(x)}px`;
        el.style.top = `${Math.round(y)}px`;
        el.style.width = small ? '84px' : '124px';
        el.style.height = small ? '58px' : '86px';
        el.style.setProperty('--sfx-rot', `${opts.rotate ?? (Math.random() > 0.5 ? -8 : 7)}deg`);
        const label = el.querySelector('.sfx-popup-text');
        if (label) label.textContent = word;

        ComicAudio.play(word === 'BAM!' ? 'open' : 'click');

        const lifetime = prefersReducedMotion.matches ? 260 : 620;
        slot.timer = setTimeout(() => {
            el.style.display = 'none';
            el.className = '';
        }, lifetime);
    }

    // Bind declarative [data-sfx] links/buttons (e.g. Hero CTAs -> BOOM!)
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-sfx]');
        if (!trigger) return;
        const word = trigger.getAttribute('data-sfx');
        // Project cards fire BAM! directly via openModal(id, el) so skip duplicate
        if (trigger.classList.contains('project-card') || trigger.classList.contains('issue-card')) return;
        spawnSfx(word, trigger);
    });

    // -----------------------------------------------------------------------
    // 1. COMPLETE BILINGUAL TRANSLATIONS (ID / EN PARITY)
    // -----------------------------------------------------------------------
    const translations = {
        id: {
            nav_home: 'Home',
            nav_about: 'Tentang',
            nav_projects: 'Project',
            nav_contact: 'Kontak',
            nav_drawer_note: 'Mau lompat ke panel mana?',
            hero_kicker: 'Meet the Developer!',
            hero_iam: 'Halo! Aku',
            hero_callme: '— atau panggil saja',
            hero_desc: 'Mahasiswa Informatika yang mengubah ide dan kopi menjadi pengalaman digital interaktif.',
            hero_focus: 'Fokus di:',
            hero_status: 'Open to Work',
            hero_cta_note: 'klik mascot-ku juga!',
            btn_projects: 'Lihat Karyaku',
            btn_cv: 'Download CV',
            about_kicker: 'Character Profile // Storyboard',
            about_title: 'Tentang Aku',
            about_speech: '<strong class="text-[var(--ink)]">"Halo! Aku Budi Nur Rahman</strong> — panggil saja <strong>Nara</strong>. Aku Fullstack Developer berusia 18 tahun di Jakarta. Bagiku, IT bukan cuma soal menulis baris kode, tapi tentang <strong>menciptakan solusi</strong>—mengasah <i>hardskill</i> dan <i>softskill</i> dari OSIS hingga memimpin tim developer saat magang di Icon Plus."',
            cb_p1_bubble: '"Biasanya semuanya dimulai dari sini—meja kecil, kopi hangat, sketchbook, dan rasa penasaran yang nggak pernah habis."',
            cb_p1_mindset: 'Buatku, nulis kode itu mirip bikin komik: tiap panel punya fungsi, alurnya harus enak dibaca, dan detail kecil bikin pengalaman terasa hidup.',
            cb_p2_bio: 'Mahasiswa Informatika di Universitas Nasional, Jakarta. Berangkat dari SMK jurusan Rekayasa Perangkat Lunak hingga membangun aplikasi web dan sistem backend untuk kebutuhan nyata.',
            cb_p2_nick: '&ldquo;Panggil saja Nara.&rdquo;',
            cb_p3_heading: 'DARI BARIS KODE PERTAMA KE TIM PRODUKSI',
            cb_p3_a: 'Mulai belajar logika pemrograman dan web development di SMK jurusan RPL, sambil mengasah komunikasi tim lewat OSIS.',
            cb_p3_b: 'Merancang prototipe mobile <strong>KotaKita</strong> (INFOVEST), mengeksplorasi <strong>React</strong>, hingga integrasi <strong>Gemini AI</strong> dengan Python di iAnalytics.',
            cb_p3_c: 'Memimpin tim developer saat PKL di Icon Plus, lalu berkontribusi sebagai <strong>Backend Developer</strong> dalam tim IT Universitas Nasional untuk <strong>Caturnawa 2026</strong> yang live di production.',
            cb_p3_d: 'Membangun aplikasi manajemen akademik mahasiswa yang sudah live di web dan terus berkembang ke mobile.',
            cb_p4_kicker: 'Selamat datang di halaman karyaku,',
            cb_p4_cta: 'BUKA HALAMAN PORTFOLIO &darr;',
            cb_p4_quip: '&ldquo;Yuk lihat karya &amp; pengalamanku!&rdquo;',
            about_origin_1_title: 'SMK — Rekayasa Perangkat Lunak (RPL)',
            about_origin_1_desc: 'Titik awal perjalanan koding: membangun fondasi logika pemrograman, web development, dan kepemimpinan aktif di OSIS.',
            about_origin_2_title: 'Informatika — Universitas Nasional',
            about_origin_2_desc: 'Terus mengeksplorasi teknologi baru mulai dari UI/UX, Web Framework modern, hingga integrasi AI & proyek kolaboratif.',
            trait_1_desc: 'Empatik, peka terhadap detail, dan tetap aktif berkolaborasi dalam tim.',
            trait_2_desc: 'Menganalisis dari banyak sudut pandang—senjata saat debugging & merancang UX.',
            trait_3_desc: 'Fokus menciptakan solusi nyata dari tahap ide hingga aplikasi siap rilis.',
            trait_4_desc: 'Eksplorasi konsisten dari UI/UX & Web Framework hingga integrasi AI.',
            about_note_header: 'Catatan Singkat // Bio',
            about_tools_note: 'senjata harian &rarr;',
            about_facts_title: 'Quick Notes:',
            about_fact_1: 'Mahasiswa Informatika — Universitas Nasional, Jakarta.',
            about_fact_2: 'Lulusan SMK Rekayasa Perangkat Lunak (RPL).',
            about_fact_3: 'Pernah memimpin tim developer saat magang di Icon Plus.',
            about_fact_4: 'Fokus di Fullstack Web, UI/UX Prototyping & integrasi AI.',
            journey_kicker: 'Chronological Journey',
            journey_title: 'Experience & Journey',
            journey_badge: '05 MILESTONES · CHRONICLE',
            tl_badge_start: 'STARTING POINT',
            tl_caturnawa_cta: 'Lihat Case Study &rarr;',
            proj_kicker: "Things I've Built",
            proj_title: 'Featured Projects',
            proj_open_hint: 'Detail &rarr;',
            vibe_kicker: 'The Human Side',
            vibe_open_folder: 'buka folder &rarr;',
            vibe_signoff: '— overthinking turned into clean UX',
            contact_kicker: 'Say Hello!',
            footer_connect: "Let's Connect & Draw Something Great!",
            footer_doodle_msg: 'Terima kasih sudah mampir!',
            aria_footer_doodle: 'Klik tanda tangan doodle Nara',
            about_p1: 'Halo! Aku Budi (bisa juga dipanggil Nara), seorang Fullstack Developer berusia 18 tahun yang berdomisili di Jakarta. Perjalanan kodingku sudah dimulai sejak bangku SMK jurusan Rekayasa Perangkat Lunak (RPL). Saat ini, aku sedang melanjutkan studi sebagai mahasiswa Informatika di Universitas Nasional, di mana aku terus mengeksplorasi teknologi baru dari UI/UX, Web Framework, hingga integrasi AI.',
            about_p2: 'Bagiku, IT bukan cuma soal menulis baris kode, tapi tentang menciptakan solusi. Selain fokus pada <i>hardskill</i>, aku juga mengasah <i>softskill</i> melalui pengalaman aktif di OSIS dan memimpin tim developer saat magang di Icon Plus. Pengalaman ini mengajariku banyak hal tentang <b>Leadership</b>, komunikasi tim, dan manajemen proyek dari tahap ide hingga siap rilis.',
            timeline_1: 'Titik awal perjalanan profesionalku. Membangun platform internal IT Support & Talent Mapping lintas supervisor (SPV) menggunakan Laravel 11 untuk mengelola resource divisi, melacak penugasan Project Manager (PM), dan memetakan dukungan aplikasi karyawan.',
            timeline_2: 'Merancang KotaKita, konsep aplikasi mobile Smart City untuk kompetisi INFOVEST. Fokus pada User Research, solusi kota cerdas, dan High-Fidelity Prototyping di Figma.',
            timeline_3: 'Mengeksplorasi integrasi Gemini AI melalui Python pada iAnalytics serta membangun antarmuka web interaktif modern menggunakan React JS.',
            timeline_4: 'Mengembangkan aplikasi manajemen akademik mahasiswa lintas platform. Versi web berbasis Next.js telah tersedia secara publik, pengembangan iOS menggunakan Swift sedang berjalan, dan ekspansi Android direncanakan pada tahap berikutnya.',
            timeline_5: 'Milestone terbaru dalam proyek kolaboratif production bersama Tim IT Universitas Nasional. Berperan sebagai Backend Developer menggunakan Next.js dan Supabase untuk skema database, autentikasi, API, pendaftaran peserta, verifikasi pembayaran/dokumen, serta logika penilaian dan leaderboard.',
            proj_subtitle: 'Klik kartu untuk detail &rarr;',
            badge_production: 'Production',
            badge_collab: 'Collaborative',
            badge_backend: 'Backend Dev',
            badge_live_web: 'Live Web',
            tracker_plat_web: 'Web &middot; Next.js',
            tracker_plat_ios: 'iOS &middot; Swift (Dev)',
            tracker_plat_android: 'Android (Planned)',
            contact_title: 'Kirimi Aku Pesan',
            contact_sub: 'Tertarik kolaborasi? Yuk diskusi bareng!',
            form_label_name: 'Nama',
            form_label_email: 'Email',
            form_label_message: 'Pesan',
            form_ph_name: 'Nama Kamu',
            form_ph_email: 'Email Kamu',
            form_ph_message: 'Tulis pesan...',
            btn_send: 'Kirim Pesan',
            btn_sending: 'Mengirim...',
            form_success: 'Pesan berhasil terkirim! Aku akan balas secepatnya.',
            form_error_prefix: 'Gagal mengirim: ',
            form_error_generic: 'Ada masalah teknis.',
            card_desc_caturnawa: 'Sistem manajemen & penilaian kompetisi nasional UNAS FEST yang telah live di production. Berkontribusi sebagai Backend Developer dalam tim IT Universitas Nasional.',
            card_desc_iconplus: 'App manajemen tiket & talent IT (PKL).',
            card_desc_tracker: 'Platform manajemen akademik lintas platform — live di web (Next.js) & ekspansi ke mobile.',
            card_desc_kotakita: 'Platform Smart City & Pelaporan Publik.',
            card_desc_festivo: 'Layanan web pembelian tiket konser/festival.',
            card_desc_gudang: 'Desain sistem manajemen stok gudang (PKL).',
            card_desc_splitbuddy: 'Aplikasi split payment / pembayaran patungan bersama.',
            card_desc_todo: 'Aplikasi manajemen tugas interaktif live di Vercel.',
            card_desc_ianalytics: 'Python parsing log iPhone terintegrasi Gemini API untuk analisis keaslian perangkat, Battery Health, dan diagnosis error hardware kritis.',
            vibe_title: 'Beyond Coding',
            vibe_subtitle: 'Kenali aku lebih dekat di luar urusan kode.',
            vibe_desc: 'Seorang introvert yang tetap punya energi untuk aktif dan bersosialisasi. Aku mungkin agak pemilih untuk urusan <i>inner circle</i>, tapi aku sangat terbuka dan berempati dengan siapa saja karena pada dasarnya aku adalah orang yang perasa. Sebagai seorang <i>overthinker</i>, aku terbiasa menganalisis sesuatu dari berbagai sudut pandang—sebuah sifat yang nyatanya sangat membantuku saat harus <i>debugging</i> kode yang rumit atau merancang <i>user flow</i> yang ramah pengguna!',
            vibe_game: 'Cara terbaik buat <i>refreshing</i> otak. Entah itu <i>push rank</i>, main RPG, atau membangun rute di game simulasi.',
            vibe_fantasy: 'Suka banget tenggelam dalam buku atau anime bergenre fantasi, walau tetap <i>open</i> ke genre seru lainnya.',
            vibe_music: 'Selalu ada <i>soundtrack</i> emosional buat menemani setiap baris kode yang ditulis.',
            modal_desc_label: 'Deskripsi Project',
            modal_tech_label: 'Tech Stack',
            modal_view_project: 'Lihat Project',
            modal_building: 'Masih Tahap Building',
            aria_back_to_top: 'Kembali ke atas',
            aria_close_modal: 'Tutup detail project',
            aria_close_folder: 'Tutup folder',
            aria_mascot: 'Karakter kartun Nara — klik untuk ganti ekspresi'
        },
        en: {
            nav_home: 'Home',
            nav_about: 'About',
            nav_projects: 'Projects',
            nav_contact: 'Contact',
            nav_drawer_note: 'Jump to which panel?',
            hero_kicker: 'Meet the Developer!',
            hero_iam: "Hello! I'm",
            hero_callme: '— or simply call me',
            hero_desc: 'An Informatics student turning ideas and coffee into interactive digital experiences.',
            hero_focus: 'Focusing on:',
            hero_status: 'Open to Work',
            hero_cta_note: 'click my mascot too!',
            btn_projects: 'View My Work',
            btn_cv: 'Download CV',
            about_kicker: 'Character Profile // Storyboard',
            about_title: 'About Me',
            about_speech: '<strong class="text-[var(--ink)]">"Hi! I\'m Budi Nur Rahman</strong> — call me <strong>Nara</strong>. I\'m an 18-year-old Fullstack Developer based in Jakarta. For me, IT isn\'t just about writing lines of code—it\'s about <strong>creating solutions</strong>, combining <i>hardskills</i> with <i>softskills</i> from student council leadership to leading a developer team during my internship at Icon Plus."',
            cb_p1_bubble: '"Most things start right here—a small desk, warm coffee, a sketchbook, and curiosity that never really runs out."',
            cb_p1_mindset: 'To me, writing code feels like making a comic: every panel has a purpose, the flow has to read effortlessly, and small details make the experience feel alive.',
            cb_p2_bio: 'Informatics student at Universitas Nasional, Jakarta. Started from Vocational High School in Software Engineering and grew into building real-world web apps and backend systems.',
            cb_p2_nick: '&ldquo;Call me Nara.&rdquo;',
            cb_p3_heading: 'FROM FIRST LINES OF CODE TO PRODUCTION TEAMS',
            cb_p3_a: 'Started learning programming logic and web development in Vocational High School (RPL), while sharpening team communication through student council.',
            cb_p3_b: 'Designed the <strong>KotaKita</strong> mobile prototype (INFOVEST), explored <strong>React</strong>, and integrated <strong>Gemini AI</strong> with Python in iAnalytics.',
            cb_p3_c: 'Led a developer team during my internship at Icon Plus, then contributed as a <strong>Backend Developer</strong> with the Universitas Nasional IT team on <strong>Caturnawa 2026</strong> in live production.',
            cb_p3_d: 'Building a multi-platform student academic management app already live on the web and expanding to mobile.',
            cb_p4_kicker: 'Welcome to my portfolio,',
            cb_p4_cta: 'OPEN PORTFOLIO PAGE &darr;',
            cb_p4_quip: '&ldquo;Come see my work &amp; journey!&rdquo;',
            about_origin_1_title: 'Vocational High School — Software Engineering (RPL)',
            about_origin_1_desc: 'Where the coding journey began: building core programming logic, web development fundamentals, and active student council leadership.',
            about_origin_2_title: 'Informatics — Universitas Nasional',
            about_origin_2_desc: 'Constantly exploring modern technologies ranging from UI/UX and Web Frameworks to AI integration and collaborative production apps.',
            trait_1_desc: 'Empathetic, observant of details, and energetic when collaborating with teams.',
            trait_2_desc: 'Analyzing problems from multiple angles—a huge advantage in debugging & UX design.',
            trait_3_desc: 'Focused on shipping real solutions from initial ideation through deployment.',
            trait_4_desc: 'Continuously exploring new craft across UI/UX, Web Frameworks, and AI.',
            about_note_header: 'Quick Sketch // Bio',
            about_tools_note: 'daily toolkit &rarr;',
            about_facts_title: 'Quick Notes:',
            about_fact_1: 'Informatics Student — Universitas Nasional, Jakarta.',
            about_fact_2: 'Vocational High School Graduate in Software Engineering (RPL).',
            about_fact_3: 'Led a developer team during my internship at Icon Plus.',
            about_fact_4: 'Focused on Fullstack Web, UI/UX Prototyping & AI integration.',
            journey_kicker: 'Chronological Journey',
            journey_title: 'Experience & Journey',
            journey_badge: '05 MILESTONES · CHRONICLE',
            tl_badge_start: 'STARTING POINT',
            tl_caturnawa_cta: 'View Case Study &rarr;',
            proj_kicker: "Things I've Built",
            proj_title: 'Featured Projects',
            proj_open_hint: 'Details &rarr;',
            vibe_kicker: 'The Human Side',
            vibe_open_folder: 'open folder &rarr;',
            vibe_signoff: '— overthinking turned into clean UX',
            contact_kicker: 'Say Hello!',
            footer_connect: "Let's Connect & Draw Something Great!",
            footer_doodle_msg: 'Thanks for stopping by!',
            aria_footer_doodle: "Click Nara's signature doodle",
            about_p1: "Hello! I'm Budi (also known as Nara), an 18-year-old Fullstack Developer based in Jakarta. My coding journey started back in Vocational High School (Software Engineering). Currently, I'm an Informatics student at Universitas Nasional, where I constantly explore new technologies ranging from UI/UX and Web Frameworks to AI integration.",
            about_p2: "For me, IT isn't just about writing lines of code; it's about creating solutions. Besides honing my <i>hardskills</i>, I've developed my <i>softskills</i> through active participation in the student council and by leading a developer team during my internship at Icon Plus. These experiences taught me a lot about <b>Leadership</b>, team communication, and project management from ideation to deployment.",
            timeline_1: 'Starting point of my professional journey. Built an internal IT Support & Talent Mapping platform across supervisors (SPV) using Laravel 11 to manage divisional resources, track Project Manager (PM) assignments, and map application support responsibilities.',
            timeline_2: 'Designed KotaKita, a Smart City mobile app concept for the INFOVEST competition. Focused on User Research, Smart City solution design, and High-Fidelity Prototyping in Figma.',
            timeline_3: 'Explored Gemini AI integration via Python in iAnalytics and built modern interactive web interfaces using React JS.',
            timeline_4: 'Developing a multi-platform academic management app for students. The Next.js web version is publicly live, iOS development in Swift is underway, and Android expansion is planned next.',
            timeline_5: 'Latest milestone in a collaborative production project with the Universitas Nasional IT team. Contributed as a Backend Developer using Next.js and Supabase covering database schema, authentication, APIs, participant registration, payment/document verification, and scoring/leaderboard logic.',
            proj_subtitle: 'Click a card for details &rarr;',
            badge_production: 'Production',
            badge_collab: 'Collaborative',
            badge_backend: 'Backend Dev',
            badge_live_web: 'Live Web',
            tracker_plat_web: 'Web &middot; Next.js',
            tracker_plat_ios: 'iOS &middot; Swift (Dev)',
            tracker_plat_android: 'Android (Planned)',
            contact_title: 'Send Me a Message',
            contact_sub: "Interested in collaborating? Let's talk!",
            form_label_name: 'Name',
            form_label_email: 'Email',
            form_label_message: 'Message',
            form_ph_name: 'Your Name',
            form_ph_email: 'Your Email',
            form_ph_message: 'Write your message...',
            btn_send: 'Send Message',
            btn_sending: 'Sending...',
            form_success: "Message sent! I'll get back to you as soon as possible.",
            form_error_prefix: 'Failed to send: ',
            form_error_generic: 'A technical error occurred.',
            card_desc_caturnawa: 'Official UNAS FEST national competition management & scoring platform live in production. Contributed as a Backend Developer within the Universitas Nasional IT team.',
            card_desc_iconplus: 'IT ticket & talent management app (Internship).',
            card_desc_tracker: 'Multi-platform academic management platform — live on web (Next.js) & expanding to mobile.',
            card_desc_kotakita: 'Smart City & Public Reporting Platform.',
            card_desc_festivo: 'Web service for purchasing concert/festival tickets.',
            card_desc_gudang: 'Warehouse stock management system design (Internship).',
            card_desc_splitbuddy: 'Split payment application for shared bills.',
            card_desc_todo: 'Interactive task management app live on Vercel.',
            card_desc_ianalytics: 'Python iPhone log parser integrated with Gemini API for authenticity checks, Battery Health, and critical hardware error diagnosis.',
            vibe_title: 'Beyond Coding',
            vibe_subtitle: 'Get to know me outside of coding.',
            vibe_desc: "An introvert with the energy to stay active and socialize. I might be a bit selective with my <i>inner circle</i>, but I'm highly open and empathetic with everyone because I'm naturally perceptive of others' feelings. As an <i>overthinker</i>, I'm used to analyzing things from multiple perspectives—a trait that actually helps me a lot when <i>debugging</i> complex code or designing user-friendly flows!",
            vibe_game: "The best way to refresh my mind. Whether it's pushing ranks, playing RPGs, or building transit routes in simulation games.",
            vibe_fantasy: "I love getting lost in fantasy books or anime, though I'm always open to other exciting genres.",
            vibe_music: "There's always an emotional soundtrack accompanying every line of code I write.",
            modal_desc_label: 'Project Overview',
            modal_tech_label: 'Tech Stack',
            modal_view_project: 'View Project',
            modal_building: 'Currently Building',
            aria_back_to_top: 'Back to top',
            aria_close_modal: 'Close project details',
            aria_close_folder: 'Close folder',
            aria_mascot: 'Cartoon Nara mascot — click to cycle expression'
        }
    };

    let currentLang = 'id';
    let activeProjectId = null;
    let activeFolderId = null;

    // -----------------------------------------------------------------------
    // 2. THEME TOGGLE (FIXED PERSISTENCE + ACCESSIBILITY)
    // -----------------------------------------------------------------------
    function syncThemeToggleUI() {
        const toggle = document.getElementById('themeToggle');
        const isDark = document.documentElement.classList.contains('dark');
        if (!toggle) return;
        toggle.classList.toggle('active', isDark);
        toggle.setAttribute('aria-pressed', String(isDark));
    }

    function toggleTheme() {
        const html = document.documentElement;
        const willBeDark = !html.classList.contains('dark');
        html.classList.toggle('dark', willBeDark);
        try {
            localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
        } catch (e) { }
        syncThemeToggleUI();
        spawnSfx('CLICK!', document.getElementById('themeToggle'), { small: true });
    }

    // -----------------------------------------------------------------------
    // 3. LANGUAGE TOGGLE (FULL STATIC + DYNAMIC PARITY)
    // -----------------------------------------------------------------------
    function applyLanguage(animate) {
        const dict = translations[currentLang];
        document.documentElement.lang = currentLang;

        document.querySelectorAll('[data-key]').forEach((el) => {
            const key = el.getAttribute('data-key');
            if (!dict[key]) return;
            if (animate && !prefersReducedMotion.matches) {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.innerHTML = dict[key];
                    el.style.opacity = '1';
                }, 140);
            } else {
                el.innerHTML = dict[key];
            }
        });

        document.querySelectorAll('[data-placeholder-key]').forEach((el) => {
            const key = el.getAttribute('data-placeholder-key');
            if (dict[key]) el.setAttribute('placeholder', dict[key]);
        });

        document.querySelectorAll('[data-aria-key]').forEach((el) => {
            const key = el.getAttribute('data-aria-key');
            if (dict[key]) el.setAttribute('aria-label', dict[key]);
        });

        updateGreeting();

        // Re-render open modal or folder so dynamic content stays translated
        if (activeProjectId && modal && modal.classList.contains('modal-visible')) {
            renderProjectModal(activeProjectId);
        }
        if (activeFolderId && iosFolder && iosFolder.classList.contains('folder-active')) {
            renderFolder(activeFolderId);
        }
    }

    function toggleLanguage() {
        const toggle = document.getElementById('langToggle');
        currentLang = currentLang === 'id' ? 'en' : 'id';
        if (toggle) {
            toggle.classList.toggle('active', currentLang === 'en');
            toggle.setAttribute('aria-pressed', String(currentLang === 'en'));
        }
        applyLanguage(true);
        spawnSfx('CLICK!', document.getElementById('langToggle'), { small: true });
    }

    // -----------------------------------------------------------------------
    // 4. TIME-BASED GREETING BADGE
    // -----------------------------------------------------------------------
    function updateGreeting() {
        const greetingBadge = document.getElementById('greeting-badge');
        if (!greetingBadge) return;
        const hour = new Date().getHours();
        let greeting = '';
        if (currentLang === 'id') {
            if (hour >= 5 && hour < 12) greeting = 'Selamat Pagi!';
            else if (hour >= 12 && hour < 15) greeting = 'Selamat Siang!';
            else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore!';
            else greeting = 'Selamat Malam!';
        } else {
            if (hour >= 5 && hour < 12) greeting = 'Good Morning!';
            else if (hour >= 12 && hour < 18) greeting = 'Good Afternoon!';
            else greeting = 'Good Evening!';
        }
        greetingBadge.textContent = greeting;
    }

    // -----------------------------------------------------------------------
    // 5. TYPING ANIMATION (REDUCED-MOTION AWARE)
    // -----------------------------------------------------------------------
    const textElement = document.getElementById('typing-text');
    const phrases = ['Fullstack Developer', 'UI/UX Enthusiast', 'Laravel Warrior', 'Problem Solver'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer = null;

    function typeEffect() {
        if (!textElement) return;
        if (prefersReducedMotion.matches) {
            textElement.textContent = phrases[0];
            return;
        }
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        let typeSpeed = isDeleting ? 48 : 95;
        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 420;
        }
        typingTimer = setTimeout(typeEffect, typeSpeed);
    }

    // -----------------------------------------------------------------------
    // 6. DOODLEVERSE CARTOON MASCOT (4 STATES + EYE TRACKING + QUIPS)
    // -----------------------------------------------------------------------
    const mascotBtn = document.getElementById('doodle-mascot');
    const mascotQuip = document.getElementById('mascot-quip');
    const mascotPupils = document.getElementById('mascot-pupils');

    const mascotStates = [
        {
            name: 'happy',
            quip: { id: 'Halo! Yuk lihat karyaku!', en: 'Hey! Check out my work!' },
            mouthId: 'mouth-happy',
            wink: false,
            browL: 'M49 52C53 50 58 50 62 52',
            browR: 'M78 52C82 50 87 50 91 52'
        },
        {
            name: 'focused',
            quip: { id: 'Mode ngoding + ngopi...', en: 'Coding + coffee mode...' },
            mouthId: 'mouth-focused',
            wink: false,
            browL: 'M49 51L62 54',
            browR: 'M91 51L78 54'
        },
        {
            name: 'amazed',
            quip: { id: 'Whoa, nol bug di prod?!', en: 'Whoa, zero bugs in prod?!' },
            mouthId: 'mouth-amazed',
            wink: false,
            browL: 'M49 48C53 45 58 45 62 48',
            browR: 'M78 48C82 45 87 45 91 48'
        },
        {
            name: 'wink',
            quip: { id: 'Ayo bikin proyek bareng!', en: "Let's build something fun!" },
            mouthId: 'mouth-wink',
            wink: true,
            browL: 'M49 52C53 50 58 50 62 52',
            browR: 'M78 50C82 48 87 48 91 50'
        }
    ];

    let mascotStateIdx = 0;
    let quipHideTimer = null;

    function setMascotState(idx, showQuip) {
        if (!mascotBtn) return;
        mascotStateIdx = idx % mascotStates.length;
        const state = mascotStates[mascotStateIdx];

        ['mouth-happy', 'mouth-focused', 'mouth-amazed', 'mouth-wink'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', id !== state.mouthId);
        });

        const eyeRight = document.getElementById('eye-right');
        const eyeRightWink = document.getElementById('eye-right-wink');
        if (eyeRight && eyeRightWink) {
            eyeRight.classList.toggle('hidden', state.wink);
            eyeRightWink.classList.toggle('hidden', !state.wink);
        }

        const browL = document.getElementById('brow-left');
        const browR = document.getElementById('brow-right');
        if (browL) browL.setAttribute('d', state.browL);
        if (browR) browR.setAttribute('d', state.browR);

        if (showQuip && mascotQuip) {
            mascotQuip.textContent = state.quip[currentLang];
            mascotQuip.classList.remove('opacity-0', 'translate-y-1');
            mascotQuip.classList.add('opacity-100', 'translate-y-0');
            clearTimeout(quipHideTimer);
            quipHideTimer = setTimeout(() => {
                mascotQuip.classList.add('opacity-0', 'translate-y-1');
                mascotQuip.classList.remove('opacity-100', 'translate-y-0');
            }, 2400);
        }
    }

    if (mascotBtn) {
        const mascotBurst = document.getElementById('mascot-burst');
        let mascotInView = true;

        const triggerMascotWave = () => {
            if (prefersReducedMotion.matches || !mascotInView) return;
            mascotBtn.classList.remove('is-waving');
            void mascotBtn.offsetWidth;
            mascotBtn.classList.add('is-waving');
            setTimeout(() => mascotBtn.classList.remove('is-waving'), 1050);
        };

        // Brief greeting wave on load + occasional gentle wave while visible
        if (!prefersReducedMotion.matches) {
            triggerMascotWave();
            setInterval(triggerMascotWave, 9500);
        }

        mascotBtn.addEventListener('click', () => {
            setMascotState(mascotStateIdx + 1, true);
            spawnSfx(mascotStateIdx % 2 === 0 ? 'POW!' : 'ZAP!', mascotBtn, { small: true });
            if (!prefersReducedMotion.matches) {
                mascotBtn.classList.remove('is-popping');
                void mascotBtn.offsetWidth;
                mascotBtn.classList.add('is-popping');

                if (mascotBurst) {
                    mascotBurst.classList.remove('is-firing');
                    void mascotBurst.offsetWidth;
                    mascotBurst.classList.add('is-firing');
                }
            }
        });

        // Pause mascot float, blink & wave when hero leaves viewport
        const mascotObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                mascotInView = entry.isIntersecting;
                mascotBtn.classList.toggle('mascot-paused', !entry.isIntersecting);
            });
        }, { threshold: 0.05 });
        mascotObserver.observe(mascotBtn);

        // Subtle desktop-only pupil tracking (throttled via rAF)
        if (supportsFinePointer.matches && !prefersReducedMotion.matches && mascotPupils) {
            let rafId = null;
            let lastX = 0;
            let lastY = 0;

            const updatePupils = () => {
                rafId = null;
                const rect = mascotBtn.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > window.innerHeight) return;
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = Math.max(-1, Math.min(1, (lastX - cx) / 260));
                const dy = Math.max(-1, Math.min(1, (lastY - cy) / 260));
                mascotPupils.style.transform = `translate(${(dx * 3).toFixed(2)}px, ${(dy * 2.5).toFixed(2)}px)`;
            };

            window.addEventListener('pointermove', (e) => {
                lastX = e.clientX;
                lastY = e.clientY;
                if (!rafId) rafId = requestAnimationFrame(updatePupils);
            }, { passive: true });
        }
    }

    // -----------------------------------------------------------------------
    // 7. SCROLL PROGRESS, NAV SHADOW, BACK-TO-TOP & ACTIVE SECTION SPY
    // -----------------------------------------------------------------------
    const scrollProgressBar = document.getElementById('scroll-progress');
    const navBar = document.querySelector('.comic-nav');
    const backToTopBtn = document.getElementById('back-to-top');
    const navLinks = document.querySelectorAll('[data-nav-section]');
    const sections = ['home', 'about', 'projects', 'contact']
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    function handleScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollProgressBar && docHeight > 0) {
            const progress = Math.min(1, Math.max(0, scrollY / docHeight));
            scrollProgressBar.style.transform = `scaleX(${progress})`;
        }

        if (navBar) {
            navBar.classList.toggle('is-scrolled', scrollY > 40);
        }

        if (backToTopBtn) {
            const show = scrollY > 300;
            backToTopBtn.classList.toggle('opacity-0', !show);
            backToTopBtn.classList.toggle('translate-y-10', !show);
            backToTopBtn.classList.toggle('pointer-events-none', !show);
        }

        // Active section scroll spy
        let currentSectionId = 'home';
        const offset = scrollY + 180;
        sections.forEach((sec) => {
            if (sec.offsetTop <= offset) {
                currentSectionId = sec.id;
            }
        });
        navLinks.forEach((link) => {
            const isActive = link.getAttribute('data-nav-section') === currentSectionId;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // -----------------------------------------------------------------------
    // 8. SCROLL REVEAL (SHARED INTERSECTION OBSERVER)
    // -----------------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    if (prefersReducedMotion.matches) {
        revealElements.forEach((el) => el.classList.add('active'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
        revealElements.forEach((el) => revealObserver.observe(el));
    }

    // -----------------------------------------------------------------------
    // 9. ACCESSIBLE MOBILE NAVIGATION DRAWER
    // -----------------------------------------------------------------------
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIconOpen = document.getElementById('mobile-menu-icon-open');
    const menuIconClose = document.getElementById('mobile-menu-icon-close');

    function setMenuOpen(open) {
        if (!mobileMenu || !menuBtn) return;
        menuBtn.setAttribute('aria-expanded', String(open));
        if (menuIconOpen) menuIconOpen.classList.toggle('hidden', open);
        if (menuIconClose) menuIconClose.classList.toggle('hidden', !open);

        if (open) {
            mobileMenu.classList.remove('hidden');
            requestAnimationFrame(() => {
                mobileMenu.classList.remove('menu-closed');
                mobileMenu.classList.add('menu-open');
            });
        } else {
            mobileMenu.classList.remove('menu-open');
            mobileMenu.classList.add('menu-closed');
            setTimeout(() => {
                if (mobileMenu.classList.contains('menu-closed')) {
                    mobileMenu.classList.add('hidden');
                }
            }, 260);
        }
    }

    function toggleMenu() {
        if (!mobileMenu) return;
        const isClosed = mobileMenu.classList.contains('menu-closed');
        setMenuOpen(isClosed);
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMenu);
    }

    // -----------------------------------------------------------------------
    // 10. PROJECTS DATA & ACCESSIBLE COMIC MODAL (BILINGUAL ID / EN)
    // -----------------------------------------------------------------------
    const modal = document.getElementById('project-modal');
    const modalMetaBadges = document.getElementById('modal-meta-badges');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalExtraSection = document.getElementById('modal-extra-section');
    const modalExtraTitle = document.getElementById('modal-extra-title');
    const modalExtraBody = document.getElementById('modal-extra-body');
    const modalTags = document.getElementById('modal-tags');
    const modalImg = document.getElementById('modal-img');
    const modalLinkContainer = document.getElementById('modal-link-container');
    const modalLink = document.getElementById('modal-link');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const projectsData = {
        caturnawa: {
            title: {
                id: 'Caturnawa 2026 — UNAS FEST',
                en: 'Caturnawa 2026 — UNAS FEST'
            },
            metaBadges: {
                id: [
                    { text: 'Production · Live', variant: 'live' },
                    { text: 'Collaborative Team Project', variant: 'dev' },
                    { text: 'Role: Backend Developer', variant: 'dev' }
                ],
                en: [
                    { text: 'Production · Live', variant: 'live' },
                    { text: 'Collaborative Team Project', variant: 'dev' },
                    { text: 'Role: Backend Developer', variant: 'dev' }
                ]
            },
            desc: {
                id: 'Caturnawa adalah sistem manajemen dan penilaian kompetisi resmi UNAS FEST (Universitas Nasional) yang telah beroperasi di production untuk mendukung Kompetisi Debat Bahasa Indonesia (KDBI) dan Advertising Competition (ADVC). Proyek ini dikerjakan secara kolaboratif oleh Tim IT Universitas Nasional, dengan kontribusi individuku berfokus penuh pada sisi Backend Development.',
                en: 'Caturnawa is the official competition management and scoring system of UNAS FEST (Universitas Nasional), publicly live in production to power Kompetisi Debat Bahasa Indonesia (KDBI) and the Advertising Competition (ADVC). Built collaboratively by the Universitas Nasional IT Team, my individual contribution focused specifically on Backend Development.'
            },
            extraTitle: {
                id: 'Kontribusi Backend Individuku (Dalam Tim)',
                en: 'My Individual Backend Contributions (Team Project)'
            },
            contributions: {
                id: [
                    'Perancangan skema dan struktur database',
                    'Sistem autentikasi dan otorisasi pengguna',
                    'Pengembangan API dan logika server-side',
                    'Alur backend pendaftaran peserta kompetisi',
                    'Sistem verifikasi pembayaran dan dokumen peserta',
                    'Logika penilaian (scoring) dan leaderboard kompetisi'
                ],
                en: [
                    'Database schema and relational design',
                    'Authentication and authorization workflows',
                    'API endpoints and server-side application logic',
                    'Participant registration backend workflow',
                    'Payment and document verification processing',
                    'Competition scoring and leaderboard logic'
                ]
            },
            tags: ['Next.js', 'Supabase'],
            img: 'img/project-caturnawa.png',
            link: 'https://caturnawa.unasfest.unas.ac.id/'
        },
        iconplus: {
            title: {
                id: 'Internal IT Support & Talent Mapping (Icon Plus)',
                en: 'Internal IT Support & Talent Mapping (Icon Plus)'
            },
            desc: {
                id: 'Aplikasi ini dirancang sebagai ekosistem profesional internal (seperti LinkedIn) dalam satu divisi perusahaan. Platform ini mempermudah pencarian talent yang siap masuk ke project baru, transparansi struktur tim (siapa anggotanya & siapa PM-nya), serta monitoring profil karyawan lintas supervisor (SPV) untuk mengetahui aplikasi apa saja yang sedang mereka support.',
                en: 'Designed as an internal professional ecosystem (similar to an internal LinkedIn) for an enterprise division. It streamlines finding available talent for new projects, brings transparency to team structures (members & Project Managers), and tracks cross-supervisor (SPV) employee profiles and supported applications.'
            },
            tags: ['Laravel 11', 'PHP', 'Tailwind', 'MySQL', 'Corporate Network'],
            isSchema: true,
            schemaNodes: {
                id: [
                    { icon: 'fa-sitemap', title: 'Div Directory', desc: 'Pantau profil & resource divisi lintas SPV.' },
                    { icon: 'fa-user-check', title: 'Talent Scout', desc: 'Cari karyawan available untuk project baru.' },
                    { icon: 'fa-user-tie', title: 'Governance', desc: 'Transparansi PM & daftar anggota tim aktif.' },
                    { icon: 'fa-cubes', title: 'App Mapping', desc: 'Lacak aplikasi produk apa yang di-support.' }
                ],
                en: [
                    { icon: 'fa-sitemap', title: 'Div Directory', desc: 'Monitor divisional profiles & resources across SPVs.' },
                    { icon: 'fa-user-check', title: 'Talent Scout', desc: 'Find available engineers ready for new projects.' },
                    { icon: 'fa-user-tie', title: 'Governance', desc: 'Transparent PM assignments & active team rosters.' },
                    { icon: 'fa-cubes', title: 'App Mapping', desc: 'Track which production apps each member supports.' }
                ]
            }
        },
        tracker: {
            title: { id: 'TrackerThings', en: 'TrackerThings' },
            metaBadges: {
                id: [
                    { text: 'Independent Project', variant: 'dev' },
                    { text: 'Web Live', variant: 'live' },
                    { text: 'Multi-Platform', variant: 'dev' }
                ],
                en: [
                    { text: 'Independent Project', variant: 'dev' },
                    { text: 'Web Live', variant: 'live' },
                    { text: 'Multi-Platform', variant: 'dev' }
                ]
            },
            desc: {
                id: 'Platform manajemen akademik lintas platform untuk mahasiswa—membantu mengatur jadwal kuliah, memantau deadline tugas, dan mencatat nilai ujian. Versi web saat ini dibangun dengan Next.js dan sudah dapat diakses secara publik, sementara pengembangan aplikasi iOS menggunakan Swift sedang berjalan dan ekspansi ke Android direncanakan pada tahap berikutnya.',
                en: 'A multi-platform academic management platform for university students—helping organize class schedules, track assignment deadlines, and record exam grades. The current web platform is built with Next.js and publicly live, while native iOS development in Swift is actively underway and Android expansion is planned next.'
            },
            extraTitle: {
                id: 'Status & Arah Pengembangan Multi-Platform',
                en: 'Multi-Platform Status & Direction'
            },
            platforms: {
                id: [
                    { name: 'Web', tech: 'Next.js', status: 'Tersedia / Live', variant: 'live' },
                    { name: 'iOS', tech: 'Swift', status: 'Dalam Pengembangan', variant: 'dev' },
                    { name: 'Android', tech: 'Tahap Berikutnya', status: 'Direncanakan', variant: 'planned' }
                ],
                en: [
                    { name: 'Web', tech: 'Next.js', status: 'Available / Live', variant: 'live' },
                    { name: 'iOS', tech: 'Swift', status: 'In Development', variant: 'dev' },
                    { name: 'Android', tech: 'Upcoming Platform', status: 'Planned', variant: 'planned' }
                ]
            },
            tags: ['Next.js', 'Swift (iOS Dev)', 'Android (Planned)'],
            img: 'img/project-tracker.png',
            link: 'https://trackerthings.vercel.app/'
        },
        kotakita: {
            title: { id: 'KotaKita (UI/UX Case Study)', en: 'KotaKita (UI/UX Case Study)' },
            desc: {
                id: 'Platform konsep Smart City untuk INVOFEST 2025. Menggabungkan fitur pelaporan fasilitas publik rusak dan pencarian ruang terbuka hijau.',
                en: 'A Smart City concept platform created for INVOFEST 2025, combining public facility damage reporting with green open space discovery.'
            },
            tags: ['Figma', 'User Research', 'Prototyping'],
            img: 'img/project-kotakita.png',
            link: 'https://www.figma.com/proto/Ch6ytISsLRValqUy4gJm2r/UI-UX-Infovest-2025_KotaKita_Budi-Nur-Rahman?node-id=68-98&t=IkPEjxylyxXDyod0-1'
        },
        festivo: {
            title: { id: 'Festivo', en: 'Festivo' },
            desc: {
                id: 'Platform layanan web komprehensif yang menyediakan fasilitas pembelian tiket untuk konser, festival, dan seminar. Aplikasi ini dirancang agar siap mendukung integrasi Payment Gateway API di masa pengembangan selanjutnya.',
                en: 'A comprehensive web ticketing platform for concerts, festivals, and seminars, architected to support future Payment Gateway API integration.'
            },
            tags: ['Laravel', 'PHP', 'MySQL', 'Web App'],
            img: 'img/project-festivo.png',
            link: 'empty'
        },
        gudang: {
            title: { id: 'Warehouse Management Dashboard', en: 'Warehouse Management Dashboard' },
            desc: {
                id: 'Desain konseptual UI/UX untuk aplikasi internal logistik (Tugas PKL). Menyajikan visualisasi dashboard untuk admin gudang memonitor rasio penjualan, arus barang masuk, dan laporan barang keluar secara real-time.',
                en: 'Conceptual UI/UX design for an internal logistics application (Internship task), providing real-time dashboard visualizations for stock ratios, inbound flow, and outbound reports.'
            },
            tags: ['UI/UX', 'Figma', 'Dashboard Design'],
            img: 'img/project-gudang.png',
            link: 'https://www.figma.com/proto/9aAxNQZmBE3OA1R3M2GX0c/Final-Task-Budi?node-id=0-1&t=UrpbB2H4SXtH7l5k-1'
        },
        splitbuddy: {
            title: { id: 'SplitBuddy', en: 'SplitBuddy' },
            desc: {
                id: 'Proyek kolaboratif perancangan UI/UX (Tugas PKL) untuk aplikasi split payment. Bertujuan memberikan solusi antarmuka yang intuitif bagi pengguna yang ingin membagi tagihan pembayaran makan atau belanja bersama teman.',
                en: 'A collaborative UI/UX design project (Internship task) for a split-payment mobile app, offering an intuitive flow for splitting dining and shopping bills with friends.'
            },
            tags: ['UI/UX', 'Figma', 'Teamwork', 'Mobile App'],
            img: 'img/project-splitbuddy.png',
            link: 'https://www.figma.com/proto/gAhf4vT3NapxPmDmt8h6Gu/Group-Task---End-to-end-Design-Apps?node-id=2005-8&t=frJyiwzE0jVTaUA0-1'
        },
        todo: {
            title: { id: 'React To-Do List', en: 'React To-Do List' },
            desc: {
                id: 'Aplikasi web manajemen tugas interaktif yang dibangun dari awal menggunakan framework React JS. Aplikasi ini sangat responsif dan telah berhasil di-deploy serta dapat diakses secara live menggunakan Vercel.',
                en: 'An interactive task management web app built from scratch with React JS—fully responsive and deployed live on Vercel.'
            },
            tags: ['React JS', 'Vercel', 'Frontend Development'],
            img: 'img/project-todo.png',
            link: 'https://to-do-list-three-xi-99.vercel.app/'
        },
        ianalytics: {
            title: { id: 'iAnalytics (iPhone Log AI Parser)', en: 'iAnalytics (iPhone Log AI Parser)' },
            desc: {
                id: 'Aplikasi analitik data berbasis Python (konsep mirip 3uTools). Mampu melakukan parsing data log internal iPhone untuk mengecek keaslian perangkat dan Battery Health. Fitur utamanya adalah integrasi dengan Gemini API, yang akan otomatis menganalisis dan memberikan saran perbaikan ketika sistem mendeteksi error hardware kritis seperti "Panic Full".',
                en: 'A Python-based analytics tool (inspired by 3uTools) that parses internal iPhone logs to inspect device authenticity and Battery Health. Powered by the Gemini API to automatically diagnose critical hardware errors like "Panic Full" and suggest repair steps.'
            },
            tags: ['Python', 'HTML', 'Gemini AI API', 'Data Parsing'],
            img: 'img/project-analytics.png',
            link: 'empty'
        }
    };

    let lastFocusedElement = null;

    function renderProjectModal(projectId) {
        const data = projectsData[projectId];
        if (!data || !modal) return;

        const dict = translations[currentLang];
        modalTitle.textContent = data.title[currentLang];
        modalDesc.textContent = data.desc[currentLang];

        // Optional classification & role badges
        if (modalMetaBadges) {
            modalMetaBadges.innerHTML = '';
            const badges = data.metaBadges ? data.metaBadges[currentLang] : null;
            if (badges && badges.length) {
                badges.forEach((b) => {
                    const span = document.createElement('span');
                    span.className = `status-pill status-pill-${b.variant || 'dev'}`;
                    span.textContent = b.text;
                    modalMetaBadges.appendChild(span);
                });
            }
        }

        // Optional structured extra block (Caturnawa backend contributions / TrackerThings multi-platform status)
        if (modalExtraSection && modalExtraTitle && modalExtraBody) {
            modalExtraBody.innerHTML = '';
            if (data.contributions && data.contributions[currentLang]) {
                modalExtraTitle.textContent = data.extraTitle[currentLang];
                const ul = document.createElement('ul');
                ul.className = 'grid grid-cols-1 sm:grid-cols-2 gap-2';
                data.contributions[currentLang].forEach((item) => {
                    const li = document.createElement('li');
                    li.className = 'flex items-start gap-2 text-xs md:text-sm text-[var(--ink)]';
                    li.innerHTML = `<span class="font-display font-extrabold text-[var(--ink)] mt-0.5">&bull;</span><span>${item}</span>`;
                    ul.appendChild(li);
                });
                modalExtraBody.appendChild(ul);
                modalExtraSection.classList.remove('hidden');
            } else if (data.platforms && data.platforms[currentLang]) {
                modalExtraTitle.textContent = data.extraTitle[currentLang];
                data.platforms[currentLang].forEach((plat) => {
                    const row = document.createElement('div');
                    row.className = 'flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--surface)] border-[1.5px] border-[var(--border-ink)]';
                    row.innerHTML = `
                        <div class="flex items-center gap-2">
                            <span class="font-display font-extrabold text-[var(--ink)]">${plat.name}</span>
                            <span class="text-[var(--muted-ink)] text-xs">&middot; ${plat.tech}</span>
                        </div>
                        <span class="status-pill status-pill-${plat.variant}">${plat.status}</span>
                    `;
                    modalExtraBody.appendChild(row);
                });
                modalExtraSection.classList.remove('hidden');
            } else {
                modalExtraSection.classList.add('hidden');
            }
        }

        const imgContainer = modalImg.parentElement;
        const defaultIcon = imgContainer.querySelector('.fa-image');
        const existingSchema = document.getElementById('schema-container');
        if (existingSchema) existingSchema.remove();

        if (data.isSchema) {
            modalImg.classList.add('hidden');
            if (defaultIcon) defaultIcon.classList.add('hidden');

            const schemaDiv = document.createElement('div');
            schemaDiv.id = 'schema-container';
            schemaDiv.className = 'absolute inset-0 w-full h-full p-4 grid grid-cols-2 gap-3 bg-[var(--warm-paper)] halftone-bg overflow-y-auto text-left text-xs z-10';
            const nodes = data.schemaNodes[currentLang];
            schemaDiv.innerHTML = nodes.map((node, i) => `
                <div class="p-3 rounded-xl border-2 border-[var(--border-ink)] bg-[var(--surface)] shadow-[3px_3px_0_var(--shadow-ink)] flex flex-col justify-center">
                    <span class="font-display font-extrabold text-[var(--ink)] block mb-1">
                        <span class="text-[10px] mr-1 opacity-60">0${i + 1}</span>
                        <i class="fas ${node.icon} mr-1" aria-hidden="true"></i>${node.title}
                    </span>
                    <p class="text-[11px] text-[var(--soft-ink)] leading-snug">${node.desc}</p>
                </div>
            `).join('');
            imgContainer.appendChild(schemaDiv);
        } else {
            modalImg.src = data.img;
            modalImg.alt = data.title[currentLang];
            modalImg.classList.remove('hidden');
            if (defaultIcon) defaultIcon.classList.add('hidden');
        }

        modalTags.innerHTML = '';
        data.tags.forEach((tag) => {
            const span = document.createElement('span');
            span.className = 'ink-stamp';
            span.textContent = tag;
            modalTags.appendChild(span);
        });

        if (data.link === 'empty') {
            modalLinkContainer.classList.remove('hidden');
            modalLink.removeAttribute('href');
            modalLink.setAttribute('aria-disabled', 'true');
            modalLink.innerHTML = `<i class="fas fa-hammer" aria-hidden="true"></i> <span>${dict.modal_building}</span>`;
            modalLink.className = 'ink-btn ink-btn-secondary px-5 py-2.5 text-sm opacity-60 cursor-not-allowed pointer-events-none';
        } else if (data.link) {
            modalLinkContainer.classList.remove('hidden');
            modalLink.href = data.link;
            modalLink.removeAttribute('aria-disabled');
            modalLink.innerHTML = `<i class="fas fa-external-link-alt" aria-hidden="true"></i> <span>${dict.modal_view_project}</span>`;
            modalLink.className = 'ink-btn ink-btn-primary px-5 py-2.5 text-sm';
        } else {
            modalLinkContainer.classList.add('hidden');
        }
    }

    function openModal(projectId, triggerEl) {
        if (!projectsData[projectId] || !modal) return;
        lastFocusedElement = triggerEl || document.activeElement;
        spawnSfx('BAM!', triggerEl || document.activeElement);
        activeProjectId = projectId;
        renderProjectModal(projectId);
        modal.classList.add('modal-visible');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('modal-visible');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeProjectId = null;
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    // -----------------------------------------------------------------------
    // 11. CONTACT FORM (PRESERVED FORMSPREE ENDPOINT + BILINGUAL FEEDBACK)
    // -----------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingIcon = document.getElementById('loading-icon');
    const btnText = submitBtn ? submitBtn.querySelector('span') : null;
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const dict = translations[currentLang];
            submitBtn.disabled = true;
            if (btnText) btnText.textContent = dict.btn_sending;
            if (loadingIcon) loadingIcon.classList.remove('hidden');
            if (formStatus) formStatus.classList.add('hidden');

            const formData = new FormData(contactForm);
            const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeoylydd';

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: { Accept: 'application/json' }
                });

                if (response.ok) {
                    formStatus.className = 'mt-4 text-center p-3 rounded-xl text-xs md:text-sm font-display font-bold bg-[var(--warm-paper)] text-[var(--ink)] border-2 border-[var(--border-ink)] shadow-[3px_3px_0_var(--shadow-ink)]';
                    formStatus.textContent = dict.form_success;
                    contactForm.reset();
                    setMascotState(0, true);
                    const env = document.getElementById('contact-envelope');
                    const envBurst = document.getElementById('envelope-burst');
                    if (env && !prefersReducedMotion.matches) {
                        env.classList.remove('is-sending');
                        void env.offsetWidth;
                        env.classList.add('is-sending');
                    }
                    if (envBurst && !prefersReducedMotion.matches) {
                        envBurst.classList.remove('is-firing');
                        void envBurst.offsetWidth;
                        envBurst.classList.add('is-firing');
                    }
                    spawnSfx('YAY!', env || submitBtn);
                } else {
                    const data = await response.json();
                    throw new Error(data.error || dict.form_error_generic);
                }
            } catch (error) {
                formStatus.className = 'mt-4 text-center p-3 rounded-xl text-xs md:text-sm font-display font-bold bg-[var(--ink)] text-[var(--paper)] border-2 border-[var(--border-ink)]';
                formStatus.textContent = dict.form_error_prefix + error.message;
            } finally {
                if (formStatus) formStatus.classList.remove('hidden');
                submitBtn.disabled = false;
                if (btnText) btnText.textContent = translations[currentLang].btn_send;
                if (loadingIcon) loadingIcon.classList.add('hidden');
                setTimeout(() => {
                    if (formStatus) formStatus.classList.add('hidden');
                }, 5000);
            }
        });
    }

    // -----------------------------------------------------------------------
    // 12. LIVE GITHUB STATS API (PRESERVED)
    // -----------------------------------------------------------------------
    const githubUsername = 'riuusix';
    const githubWidget = document.getElementById('github-stats');
    const githubLink = document.getElementById('gh-link');
    if (githubWidget && githubLink) {
        githubLink.href = `https://github.com/${githubUsername}`;
        fetch(`https://api.github.com/users/${githubUsername}`)
            .then((response) => {
                if (!response.ok) throw new Error('GitHub API unavailable');
                return response.json();
            })
            .then((data) => {
                const reposEl = document.getElementById('gh-repos');
                const followersEl = document.getElementById('gh-followers');
                if (reposEl) reposEl.textContent = data.public_repos;
                if (followersEl) followersEl.textContent = data.followers;
                githubWidget.classList.remove('hidden');
            })
            .catch(() => {
                // Gracefully keep widget hidden when rate-limited or offline
            });
    }

    // -----------------------------------------------------------------------
    // 13. GAMING & MUSIC FOLDER DRAWER (PRESERVED + BILINGUAL + FALLBACK)
    // -----------------------------------------------------------------------
    const folderData = {
        gaming: {
            title: { id: 'Games', en: 'Games' },
            subtitle: { id: 'Game favorit buat recharge otak.', en: 'Favorite games to recharge my brain.' },
            items: [
                { name: 'Mobile Legends', type: 'image', src: 'img/icon/ml.png', desc: { id: 'Ayo mabar push rank!', en: "Let's queue up and push rank!" } },
                { name: 'Honkai: Star Rail', type: 'image', src: 'img/icon/hsr.png', desc: { id: 'Gacha time!', en: 'Trailblazing & gacha time!' } },
                { name: 'Genshin Impact', type: 'image', src: 'img/icon/genshin.png', desc: { id: 'Eksplorasi Teyvat', en: 'Exploring Teyvat' } },
                { name: 'Transport Fever 2', type: 'image', src: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1066780/capsule_616x353.jpg', desc: { id: 'Lagi sibuk bangun rute kereta', en: 'Busy building train routes!' } }
            ]
        },
        music: {
            title: { id: 'Playlists', en: 'Playlists' },
            subtitle: { id: 'Yuk connect & dengerin bareng!', en: "Let's connect & listen together!" },
            items: [
                { name: 'Spotify', type: 'icon', icon: 'fab fa-spotify', url: 'https://open.spotify.com/user/317iwrepjm3j4cm3dlkw7qo64vni?si=9EuvQfw6RPCbGlvMwgcDjw', desc: { id: 'Buka profil Spotify Budi', en: "Open Budi's Spotify profile" } },
                { name: 'Apple Music', type: 'icon', icon: 'fab fa-apple', url: 'https://music.apple.com/profile/bieurs', desc: { id: 'Buka profil Apple Music Budi', en: "Open Budi's Apple Music profile" } }
            ]
        }
    };

    const iosFolder = document.getElementById('ios-folder');
    const folderGrid = document.getElementById('folder-grid');
    const folderTitle = document.getElementById('folder-title');
    const folderSubtitle = document.getElementById('folder-subtitle');
    const folderCloseBtn = document.getElementById('folder-close-btn');

    function renderFolder(folderId) {
        const data = folderData[folderId];
        if (!data || !folderGrid) return;

        folderTitle.textContent = data.title[currentLang];
        const sub = data.subtitle[currentLang];
        if (sub) {
            folderSubtitle.textContent = sub;
            folderSubtitle.classList.remove('hidden');
        } else {
            folderSubtitle.classList.add('hidden');
        }

        folderGrid.innerHTML = '';

        data.items.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'folder-icon-item flex flex-col items-center text-center gap-2 group cursor-pointer focus-visible:outline-none';
            btn.style.animationDelay = `${index * 0.08}s`;

            const iconBox = document.createElement('div');
            iconBox.className = 'w-[68px] h-[68px] rounded-2xl border-2 border-[var(--border-ink)] shadow-[3px_3px_0_var(--shadow-ink)] overflow-hidden bg-[var(--warm-paper)] flex items-center justify-center group-hover:-translate-y-1 transition-transform';

            if (item.type === 'image') {
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = item.name;
                img.loading = 'lazy';
                img.className = 'w-full h-full object-cover mono-reveal-img';
                img.onerror = () => {
                    iconBox.innerHTML = '<i class="fas fa-gamepad text-2xl text-[var(--ink)]" aria-hidden="true"></i>';
                };
                iconBox.appendChild(img);
            } else {
                iconBox.classList.add('bg-[var(--ink)]', 'text-[var(--paper)]', 'text-3xl');
                iconBox.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i>`;
            }

            const label = document.createElement('span');
            label.className = 'text-[11px] font-display font-bold text-[var(--ink)] line-clamp-2 leading-tight';
            label.textContent = item.name;

            btn.appendChild(iconBox);
            btn.appendChild(label);

            btn.addEventListener('click', () => {
                if (item.url) {
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                } else {
                    alert(item.desc[currentLang]);
                }
            });

            folderGrid.appendChild(btn);
        });
    }

    function openFolder(folderId) {
        if (!folderData[folderId] || !iosFolder) return;
        lastFocusedElement = document.activeElement;
        activeFolderId = folderId;
        renderFolder(folderId);
        iosFolder.classList.add('folder-active');
        iosFolder.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (folderCloseBtn) folderCloseBtn.focus();
    }

    function closeFolder() {
        if (!iosFolder) return;
        iosFolder.classList.remove('folder-active');
        iosFolder.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeFolderId = null;
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    // -----------------------------------------------------------------------
    // 14. GLOBAL KEYBOARD ACCESSIBILITY (ESCAPE TO CLOSE OVERLAYS / SKIP INTRO)
    // -----------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (iosFolder && iosFolder.classList.contains('folder-active')) {
            closeFolder();
        } else if (modal && modal.classList.contains('modal-visible')) {
            closeModal();
        } else if (mobileMenu && mobileMenu.classList.contains('menu-open')) {
            setMenuOpen(false);
            if (menuBtn) menuBtn.focus();
        } else if (document.body.classList.contains('in-comic-opening')) {
            skipComicOpening();
        }
    });

    // -----------------------------------------------------------------------
    // 14B. FOOTER SIGNATURE DOODLE EASTER EGG
    // -----------------------------------------------------------------------
    const footerDoodle = document.getElementById('footer-doodle');
    const footerDoodleNote = document.getElementById('footer-doodle-note');
    let footerDoodleTimer = null;
    if (footerDoodle && footerDoodleNote) {
        footerDoodle.addEventListener('click', () => {
            spawnSfx('ZAP!', footerDoodle, { small: true });
            footerDoodleNote.classList.remove('opacity-0');
            footerDoodleNote.classList.add('opacity-100');
            clearTimeout(footerDoodleTimer);
            footerDoodleTimer = setTimeout(() => {
                footerDoodleNote.classList.add('opacity-0');
                footerDoodleNote.classList.remove('opacity-100');
            }, 3000);
        });
    }

    // -----------------------------------------------------------------------
    // 16. PHASE 9 — LOADING SCREEN + INTRO-ONLY RUSH-UP COMIC WALL PARALLAX
    // -----------------------------------------------------------------------
    const p9Loader = document.getElementById('p9-loader');
    const p9Spacer = document.getElementById('p9-wall-spacer');
    const p9Overlay = document.getElementById('p9-wall-overlay');
    const p9SkipBtn = document.getElementById('p9-skip-btn');
    const p9ScrollCue = document.getElementById('p9-scroll-cue');
    const heroSection = document.getElementById('home');

    function dismissLoader() {
        if (p9Loader) {
            p9Loader.classList.add('is-done');
            p9Loader.setAttribute('aria-hidden', 'true');
        }
    }

    function skipComicOpening() {
        dismissLoader();
        if (!heroSection) return;
        document.body.classList.remove('in-comic-opening');
        if (p9Overlay) p9Overlay.classList.add('is-cleared');
        heroSection.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    }

    function initScrollComicOpening() {
        if (!p9Spacer || !p9Overlay || !heroSection) return;

        // Bypass completely for prefers-reduced-motion
        if (prefersReducedMotion.matches) {
            dismissLoader();
            p9Spacer.classList.add('is-skipped');
            p9Overlay.classList.add('is-cleared');
            document.body.classList.remove('in-comic-opening');
            return;
        }

        // Direct internal section hash (#home, #about, #projects, #contact) skips intro cleanly
        if (window.location.hash && window.location.hash !== '#top') {
            dismissLoader();
            const hashTarget = document.querySelector(window.location.hash);
            if (hashTarget) {
                document.body.classList.remove('in-comic-opening');
                p9Overlay.classList.add('is-cleared');
                setTimeout(() => hashTarget.scrollIntoView({ behavior: 'auto' }), 0);
            }
        } else {
            // Replay Step 1 Loader + Step 2 Comic Wall on every full page refresh
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
            window.scrollTo(0, 0);
            document.body.classList.add('in-comic-opening');

            // Step 1: Wait only for real fonts + critical readiness, with strict fail-safe ceiling
            const fontsReady = (document.fonts && document.fonts.ready)
                ? document.fonts.ready.catch(() => {})
                : Promise.resolve();
            const failSafe = setTimeout(dismissLoader, 950);
            fontsReady.then(() => {
                setTimeout(() => {
                    clearTimeout(failSafe);
                    dismissLoader();
                }, 260);
            });
        }

        const rushEls = Array.from(p9Overlay.querySelectorAll('[data-rush]'));
        let wallRaf = false;

        function updateWall() {
            wallRaf = false;
            const vh = window.innerHeight || 800;
            const spacerH = p9Spacer.offsetHeight || vh;
            const y = window.scrollY || window.pageYOffset;
            const p = Math.max(0, Math.min(1.15, y / spacerH));

            const insideIntro = p < 0.96;
            document.body.classList.toggle('in-comic-opening', insideIntro);
            p9Overlay.classList.toggle('is-cleared', !insideIntro);

            if (!insideIntro) return;

            rushEls.forEach((el) => {
                const speed = parseFloat(el.dataset.rush || '1');
                const rot = parseFloat(el.dataset.rot || '0') * p;
                const sc = 1 + parseFloat(el.dataset.scale || '0') * p;
                const ty = -(p * vh * 1.24 * speed);
                el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
            });

            if (p9ScrollCue) {
                p9ScrollCue.style.opacity = Math.max(0, 1 - p * 4).toFixed(2);
            }
        }

        function scheduleWallFrame() {
            if (wallRaf) return;
            wallRaf = true;
            requestAnimationFrame(updateWall);
        }

        window.addEventListener('scroll', scheduleWallFrame, { passive: true });
        window.addEventListener('resize', scheduleWallFrame, { passive: true });
        window.addEventListener('pagehide', () => {
            window.removeEventListener('scroll', scheduleWallFrame);
            window.removeEventListener('resize', scheduleWallFrame);
        }, { once: true });

        updateWall();
    }

    if (p9SkipBtn) p9SkipBtn.addEventListener('click', skipComicOpening);

    // -----------------------------------------------------------------------
    // 17. PHASE 6 — ABOUT NARA COMIC AVATAR (4 INTERACTIVE EXPRESSIONS)
    // -----------------------------------------------------------------------
    const aboutAvatarExpressions = {
        waving: {
            sfx: 'YO!',
            anno: { id: 'coffee → code!', en: 'coffee → code!' },
            pose: 'av-pose-waving',
            eyes: 'av-eyes-normal',
            mouth: 'av-mouth-wave',
            prop: null,
            browL: 'M124 82 C131 78 140 78 147 82',
            browR: 'M173 82 C180 78 189 78 196 82'
        },
        thinking: {
            sfx: 'HMM...',
            anno: { id: 'debugging UX?', en: 'debugging UX?' },
            pose: 'av-pose-thinking',
            eyes: 'av-eyes-thinking',
            mouth: 'av-mouth-think',
            prop: 'av-prop-thinking',
            browL: 'M124 84 C131 82 140 82 147 84',
            browR: 'M173 78 C180 74 189 74 196 78'
        },
        coding: {
            sfx: 'CLACK!',
            anno: { id: 'zero bugs pls!', en: 'zero bugs pls!' },
            pose: 'av-pose-coding',
            eyes: 'av-eyes-coding',
            mouth: 'av-mouth-code',
            prop: null,
            browL: 'M124 80 L147 85',
            browR: 'M196 80 L173 85'
        },
        happy: {
            sfx: 'YAY!',
            anno: { id: 'shipped to prod!', en: 'shipped to prod!' },
            pose: 'av-pose-happy',
            eyes: 'av-eyes-happy',
            mouth: 'av-mouth-happy',
            prop: 'av-prop-happy',
            browL: 'M124 76 C131 71 140 71 147 76',
            browR: 'M173 76 C180 71 189 71 196 76'
        }
    };

    function setAboutAvatarExpr(key, triggerSfx) {
        const cfg = aboutAvatarExpressions[key] || aboutAvatarExpressions.waving;
        ['av-pose-waving', 'av-pose-thinking', 'av-pose-coding', 'av-pose-happy'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === cfg.pose) ? '' : 'none';
        });
        ['av-eyes-normal', 'av-eyes-thinking', 'av-eyes-coding', 'av-eyes-happy'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === cfg.eyes) ? '' : 'none';
        });
        ['av-mouth-wave', 'av-mouth-think', 'av-mouth-code', 'av-mouth-happy'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === cfg.mouth) ? '' : 'none';
        });
        ['av-prop-thinking', 'av-prop-happy'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === cfg.prop) ? '' : 'none';
        });

        const browL = document.getElementById('av-brow-l');
        const browR = document.getElementById('av-brow-r');
        if (browL) browL.setAttribute('d', cfg.browL);
        if (browR) browR.setAttribute('d', cfg.browR);

        const sfxEl = document.getElementById('avatar-stage-sfx');
        const annoEl = document.getElementById('avatar-stage-anno');
        if (sfxEl) sfxEl.textContent = cfg.sfx;
        if (annoEl) annoEl.textContent = cfg.anno[currentLang] || cfg.anno.id;

        document.querySelectorAll('.avatar-expr-btn').forEach((btn) => {
            const isActive = btn.dataset.avatarExpr === key;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        if (triggerSfx && sfxEl) {
            spawnSfx(cfg.sfx, sfxEl, { small: true });
        }
    }

    document.querySelectorAll('.avatar-expr-btn').forEach((btn) => {
        btn.addEventListener('click', () => setAboutAvatarExpr(btn.dataset.avatarExpr, true));
    });

    // -----------------------------------------------------------------------
    // 18. PHASE 6 — 4-LAYER PARALLAX COMIC ENGINE (IO-GATED + rAF)
    // -----------------------------------------------------------------------
    function initParallaxComicSystem() {
        if (prefersReducedMotion.matches) return;

        const layers = Array.from(document.querySelectorAll('[data-parallax], [data-parallax-x], [data-parallax-scale]'));
        if (!layers.length) return;

        const visibleLayers = new Set();
        let rafPending = false;

        const sectionMap = new Map();
        layers.forEach((el) => {
            const host = el.closest('section, [data-parallax-host]') || el.parentElement;
            if (!sectionMap.has(host)) sectionMap.set(host, []);
            sectionMap.get(host).push(el);
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const group = sectionMap.get(entry.target);
                if (!group) return;
                group.forEach((el) => {
                    if (entry.isIntersecting) visibleLayers.add(el);
                    else visibleLayers.delete(el);
                });
            });
            scheduleParallaxFrame();
        }, { rootMargin: '120px 0px 120px 0px' });

        sectionMap.forEach((_, host) => io.observe(host));

        function updateParallax() {
            rafPending = false;
            const vh = window.innerHeight || 800;
            const mobileDampen = window.innerWidth <= 768 ? 0.35 : 1;

            visibleLayers.forEach((el) => {
                const host = el.closest('section, [data-parallax-host]') || el.parentElement;
                if (!host) return;
                const rect = host.getBoundingClientRect();
                const centerDelta = (rect.top + rect.height * 0.5) - (vh * 0.5);
                // Normalized progress roughly in [-1, 1] across viewport transit
                const progress = Math.max(-1.25, Math.min(1.25, centerDelta / vh));

                const speedY = parseFloat(el.dataset.parallax || '0');
                const speedX = parseFloat(el.dataset.parallaxX || '0');
                const speedScale = parseFloat(el.dataset.parallaxScale || '0');

                const ty = Math.round(progress * speedY * 140 * mobileDampen * 10) / 10;
                const tx = Math.round(progress * speedX * 120 * mobileDampen * 10) / 10;
                const sc = speedScale ? (1 + (1 - Math.abs(progress)) * speedScale * mobileDampen) : 1;

                el.style.transform = speedScale
                    ? `translate3d(${tx}px, ${ty}px, 0) scale(${sc.toFixed(3)})`
                    : `translate3d(${tx}px, ${ty}px, 0)`;
            });
        }

        function scheduleParallaxFrame() {
            if (rafPending || visibleLayers.size === 0) return;
            rafPending = true;
            requestAnimationFrame(updateParallax);
        }

        window.addEventListener('scroll', scheduleParallaxFrame, { passive: true });
        window.addEventListener('resize', scheduleParallaxFrame, { passive: true });

        // Clean listener teardown on page unload
        window.addEventListener('pagehide', () => {
            window.removeEventListener('scroll', scheduleParallaxFrame);
            window.removeEventListener('resize', scheduleParallaxFrame);
            io.disconnect();
        }, { once: true });
    }

    // -----------------------------------------------------------------------
    // 15. INITIALIZE & EXPOSE INLINE HANDLERS
    // -----------------------------------------------------------------------
    window.toggleTheme = toggleTheme;
    window.toggleLanguage = toggleLanguage;
    window.toggleMenu = toggleMenu;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openFolder = openFolder;
    window.closeFolder = closeFolder;
    window.toggleComicSound = ComicAudio.toggle;
    window.skipComicOpening = skipComicOpening;

    document.addEventListener('DOMContentLoaded', () => {
        initScrollComicOpening();
        syncThemeToggleUI();
        applyLanguage(false);
        handleScroll();
        if (textElement) {
            if (prefersReducedMotion.matches) {
                textElement.textContent = phrases[0];
            } else {
                textElement.textContent = '';
                typeEffect();
            }
        }
    });
})();
