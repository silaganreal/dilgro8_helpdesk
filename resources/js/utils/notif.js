// resources/js/utils/notif.js
// export function showNotification(auth, title = "New Request", body = "A user submitted a new request") {
//     if (!window.Notification) {
//         console.log('Browser does not support notifications.');
//         return;
//     }

//     if (Notification.permission === 'granted') {
//         new Notification(title, {
//             body: body,
//             icon: '/dilg-logo.png',
//         });

//         let audio;

//         if (auth?.user?.id === 4) {
//             audio = new Audio('/yamete_kudasai.mp3');
//         } else {
//             audio = new Audio('/positive-notif.wav');
//         }

//         audio.play().catch(e => console.warn('Audio play failed:', e));

//         // Stop audio after 5 seconds
//         setTimeout(() => {
//             audio.pause();
//             audio.currentTime = 0;
//         }, 5000);
//     } else if (Notification.permission !== 'denied') {
//         Notification.requestPermission().then(permission => {
//             if (permission === 'granted') {
//                 showNotification(title, body);
//             }
//         });
//     }
// }


// resources/js/utils/notif.js

// 1️⃣ Preload audio files
const audioFiles = {
    4: new Audio('/yamete_kudasai.mp3'), // special user
    default: new Audio('/positive-notif.wav'), // all others
};

// Preload so audio is ready instantly
Object.values(audioFiles).forEach(a => a.load());

/**
 * Show desktop notification with sound
 * @param {object} auth - current authenticated user
 * @param {string} title - notification title
 * @param {string} body - notification body
 * @param {string} url - optional URL to open on click
 */
export async function showNotification(auth, title = "New Request", body = "A user submitted a new request", url = "/") {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        console.log("Browser does not support notifications or service workers.");
        return;
    }

    // Request permission if needed
    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }

    if (Notification.permission !== "granted") return;

    // Show notification using service worker if available
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;

    registration.showNotification(title, {
        body,
        icon: "/dilg-logo.png",
        badge: "/dilg-logo.png",
        data: { url }, // optional: can open this URL on click
    });

    // Select audio based on user
    const audio = auth?.user?.id === 4 ? audioFiles[4] : audioFiles.default;

    // Reset and play
    audio.currentTime = 0;
    audio.play().catch(e => console.warn("Audio blocked:", e));

    // Stop audio after 5 seconds
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 5000);
}
