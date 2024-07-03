CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 1,
    UNIQUE(username),
    FOREIGN KEY (role_id) REFERENCES role(id)
);

CREATE TABLE job (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE postulation (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    job_id INT NOT NULL,
    cv_file_name VARCHAR(255) NOT NULL,
    cv_uploaded BYTEA NOT NULL,
    score FLOAT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES job(id)
);


INSERT INTO role (name) VALUES ('admin');
INSERT INTO role (name) VALUES ('user');

