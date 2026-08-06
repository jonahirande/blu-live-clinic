// init-db.js
db = db.getSiblingDB('liveclinic');

db.createUser({
  user: "clinic_admin",
  pwd: "p@ssw0rd_db_user",
  roles: [{ role: "readWrite", db: "liveclinic" }]
});

db.createCollection('users');

// Create a unique index on username that ignores case Sensitivity
db.users.createIndex(
  { username: 1 }, 
  { unique: true, collation: { locale: 'en', strength: 2 } }
);
