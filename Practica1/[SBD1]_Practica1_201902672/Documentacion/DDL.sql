-- Generado por Oracle SQL Developer Data Modeler 24.3.1.351.0831
--   en:        2026-02-26 01:38:07 CST
--   sitio:      Oracle Database 21c
--   tipo:      Oracle Database 21c



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE Centro_Escuelas 
    ( 
     id_escuela NUMBER (10)  NOT NULL , 
     id_centro  NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE Centro_Escuelas 
    ADD CONSTRAINT Centro_Escuelas_PK PRIMARY KEY ( id_escuela, id_centro ) ;

CREATE TABLE Centro_Evaluaciones 
    ( 
     id_centro NUMBER (10)  NOT NULL , 
     nombre    VARCHAR2 (120 CHAR)  NOT NULL , 
     direccion VARCHAR2 (250 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE Centro_Evaluaciones 
    ADD CONSTRAINT Centro_Evaluaciones_PKv2 PRIMARY KEY ( id_centro ) ;

ALTER TABLE Centro_Evaluaciones 
    ADD CONSTRAINT Centro_Evaluaciones_PK UNIQUE ( id_centro ) ;

CREATE TABLE Departamento 
    ( 
     id_depto NUMBER  NOT NULL , 
     nombre   VARCHAR2 (100 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE Departamento 
    ADD CONSTRAINT Departamento_PK PRIMARY KEY ( id_depto ) ;

CREATE TABLE Empleado 
    ( 
     id_empleado  NUMBER  NOT NULL , 
     cui_empleado VARCHAR2 (50 CHAR)  NOT NULL , 
     nombre       VARCHAR2 (120 CHAR)  NOT NULL , 
     rol          VARCHAR2 (20 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE Empleado 
    ADD CONSTRAINT Empleado_PK PRIMARY KEY ( id_empleado ) ;

CREATE TABLE Escuela_Automovilismo 
    ( 
     id_escuela      NUMBER (10)  NOT NULL , 
     nombre          VARCHAR2 (120 CHAR)  NOT NULL , 
     direccion       VARCHAR2 (250 CHAR)  NOT NULL , 
     no_autorizacion VARCHAR2 (50 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE Escuela_Automovilismo 
    ADD CONSTRAINT Escuela_Automovilismo_PK PRIMARY KEY ( id_escuela ) ;

CREATE TABLE Evaluacion 
    ( 
     id_evaluacion          NUMBER  NOT NULL , 
     fecha                  TIMESTAMP  NOT NULL , 
     correlativo            NUMBER  NOT NULL , 
     id_persona             NUMBER  NOT NULL , 
     id_centro              NUMBER (10)  NOT NULL , 
     id_empleado_atiende    NUMBER  NOT NULL , 
     id_empleado_instructor NUMBER  NOT NULL , 
     resultado_teorico      NUMBER  NOT NULL , 
     resultado_practico     NUMBER  NOT NULL 
    ) 
;

ALTER TABLE Evaluacion 
    ADD CONSTRAINT Evaluacion_PK PRIMARY KEY ( id_evaluacion ) ;

CREATE TABLE Evaluacion_Preguntas 
    ( 
     id_eva_preg      NUMBER  NOT NULL , 
     id_evalu         NUMBER  NOT NULL , 
     id_preg          NUMBER  NOT NULL , 
     id_opcion        NUMBER  NOT NULL , 
     puntaje_obtenido NUMBER  NOT NULL , 
     observacion      CLOB  NOT NULL 
    ) 
;

ALTER TABLE Evaluacion_Preguntas 
    ADD CONSTRAINT Evaluacion_Preguntas_PK PRIMARY KEY ( id_eva_preg ) ;

CREATE TABLE Municipio 
    ( 
     id_muni  NUMBER  NOT NULL , 
     id_depto NUMBER  NOT NULL , 
     nombre   VARCHAR2 (100 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE Municipio 
    ADD CONSTRAINT Municipio_PK PRIMARY KEY ( id_muni ) ;

CREATE TABLE Opcion_Respuesta 
    ( 
     id_opcion   NUMBER  NOT NULL , 
     id_pregunta NUMBER  NOT NULL , 
     texto       CLOB  NOT NULL , 
     img         VARCHAR2 (500 CHAR)  NOT NULL , 
     correcta    NUMBER  NOT NULL 
    ) 
;

ALTER TABLE Opcion_Respuesta 
    ADD CONSTRAINT Opcion_Respuesta_PK PRIMARY KEY ( id_opcion ) ;

CREATE TABLE Persona 
    ( 
     id_persona       NUMBER  NOT NULL , 
     nombre_completo  VARCHAR2 (150 CHAR)  NOT NULL , 
     direccion        VARCHAR2 (250 CHAR)  NOT NULL , 
     cui              VARCHAR2 (50 CHAR)  NOT NULL , 
     telefono         VARCHAR2 (20 CHAR)  NOT NULL , 
     fotografia       VARCHAR2 (400 CHAR)  NOT NULL , 
     tipo_licencia    CHAR (1 CHAR)  NOT NULL , 
     tipo_tramite     VARCHAR2 (20 CHAR)  NOT NULL , 
     genero           VARCHAR2 (20 CHAR)  NOT NULL , 
     fecha_nacimiento TIMESTAMP  NOT NULL , 
     id_muni          NUMBER  NOT NULL , 
     id_escuela       NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE Persona 
    ADD CONSTRAINT Persona_PK PRIMARY KEY ( id_persona ) ;

CREATE TABLE Preguntas 
    ( 
     id_pregunta NUMBER  NOT NULL , 
     tipo        VARCHAR2 (15 CHAR)  NOT NULL , 
     texto       CLOB  NOT NULL , 
     img_ref     VARCHAR2 (500 CHAR)  NOT NULL , 
     valor       NUMBER  NOT NULL 
    ) 
;

ALTER TABLE Preguntas 
    ADD CONSTRAINT Preguntas_PK PRIMARY KEY ( id_pregunta ) ;

CREATE TABLE Registro 
    ( 
     id_registro NUMBER  NOT NULL , 
     entidad     VARCHAR2 (50 CHAR)  NOT NULL , 
     id_entidad  NUMBER  NOT NULL , 
     accion      VARCHAR2 (10 CHAR)  NOT NULL , 
     fecha_hora  TIMESTAMP  NOT NULL , 
     id_empleado NUMBER  NOT NULL 
    ) 
;

ALTER TABLE Registro 
    ADD CONSTRAINT Registro_PK PRIMARY KEY ( id_registro ) ;

ALTER TABLE Centro_Escuelas 
    ADD CONSTRAINT FK_CE_CEN FOREIGN KEY 
    ( 
     id_escuela
    ) 
    REFERENCES Escuela_Automovilismo 
    ( 
     id_escuela
    ) 
;

ALTER TABLE Centro_Escuelas 
    ADD CONSTRAINT FK_CE_ESC FOREIGN KEY 
    ( 
     id_centro
    ) 
    REFERENCES Centro_Evaluaciones 
    ( 
     id_centro
    ) 
;

ALTER TABLE Evaluacion_Preguntas 
    ADD CONSTRAINT FK_EP_EVAPREG FOREIGN KEY 
    ( 
     id_preg
    ) 
    REFERENCES Preguntas 
    ( 
     id_pregunta
    ) 
;

ALTER TABLE Evaluacion_Preguntas 
    ADD CONSTRAINT FK_EP_OPC FOREIGN KEY 
    ( 
     id_opcion
    ) 
    REFERENCES Opcion_Respuesta 
    ( 
     id_opcion
    ) 
;

ALTER TABLE Evaluacion_Preguntas 
    ADD CONSTRAINT FK_EP_PREG FOREIGN KEY 
    ( 
     id_evalu
    ) 
    REFERENCES Evaluacion 
    ( 
     id_evaluacion
    ) 
;

ALTER TABLE Evaluacion 
    ADD CONSTRAINT FK_EVAL_CEN FOREIGN KEY 
    ( 
     id_centro
    ) 
    REFERENCES Centro_Evaluaciones 
    ( 
     id_centro
    ) 
;

ALTER TABLE Evaluacion 
    ADD CONSTRAINT FK_EVAL_EMP FOREIGN KEY 
    ( 
     id_empleado_instructor
    ) 
    REFERENCES Empleado 
    ( 
     id_empleado
    ) 
;

ALTER TABLE Evaluacion 
    ADD CONSTRAINT FK_EVAL_PER FOREIGN KEY 
    ( 
     id_persona
    ) 
    REFERENCES Persona 
    ( 
     id_persona
    ) 
;

ALTER TABLE Municipio 
    ADD CONSTRAINT FK_MUN_DEP FOREIGN KEY 
    ( 
     id_depto
    ) 
    REFERENCES Departamento 
    ( 
     id_depto
    ) 
;

ALTER TABLE Opcion_Respuesta 
    ADD CONSTRAINT FK_OP_PREG FOREIGN KEY 
    ( 
     id_pregunta
    ) 
    REFERENCES Preguntas 
    ( 
     id_pregunta
    ) 
;

ALTER TABLE Persona 
    ADD CONSTRAINT FK_PER_ESC FOREIGN KEY 
    ( 
     id_escuela
    ) 
    REFERENCES Escuela_Automovilismo 
    ( 
     id_escuela
    ) 
;

ALTER TABLE Persona 
    ADD CONSTRAINT FK_PER_MUN FOREIGN KEY 
    ( 
     id_muni
    ) 
    REFERENCES Municipio 
    ( 
     id_muni
    ) 
;

ALTER TABLE Registro 
    ADD CONSTRAINT FK_REG_EMP FOREIGN KEY 
    ( 
     id_empleado
    ) 
    REFERENCES Empleado 
    ( 
     id_empleado
    ) 
;



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                            12
-- CREATE INDEX                             0
-- ALTER TABLE                             26
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0




SELECT owner, table_name
FROM all_tables
WHERE table_name IN (
  'CENTRO_ESCUELAS','CENTRO_EVALUACIONES','DEPARTAMENTO','EMPLEADO',
  'ESCUELA_AUTOMOVILISMO','EVALUACION','EVALUACION_PREGUNTAS','MUNICIPIO',
  'OPCION_RESPUESTA','PERSONA','PREGUNTAS','REGISTRO'
)
ORDER BY owner, table_name;
