const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ceren123",
    database: "ders_kayit_sistemi"
});

db.connect((err) => {
    if (err) {
        console.error("Veritabanı bağlantı hatası:", err);
        return;
    }
    console.log("MySQL veritabanına bağlanıldı.");
});

app.get("/", (req, res) => {
    res.send("Cloud OBS sunucusu çalışıyor.");
});

app.post("/api/login", (req, res) => {
    const { student_number, password } = req.body;

    if (!student_number || !password) {
        return res.status(400).json({
            message: "Öğrenci numarası ve şifre zorunludur."
        });
    }

    const sql = `
    SELECT id, student_number, full_name
    FROM students
    WHERE student_number = ? AND password = ?
  `;

    db.query(sql, [student_number, password], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Giriş kontrolü sırasında hata oluştu."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Öğrenci numarası veya şifre hatalı."
            });
        }

        res.json({
            message: "Giriş başarılı.",
            student: results[0]
        });
    });
});

app.get("/api/courses", (req, res) => {
    const sql = `
    SELECT 
      id,
      course_code,
      course_name,
      instructor,
      ects,
      quota,
      current_enrollment
    FROM courses
    ORDER BY id ASC
  `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Dersler alınamadı."
            });
        }

        res.json(results);
    });
});

app.get("/api/registrations/:studentId", (req, res) => {
    const { studentId } = req.params;

    const sql = `
    SELECT 
      c.id,
      c.course_code,
      c.course_name,
      c.ects
    FROM registrations r
    INNER JOIN courses c ON r.course_id = c.id
    WHERE r.student_id = ?
    ORDER BY r.created_at ASC
  `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Seçilen dersler alınamadı."
            });
        }

        const totalEcts = results.reduce((sum, course) => sum + course.ects, 0);

        res.json({
            courses: results,
            total_ects: totalEcts
        });
    });
});

app.post("/api/register", (req, res) => {
    const { student_id, course_id } = req.body;

    if (!student_id || !course_id) {
        return res.status(400).json({
            message: "student_id ve course_id zorunludur."
        });
    }

    const checkDuplicateSql = `
    SELECT id
    FROM registrations
    WHERE student_id = ? AND course_id = ?
  `;

    db.query(checkDuplicateSql, [student_id, course_id], (err, duplicateResults) => {
        if (err) {
            return res.status(500).json({
                message: "Kayıt kontrolü yapılamadı."
            });
        }

        if (duplicateResults.length > 0) {
            return res.status(400).json({
                message: "Bu ders zaten seçildi."
            });
        }

        const checkCourseSql = `
      SELECT id, quota, current_enrollment
      FROM courses
      WHERE id = ?
    `;

        db.query(checkCourseSql, [course_id], (err, courseResults) => {
            if (err) {
                return res.status(500).json({
                    message: "Ders kontrolü yapılamadı."
                });
            }

            if (courseResults.length === 0) {
                return res.status(404).json({
                    message: "Ders bulunamadı."
                });
            }

            const course = courseResults[0];

            if (course.current_enrollment >= course.quota) {
                return res.status(400).json({
                    message: "Ders kontenjanı dolu."
                });
            }

            const insertRegistrationSql = `
        INSERT INTO registrations (student_id, course_id)
        VALUES (?, ?)
      `;

            db.query(insertRegistrationSql, [student_id, course_id], (err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Ders seçimi yapılamadı."
                    });
                }

                const updateEnrollmentSql = `
          UPDATE courses
          SET current_enrollment = current_enrollment + 1
          WHERE id = ?
        `;

                db.query(updateEnrollmentSql, [course_id], (err) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Kontenjan güncellenemedi."
                        });
                    }

                    res.status(201).json({
                        message: "Ders başarıyla seçildi."
                    });
                });
            });
        });
    });
});

app.delete("/api/register", (req, res) => {
    const { student_id, course_id } = req.body;

    if (!student_id || !course_id) {
        return res.status(400).json({
            message: "student_id ve course_id zorunludur."
        });
    }

    const deleteSql = `
    DELETE FROM registrations
    WHERE student_id = ? AND course_id = ?
  `;

    db.query(deleteSql, [student_id, course_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Ders silinemedi."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Silinecek ders kaydı bulunamadı."
            });
        }

        const updateEnrollmentSql = `
      UPDATE courses
      SET current_enrollment = current_enrollment - 1
      WHERE id = ? AND current_enrollment > 0
    `;

        db.query(updateEnrollmentSql, [course_id], (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Kontenjan güncellenemedi."
                });
            }

            res.json({
                message: "Ders seçimden kaldırıldı."
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});