-- =====================================================================
-- Holiday Finder - MySQL schema + seed data
-- Requires MySQL 8.0.16+ (CHECK constraints are enforced).
-- Re-runnable: drops and recreates the whole database.
-- =====================================================================

DROP DATABASE IF EXISTS holiday_finder;
CREATE DATABASE holiday_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE holiday_finder;

-- ---------------------------------------------------------------------
-- Roles (lookup table - matches Role enum in the backend: 1 = User, 2 = Admin)
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id   TINYINT UNSIGNED NOT NULL,
    name VARCHAR(20)      NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_name (name)
);

-- ---------------------------------------------------------------------
-- Users
-- password holds an HMAC-SHA512 hex digest (128 chars) - see cyber.hash()
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id        INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    firstName VARCHAR(50)      NOT NULL,
    lastName  VARCHAR(50)      NOT NULL,
    email     VARCHAR(100)     NOT NULL,
    password  VARCHAR(128)     NOT NULL,
    roleId    TINYINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT fk_users_role FOREIGN KEY (roleId) REFERENCES roles (id)
);

-- ---------------------------------------------------------------------
-- Vacations
-- ---------------------------------------------------------------------
CREATE TABLE vacations (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    destination VARCHAR(100)  NOT NULL,
    description VARCHAR(1000) NOT NULL,
    startDate   DATE          NOT NULL,
    endDate     DATE          NOT NULL,
    price       DECIMAL(7, 2) NOT NULL,
    imageName   VARCHAR(100)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_vacations_start_date (startDate),
    CONSTRAINT chk_vacations_dates CHECK (endDate >= startDate),
    CONSTRAINT chk_vacations_price CHECK (price >= 0 AND price <= 10000)
);

-- ---------------------------------------------------------------------
-- Likes (many-to-many: which user liked which vacation)
-- Composite PK prevents the same user liking the same vacation twice.
-- ---------------------------------------------------------------------
CREATE TABLE likes (
    userId     INT UNSIGNED NOT NULL,
    vacationId INT UNSIGNED NOT NULL,
    PRIMARY KEY (userId, vacationId),
    KEY idx_likes_vacation (vacationId),
    CONSTRAINT fk_likes_user     FOREIGN KEY (userId)     REFERENCES users (id)     ON DELETE CASCADE,
    CONSTRAINT fk_likes_vacation FOREIGN KEY (vacationId) REFERENCES vacations (id) ON DELETE CASCADE
);

-- =====================================================================
-- Seed data
-- =====================================================================

INSERT INTO roles (id, name) VALUES
    (1, 'User'),
    (2, 'Admin');

-- All seed users have the password: 1234
-- (hashed with HMAC-SHA512 using HASH_SALT from Backend/.env)
INSERT INTO users (firstName, lastName, email, password, roleId) VALUES
    ('Admin', 'Manager',  'admin@example.com', '466cfef59b93225ba7a61018f7c6f2bcb59de4aa5c58f3d688172ef8819e9a131af18b5c8434a403c61d1d370eae5628f661f490725e5b4c9b85651ca0f4f683', 2),
    ('Dana',  'Levi',     'dana@example.com',  '466cfef59b93225ba7a61018f7c6f2bcb59de4aa5c58f3d688172ef8819e9a131af18b5c8434a403c61d1d370eae5628f661f490725e5b4c9b85651ca0f4f683', 1),
    ('Yossi', 'Cohen',    'yossi@example.com', '466cfef59b93225ba7a61018f7c6f2bcb59de4aa5c58f3d688172ef8819e9a131af18b5c8434a403c61d1d370eae5628f661f490725e5b4c9b85651ca0f4f683', 1),
    ('Noa',   'Mizrahi',  'noa@example.com',   '466cfef59b93225ba7a61018f7c6f2bcb59de4aa5c58f3d688172ef8819e9a131af18b5c8434a403c61d1d370eae5628f661f490725e5b4c9b85651ca0f4f683', 1),
    ('Amit',  'Friedman', 'amit@example.com',  '466cfef59b93225ba7a61018f7c6f2bcb59de4aa5c58f3d688172ef8819e9a131af18b5c8434a403c61d1d370eae5628f661f490725e5b4c9b85651ca0f4f683', 1);

