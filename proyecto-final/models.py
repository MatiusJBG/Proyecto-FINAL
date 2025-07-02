"""
Modelos orientados a objetos para el sistema de gestión de estudiantes
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

class NodoContenido(ABC):
    """Clase abstracta base para todos los nodos de contenido"""
    
    def __init__(self, id: int, nombre: str, orden: int = 0):
        self.id = id
        self.nombre = nombre
        self.orden = orden
        self.hijos: List['NodoContenido'] = []
        self.padre: Optional['NodoContenido'] = None
    
    def agregar_hijo(self, hijo: 'NodoContenido') -> None:
        """Agrega un nodo hijo a este nodo"""
        hijo.padre = self
        self.hijos.append(hijo)
        self.hijos.sort(key=lambda x: x.orden)
    
    def eliminar_hijo(self, hijo_id: int) -> bool:
        """Elimina un nodo hijo por ID"""
        for i, hijo in enumerate(self.hijos):
            if hijo.id == hijo_id:
                del self.hijos[i]
                return True
        return False
    
    def buscar_por_id(self, id_buscar: int) -> Optional['NodoContenido']:
        """Busca un nodo por ID en el árbol"""
        if self.id == id_buscar:
            return self
        
        for hijo in self.hijos:
            resultado = hijo.buscar_por_id(id_buscar)
            if resultado:
                return resultado
        
        return None
    
    def buscar_por_nombre(self, nombre_buscar: str) -> List['NodoContenido']:
        """Busca nodos por nombre en el árbol"""
        resultados = []
        
        if nombre_buscar.lower() in self.nombre.lower():
            resultados.append(self)
        
        for hijo in self.hijos:
            resultados.extend(hijo.buscar_por_nombre(nombre_buscar))
        
        return resultados
    
    def obtener_ruta(self) -> List[str]:
        """Obtiene la ruta completa desde la raíz hasta este nodo"""
        ruta = [self.nombre]
        nodo_actual = self.padre
        
        while nodo_actual:
            ruta.insert(0, nodo_actual.nombre)
            nodo_actual = nodo_actual.padre
        
        return ruta
    
    def obtener_profundidad(self) -> int:
        """Obtiene la profundidad del nodo en el árbol"""
        profundidad = 0
        nodo_actual = self.padre
        
        while nodo_actual:
            profundidad += 1
            nodo_actual = nodo_actual.padre
        
        return profundidad
    
    def contar_hijos(self) -> int:
        """Cuenta el número total de hijos recursivamente"""
        total = len(self.hijos)
        for hijo in self.hijos:
            total += hijo.contar_hijos()
        return total
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el nodo a diccionario para serialización"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'orden': self.orden,
            'tipo': self.__class__.__name__,
            'hijos': [hijo.to_dict() for hijo in self.hijos],
            'profundidad': self.obtener_profundidad(),
            'ruta': self.obtener_ruta()
        }

class Curso(NodoContenido):
    """Clase para representar un curso"""
    
    def __init__(self, id: int, nombre: str, descripcion: str = "", 
                 duracion_estimada: int = 0, id_profesor: Optional[int] = None):
        super().__init__(id, nombre)
        self.descripcion = descripcion
        self.duracion_estimada = duracion_estimada
        self.id_profesor = id_profesor
        self.estado = "activo"
        self.fecha_creacion = datetime.now()
    
    def agregar_modulo(self, modulo: 'Modulo') -> None:
        """Agrega un módulo al curso"""
        self.agregar_hijo(modulo)
    
    def obtener_modulos(self) -> List['Modulo']:
        """Obtiene todos los módulos del curso"""
        return [hijo for hijo in self.hijos if isinstance(hijo, Modulo)]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el curso a diccionario"""
        base_dict = super().to_dict()
        base_dict.update({
            'descripcion': self.descripcion,
            'duracion_estimada': self.duracion_estimada,
            'id_profesor': self.id_profesor,
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat(),
            'modulos': [modulo.to_dict() for modulo in self.obtener_modulos()]
        })
        return base_dict

