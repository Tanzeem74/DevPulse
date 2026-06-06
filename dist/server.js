

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express3 from "express";

// src/modules/auth/auth.route.ts
import express from "express";

// src/utils/auth.utils.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  secret: process.env.JWT_SECRET,
  //refresh_secret: process.env.JWT_REFRESH_SECRET,
  PORT: process.env.PORT
};
var config_default = config;

// src/utils/auth.utils.ts
var JWT_SECRET = config_default.secret;
var hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};
var comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
var generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('contributor','maintainer')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
            reporter_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
    console.log("database connected sucessfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
var createUser = async (name, email, password, role) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, password, role || "contributor"]
  );
  return result.rows[0];
};
var findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};
var authService = {
  createUser,
  findUserByEmail
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const roleValue = role ?? "contributor";
    const exist = await authService.findUserByEmail(email);
    if (exist) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }
    const hashedPassword = await hashPassword(password);
    const user = await authService.createUser(name, email, hashedPassword, roleValue);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    const token = generateToken({
      id: user.id,
      name: user.name,
      role: user.role
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = express.Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
var authRoute = router;

// src/modules/issues/issue.route.ts
import express2 from "express";

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token required"
      });
    }
    const decoded = jwt2.verify(token, config_default.secret);
    const userResult = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
var auth_default = auth;

// src/modules/issues/issue.service.ts
var createIssueIntoDB = async (title, description, type, reporterId) => {
  const result = await pool.query(
    `INSERT INTO issues(title,description,type,reporter_id)
        VALUES ($1,$2,$3,$4)
        RETURNING *`,
    [title, description, type, reporterId]
  );
  return result.rows[0];
};
var getIssuesFromDB = async (query) => {
  let baseQuery = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  let index = 1;
  if (query.type) {
    conditions.push(`type = $${index}`);
    values.push(query.type);
    index++;
  }
  if (query.status) {
    conditions.push(`status = $${index}`);
    values.push(query.status);
    index++;
  }
  if (conditions.length > 0) {
    baseQuery += ` WHERE ` + conditions.join(" AND ");
  }
  if (query.sort === "oldest") {
    baseQuery += ` ORDER BY created_at ASC`;
  } else {
    baseQuery += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(baseQuery, values);
  const finalData = await Promise.all(
    result.rows.map(async (issue) => {
      const user = await pool.query(
        "SELECT id, name, role FROM users WHERE id = $1",
        [issue.reporter_id]
      );
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: user.rows[0],
        created_at: issue.created_at,
        updated_at: issue.updated_at
      };
    })
  );
  return finalData;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  const issue = result.rows[0];
  if (!issue) {
    return null;
  }
  const user = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id]
  );
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: user.rows[0],
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var getIssueById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  return result.rows[0];
};
var updateIssueInDB = async (id, title, description, type) => {
  const result = await pool.query(`UPDATE issues
    SET
    title = $1,
    description = $2,
    type = $3,
    updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `, [title, description, type, id]);
  return result.rows[0];
};
var updateIssueStatusInDB = async (id, status) => {
  const result = await pool.query(
    `UPDATE issues
         SET status = $1,
         updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    "DELETE FROM issues WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
var issueService = {
  createIssueIntoDB,
  getIssuesFromDB,
  getSingleIssueFromDB,
  getIssueById,
  updateIssueInDB,
  deleteIssueFromDB,
  updateIssueStatusInDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user.id;
    const issue = await issueService.createIssueIntoDB(title, description, type, reporterId);
    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
var getIssues = async (req, res) => {
  try {
    const issues = await issueService.getIssuesFromDB(req.query);
    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: issues
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const issue = await issueService.getSingleIssueFromDB(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: issue
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    const issue = await issueService.getIssueById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    const user = req.user;
    if (user.role !== "maintainer") {
      if (issue.reporter_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }
      if (issue.status !== "open") {
        return res.status(403).json({
          success: false,
          message: "Issue can no longer be updated"
        });
      }
    }
    const { title, description, type } = req.body;
    const updatedIssue = await issueService.updateIssueInDB(issueId, title, description, type);
    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "maintainer") {
      return res.status(403).json({
        success: false,
        message: "Only maintainer can delete issues"
      });
    }
    const id = Number(req.params.id);
    const deletedIssue = await issueService.deleteIssueFromDB(id);
    if (!deletedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
var issueController = {
  createIssue,
  getIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issue.route.ts
var router2 = express2.Router();
router2.post("/", auth_default, issueController.createIssue);
router2.get("/", issueController.getIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default, issueController.updateIssue);
router2.delete("/:id", auth_default, issueController.deleteIssue);
var issueRoute = router2;

// src/app.ts
var app = express3();
app.use(express3.json());
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "express-Assignment",
    "Author": "Shah Tanzeem Afsar"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var port = config_default.PORT;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map