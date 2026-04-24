
## StudyPal Mind Map

```
studietracker/
├── public/              ← Frontend (HTML/CSS/JS)
├── src/
│   ├── config/
│   │   └── db.js        ← MongoDB-anslutning
│   ├── models/
│   │   ├── User.js      ← Användare
│   │   ├── Course.js    ← Kurser
│   │   └── StudySession.js ← Studiepass
│   ├── controllers/
│   │   ├── authController.js     ← Register/Login
│   │   ├── courseController.js   ← CRUD kurser
│   │   └── studySessionController.js ← CRUD + sammanfattning
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   └── studySessionRoutes.js
│   ├── middleware/
│   │   └── auth.js      ← JWT-skydd
│   └── app.js
└── .env                 ← MongoDB URI + JWT secret
```
