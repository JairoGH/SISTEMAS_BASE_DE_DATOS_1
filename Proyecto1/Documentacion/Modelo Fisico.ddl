-- Generado por Oracle SQL Developer Data Modeler 24.3.1.351.0831
--   en:        2026-03-25 08:23:02 CST
--   sitio:      Oracle Database 21c
--   tipo:      Oracle Database 21c



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE ASIGNACION 
    ( 
     ESTUDIANTE_carnet   NUMBER (10)  NOT NULL , 
     SECCION_cod_curso   NUMBER (5)  NOT NULL , 
     SECCION_cod_seccion VARCHAR2 (6)  NOT NULL , 
     SECCION_anio        NUMBER (5)  NOT NULL , 
     SECCION_ciclo       VARCHAR2 (15)  NOT NULL , 
     zona                NUMBER (3)  NOT NULL , 
     nota                NUMBER (3)  NOT NULL 
    ) 
;

ALTER TABLE ASIGNACION 
    ADD CONSTRAINT ASIGNACION_PK PRIMARY KEY ( ESTUDIANTE_carnet, SECCION_cod_curso, SECCION_cod_seccion, SECCION_anio, SECCION_ciclo ) ;

CREATE TABLE CARRERA 
    ( 
     cod_carrera    NUMBER (5)  NOT NULL , 
     nombre_carrera VARCHAR2 (100) 
    ) 
;

ALTER TABLE CARRERA 
    ADD CONSTRAINT CARRERA_PK PRIMARY KEY ( cod_carrera ) ;

CREATE TABLE CATEDRATICO 
    ( 
     cod_catedratico    NUMBER (5)  NOT NULL , 
     nombre_catedratico VARCHAR2 (100) , 
     sueldo_mensual     NUMBER (11) 
    ) 
;

ALTER TABLE CATEDRATICO 
    ADD CONSTRAINT CATEDRATICO_PK PRIMARY KEY ( cod_catedratico ) ;

CREATE TABLE CURSO 
    ( 
     cod_curso    NUMBER (5)  NOT NULL , 
     nombre_curso VARCHAR2 (100) 
    ) 
;

ALTER TABLE CURSO 
    ADD CONSTRAINT CURSO_PK PRIMARY KEY ( cod_curso ) ;

CREATE TABLE DIA 
    ( 
     cod_dia    NUMBER (2)  NOT NULL , 
     nombre_dia VARCHAR2 (15) 
    ) 
;

ALTER TABLE DIA 
    ADD CONSTRAINT DIA_PK PRIMARY KEY ( cod_dia ) ;

CREATE TABLE ESTUDIANTE 
    ( 
     carnet            NUMBER (10)  NOT NULL , 
     nombre_estudiante VARCHAR2 (100) , 
     ingreso_familiar  NUMBER (10) , 
     fecha_nacimiento  DATE 
    ) 
;

ALTER TABLE ESTUDIANTE 
    ADD CONSTRAINT ESTUDIANTE_PK PRIMARY KEY ( carnet ) ;

CREATE TABLE HORARIO 
    ( 
     SECCION_cod_seccion VARCHAR2 (6)  NOT NULL , 
     SECCION_anio        NUMBER (5)  NOT NULL , 
     SECCION_ciclo       VARCHAR2 (15)  NOT NULL , 
     PERIODO_cod_periodo NUMBER (2)  NOT NULL , 
     DIA_cod_dia         NUMBER (2)  NOT NULL , 
     SALON_cod_edificio  VARCHAR2 (10)  NOT NULL , 
     SALON_cod_salon     NUMBER (5)  NOT NULL , 
     SECCION_cod_curso   NUMBER (5)  NOT NULL 
    ) 
;

ALTER TABLE HORARIO 
    ADD CONSTRAINT HORARIO_PK PRIMARY KEY ( SECCION_cod_curso, SECCION_cod_seccion, SECCION_anio, SECCION_ciclo, PERIODO_cod_periodo, DIA_cod_dia, SALON_cod_edificio, SALON_cod_salon ) ;

CREATE TABLE INSCRIPCION 
    ( 
     ESTUDIANTE_carnet   NUMBER (10)  NOT NULL , 
     CARRERA_cod_carrera NUMBER (5)  NOT NULL , 
     fecha_inscripcion   DATE  NOT NULL 
    ) 
