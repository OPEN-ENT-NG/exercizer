CREATE TABLE exercizer.subject_lesson_level(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	label VARCHAR(255) NOT NULL
);

CREATE TABLE exercizer.subject_lesson_type(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	label VARCHAR(255) NOT NULL
);

CREATE TABLE exercizer.subject_tag(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	label VARCHAR(255) NOT NULL
);

CREATE TABLE exercizer.subject_library_main_information(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	subject_id BIGINT NOT NULL,
	subject_lesson_type_id BIGINT NOT NULL,
	subject_lesson_level_id BIGINT NOT NULL,
	CONSTRAINT subject_library_main_information_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT subject_library_main_information_subject_lesson_type_fk FOREIGN KEY (subject_lesson_type_id) REFERENCES exercizer.subject_lesson_type(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT subject_library_main_information_subject_lesson_level_fk FOREIGN KEY (subject_lesson_level_id) REFERENCES exercizer.subject_lesson_level(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE exercizer.subject_library_tag(
	id BIGSERIAL NOT NULL PRIMARY KEY,
	subject_id BIGINT NOT NULL,
	subject_tag_id BIGINT NOT NULL,
	CONSTRAINT subject_library_tag_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT subject_library_tag_subject_tag_fk FOREIGN KEY (subject_tag_id) REFERENCES exercizer.subject_tag(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