class Modulo(NodoContenido):
    """Clase para representar un módulo"""
    
    def __init__(self, id: int, nombre: str, descripcion: str = "", 
                 duracion_estimada: int = 0, id_curso: int = 0):
        super().__init__(id, nombre)
        self.descripcion = descripcion
        self.duracion_estimada = duracion_estimada
        self.id_curso = id_curso
    
    def agregar_leccion(self, leccion: 'Leccion') -> None:
        """Agrega una lección al módulo"""
        self.agregar_hijo(leccion)
    
    def obtener_lecciones(self) -> List['Leccion']:
        """Obtiene todas las lecciones del módulo"""
        return [hijo for hijo in self.hijos if isinstance(hijo, Leccion)]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el módulo a diccionario"""
        base_dict = super().to_dict()
        base_dict.update({
            'descripcion': self.descripcion,
            'duracion_estimada': self.duracion_estimada,
            'id_curso': self.id_curso,
            'lecciones': [leccion.to_dict() for leccion in self.obtener_lecciones()]
        })
        return base_dict

class Leccion(NodoContenido):
    """Clase para representar una lección"""
    
    def __init__(self, id: int, nombre: str, contenido: str = "", 
                 duracion_estimada: int = 0, id_modulo: int = 0, es_obligatoria: bool = True):
        super().__init__(id, nombre)
        self.contenido = contenido
        self.duracion_estimada = duracion_estimada
        self.id_modulo = id_modulo
        self.es_obligatoria = es_obligatoria
        self.recursos: List['Recurso'] = []
    
    def agregar_recurso(self, recurso: 'Recurso') -> None:
        """Agrega un recurso a la lección"""
        self.recursos.append(recurso)
        self.recursos.sort(key=lambda x: x.orden)
    
    def eliminar_recurso(self, recurso_id: int) -> bool:
        """Elimina un recurso por ID"""
        for i, recurso in enumerate(self.recursos):
            if recurso.id == recurso_id:
                del self.recursos[i]
                return True
        return False
    
    def buscar_recurso(self, nombre_buscar: str) -> List['Recurso']:
        """Busca recursos por nombre"""
        return [recurso for recurso in self.recursos 
                if nombre_buscar.lower() in recurso.nombre.lower()]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte la lección a diccionario"""
        base_dict = super().to_dict()
        base_dict.update({
            'contenido': self.contenido,
            'duracion_estimada': self.duracion_estimada,
            'id_modulo': self.id_modulo,
            'es_obligatoria': self.es_obligatoria,
            'recursos': [recurso.to_dict() for recurso in self.recursos]
        })
        return base_dict

class Recurso:
    """Clase para representar un recurso de aprendizaje"""
    
    def __init__(self, id: int, nombre: str, tipo: str, url: str, 
                 orden: int = 0, duracion: Optional[int] = None):
        self.id = id
        self.nombre = nombre
        self.tipo = tipo  # video, documento, enlace, presentacion, imagen
        self.url = url
        self.orden = orden
        self.duracion = duracion  # Para videos
        self.fecha_creacion = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el recurso a diccionario"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'tipo': self.tipo,
            'url': self.url,
            'orden': self.orden,
            'duracion': self.duracion,
            'fecha_creacion': self.fecha_creacion.isoformat()
        }

