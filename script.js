document.addEventListener('DOMContentLoaded', () => {
    const faceObj = document.getElementById('face');
    const gloveObj = document.getElementById('glove');
    const hitEffect = document.getElementById('hit-effect');
    const damageLevel = document.getElementById('damage-level');
    const damageFill = document.getElementById('damage-fill');
    const messageArea = document.getElementById('message-area');

    // Ayarlar
    const maxHits = 5; // Toplam morarma seviyesi (face-0'dan face-5'e kadar)
    let currentHits = 0;

    // --- Ziyaretçi Bildirim Sistemi ---
    // Site açıldığında otomatik olarak ntfy.sh üzerinden sana bildirim gönderir.
    function sendVisitNotification() {
        // İsteğe bağlı: Cloudflare veya ipify üzerinden IP/Konum alabiliriz
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                const message = `Siten az önce ziyaret edildi!\n\nKonum: ${data.city}, ${data.region}, ${data.country_name}\nIP: ${data.ip}\nTarayıcı: ${navigator.userAgent.substring(0, 50)}...`;

                // Kendi belirleyeceğin benzersiz bir kanal adı (Aşağıdaki kanal adını değiştirmelisin)
                const channelName = "benimsitem_bilgi_bildirim_9988";

                fetch(`https://ntfy.sh/${channelName}`, {
                    method: 'POST',
                    body: message,
                    headers: {
                        'Title': '🚨 Yeni Ziyaretçi Var!',
                        'Tags': 'eyes,rotating_light'
                    }
                }).catch(err => console.log("Bildirim gönderilemedi."));
            })
            .catch(err => {
                // Konum servisi çalışmazsa sadece ziyaret edildiğini bildir
                const channelName = "benimsitem_bilgi_bildirim_9988";
                fetch(`https://ntfy.sh/${channelName}`, {
                    method: 'POST',
                    body: "Birisi bağlantıya tıkladı ve siteye girdi! (Konum alınamadı)",
                    headers: {
                        'Title': '🚨 Yeni Ziyaretçi Var!',
                        'Tags': 'eyes'
                    }
                });
            });
    }

    // Bildirimi site ilk açıldığında gönder
    sendVisitNotification();
    // -----------------------------------

    // Ses efektleri array'i (telefonda gecikmeyi önlemek için preload)
    const punchSounds = [
        new Audio('sounds/punch1.mp3'),
        new Audio('sounds/punch2.mp3'),
        new Audio('sounds/punch3.mp3')
    ];

    // Sesleri önden yükle (Telefonda gecikmeyi engeller)
    punchSounds.forEach(sound => {
        sound.preload = 'auto';
        sound.load();
    });

    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.innerHTML = '<span class="music-icon">🎵</span> Sesi Oynat';
        } else {
            bgMusic.play().catch(e => console.log("Müzik çalınamadı:", e));
            musicBtn.innerHTML = '<span class="music-icon">⏸️</span> Sesi Durdur';
        }
        isPlaying = !isPlaying;
    });

    function playRandomPunchSound() {
        const randomIndex = Math.floor(Math.random() * punchSounds.length);
        const sound = punchSounds[randomIndex];
        sound.currentTime = 0;

        // Ses engellemesini aşmak için try-catch
        try {
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Ses çalınamadı (tarayıcı izni veya dosya eksik):", e);
                });
            }
        } catch (err) {
            console.log("Ses hatası:", err);
        }
    }

    function playAnimations(e) {
        // Animasyon sınıflarını sıfırla
        faceObj.classList.remove('shake');
        gloveObj.classList.remove('punch');
        hitEffect.classList.remove('hit-anim');

        // DOM Reflow - Animasyonların yeniden tetiklenebilmesi için
        void faceObj.offsetWidth;
        void gloveObj.offsetWidth;
        void hitEffect.offsetWidth;

        // Vuruş efekti pozisyonunu tıklandığı konuma göre ayarla
        if (e) {
            const rect = faceObj.getBoundingClientRect();
            const hitX = e.clientX - rect.left;
            const hitY = e.clientY - rect.top;
            hitEffect.style.left = `${hitX}px`;
            hitEffect.style.top = `${hitY}px`;
        }

        // Animasyonları başlat
        faceObj.classList.add('shake');
        gloveObj.classList.add('punch');
        hitEffect.classList.add('hit-anim');

        // Ses çal
        playRandomPunchSound();
    }

    faceObj.addEventListener('click', (e) => {
        if (currentHits < maxHits) {
            currentHits++;

            // Animasyon ve ses
            playAnimations(e);

            // Resmi değiştirmeyi dene (Eğer resim yoksa broken image ikonu çıkar, bu yüzden kullanıcı kendi koymalı)
            faceObj.src = `images/face-${currentHits}.jpg`;

            // Hasar barını güncelle
            const damagePercentage = (currentHits / maxHits) * 100;
            damageLevel.textContent = Math.round(damagePercentage);
            damageFill.style.width = `${damagePercentage}%`;

            // Son seviyeye ulaşıldıysa özür mesajını göster
            if (currentHits === maxHits) {
                setTimeout(() => {
                    messageArea.style.display = 'block';
                    // CSS transition'ın algılaması için çok kısa bir an bekle
                    setTimeout(() => {
                        messageArea.classList.remove('hidden');
                        messageArea.style.opacity = '1';
                        messageArea.style.transform = 'translateY(0)';
                    }, 50);
                }, 800); // Vuruştan 0.8 saniye sonra
            }
        } else {
            // Zaten maksimum hasarda, sadece ses ve sarsıntı
            playAnimations(e);
        }
    });
});
