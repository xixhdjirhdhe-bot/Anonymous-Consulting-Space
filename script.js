// ดึงข้อมูล Firebase Config จริงของคุณมาใส่ตรงนี้ (ถ้ายังไม่มี ปล่อยว่างไว้ก่อนได้ ปุ่มจะไม่ค้างแล้ว)
const firebaseConfig = {
    apiKey: "AIzaSyDGRl6vPHTtGwW94rerMP3RwdNU2zlhh_w",
    authDomain: "anonymous-consulting-space.firebaseapp.com",
    databaseURL: "https://anonymous-consulting-space-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "anonymous-consulting-space",
    storageBucket: "anonymous-consulting-space.appspot.com",
    messagingSenderId: "230397160597",
    appId: "1:230397160597:web:0c9df5351d2f99f145bf9c",
    measurementId: "G-BVE5XRHNE1"
};

// ตรวจสอบว่าผู้ใช้ใส่รหัส Firebase หรือยัง
let isFirebaseReady = false;
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
    isFirebaseReady = true;
}

document.addEventListener("DOMContentLoaded", () => {
    const page1 = document.getElementById("page-1");
    const page2 = document.getElementById("page-2");
    const pageLoading = document.getElementById("page-loading");
    const pageChat = document.getElementById("page-chat");
    
    const loadingMessage = document.getElementById("loading-message");
    const chatWithRole = document.getElementById("chat-with-role");
    const chatMessages = document.getElementById("chat-messages");
    const inputMsg = document.getElementById("input-msg");
    const btnSend = document.getElementById("btn-send");
    const btnLeave = document.getElementById("btn-leave");

    let myRole = "";
    let myUserId = "user_" + Math.random().toString(36).substr(2, 9);
    let currentRoomId = null;
    let roomRef = null;

    // ฟังก์ชันสลับหน้า
    function switchPage(fromPage, toPage) {
        fromPage.classList.remove("active");
        toPage.classList.add("active");
    }

    // กดเริ่มต้นใช้งาน -> ไปหน้า 2
    document.getElementById("btn-to-page-2").addEventListener("click", () => {
        switchPage(page1, page2);
    });

    // เลือกบทบาทคนต้องการปรึกษา
    document.getElementById("btn-role-seeker").addEventListener("click", () => {
        startMatching("seeker");
    });

    // เลือกบทบาทคนให้คำปรึกษา
    document.getElementById("btn-role-giver").addEventListener("click", () => {
        startMatching("giver");
    });

    function startMatching(role) {
        myRole = role;
        switchPage(page2, pageLoading);
        
        if(role === "seeker") {
            loadingMessage.innerText = "ยินดีต้อนรับ ไม่ต้องห่วงไม่มีใครรู้ว่าคุณคือใคร ปรึกษาได้เต็มที่";
        } else {
            loadingMessage.innerText = "ยินดีต้อนรับ คนฮีลใจ คุณต้องให้คำปรึกษาและทำหน้าที่ดีๆ";
        }

        // ถ้ายังไม่ได้ต่อ Firebase ให้จำลองเข้าห้องแชทใน 3 วินาที (เพื่อไว้ดูหน้าตาเว็บ)
        if (!isFirebaseReady) {
            setTimeout(() => {
                switchPage(pageLoading, pageChat);
                chatWithRole.innerText = "ห้องแชทจำลอง (ยังไม่ได้เชื่อมต่อ Firebase)";
                appendMessage("ระบบ", "นี่คือหน้าตาห้องแชทจำลอง กรุณาใส่รหัส Firebase ใน script.js เพื่อแชทจริง", "system");
            }, 3000);
            return;
        }

        // --- เริ่มระบบแชทจริงของ Firebase ---
        const targetRole = role === "seeker" ? "giver" : "seeker";
        database.ref('rooms').once('value', (snapshot) => {
            let foundRoom = false;
            const rooms = snapshot.val();
            
            if (rooms) {
                for (let roomId in rooms) {
                    if (rooms[roomId].status === "waiting" && !rooms[roomId][role] && rooms[roomId][targetRole]) {
                        currentRoomId = roomId;
                        foundRoom = true;
                        break;
                    }
                }
            }

            if (foundRoom) {
                roomRef = database.ref('rooms/' + currentRoomId);
                let updates = { status: "connected" };
                updates[role] = myUserId;
                roomRef.update(updates);
                enterChatRoom();
            } else {
                currentRoomId = "room_" + Math.random().toString(36).substr(2, 9);
                roomRef = database.ref('rooms/' + currentRoomId);
                let roomData = { status: "waiting" };
                roomData[role] = myUserId;
                roomRef.set(roomData);

                roomRef.on('value', (snap) => {
                    const data = snap.val();
                    if (data && data.status === "connected") {
                        roomRef.off('value');
                        enterChatRoom();
                    }
                });
            }
        });
    }

    function enterChatRoom() {
        switchPage(pageLoading, pageChat);
        chatWithRole.innerText = myRole === "seeker" ? "💬 กำลังคุยกับ: ผู้ให้คำปรึกษา" : "💬 กำลังคุยกับ: ผู้ขอรับคำปรึกษา";
        
        roomRef.child('messages').on('child_added', (snapshot) => {
            const msgData = snapshot.val();
            const senderType = msgData.senderId === myUserId ? "me" : "other";
            appendMessage("", msgData.text, senderType);
        });
    }

    function sendMessage() {
        const text = inputMsg.value.trim();
        if (text === "") return;

        if (isFirebaseReady && roomRef) {
            roomRef.child('messages').push({
                senderId: myUserId,
                text: text
            });
        } else {
            // ส่งแบบจำลองในคอมตัวเอง
            appendMessage("ฉัน", text, "me");
        }
        inputMsg.value = "";
    }

    btnSend.addEventListener("click", sendMessage);
    inputMsg.addEventListener("keypress", (e) => { if (e.key === 'Enter') sendMessage(); });

    function appendMessage(sender, text, type) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("msg", type);
        msgDiv.innerText = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    btnLeave.addEventListener("click", () => {
        location.reload();
    });
});