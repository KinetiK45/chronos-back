DROP DATABASE IF EXISTS chronos_lubiviy_poliatskiy;

CREATE DATABASE IF NOT EXISTS chronos_lubiviy_poliatskiy;
CREATE USER IF NOT EXISTS 'dljubyvyj'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON chronos_lubiviy_poliatskiy.* TO 'dljubyvyj'@'localhost';

use chronos_lubiviy_poliatskiy;

create table if not exists roles
(
    id   int         not null primary key AUTO_INCREMENT,
    role varchar(50) not null
);

create table if not exists users
(
    id                  int          not null primary key AUTO_INCREMENT,
    username            varchar(45)  not null unique,
    password            varchar(30)  not null,
    email               varchar(256) not null unique,
    full_name           varchar(60)  not null,
    photo               varchar(256) default 'default.png',
    racist              boolean      default true,
    race                varchar(60)  default 'istribitel mig-28 v sovershenstve',
    is_vlaDICK          boolean      default true,
    supporting_feminism boolean      default false,
    religion            enum ('Atheist','Buddhist','Catholic','Christian','Woman'),
    role_id             int          not null,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

create table if not exists calendars
(
    id    int         not null primary key auto_increment,
    title varchar(70) not null,
    user_id int not null,
    description varchar(256),
    foreign key (user_id) references users(id) on delete cascade
);

create table if not exists events
(
    id       int          not null primary key auto_increment,
    title    varchar(256) not null,
    startAt  datetime     not null,
    endAt    datetime     not null,
    allDay   boolean      not null,
    calendar_id int not null,
    description varchar(256),
    color VARCHAR(7), -- цвет в формате HEX
    category enum ('arrangement','reminder','task'),
    foreign key (calendar_id) references calendars (id) on delete cascade
);
create table if not exists calendar_users
(
    id          int not null primary key auto_increment,
    user_id     int not null,
    calendar_id    int not null,
    foreign key (user_id) references users (id) on delete cascade,
    foreign key (calendar_id) references calendars (id) on delete cascade
);

create table if not exists notifications
(
    id         int          not null primary key auto_increment,
    user_email varchar(256) not null,
    event_id   int          not null,
    foreign key (user_email) references users (email) on delete cascade,
    foreign key (event_id) references events (id) on delete cascade
);

INSERT INTO roles (role) VALUES
('Admin'),
('User');

#  SELECT e.id,e.title,e.user_id,e.description
#         FROM calendars e
#         LEFT JOIN event_users eu ON e.id = eu.calendar_id
#         WHERE eu.user_id = ? OR e.user_id = ?
#         LIMIT 10;


