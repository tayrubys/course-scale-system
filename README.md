# Course Scale System 
<div align="center">

![JavaScript](https://img.shields.io/badge/JAVASCRIPT-FRONTEND-EC4899?style=for-the-badge&logo=javascript&logoColor=white&labelColor=9D174D)
![HTML](https://img.shields.io/badge/HTML-PAGE-3B82F6?style=for-the-badge&logo=html5&logoColor=white&labelColor=1E3A8A)
![CSS](https://img.shields.io/badge/CSS-STYLING-EC4899?style=for-the-badge&logo=css3&logoColor=white&labelColor=9D174D)
![Node](https://img.shields.io/badge/NODE-EXPRESS-3B82F6?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1E3A8A)
![API](https://img.shields.io/badge/API-REST-EC4899?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=9D174D)

![AWS](https://img.shields.io/badge/AWS-EC2-3B82F6?style=for-the-badge&logo=amazonaws&logoColor=white&labelColor=1E3A8A)
![JMeter](https://img.shields.io/badge/JMETER-LOAD_TEST-EC4899?style=for-the-badge&logo=apachejmeter&logoColor=white&labelColor=9D174D)
![Cloud](https://img.shields.io/badge/CLOUD-COMPUTING-3B82F6?style=for-the-badge&logo=icloud&logoColor=white&labelColor=1E3A8A)

</div>
Bu proje, üniversite ders kayıt sistemlerinin yoğunluk altında nasıl davrandığını incelemek ve bulut bilişim ile ölçeklenebilirliğini analiz etmek amacıyla geliştirilmiştir.

## Proje Amacı
Bu projenin amacı, ders kayıt dönemlerinde oluşan yoğunluk problemlerini simüle etmek ve bulut tabanlı çözümler ile sistem performansını iyileştirmektir.

##  Kullanılan Teknolojiler
- HTML
- CSS
- JavaScript
- Node.js (Express)
- AWS EC2

## Bulut Ortamı
Proje AWS EC2 üzerinde çalıştırılmıştır ve internet üzerinden erişilebilir hale getirilmiştir.

## Özellikler
- Ders seçme sistemi
- AKTS (kredi) kontrolü
- Sistem yoğunluk simülasyonu (CPU yükü)
- Backend API entegrasyonu
- Yük testine uygun yapı (JMeter)

##  Test
Sistem performansı Apache JMeter kullanılarak test edilmiştir. Farklı kullanıcı sayıları ile sistemin tepkisi analiz edilmiştir.

##  Proje Hedefi
Bu proje ile bulut tabanlı sistemlerin yüksek trafik altında daha verimli çalıştığı ve ölçeklenebilir olduğu gösterilmiştir.
---
## Akış Şeması

```mermaid
flowchart TD
    A([Başla]) --> B[Kullanıcı isteği sisteme gönderir]
    B --> C[İstek Application Load Balancer'a ulaşır]
    C --> D[Load Balancer sağlıklı EC2 hedeflerini kontrol eder]
    D --> E[İstek uygun EC2 instance'ına yönlendirilir]
    E --> F[EC2 uygulaması RDS MySQL ile iletişim kurar]
    F --> G[CPU kullanım oranı CloudWatch tarafından izlenir]

    G --> H{CPU kullanımı eşik değerin üzerinde mi?}

    H -- Evet --> I[Auto Scaling Group yeni EC2 instance başlatır]
    I --> J[Yeni instance sağlık kontrolünden geçer]
    J --> K[Instance Target Group'a eklenir ve trafik almaya başlar]
    K --> N[Sistem çalışmaya devam eder]

    H -- Hayır --> L{CPU kullanımı eşik değerin altında mı?}
    L -- Evet --> M[Auto Scaling Group fazla instance'ı sonlandırır]
    M --> O[Target Group aktif hedef sayısını günceller]
    O --> N

    L -- Hayır --> N
    N --> G
```
---
## Durum Diyagramı

```mermaid
stateDiagram-v2
    [*] --> Pending

    Pending --> InService: EC2 başlatılır

    InService --> Launching: CPU > eşik\nScale Out tetiklenir
    Launching --> InService: Yeni instance hazır

    InService --> Terminating: CPU düşer\nScale In tetiklenir
    Terminating --> InService: Fazla instance kaldırılır

    InService --> Unhealthy: Health Check başarısız
    Unhealthy --> Terminating: Instance sonlandırılır
    Terminating --> [*]
```
---
## Varlık İlişki Diyagramı

```mermaid
erDiagram
    STUDENTS ||--o{ ENROLLMENTS : "ders kaydı yapar"
    COURSES ||--o{ ENROLLMENTS : "kayıt içerir"

    STUDENTS {
        int id PK
        string student_number
        string full_name
        string password
    }

    COURSES {
        int id PK
        string course_code
        string course_name
        string instructor
        int ects
        int quota
        int current_enrollment
    }

    ENROLLMENTS {
        int id PK
        int student_id FK
        int course_id FK
        datetime created_at
    }
```
---
##  Projeyi Çalıştırma
```bash
npm install
npm start
