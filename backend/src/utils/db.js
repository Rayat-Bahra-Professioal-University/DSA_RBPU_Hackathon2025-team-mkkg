// Very small JSON-file-backed DB for prototyping
import fs from "fs";
import path from "path";

const DB_FILE = path.resolve("./backend/data.json");

function readAll() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("DB read error", err);
    return [];
  }
}

function writeAll(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("DB write error", err);
  }
}

export default {
  getAll: () => readAll(),
  save: (item) => {
    const all = readAll();
    all.unshift(item);
    writeAll(all);
    return item;
  },
  getById: (id) => readAll().find((i) => i.id === id),
};
