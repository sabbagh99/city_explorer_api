CREATE TABLE IF NOT EXISTS city_info(
    id SERIAL PRIMARY KEY NOT NULL,
    city_name VARCHAR(265) NOT NULL,
    lon VARCHAR(265) NOT NULL,
    lat VARCHAR(265) NOT NULL
);