;

ALTER TABLE INSCRIPCION 
    ADD CONSTRAINT INSCRIPCION_PK PRIMARY KEY ( ESTUDIANTE_carnet, CARRERA_cod_carrera, fecha_inscripcion ) ;

CREATE TABLE PENSUM 
    ( 
     PLAN_CARRERA_cod_carrera NUMBER (5)  NOT NULL , 
     CURSO_cod_curso          NUMBER (5)  NOT NULL , 
     obligatorio              NUMBER (2)  NOT NULL , 
     num_creditos             NUMBER (3) , 
     nota_aprobacion          NUMBER (3) , 
     zona_minima              NUMBER (3) , 
     creditos_prereq          NUMBER (3) , 
     PLAN_cod_plan            VARCHAR2 (20)  NOT NULL 
    ) 
;

ALTER TABLE PENSUM 
    ADD CONSTRAINT PENSUM_PK PRIMARY KEY ( PLAN_CARRERA_cod_carrera, PLAN_cod_plan, CURSO_cod_curso ) ;

CREATE TABLE PERIODO 
    ( 
     cod_periodo NUMBER (2)  NOT NULL , 
     hora_inicio VARCHAR2 (5) , 
     hora_fin    VARCHAR2 (5) 
    ) 
;

ALTER TABLE PERIODO 
    ADD CONSTRAINT PERIODO_PK PRIMARY KEY ( cod_periodo ) ;

CREATE TABLE PLAN 
    ( 
     CARRERA_cod_carrera NUMBER (5)  NOT NULL , 
     cod_plan            VARCHAR2 (20)  NOT NULL , 
     nombre_plan         VARCHAR2 (50) , 
     anio_inicio         NUMBER (5) , 
     ciclo_inicio        VARCHAR2 (15) , 
     anio_fin            NUMBER (5) , 
     ciclo_fin           VARCHAR2 (15) , 
     creditos_cierre     NUMBER (5) 
    ) 
;

ALTER TABLE PLAN 
    ADD CONSTRAINT PLAN_PK PRIMARY KEY ( CARRERA_cod_carrera, cod_plan ) ;

CREATE TABLE PREREQ 
    ( 
     PENSUM_PC_cod_carrera  NUMBER (5)  NOT NULL , 
     cod_curso_prereq       NUMBER (5)  NOT NULL , 
     PENSUM_PLAN_cod_plan   VARCHAR2 (20)  NOT NULL , 
     PENSUM_CURSO_cod_curso NUMBER (5)  NOT NULL 
    ) 
;

ALTER TABLE PREREQ 
    ADD CONSTRAINT PREREQ_PK PRIMARY KEY ( PENSUM_PC_cod_carrera, PENSUM_PLAN_cod_plan, PENSUM_CURSO_cod_curso, cod_curso_prereq ) ;

CREATE TABLE SALON 
    ( 
     cod_edificio VARCHAR2 (10)  NOT NULL , 
     cod_salon    NUMBER (5)  NOT NULL , 
     capacidad    NUMBER (5) 
    ) 
;

ALTER TABLE SALON 
    ADD CONSTRAINT SALON_PK PRIMARY KEY ( cod_edificio, cod_salon ) ;

CREATE TABLE SECCION 
    ( 
     CURSO_cod_curso             NUMBER (5)  NOT NULL , 
     cod_seccion                 VARCHAR2 (6)  NOT NULL , 
     anio                        NUMBER (5)  NOT NULL , 
     ciclo                       VARCHAR2 (15)  NOT NULL , 
     CATEDRATICO_cod_catedratico NUMBER (5)  NOT NULL 
    ) 
;

ALTER TABLE SECCION 
    ADD CONSTRAINT SECCION_PK PRIMARY KEY ( cod_seccion, anio, ciclo, CURSO_cod_curso ) ;

ALTER TABLE ASIGNACION 
    ADD CONSTRAINT ASIGNACION_ESTUDIANTE_FK FOREIGN KEY 
    ( 
     ESTUDIANTE_carnet
    ) 
    REFERENCES ESTUDIANTE 
    ( 
     carnet
    ) 
;

