CREATE DATABASE IF NOT EXISTS service_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE service_portal;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  display_name VARCHAR(80) NOT NULL,
  email VARCHAR(254) NOT NULL,
  role ENUM('requester', 'agent', 'administrator') NOT NULL DEFAULT 'requester',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(24) NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(40) NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL,
  status ENUM('Backlog', 'Open', 'In Progress', 'Waiting', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  requester_id BIGINT UNSIGNED NOT NULL,
  assignee_id BIGINT UNSIGNED NULL,
  channel ENUM('Portal', 'Email', 'API') NOT NULL DEFAULT 'Portal',
  due_at DATETIME NULL,
  satisfaction DECIMAL(2,1) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_service_requests_public_id (public_id),
  KEY idx_service_requests_queue (status, priority, updated_at),
  KEY idx_service_requests_requester (requester_id),
  KEY idx_service_requests_assignee (assignee_id),
  CONSTRAINT fk_requests_requester
    FOREIGN KEY (requester_id) REFERENCES users(id),
  CONSTRAINT fk_requests_assignee
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_satisfaction
    CHECK (satisfaction IS NULL OR satisfaction BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS request_tags (
  request_id BIGINT UNSIGNED NOT NULL,
  tag VARCHAR(30) NOT NULL,
  PRIMARY KEY (request_id, tag),
  CONSTRAINT fk_tags_request
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS request_comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  body VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_request_created (request_id, created_at),
  CONSTRAINT fk_comments_request
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author
    FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(160) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  category VARCHAR(40) NOT NULL,
  published_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_articles_slug (slug),
  FULLTEXT KEY ft_articles_title_summary (title, summary)
) ENGINE=InnoDB;
