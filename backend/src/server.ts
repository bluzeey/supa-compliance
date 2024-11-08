import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { loginRoute } from "./routes/login";
import { callbackRoute } from "./routes/callback";
import { projectRoute } from "./routes/projects";
import { organizationRoute } from "./routes/organizations";
import { pitrRoute } from "./routes/pitr";
import { databaseRoute } from "./routes/databases"; // Import branchRoute

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Route registration
app.use("/login", loginRoute);
app.use("/callback", callbackRoute);
app.use("/projects", projectRoute);
app.use("/organizations", organizationRoute);
app.use("/pitr", pitrRoute);
app.use("/projects", databaseRoute); // Register branch route

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