ALTER TABLE ASIGNACION 
    ADD CONSTRAINT ASIGNACION_SECCION_FK FOREIGN KEY 
    ( 
     SECCION_cod_seccion,
     SECCION_anio,
     SECCION_ciclo,
     SECCION_cod_curso
    ) 
    REFERENCES SECCION 
    ( 
     cod_seccion,
     anio,
     ciclo,
     CURSO_cod_curso
    ) 
;

ALTER TABLE HORARIO 
    ADD CONSTRAINT HORARIO_DIA_FK FOREIGN KEY 
    ( 
     DIA_cod_dia
    ) 
    REFERENCES DIA 
    ( 
     cod_dia
    ) 
;

ALTER TABLE HORARIO 
    ADD CONSTRAINT HORARIO_PERIODO_FK FOREIGN KEY 
    ( 
     PERIODO_cod_periodo
    ) 
    REFERENCES PERIODO 
    ( 
     cod_periodo
    ) 
;

ALTER TABLE HORARIO 
    ADD CONSTRAINT HORARIO_SALON_FK FOREIGN KEY 
    ( 
     SALON_cod_edificio,
     SALON_cod_salon
    ) 
    REFERENCES SALON 
    ( 
     cod_edificio,
     cod_salon
    ) 
;

ALTER TABLE HORARIO 
    ADD CONSTRAINT HORARIO_SECCION_FK FOREIGN KEY 
    ( 
     SECCION_cod_seccion,
     SECCION_anio,
     SECCION_ciclo,
     SECCION_cod_curso
    ) 
    REFERENCES SECCION 
    ( 
     cod_seccion,
     anio,
     ciclo,
     CURSO_cod_curso
    ) 
;

ALTER TABLE INSCRIPCION 
    ADD CONSTRAINT INSCRIPCION_CARRERA_FK FOREIGN KEY 
    ( 
     CARRERA_cod_carrera
    ) 
    REFERENCES CARRERA 
    ( 
     cod_carrera
    ) 
;

ALTER TABLE INSCRIPCION 
    ADD CONSTRAINT INSCRIPCION_ESTUDIANTE_FK FOREIGN KEY 
    ( 
     ESTUDIANTE_carnet
    ) 
    REFERENCES ESTUDIANTE 
    ( 
     carnet
    ) 
;

ALTER TABLE PENSUM 
    ADD CONSTRAINT PENSUM_CURSO_FK FOREIGN KEY 
    ( 
     CURSO_cod_curso
    ) 
    REFERENCES CURSO 
    ( 
     cod_curso
    ) 
;

ALTER TABLE PENSUM 
    ADD CONSTRAINT PENSUM_PLAN_FK FOREIGN KEY 
    ( 
     PLAN_CARRERA_cod_carrera,
     PLAN_cod_plan
    ) 
    REFERENCES PLAN 
    ( 
     CARRERA_cod_carrera,
     cod_plan
    ) 
;

ALTER TABLE PLAN 
    ADD CONSTRAINT PLAN_CARRERA_FK FOREIGN KEY 
    ( 
     CARRERA_cod_carrera
    ) 
    REFERENCES CARRERA 
    ( 
     cod_carrera
    ) 
;

ALTER TABLE PREREQ 
    ADD CONSTRAINT PREREQ_PENSUM_FK FOREIGN KEY 
    ( 
     PENSUM_PC_cod_carrera,
     PENSUM_PLAN_cod_plan,
     PENSUM_CURSO_cod_curso
    ) 
    REFERENCES PENSUM 
    ( 
     PLAN_CARRERA_cod_carrera,
     PLAN_cod_plan,
     CURSO_cod_curso
    ) 
;

ALTER TABLE SECCION 
    ADD CONSTRAINT SECCION_CATEDRATICO_FK FOREIGN KEY 
    ( 
     CATEDRATICO_cod_catedratico
    ) 
    REFERENCES CATEDRATICO 
    ( 
     cod_catedratico
    ) 
;

ALTER TABLE SECCION 
    ADD CONSTRAINT SECCION_CURSO_FK FOREIGN KEY 
    ( 
     CURSO_cod_curso
    ) 
    REFERENCES CURSO 
    ( 
     cod_curso
    ) 
;



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                            14
-- CREATE INDEX                             0
-- ALTER TABLE                             28
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
