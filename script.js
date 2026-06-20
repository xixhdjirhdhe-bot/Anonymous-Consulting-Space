// ==========================================================================
// 1. ระบบควบคุมการเปิด/ปิด เพลงพื้นหลัง (Ambient Audio Controller)
// ==========================================================================
function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    
    // ตั้งระดับความดังที่ 0.2 (กำลังพอดีสำหรับการเปิดฟังคลายเครียดแบบชิลๆ)
    music.volume = 0.2; 

    if (music.paused) {
        // คำสั่งเล่นเพลง
        music.play().then(() => {
            btn.innerText = "⏸️ ปิดเสียงพื้นหลัง";
            btn.classList.add('playing');
        }).catch(error => {
            console.log("การเล่นเสียงอัตโนมัติถูกเบราว์เซอร์บล็อกชั่วคราว: ", error);
        });
    } else {
        // คำสั่งหยุดเล่นเพลง
        music.pause();
        btn.innerText = "🎵 เปิดเสียงพื้นหลัง";
        btn.classList.remove('playing');
    }
}

// ==========================================================================
// 2. ฟังก์ชันควบคุมการทำงานของปุ่มเมนูต่างๆ (Navigation Panel)
// ==========================================================================
function navigateTo(page) {
    switch(page) {
        case 'next':
            alert('กำลังนำคุณไปยังหน้าถัดไป...');
            break;
        case 'settings':
            alert('กำลังเข้าสู่หน้าตั้งค่า...');
            break;
        case 'credits':
            alert('ผู้พัฒนา: Anonymous Consulting Team\nขอบคุณสำหรับการเข้ามาระบายความในใจกับเราครับ :)');
            break;
        default:
            console.log('พบข้อผิดพลาด: ไม่พบหน้านี้');
    }
}