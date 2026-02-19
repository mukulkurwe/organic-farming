// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/* ============================
   SIGNUP
============================ */
export const signup = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !phone || !password) {
      return res.status(400).json({
        ok: false,
        message: "Name, phone, and password are required",
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        ok: false,
        message: "Phone number must be 10 digits",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "User with this phone number already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user (use password_hash column)
    const result = await pool.query(
      `INSERT INTO users (name, phone, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, role, created_at`,
      [name, phone, hashedPassword, role || "farmer"]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      ok: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

/* ============================
   LOGIN
============================ */
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate required fields
    if (!phone || !password) {
      return res.status(400).json({
        ok: false,
        message: "Phone and password are required",
      });
    }

    // Find user by phone
    const result = await pool.query(
      "SELECT id, name, phone, password_hash, role, created_at FROM users WHERE phone = $1",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        message: "Invalid phone number or password",
      });
    }

    const user = result.rows[0];

    // Check if password hash exists
    if (!user.password_hash) {
      return res.status(401).json({
        ok: false,
        message: "Please set up your password first",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        message: "Invalid phone number or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      ok: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

/* ============================
   GET CURRENT USER
============================ */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "SELECT id, name, phone, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    res.json({
      ok: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};
