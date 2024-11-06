import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { loginRoute } from "./routes/login";
import { callbackRoute } from "./routes/callback";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());

// Route registration
app.use("/login", loginRoute);
app.use("/callback", callbackRoute);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
