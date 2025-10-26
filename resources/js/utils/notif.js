// resources/js/utils/notif.js

// export function showNotification(title = "New Request", body = "A user submitted a new request") {
//     if (!window.Notification) {
//         console.log('Browser does not support notifications.');
//         return;
//     }

//     if (Notification.permission === 'granted') {
//         const notify = new Notification(title, {
//             body: body,
//             icon: './dilg-logo.png',
//         });

//         if(auth?.user?.fname === "Chok") {
//             const audio = new Audio('./yamete_kudasai.mp3');
//         } else {
//             const audio = new Audio('./positive-notif.wav');
//         }

//         audio.play();

//         // Optional: stop audio after 5 seconds
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
export function showNotification(auth, title = "New Request", body = "A user submitted a new request") {
    if (!window.Notification) {
        console.log('Browser does not support notifications.');
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/dilg-logo.png',
        });

        let audio;

        if (auth?.user?.fname === "Chok") {
            audio = new Audio('/yamete_kudasai.mp3');
        } else {
            audio = new Audio('/positive-notif.wav');
        }

        audio.play().catch(e => console.warn('Audio play failed:', e));

        // Stop audio after 5 seconds
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 5000);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(title, body);
            }
        });
    }
}
