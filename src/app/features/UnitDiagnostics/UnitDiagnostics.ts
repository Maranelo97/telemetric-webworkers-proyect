import { Component, OnInit, inject, afterNextRender, PLATFORM_ID, ChangeDetectionStrategy, signal } from '@angular/core';
import * as d3 from 'd3';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-unit-diagnostics',
  imports: [],
  templateUrl: './UnitDiagnostics.html',
  styleUrl: './UnitDiagnostics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UnitDiagnostics {
private route = inject(ActivatedRoute);
  private router = inject(Router);

unitId = signal<string>(this.route.snapshot.paramMap.get('id') || 'UNKNOWN');

  constructor() {

    
    afterNextRender(() => {
      this.createRadarChart();
      this.createGForceMonitor();
    });
  }
createRadarChart() {
    const data = [
      { axis: "Seguridad", value: 0.9 },
      { axis: "Consumo", value: 0.85 },
      { axis: "Puntualidad", value: 0.7 },
      { axis: "Cuidado", value: 0.95 },
      { axis: "Velocidad", value: 0.6 }
    ];

    const width = 250, height = 250;
    const svg = d3.select("#radarChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    // Lógica para dibujar el Radar (Spider Chart)
    // Usamos líneas neón y círculos de fondo
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, 100]);
    
    // Dibujar niveles (círculos de fondo)
    svg.selectAll(".levels")
       .data([0.2, 0.4, 0.6, 0.8, 1])
       .enter().append("circle")
       .attr("r", d => rScale(d))
       .attr("fill", "none")
       .attr("stroke", "rgba(255,255,255,0.05)");

    // Dibujar el área del chofer (en indigo brillante)
    const line = d3.lineRadial<{axis: string, value: number}>()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * (2 * Math.PI / data.length))
      .curve(d3.curveLinearClosed);

    svg.append("path")
       .datum(data)
       .attr("d", line)
       .attr("fill", "rgba(79, 70, 229, 0.3)")
       .attr("stroke", "#6366f1")
       .attr("stroke-width", 2)
       .style("filter", "drop-shadow(0 0 5px #6366f1)");
  }

  createGForceMonitor() {
    // Un simple vector visual que se mueve
    const width = 200, height = 200;
    const svg = d3.select("#gForceChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Grid circular de G-Force
    svg.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 80).attr("fill", "none").attr("stroke", "rgba(255,255,255,0.1)");
    svg.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 40).attr("fill", "none").attr("stroke", "rgba(255,255,255,0.1)");
    
    // Punto central (El vehículo)
    svg.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 4).attr("fill", "#6366f1");

    // Vector de inercia (G-Force)
    svg.append("line")
       .attr("x1", 100).attr("y1", 100)
       .attr("x2", 140).attr("y2", 60) // Esto sería dinámico
       .attr("stroke", "#ef4444")
       .attr("stroke-width", 3)
       .attr("marker-end", "url(#arrowhead)");
  }

  back() {
    this.router.navigate(['/allFleet']);
  }
}
