# bancoSolar
Prueba de modulo 7

#Codigo para la creacion de base de datos y tablas. 

CREATE DATABASE bancosolar;

CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nombre VARCHAR(50),
balance FLOAT CHECK (balance >= 0));

CREATE TABLE transferencias (id SERIAL PRIMARY KEY, emisor INT, receptor
INT, monto FLOAT, fecha TIMESTAMP, FOREIGN KEY (emisor) REFERENCES
usuarios(id), FOREIGN KEY (receptor) REFERENCES usuarios(id));

# RECUERDA CAMBIAR LAS CREDENCIALES EN EL ARCHIVO dbConfig.

