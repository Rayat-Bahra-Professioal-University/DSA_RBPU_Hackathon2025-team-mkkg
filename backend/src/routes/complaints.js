import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../utils/db.js";

const router = express.Router();

// List complaints (simple, supports query filter by registrationNumber)
router.get("/", (req, res) => {
  const { q, status } = req.query;
  let items = db.getAll();

  if (q) {
    items = items.filter((i) => i.registrationNumber.includes(q));
  }

  if (status) {
    items = items.filter((i) => i.status === status);
  }

  res.json(items);
});

// Create complaint
router.post("/", (req, res) => {
  const { type, description, location, phone, urgent, files } = req.body;

  if (!type || !description || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const registrationNumber = `367374${Date.now().toString().slice(-9)}`;

  const newItem = {
    id: uuidv4(),
    registrationNumber,
    type,
    description,
    location,
    phone: phone || null,
    urgent: !!urgent,
    files: files || [],
    status: "pending",
    date: new Date().toISOString(),
  };

  db.save(newItem);

  res.status(201).json(newItem);
});

// Get single complaint
router.get("/:id", (req, res) => {
  const item = db.getById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

export default router;
