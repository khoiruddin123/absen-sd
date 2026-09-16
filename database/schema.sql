-- =====================================================================
-- Sistem Absensi PPM Roudlotul Jannah Surakarta (MySQL Schema)
-- Database: apsensd
-- =====================================================================
-- Silakan jalankan script ini di phpMyAdmin pada database `apsensd`.
-- =====================================================================

CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
  id VARCHAR(36) PRIMARY KEY,
  class_id VARCHAR(36) NOT NULL,
  gender ENUM('L', 'P') NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (class_id, gender),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) PRIMARY KEY,
  nis VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  class_id VARCHAR(36) NOT NULL,
  gender ENUM('L', 'P') NOT NULL,
  generation VARCHAR(100),
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT
);

CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_active ON students(active);

CREATE TABLE IF NOT EXISTS student_class_history (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  class_id VARCHAR(36) NOT NULL,
  gender ENUM('L', 'P') NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT
);

CREATE INDEX idx_sch_student ON student_class_history(student_id, effective_from);

CREATE TABLE IF NOT EXISTS attendance_operators (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  group_id VARCHAR(36) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, group_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT
);

CREATE INDEX idx_operators_active ON attendance_operators(active);

CREATE TABLE IF NOT EXISTS session_settings (
  id VARCHAR(36) PRIMARY KEY,
  session_type ENUM('subuh', 'malam') NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  scan_start_time TIME NOT NULL,
  on_time_until TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id VARCHAR(36) PRIMARY KEY,
  session_date DATE NOT NULL,
  session_type VARCHAR(100) NOT NULL,
  scan_start_time TIME NOT NULL,
  on_time_until TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_date ON attendance_sessions(session_date);

CREATE TABLE IF NOT EXISTS session_groups (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  group_id VARCHAR(36) NOT NULL,
  opened TINYINT(1) NOT NULL DEFAULT 1,
  closed_manually TINYINT(1) NOT NULL DEFAULT 0,
  finalized TINYINT(1) NOT NULL DEFAULT 0,
  finalized_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (session_id, group_id),
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT
);

CREATE INDEX idx_session_groups_session ON session_groups(session_id);
CREATE INDEX idx_session_groups_finalized ON session_groups(finalized);

CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  group_id VARCHAR(36) NOT NULL,
  status ENUM('hadir', 'terlambat', 'izin', 'sakit', 'alpa') NOT NULL,
  scanned_at DATETIME NULL,
  source ENUM('scan', 'manual_nis', 'auto_alpa', 'edited') NOT NULL DEFAULT 'scan',
  operator_id VARCHAR(36) NULL,
  class_id_snapshot VARCHAR(36) NOT NULL,
  group_name_snapshot VARCHAR(255) NOT NULL,
  gender_snapshot ENUM('L', 'P') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (session_id, student_id),
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT,
  FOREIGN KEY (operator_id) REFERENCES attendance_operators(id) ON DELETE SET NULL,
  FOREIGN KEY (class_id_snapshot) REFERENCES classes(id)
);

CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_group ON attendance_records(group_id);

-- Default data for session_settings
INSERT IGNORE INTO session_settings (id, session_type, label, scan_start_time, on_time_until, end_time) VALUES
(UUID(), 'subuh', 'Subuh', '04:30:00', '04:45:00', '05:45:00'),
(UUID(), 'malam', 'Malam', '19:00:00', '19:30:00', '21:00:00');
