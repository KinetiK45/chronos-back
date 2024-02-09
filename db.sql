DROP DATABASE IF EXISTS chronos_lubiviy_poliatskiy;

CREATE DATABASE IF NOT EXISTS chronos_lubiviy_poliatskiy;
CREATE USER IF NOT EXISTS 'dljubyvyj'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON chronos_lubiviy_poliatskiy.* TO 'dljubyvyj'@'localhost';

use chronos_lubiviy_poliatskiy;

create table if not exists roles(
    id int not null primary key AUTO_INCREMENT ,
    role varchar(50) not null
);

create table if not exists user (
    id int not null primary key AUTO_INCREMENT ,
    username  varchar(45) not null unique,
    password varchar(30) not null,
    email varchar(256) not null unique ,
    full_name varchar(60) not null,
    photo varchar(256) default 'default.png',
    racist boolean default true,
    race varchar(60) default 'istribitel mig-28 v sovershenstve',
    is_vlaDICK boolean default true,
    supporting_feminism boolean default false,
    religion enum('Atheist','Buddhist','Catholic','Christian','Woman'),
    role_id int not null,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

create table if not exists events (
  id int not null primary key auto_increment,
    title varchar(256) not null ,
    startAt datetime not null ,
    endAt datetime not null ,
    allDay boolean not null ,
    category enum('arrangement','reminder','task')
);

create table if not exists event_users(
    id int not null  primary key auto_increment,
    user_id int not null,
    event_id int not null,
    foreign key (user_id) references user(id) on delete cascade,
    foreign key (event_id) references events(id) on delete cascade
);

create table if not exists notification(
  id int not null primary key auto_increment,
  user_email varchar(256) not null,
  event_id int not null,
  foreign key (user_email) references user(email) on delete cascade,
  foreign key (event_id) references events(id) on delete cascade
);
