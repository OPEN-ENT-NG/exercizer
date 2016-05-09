CREATE SCHEMA exercizer;

CREATE TABLE exercizer.users (
	id VARCHAR(36) NOT NULL PRIMARY KEY,
	username VARCHAR(255)
);

CREATE TABLE exercizer.groups (
	id VARCHAR(36) NOT NULL PRIMARY KEY,
	name VARCHAR(255)
);

CREATE TABLE exercizer.members (
	id VARCHAR(36) NOT NULL PRIMARY KEY,
	user_id VARCHAR(36),
	group_id VARCHAR(36),
	CONSTRAINT user_fk FOREIGN KEY(user_id) REFERENCES exercizer.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT group_fk FOREIGN KEY(group_id) REFERENCES exercizer.groups(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE exercizer.folder(
	id BIGSERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL
);

CREATE TABLE exercizer.subject(
	id BIGSERIAL PRIMARY KEY,
	owner VARCHAR(36) NOT NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	modified TIMESTAMP NOT NULL DEFAULT NOW(),
	visibility VARCHAR(9),
	folder_id BIGINT NULL,
	original_subject_id BIGINT NULL,
	title VARCHAR(255) NOT NULL,
	description TEXT NULL,
	picture VARCHAR(255) NULL,
	is_library_subject BOOL NOT NULL DEFAULT FALSE,
	is_deleted BOOL NOT NULL DEFAULT FALSE,
	CONSTRAINT subject_owner_fk FOREIGN KEY(owner) REFERENCES rbs.users(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT subject_folder_fk FOREIGN KEY (id) REFERENCES exercizer.folder(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT subject_original_subject_fk FOREIGN KEY (original_subject_id) REFERENCES exercizer.subject(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE exercizer.subject_shares (
	member_id VARCHAR(36) NOT NULL,
	resource_id BIGINT NOT NULL,
	action VARCHAR(255) NOT NULL,
	CONSTRAINT subject_shares_pk PRIMARY KEY (member_id, resource_id, action),
	CONSTRAINT subject_shares_resource_fk FOREIGN KEY(resource_id) REFERENCES exercizer.subject(id) ON UPDATE CASCADE ON DELETE NO ACTION,
	CONSTRAINT subject_shares_member_fk FOREIGN KEY(member_id) REFERENCES exercizer.members(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE exercizer.scripts (
	filename VARCHAR(255) NOT NULL PRIMARY KEY,
	passed TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE exercizer.grain_type(
	id BIGSERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL
);

CREATE TABLE exercizer.grain(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	subject_id BIGINT NOT NULL,
	grain_type_id BIGINT NOT NULL,
	parent_grain_id BIGINT NULL,
	next_grain_id BIGINT NULL,
	previous_grain_id BIGINT NULL,
	original_grain_id BIGINT NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	modified TIMESTAMP NOT NULL DEFAULT NOW(),
	grain_data JSON NULL,
	is_library_grain BOOL NOT NULL DEFAULT FALSE,
	CONSTRAINT grain_subject_fk FOREIGN KEY(subject_id) REFERENCES exercizer.subject(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_grain_type_fk FOREIGN KEY(grain_type_id) REFERENCES exercizer.grain_type(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_parent_grain_fk FOREIGN KEY(parent_grain_id) REFERENCES exercizer.grain(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_next_grain_fk FOREIGN KEY(next_grain_id) REFERENCES exercizer.grain(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_previous_grain_fk FOREIGN KEY(previous_grain_id) REFERENCES exercizer.grain(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_original_grain_fk FOREIGN KEY(original_grain_id) REFERENCES exercizer.grain(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE exercizer.subject_scheduled(
	id BIGSERIAL PRIMARY KEY,
	subject_id BIGINT NOT NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	title VARCHAR(255) NOT NULL,
	description TEXT NULL,
	picture VARCHAR(255) NULL,
	begin_date TIMESTAMP NOT NULL,
	due_date TIMESTAMP NOT NULL,
	note_published_date TIMESTAMP,
	duration TIMESTAMP,
	is_over BOOL NOT NULL DEFAULT FALSE,
	is_one_shot_submit BOOL NOT NULL DEFAULT FALSE,
	has_to_be_randomized BOOL NOT NULL DEFAULT FALSE,
	is_deleted BOOL NOT NULL DEFAULT FALSE,
	CONSTRAINT subject_scheduled_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE exercizer.grain_scheduled(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	subject_scheduled_id BIGINT NOT NULL,
	grain_type_id BIGINT NOT NULL,
	parent_grain_id BIGINT NULL,
	next_grain_id BIGINT NULL,
	previous_grain_id BIGINT NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	grain_data JSON NULL,
	is_deleted BOOL NOT NULL DEFAULT FALSE,
	CONSTRAINT grain_scheduled_subject_fk FOREIGN KEY(subject_scheduled_id) REFERENCES exercizer.subject_scheduled(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_scheduled_grain_type_fk FOREIGN KEY(grain_type_id) REFERENCES exercizer.grain_type(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_scheduled_parent_grain_fk FOREIGN KEY(parent_grain_id) REFERENCES exercizer.grain_scheduled(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_scheduled_next_grain_fk FOREIGN KEY(next_grain_id) REFERENCES exercizer.grain_scheduled(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_scheduled_previous_grain_fk FOREIGN KEY(previous_grain_id) REFERENCES exercizer.grain_scheduled(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE exercizer.subject_copy(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	subject_scheduled_id BIGINT NOT NULL,
	owner VARCHAR(36) NOT NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	modified TIMESTAMP NOT NULL DEFAULT NOW(),
	final_score NUMERIC(6,2),
	calculated_score NUMERIC(6,2),
	teacher_comment TEXT,
	has_been_submitted BOOL NOT NULL DEFAULT FALSE,
	is_deleted BOOL NOT NULL DEFAULT FALSE,
	CONSTRAINT subject_copy_subject_scheduled_fk FOREIGN KEY(subject_scheduled_id) REFERENCES exercizer.subject_scheduled(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT subject_copy_owner_fk FOREIGN KEY(owner) REFERENCES rbs.users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE exercizer.grain_copy(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	subject_copy_id BIGINT NOT NULL,
	grain_scheduled_id BIGINT NOT NULL,
	grain_type_id BIGINT NOT NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	modified TIMESTAMP NOT NULL DEFAULT NOW(),
	grain_copy_data JSON NULL,
	final_score NUMERIC(6,2),
	score NUMERIC(6,2),
	teacher_comment TEXT,
	is_deleted BOOL NOT NULL DEFAULT FALSE,
	CONSTRAINT grain_copy_subject_copy_fk FOREIGN KEY(subject_copy_id) REFERENCES exercizer.subject_copy(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_copy_grain_scheduled_fk FOREIGN KEY(grain_scheduled_id) REFERENCES exercizer.grain_scheduled(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT grain_copy_grain_type_fk FOREIGN KEY(grain_type_id) REFERENCES exercizer.grain_type(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE FUNCTION exercizer.merge_users(key VARCHAR, data VARCHAR) RETURNS VOID AS
$$
BEGIN
    LOOP
        UPDATE exercizer.users SET username = data WHERE id = key;
        IF found THEN
            RETURN;
        END IF;
        BEGIN
            INSERT INTO exercizer.users(id,username) VALUES (key, data);
            RETURN;
        EXCEPTION WHEN unique_violation THEN
        END;
    END LOOP;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION exercizer.insert_users_members() RETURNS TRIGGER AS $$
    BEGIN
		IF (TG_OP = 'INSERT') THEN
            INSERT INTO exercizer.members (id, user_id) VALUES (NEW.id, NEW.id);
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION exercizer.insert_groups_members() RETURNS TRIGGER AS $$
    BEGIN
		IF (TG_OP = 'INSERT') THEN
            INSERT INTO exercizer.members (id, group_id) VALUES (NEW.id, NEW.id);
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_trigger
AFTER INSERT ON exercizer.users
    FOR EACH ROW EXECUTE PROCEDURE exercizer.insert_users_members();

CREATE TRIGGER groups_trigger
AFTER INSERT ON exercizer.groups
    FOR EACH ROW EXECUTE PROCEDURE exercizer.insert_groups_members();

CREATE TYPE exercizer.share_tuple as (member_id VARCHAR(36), action VARCHAR(255));
