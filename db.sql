DROP DATABASE IF EXISTS chronos_lubiviy_poliatskiy;

CREATE DATABASE IF NOT EXISTS chronos_lubiviy_poliatskiy;
CREATE USER IF NOT EXISTS 'dljubyvyj'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON chronos_lubiviy_poliatskiy.* TO 'dljubyvyj'@'localhost';

use chronos_lubiviy_poliatskiy;

