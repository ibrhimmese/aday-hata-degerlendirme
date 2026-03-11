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

    // Ses efektleri array'i (hata vermemesi için önce catch ekliyoruz)
    const punchSounds = [
        new Audio('sounds/punch1.mp3'),
        new Audio('sounds/punch2.mp3'),
        new Audio('sounds/punch3.mp3')
    ];

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
