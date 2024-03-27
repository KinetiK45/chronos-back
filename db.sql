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
    photo               varchar(256) not null default 'default.png',
    email               varchar(256) not null unique,
    full_name           varchar(60)  not null,
);

create table if not exists calendars
(
    id    int         not null primary key auto_increment,
    title varchar(70) not null,
    user_id int not null,
    description varchar(256),
    color VARCHAR(7),
    type enum ('default','own','shared'),
    foreign key (user_id) references users(id) on delete cascade
);

create table if not exists events
(
    id       int          not null primary key auto_increment,
    title    varchar(256) not null,
    startAt  datetime     not null,
    endAt    datetime     not null,
    calendar_id int not null,
    description varchar(256),
    category enum ('arrangement','reminder','task'),
    place varchar(80),
    creator_id int not null,
    complete boolean default false,
    foreign key (calendar_id) references calendars (id) on delete cascade
);

create table if not exists calendar_users
(
    id          int not null primary key auto_increment,
    custom_color VARCHAR(7),
    user_id     int not null,
    calendar_id    int not null,
    role  enum('editor','inspector') not null ,
    foreign key (user_id) references users (id) on delete cascade,
    foreign key (calendar_id) references calendars (id) on delete cascade
);

create table if not exists events_users
(
  id int not null  primary key auto_increment,
  user_id int not null,
  event_id  int not null,
  foreign key (user_id) references users(id) on DELETE cascade,
  foreign key (event_id) references events(id) on delete cascade
);

create table if not exists notifications
(
    id         int          not null primary key auto_increment,
    user_email varchar(256) not null,
    event_id   int          not null,
    foreign key (user_email) references users (email) on delete cascade,
    foreign key (event_id) references events (id) on delete cascade
);

create table if not exists chats
(
    id          int not null primary key auto_increment,
    title varchar(20),
    event_id int not null,
    foreign key (event_id) references events (id) on delete cascade
);

CREATE TABLE IF NOT EXISTS messages
(
    id        INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
    chat_id   INT  NOT NULL,
    content   TEXT NOT NULL,
    sender_id INT  NOT NULL,
    reply_to  INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to) REFERENCES messages (id) ON DELETE SET NULL
);

