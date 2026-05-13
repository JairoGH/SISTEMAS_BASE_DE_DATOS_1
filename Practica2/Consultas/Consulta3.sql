-- ===================================================================================
-- EN BASE A UN RANGO DE FECHAS, MOSTRAR CUANTOS REGISTROS DE EVALUACIONES FUERON
-- REALIZADAS POR TIPO DE TRAMITE Y TIPO DE LICNCIA SOLICITADA
-- =================================================================================== 

-- SELECCIONAMOS LAS COLUMNAS DESEADAS
SELECT 
  r.t_tramite,
  r.t_licencia,
  
  -- CONTAMOS LA CANTIDAD DE ID's QUE HAY EN EXAMEN
  COUNT(ex.id_examen) AS total_evaluaciones
  
FROM Examen ex

-- SE UNEN LAS TABLAS PARA OBTENER LA FECHA DEL CORRELATIVO Y LOS DETALLES DE REGISTRO
  
  JOIN Correlativo co ON co.id_correlativo = ex.correlativo_id_correlativo
  JOIN Registro r     ON r.id_registro     = ex.registro_id_registro
  
  -- SE FILTRA ESTRICTAMENTE EL RANGO
  WHERE TRUNC(co.fecha) BETWEEN DATE '2025-08-08' AND DATE '2025-08-28'
  
-- AGRUPAMOS Y ORDENAMOS
GROUP BY t_tramite, t_licencia
ORDER BY total_evaluaciones DESC, t_tramite, t_licencia;