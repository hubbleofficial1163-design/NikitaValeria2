const TELEGRAM_CONFIG = {
    BOT_TOKEN: '8372798819:AAHKEu8fizItw63rCxjwp0FN4dLQH-4gp94',
    CHAT_ID: '-1003409076754'
};

// Музыкальный плеер
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('weddingMusic');
        this.toggleBtn = document.getElementById('musicToggle');
        this.isPlaying = false;
        this.init();
    }

    init() {
        // Устанавливаем громкость на 50%
        this.audio.volume = 0.5;
        
        this.toggleBtn.addEventListener('click', () => this.toggleMusic());
        
        // Обработка ошибок
        this.audio.addEventListener('error', (e) => {
            console.error('Ошибка загрузки музыки:', e);
            this.toggleBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            this.toggleBtn.title = 'Ошибка загрузки музыки';
        });
    }

    toggleMusic() {
        if (this.isPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }

    playMusic() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.toggleBtn.classList.add('playing');
                this.toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i><span class="music-text">Музыка</span>';
            })
            .catch(error => {
                console.error('Ошибка воспроизведения:', error);
                // Если автовоспроизведение заблокировано, показываем подсказку
                if (error.name === 'NotAllowedError') {
                    alert('Пожалуйста, нажмите на кнопку "Музыка" для запуска фоновой музыки');
                }
            });
    }

    pauseMusic() {
        this.audio.pause();
        this.isPlaying = false;
        this.toggleBtn.classList.remove('playing');
        this.toggleBtn.innerHTML = '<i class="fas fa-music"></i><span class="music-text">Музыка</span>';
    }
}

// Календарь
class WeddingCalendar {
    constructor() {
        this.currentDate = new Date(2026, 6, 4); // Июль 2026
        this.weddingDate = new Date(2026, 6, 4);
        this.init();
    }

    init() {
        this.renderCalendar();
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    renderCalendar() {
        const monthYear = document.getElementById('currentMonthYear');
        const calendarDays = document.getElementById('calendarDays');
        
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        calendarDays.innerHTML = '';

        // Получаем первый и последний день месяца
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Получаем день недели для первого дня (0-воскресенье, 6-суббота)
        let firstDayOfWeek = firstDay.getDay();
        // Преобразуем к формату Пн=0, Вс=6
        if (firstDayOfWeek === 0) firstDayOfWeek = 6;
        else firstDayOfWeek--;

        // Добавляем пустые ячейки для дней предыдущего месяца
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarDays.appendChild(emptyDay);
        }

        // Добавляем дни текущего месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Проверяем, является ли день днем свадьбы
            if (this.currentDate.getMonth() === this.weddingDate.getMonth() &&
                this.currentDate.getFullYear() === this.weddingDate.getFullYear() &&
                day === this.weddingDate.getDate()) {
                dayElement.classList.add('wedding-day');
            }

            calendarDays.appendChild(dayElement);
        }

        // Добавляем пустые ячейки в конце, если нужно
        const totalCells = firstDayOfWeek + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day other-month';
                calendarDays.appendChild(emptyDay);
            }
        }
    }
}

// Отправка формы в Telegram
class TelegramSender {
    constructor() {
        this.token = TELEGRAM_CONFIG.BOT_TOKEN;
    }

    getChatId() {
        return TELEGRAM_CONFIG.CHAT_ID;
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    async sendFormData(formData) {
        const chatId = this.getChatId();
        const message = this.formatMessage(formData);
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            return result.ok;
        } catch (error) {
            console.error('Ошибка:', error);
            return false;
        }
    }

    formatMessage(data) {
        const attendanceText = {
            'yes': '✅ С радостью приду!',
            'no': '❌ К сожалению, не смогу'
        }[data.attendance] || data.attendance;

        return `
<b>🎉 НОВЫЙ ОТВЕТ НА СВАДЕБНОЕ ПРИГЛАШЕНИЕ</b>

<b>👤 Имя:</b> ${data.name}
<b>📞 Телефон:</b> ${data.phone}
<b>👥 Гостей:</b> ${data.guests}

<b>✅ Присутствие:</b> ${attendanceText}

<b>💌 Пожелания:</b> ${data.message || 'нет'}

<b>📅 Отправлено:</b> ${new Date().toLocaleString('ru-RU')}
        `.trim();
    }
}

// Мини-уведомление о музыке
class MiniMusicNotification {
    constructor() {
        this.notification = document.getElementById('musicNotification');
        this.closeBtn = document.getElementById('closeMusicNotification');
        this.musicBtn = document.getElementById('musicToggle');
        this.shownKey = 'miniMusicNotificationShown';
        this.init();
    }

    init() {
        // Показываем уведомление через 1 секунду
        setTimeout(() => this.showNotification(), 1000);
        
        // Закрытие по кнопке
        this.closeBtn.addEventListener('click', () => this.hideNotification());
        
        // Закрытие при клике на кнопку музыки
        this.musicBtn.addEventListener('click', () => {
            setTimeout(() => this.hideNotification(), 500);
        });
        
        // Автоматическое скрытие через 10 секунд
        setTimeout(() => this.hideNotification(), 10000);
    }

    showNotification() {
        // Проверяем, не отключил ли пользователь уведомления
        if (!localStorage.getItem(this.shownKey)) {
            this.notification.classList.remove('hidden');
        }
    }

    hideNotification() {
        this.notification.classList.add('hidden');
        // Устанавливаем флаг, что пользователь видел уведомление
        localStorage.setItem(this.shownKey, 'true');
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем уведомление о музыке
    const miniMusicNotification = new MiniMusicNotification();

    // Инициализация музыкального плеера
    const musicPlayer = new MusicPlayer();
    // Инициализация календаря
    const weddingCalendar = new WeddingCalendar();
    
    // Инициализация Telegram отправителя
    const telegramSender = new TelegramSender();
    
    // Анимации при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => observer.observe(group));
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Обработка отправки формы
    document.getElementById('weddingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.querySelector('.submit-button');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        telegramSender.showNotification('Отправляем ваш ответ...', 'loading');
        
        try {
            const attendanceRadio = document.querySelector('input[name="attendance"]:checked');
            
            if (!attendanceRadio) {
                throw new Error('Пожалуйста, выберите вариант присутствия');
            }
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                guests: document.getElementById('guests').value,
                attendance: attendanceRadio.value,
                message: document.getElementById('message').value.trim()
            };
            
            // Валидация
            if (!formData.name || !formData.phone) {
                throw new Error('Пожалуйста, заполните обязательные поля');
            }
            
            const success = await telegramSender.sendFormData(formData);
            
            if (success) {
                telegramSender.showNotification('✅ Спасибо! Ваш ответ отправлен организаторам.', 'success');
                e.target.reset();
            } else {
                telegramSender.showNotification('❌ Ошибка отправки. Пожалуйста, попробуйте еще раз.', 'error');
            }
        } catch (error) {
            telegramSender.showNotification(`❌ ${error.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Предзагрузка изображений
    window.addEventListener('load', function() {
        const images = ['1.jpg', '4.jpg', '2.png', '5.jpg', '7.jpg'];
        images.forEach(img => {
            const image = new Image();
            image.src = img;
        });
        
        // Предзагрузка музыки
        const audio = document.getElementById('weddingMusic');
        audio.load();
    });
});