-- Dates are relative to the day the script runs, so there are always
-- past, currently-active and future vacations for the UI filters.
INSERT INTO vacations (destination, description, startDate, endDate, price, imageName) VALUES
    ('Santorini, Greece',
     'Whitewashed villages perched on the cliffs of a volcanic caldera. Watch the famous sunset from Oia, swim at the red and black sand beaches, and sail around the caldera to the hot springs.',
     CURDATE() - INTERVAL 60 DAY, CURDATE() - INTERVAL 53 DAY, 1450.00, 'santorini.jpg'),

    ('Prague, Czech Republic',
     'A fairytale old town of Gothic spires and cobbled lanes. Cross the Charles Bridge at dawn, explore Prague Castle, and catch the Astronomical Clock striking the hour in Old Town Square.',
     CURDATE() - INTERVAL 30 DAY, CURDATE() - INTERVAL 26 DAY, 790.00, 'prague.jpg'),

    ('Rome, Italy',
     'Walk through 2,000 years of history - the Colosseum, the Roman Forum and the Pantheon. Visit the Vatican Museums and the Sistine Chapel, toss a coin into the Trevi Fountain and dine in Trastevere.',
     CURDATE() - INTERVAL 3 DAY, CURDATE() + INTERVAL 4 DAY, 1150.00, 'rome.jpg'),

    ('Amsterdam, Netherlands',
     'Cruise the UNESCO-listed canal ring, see Rembrandt at the Rijksmuseum and the world''s largest Van Gogh collection, visit the Anne Frank House and cycle through Vondelpark like a local.',
     CURDATE() - INTERVAL 1 DAY, CURDATE() + INTERVAL 5 DAY, 1050.00, 'amsterdam.jpg'),

    ('Paris, France',
     'The City of Light: ride to the top of the Eiffel Tower, see the Mona Lisa at the Louvre, stroll the hilltop streets of Montmartre and finish the day with an evening cruise on the Seine.',
     CURDATE() + INTERVAL 14 DAY, CURDATE() + INTERVAL 19 DAY, 1200.00, 'paris.jpg'),

    ('Barcelona, Spain',
     'Gaudi''s masterpieces - the Sagrada Familia, Park Guell and Casa Batllo - alongside the medieval Gothic Quarter, tapas bars on La Rambla and the Mediterranean beaches of Barceloneta.',
     CURDATE() + INTERVAL 21 DAY, CURDATE() + INTERVAL 27 DAY, 980.00, 'barcelona.jpg'),

    ('London, United Kingdom',
     'See the Crown Jewels at the Tower of London, the Rosetta Stone at the British Museum and the view from the London Eye. Evenings are for a West End musical and a pint in a historic pub.',
     CURDATE() + INTERVAL 35 DAY, CURDATE() + INTERVAL 40 DAY, 1350.00, 'london.jpg'),

    ('Marrakech, Morocco',
     'Get lost in the souks of the medina, watch snake charmers and storytellers in Jemaa el-Fnaa square at night, relax in the blue Majorelle Garden and stay in a traditional riad with a courtyard pool.',
     CURDATE() + INTERVAL 45 DAY, CURDATE() + INTERVAL 50 DAY, 850.00, 'marrakech.jpg'),

    ('Dubai, United Arab Emirates',
     'Ride to the observation deck of the Burj Khalifa, the tallest building in the world, shop at the Dubai Mall, dune-bash on a desert safari with a Bedouin-style dinner and relax on the beaches of Palm Jumeirah.',
     CURDATE() + INTERVAL 55 DAY, CURDATE() + INTERVAL 60 DAY, 1550.00, 'dubai.jpg'),

    ('Bangkok, Thailand',
     'Golden temples and non-stop energy: the Grand Palace and the Emerald Buddha, Wat Arun on the Chao Phraya River, the Damnoen Saduak floating market and legendary street food in Chinatown.',
     CURDATE() + INTERVAL 70 DAY, CURDATE() + INTERVAL 79 DAY, 1650.00, 'bangkok.jpg'),

    ('Tokyo, Japan',
     'Neon and tradition side by side - cross the Shibuya Scramble, visit Senso-ji temple in Asakusa, eat fresh sushi at the Tsukiji Outer Market and take a day trip to Hakone for views of Mount Fuji.',
     CURDATE() + INTERVAL 90 DAY, CURDATE() + INTERVAL 100 DAY, 2900.00, 'tokyo.jpg'),

    ('Reykjavik, Iceland',
     'Drive the Golden Circle to Thingvellir National Park, the Geysir geothermal area and Gullfoss waterfall, bathe in the milky-blue waters of the Blue Lagoon and explore the black sand beaches of the south coast.',
     CURDATE() + INTERVAL 110 DAY, CURDATE() + INTERVAL 116 DAY, 2100.00, 'reykjavik.jpg'),

    ('New York, USA',
     'The city that never sleeps: Times Square, a Broadway show, a ferry to the Statue of Liberty, a walk across the Brooklyn Bridge and an afternoon in Central Park and the Metropolitan Museum of Art.',
     CURDATE() + INTERVAL 130 DAY, CURDATE() + INTERVAL 137 DAY, 2450.00, 'new-york.jpg'),

    ('Bali, Indonesia',
     'Green rice terraces and monkey forests in Ubud, the cliff-top Uluwatu Temple with its sunset Kecak fire dance, surfing in Canggu and beach clubs in Seminyak.',
     CURDATE() + INTERVAL 150 DAY, CURDATE() + INTERVAL 160 DAY, 2200.00, 'bali.jpg');

-- Users 2-5 are regular users; the admin (id 1) does not like vacations.
INSERT INTO likes (userId, vacationId) VALUES
    (2, 1), (2, 5), (2, 6), (2, 11), (2, 14),
    (3, 3), (3, 5), (3, 9), (3, 11),
    (4, 1), (4, 5), (4, 8), (4, 12),
    (5, 4), (5, 5), (5, 11), (5, 13);
