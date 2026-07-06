const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { conectarDB } = require("./config/database");
const solicitudesRoutes = require("./routes/solicitudes");
const authRoutes = require("./routes/auth");
const campanasRoutes = require('./routes/campanas');
const donacionesRoutes = require('./routes/donaciones');
const asociacionesRoutes = require('./routes/asociaciones');
const asociacionesAuthRoutes =
require('./routes/asociacionesAuth');
const asociacionesCampanasRoutes =
require('./routes/asociacionesCampanas');
const adminRoutes = require('./routes/adminRoutes');
const iaRoutes = require('./routes/ia');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión DB
conectarDB();

// Rutas
app.use("/api/companies", solicitudesRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/campaigns', campanasRoutes);
app.use('/api/donations', donacionesRoutes);
app.use('/api/associations', asociacionesRoutes);
app.use(
  '/api/associations',
  asociacionesAuthRoutes
);
app.use(
  '/api/associations',
  asociacionesCampanasRoutes
);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', iaRoutes);
app.use('/api/users', usuariosRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("🔥 Backend FireSupport IA funcionando");
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});