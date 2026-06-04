import { Injectable, inject } from '@angular/core';
import { TELEMETRY_PORT } from '../ports/output/telemetry.port';
import { HISTORY_REPORTING_PORT } from '../ports/visuals/charting.port';
import { Vehicle } from '../models/vehicle.model';
import { DriverBiometrics } from '../models/biometrics.model';
import { ENGINE_PORT } from '../ports/output/engine.port';
import { BlueprintStrategy } from '../models/engine-strategy.model';
import * as THREE from 'three';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnitDiagnosticsUseCase {
  private telemetry = inject(TELEMETRY_PORT);
  private historyReporting = inject(HISTORY_REPORTING_PORT);
  private enginePort = inject(ENGINE_PORT);

  //AQUI ARMAR UN METODO QUE OBTENGA LA INFORMACIÓN Y LA COMPARTA COMO UN SINGAL
  // READONLY A LOS DEMAS COMPONENTES HIJOS ENTONCES EL PADRE EVITA SUSCRIPCIONES EXTRA

  getUnitDetails(unitId: string) {
    // Obtener vehículo y determinar si es crítico
    return this.telemetry
      .getVehicleDetail(unitId)
      .pipe(map((vehicle) => ({ vehicle, isCritical: vehicle?.status === 'CRITICAL' })));
  }

  getRadarStats(vehicle: Vehicle | null, biometrics: DriverBiometrics) {
    // Calcular stats combinados para radar (centraliza lógica DRY)
    return [
      { axis: 'Atención', value: biometrics.attentionLevel / 100 },
      { axis: 'Frenado', value: (vehicle?.metrics.brakingPrecision || 78) / 100 },
      { axis: 'Consumo', value: (vehicle?.metrics.fuel || 92) / 100 },
      { axis: 'Estrés', value: biometrics.stressZone === 'OPTIMAL' ? 0.9 : 0.4 },
      { axis: 'Salud', value: (vehicle?.metrics.health || 85) / 100 },
    ];
  }

  getEngineHealthStream() {
    // Retorna stream para biometría
    return this.telemetry.streamEngineHealth();
  }

  getGForceStream() {
    // Retorna stream para g-force
    return this.telemetry.streamGForce();
  }

  getRadarColors(status?: string): { mainColor: string; areaColor: string } {
    const isCritical = status === 'CRITICAL';
    return {
      mainColor: isCritical ? '#ef4444' : '#6366f1',
      areaColor: isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.2)',
    };
  }

  getHistoryData(unitId: string, metric: string) {
    // Retorna datos históricos para métricas
    return this.historyReporting.getMetricHistory(unitId, metric);
  }

  async loadEngineModel(modelName: string): Promise<THREE.Group> {
    const model = await this.enginePort.loadModel(modelName);
    // Aplicar estrategia de material (lógica de dominio)
    const strategy = new BlueprintStrategy();
    strategy.apply(model);
    return model;
  }
}