class ArbolDecision:
    """Clase para representar el árbol binario de decisión"""
    
    def __init__(self):
        self.raiz: Optional['NodoDecision'] = None
    
    def agregar_nodo(self, nodo: 'NodoDecision') -> None:
        """Agrega un nodo al árbol de decisión"""
        if not self.raiz:
            self.raiz = nodo
        else:
            self._insertar_nodo(self.raiz, nodo)
    
    def _insertar_nodo(self, nodo_actual: 'NodoDecision', nuevo_nodo: 'NodoDecision') -> None:
        """Inserta un nodo en el árbol de decisión"""
        if nuevo_nodo.prioridad < nodo_actual.prioridad:
            if nodo_actual.izquierda is None:
                nodo_actual.izquierda = nuevo_nodo
            else:
                self._insertar_nodo(nodo_actual.izquierda, nuevo_nodo)
        else:
            if nodo_actual.derecha is None:
                nodo_actual.derecha = nuevo_nodo
            else:
                self._insertar_nodo(nodo_actual.derecha, nuevo_nodo)
    
    def evaluar_estudiante(self, datos_estudiante: Dict[str, Any]) -> Dict[str, Any]:
        """Evalúa un estudiante y genera una recomendación"""
        if not self.raiz:
            return {
                'recomendacion': 'Continúa con tu aprendizaje',
                'tipo': 'general',
                'prioridad': 'baja'
            }
        
        return self._evaluar_nodo(self.raiz, datos_estudiante)
    
    def _evaluar_nodo(self, nodo: 'NodoDecision', datos: Dict[str, Any]) -> Dict[str, Any]:
        """Evalúa un nodo del árbol de decisión"""
        if nodo.es_hoja():
            return {
                'recomendacion': nodo.accion,
                'tipo': nodo.tipo,
                'prioridad': nodo.prioridad,
                'regla_id': nodo.id
            }
        
        # Evaluar la condición del nodo
        condicion_cumplida = self._evaluar_condicion(nodo.condicion, datos)
        
        if condicion_cumplida:
            if nodo.izquierda:
                return self._evaluar_nodo(nodo.izquierda, datos)
        else:
            if nodo.derecha:
                return self._evaluar_nodo(nodo.derecha, datos)
        
        # Si no hay nodo hijo, retornar el nodo actual
        return {
            'recomendacion': nodo.accion or 'Continúa con tu aprendizaje',
            'tipo': nodo.tipo,
            'prioridad': nodo.prioridad,
            'regla_id': nodo.id
        }
    
    def _evaluar_condicion(self, condicion: str, datos: Dict[str, Any]) -> bool:
        """Evalúa una condición contra los datos del estudiante"""
        try:
            # Mapear condiciones a datos del estudiante
            mapeo = {
                'promedio_puntajes < 70': datos.get('promedio_puntajes', 0) < 70,
                'promedio_progreso < 50': datos.get('promedio_progreso', 0) < 50,
                'evaluaciones_aprobadas/total_evaluaciones < 0.8': 
                    (datos.get('evaluaciones_aprobadas', 0) / max(datos.get('total_evaluaciones', 1), 1)) < 0.8,
                'tiempo_promedio > 60': datos.get('tiempo_promedio', 0) > 60,
                'lecciones_completadas < 5': datos.get('lecciones_completadas', 0) < 5
            }
            
            return mapeo.get(condicion, False)
        except:
            return False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el árbol a diccionario"""
        if not self.raiz:
            return {'raiz': None}
        
        return {
            'raiz': self._nodo_to_dict(self.raiz)
        }
    
    def _nodo_to_dict(self, nodo: 'NodoDecision') -> Dict[str, Any]:
        """Convierte un nodo de decisión a diccionario"""
        return {
            'id': nodo.id,
            'condicion': nodo.condicion,
            'accion': nodo.accion,
            'tipo': nodo.tipo,
            'prioridad': nodo.prioridad,
            'es_hoja': nodo.es_hoja(),
            'izquierda': self._nodo_to_dict(nodo.izquierda) if nodo.izquierda else None,
            'derecha': self._nodo_to_dict(nodo.derecha) if nodo.derecha else None
        }

class NodoDecision:
    """Clase para representar un nodo del árbol de decisión"""
    
    def __init__(self, id: int, condicion: str, accion: str, 
                 tipo: str = "general", prioridad: str = "media"):
        self.id = id
        self.condicion = condicion
        self.accion = accion
        self.tipo = tipo
        self.prioridad = prioridad
        self.izquierda: Optional['NodoDecision'] = None
        self.derecha: Optional['NodoDecision'] = None
    
    def es_hoja(self) -> bool:
        """Determina si el nodo es una hoja (sin hijos)"""
        return self.izquierda is None and self.derecha is None

class GestorContenido:
    """Clase para gestionar el contenido jerárquico de los cursos"""
    
    def __init__(self):
        self.cursos: Dict[int, Curso] = {}
        self.arbol_decision = ArbolDecision()
        self._inicializar_arbol_decision()
    
    def agregar_curso(self, curso: Curso) -> None:
        """Agrega un curso al gestor"""
        self.cursos[curso.id] = curso
    
    def obtener_curso(self, curso_id: int) -> Optional[Curso]:
        """Obtiene un curso por ID"""
        return self.cursos.get(curso_id)
    
    def eliminar_curso(self, curso_id: int) -> bool:
        """Elimina un curso"""
        if curso_id in self.cursos:
            del self.cursos[curso_id]
            return True
        return False
    
    def buscar_contenido(self, termino: str) -> List[Dict[str, Any]]:
        """Busca contenido en todos los cursos"""
        resultados = []
        
        for curso in self.cursos.values():
            # Buscar en el curso
            if termino.lower() in curso.nombre.lower():
                resultados.append({
                    'tipo': 'curso',
                    'nodo': curso.to_dict(),
                    'ruta': curso.obtener_ruta()
                })
            
            # Buscar en módulos
            for modulo in curso.obtener_modulos():
                if termino.lower() in modulo.nombre.lower():
                    resultados.append({
                        'tipo': 'modulo',
                        'nodo': modulo.to_dict(),
                        'ruta': modulo.obtener_ruta()
                    })
                
                # Buscar en lecciones
                for leccion in modulo.obtener_lecciones():
                    if termino.lower() in leccion.nombre.lower():
                        resultados.append({
                            'tipo': 'leccion',
                            'nodo': leccion.to_dict(),
                            'ruta': leccion.obtener_ruta()
                        })
                    
                    # Buscar en recursos
                    for recurso in leccion.recursos:
                        if termino.lower() in recurso.nombre.lower():
                            resultados.append({
                                'tipo': 'recurso',
                                'nodo': recurso.to_dict(),
                                'ruta': leccion.obtener_ruta() + [recurso.nombre]
                            })
        
        return resultados
    
    def obtener_estructura_completa(self) -> Dict[str, Any]:
        """Obtiene la estructura completa de todos los cursos"""
        return {
            'cursos': [curso.to_dict() for curso in self.cursos.values()],
            'total_cursos': len(self.cursos),
            'arbol_decision': self.arbol_decision.to_dict()
        }
    
    def generar_recomendacion(self, datos_estudiante: Dict[str, Any]) -> Dict[str, Any]:
        """Genera una recomendación para un estudiante"""
        return self.arbol_decision.evaluar_estudiante(datos_estudiante)
    
    def _inicializar_arbol_decision(self) -> None:
        """Inicializa el árbol de decisión con reglas predefinidas"""
        # Nodo raíz: evaluar puntaje promedio
        nodo_raiz = NodoDecision(1, 'promedio_puntajes < 70', '', 'evaluacion', 'alta')
        
        # Nodo izquierdo: puntaje bajo -> recomendar refuerzo
        nodo_refuerzo = NodoDecision(2, '', 'Repasar módulos anteriores y practicar más ejercicios', 'refuerzo', 'alta')
        
        # Nodo derecho: evaluar progreso
        nodo_progreso = NodoDecision(3, 'promedio_progreso < 50', '', 'progreso', 'media')
        
        # Nodo izquierdo del progreso: progreso bajo -> más tiempo
        nodo_tiempo = NodoDecision(4, '', 'Dedicar más tiempo al estudio y completar lecciones pendientes', 'tiempo', 'media')
        
        # Nodo derecho del progreso: evaluar aprobación
        nodo_aprobacion = NodoDecision(5, 'evaluaciones_aprobadas/total_evaluaciones < 0.8', '', 'evaluacion', 'media')
        
        # Nodo izquierdo de aprobación: aprobación baja -> revisión
        nodo_revision = NodoDecision(6, '', 'Revisar conceptos clave antes de las evaluaciones', 'revision', 'media')
        
        # Nodo derecho de aprobación: todo bien -> continuar
        nodo_continuar = NodoDecision(7, '', '¡Excelente progreso! Continúa con el siguiente módulo', 'motivacion', 'baja')
        
        # Construir el árbol
        nodo_raiz.izquierda = nodo_refuerzo
        nodo_raiz.derecha = nodo_progreso
        nodo_progreso.izquierda = nodo_tiempo
        nodo_progreso.derecha = nodo_aprobacion
        nodo_aprobacion.izquierda = nodo_revision
        nodo_aprobacion.derecha = nodo_continuar
        
        self.arbol_decision.raiz = nodo_raiz

class GestorMateriales:
    """Clase para gestionar el CRUD de materiales"""
    
    def __init__(self, gestor_contenido: GestorContenido):
        self.gestor_contenido = gestor_contenido
    
    def crear_recurso(self, leccion_id: int, nombre: str, tipo: str, url: str, 
                     orden: int = 0, duracion: Optional[int] = None) -> Optional[Recurso]:
        """Crea un nuevo recurso"""
        # Encontrar la lección
        for curso in self.gestor_contenido.cursos.values():
            for modulo in curso.obtener_modulos():
                for leccion in modulo.obtener_lecciones():
                    if leccion.id == leccion_id:
                        # Generar ID único (en producción usar base de datos)
                        nuevo_id = max([r.id for r in leccion.recursos], default=0) + 1
                        recurso = Recurso(nuevo_id, nombre, tipo, url, orden, duracion)
                        leccion.agregar_recurso(recurso)
                        return recurso
        return None
    
    def actualizar_recurso(self, recurso_id: int, nombre: str = None, 
                          url: str = None, orden: int = None) -> bool:
        """Actualiza un recurso existente"""
        for curso in self.gestor_contenido.cursos.values():
            for modulo in curso.obtener_modulos():
                for leccion in modulo.obtener_lecciones():
                    for recurso in leccion.recursos:
                        if recurso.id == recurso_id:
                            if nombre:
                                recurso.nombre = nombre
                            if url:
                                recurso.url = url
                            if orden is not None:
                                recurso.orden = orden
                            return True
        return False
    
    def eliminar_recurso(self, recurso_id: int) -> bool:
        """Elimina un recurso"""
        for curso in self.gestor_contenido.cursos.values():
            for modulo in curso.obtener_modulos():
                for leccion in modulo.obtener_lecciones():
                    if leccion.eliminar_recurso(recurso_id):
                        return True
        return False
    
    def obtener_recurso(self, recurso_id: int) -> Optional[Recurso]:
        """Obtiene un recurso por ID"""
        for curso in self.gestor_contenido.cursos.values():
            for modulo in curso.obtener_modulos():
                for leccion in modulo.obtener_lecciones():
                    for recurso in leccion.recursos:
                        if recurso.id == recurso_id:
                            return recurso
        return None
    
    def listar_recursos_leccion(self, leccion_id: int) -> List[Recurso]:
        """Lista todos los recursos de una lección"""
        for curso in self.gestor_contenido.cursos.values():
            for modulo in curso.obtener_modulos():
                for leccion in modulo.obtener_lecciones():
                    if leccion.id == leccion_id:
                        return leccion.recursos
        return [] 