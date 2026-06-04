# Documentación Técnica: EnginePort

El `EnginePort` es la interfaz de comunicación exclusiva entre el Dominio/Casos de Uso y cualquier implementación de renderizado 3D.

## 1. Inyección de Dependencia
```typescript
private engine = inject(ENGINE_PORT);
```

## 2. Métodos Disponibles

| Método | Propósito |
| :--- | :--- |
| `loadModel(modelName: string)` | Carga asíncrona de un modelo GLB (optimizado con DRACO). Retorna una `Promise<THREE.Group>`. |
| `highlightComponent(model, componentName, color)` | Resalta una parte específica del modelo. Internamente ejecuta un reset previo. |
| `resetModelVisuals(model)` | Restaura el modelo a su estado visual base (wireframe/blueprint). |

## 3. Patrón de Consumo Recomendado

El consumo debe seguir un flujo lineal y asíncrono. Nunca manipules las propiedades de `THREE.Group` directamente desde el componente.

```typescript
async function renderEngine(modelName: string) {
  // 1. Obtención del modelo
  const model = await this.engine.loadModel(modelName);
  this.scene.add(model);

  // 2. Manipulación visual (Delegada al Port)
  this.engine.highlightComponent(model, 'Piston_01', 0xff0000);

  // 3. Limpieza de visuales
  this.engine.resetModelVisuals(model);
}
```

## 4. Reglas de Oro (Hexagonal)

1. **NO** importar `three` directamente en componentes de UI (`features/`).
2. **Encapsulación**: La lógica de negocio vive en el `UseCase`. El componente de UI solo coordina.
3. **Caché**: El `ThreeJsEngineAdapter` maneja una caché interna. No implementar lógica de carga en la UI.
