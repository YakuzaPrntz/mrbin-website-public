-- Mr.Bin bookings table
-- Applied via: wrangler d1 execute mrbin-bookings --file=schema.sql --remote

CREATE TABLE IF NOT EXISTS bookings (
  id                 INTEGER  PRIMARY KEY AUTOINCREMENT,
  name               TEXT     NOT NULL,
  phone              TEXT     NOT NULL,
  email              TEXT     NOT NULL,
  address            TEXT     NOT NULL,
  num_bins           INTEGER  NOT NULL DEFAULT 1,
  service_date       TEXT,
  notes              TEXT,
  notified_owner     INTEGER  NOT NULL DEFAULT 0,
  notified_customer  INTEGER  NOT NULL DEFAULT 0,
  created_at         TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  logged_at  TEXT    NOT NULL,
  ip_hash    TEXT,
  endpoint   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS visitor_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  visited_at  TEXT    NOT NULL,
  ip_hash     TEXT,
  country     TEXT,
  region      TEXT,
  city        TEXT,
  postal_code TEXT,
  latitude    REAL,
  longitude   REAL,
  referrer    TEXT,
  user_agent  TEXT,
  device_type TEXT,
  bot_score   INTEGER,
  is_bot      INTEGER NOT NULL DEFAULT 0
);
